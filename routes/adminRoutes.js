import express from 'express';
import Booking from '../models/Booking.js';
import Venue from '../models/Venue.js';
import Court from '../models/Court.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get bookings for a venue (admin)
// @route   GET /api/admin/bookings/:venueId
router.get('/bookings/:venueId', protect, async (req, res) => {
    try {
        // Get all courts for this venue
        const courts = await Court.find({ venue_id: req.params.venueId });
        const courtIds = courts.map((c) => c._id);

        const bookings = await Booking.find({ court_id: { $in: courtIds } })
            .populate('court_id', 'name sport_type price_per_hour')
            .populate('user_id', 'name email')
            .sort({ booking_date: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Block a slot (offline booking)
// @route   POST /api/admin/block-slot
router.post('/block-slot', protect, async (req, res) => {
    try {
        const { court_id, booking_date, start_time, end_time, customer_name, amount_paid } = req.body;

        const existingBooking = await Booking.findOne({
            court_id,
            booking_date: new Date(booking_date),
            start_time,
            status: { $in: ['PENDING', 'CONFIRMED'] },
        });

        if (existingBooking) {
            return res.status(400).json({ message: 'Slot already booked' });
        }

        const court = await Court.findById(court_id);
        const totalPrice = court ? (court.price_per_hour || 0) : 0;
        
        let paymentStatus = 'UNPAID';
        if (amount_paid > 0) {
            paymentStatus = amount_paid >= totalPrice ? 'PAID' : 'PARTIAL';
        }

        const booking = await Booking.create({
            court_id,
            user_id: req.user._id,
            booking_date: new Date(booking_date),
            start_time,
            end_time,
            status: 'CONFIRMED',
            payment_status: paymentStatus,
            customer_name: customer_name || 'Walk-in',
            amount_paid: amount_paid || 0,
        });

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Mark booking as fully paid
// @route   PUT /api/admin/bookings/:id/mark-paid
router.put('/bookings/:id/mark-paid', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        booking.payment_status = 'PAID';
        await booking.save();
        res.json({ message: 'Marked as fully paid', booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update venue settings
// @route   PUT /api/admin/venue/:id/settings
router.put('/venue/:id/settings', protect, async (req, res) => {
    try {
        const venue = await Venue.findById(req.params.id);
        if (!venue) return res.status(404).json({ message: 'Venue not found' });

        const isOwner = venue.owner_id && venue.owner_id.toString() === req.user._id.toString();
        if (!isOwner && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to update this venue' });
        }

        const { name, address, sport_type, description, contact, amenities, number_of_pitches } = req.body;
        if (name) venue.name = name;
        if (address) venue.address = address;
        if (sport_type) venue.sport_type = sport_type;
        if (typeof description === 'string') venue.description = description;
        if (typeof contact === 'string') venue.contact = contact;
        if (Array.isArray(amenities)) venue.amenities = amenities;
        if (number_of_pitches) venue.number_of_pitches = Number(number_of_pitches);

        await venue.save();
        res.json({ message: 'Settings updated', venue });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update venue courts/pitches
// @route   PUT /api/admin/venue/:id/courts
router.put('/venue/:id/courts', protect, async (req, res) => {
    try {
        const venueId = req.params.id;
        const venue = await Venue.findById(venueId);
        if (!venue) return res.status(404).json({ message: 'Venue not found' });

        const isOwner = venue.owner_id && venue.owner_id.toString() === req.user._id.toString();
        if (!isOwner && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to update this venue courts' });
        }

        const incomingCourts = Array.isArray(req.body.courts) ? req.body.courts : [];
        const existingCourts = await Court.find({ venue_id: venueId });
        const existingById = new Map(existingCourts.map(c => [c._id.toString(), c]));
        const seenIds = new Set();

        for (const c of incomingCourts) {
            const payload = {
                venue_id: venueId,
                name: c.name,
                sport_type: c.sport_type || venue.sport_type || 'General',
                price_per_hour: Number(c.price_per_hour) || 0,
                open_time: c.open_time || '08:00',
                close_time: c.close_time || '22:00',
                slot_duration: Number(c.slot_duration) || 60,
                slot_pricing: Array.isArray(c.slot_pricing)
                    ? c.slot_pricing
                        .filter(sp => sp?.start_time && sp?.end_time)
                        .map(sp => ({
                            start_time: sp.start_time,
                            end_time: sp.end_time,
                            price: Number(sp.price) || Number(c.price_per_hour) || 0,
                        }))
                    : [],
            };

            if (c._id && existingById.has(String(c._id))) {
                seenIds.add(String(c._id));
                await Court.findByIdAndUpdate(c._id, payload, { new: true, runValidators: true });
            } else {
                const created = await Court.create(payload);
                seenIds.add(created._id.toString());
            }
        }

        // Remove courts deleted by admin (only if no active bookings)
        for (const c of existingCourts) {
            if (seenIds.has(c._id.toString())) continue;
            const activeBooking = await Booking.findOne({
                court_id: c._id,
                status: { $in: ['PENDING', 'CONFIRMED'] },
            });
            if (!activeBooking) {
                await Court.findByIdAndDelete(c._id);
            }
        }

        venue.number_of_pitches = incomingCourts.length || 1;
        await venue.save();

        const updatedCourts = await Court.find({ venue_id: venueId }).sort({ createdAt: 1 });
        res.json({ message: 'Courts updated', courts: updatedCourts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get venue stats
// @route   GET /api/admin/stats/:venueId
router.get('/stats/:venueId', protect, async (req, res) => {
    try {
        const courts = await Court.find({ venue_id: req.params.venueId });
        const courtIds = courts.map((c) => c._id);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todaysBookings = await Booking.find({
            court_id: { $in: courtIds },
            booking_date: { $gte: today, $lt: tomorrow },
            status: { $in: ['PENDING', 'CONFIRMED'] },
        }).populate('user_id', 'name').populate('court_id', 'name sport_type price_per_hour');

        const todaysRevenue = todaysBookings.reduce((sum, b) => sum + (b.price_charged || b.court_id?.price_per_hour || 0), 0);

        // Total available slots (assume 14 slots 8am-10pm × courts)
        const totalSlots = courts.length * 14;
        const bookedSlots = todaysBookings.length;
        const availableSlots = totalSlots - bookedSlots;

        const pendingPayments = await Booking.countDocuments({
            court_id: { $in: courtIds },
            payment_status: { $in: ['UNPAID', 'PARTIAL'] },
            status: 'CONFIRMED',
        });

        res.json({
            todaysRevenue,
            bookingsToday: bookedSlots,
            availableSlots,
            pendingPayments,
            todaysBookings,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
