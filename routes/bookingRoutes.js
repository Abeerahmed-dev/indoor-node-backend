import express from 'express';
import Booking from '../models/Booking.js';
import Court from '../models/Court.js';

const router = express.Router();

const toMinutes = (timeStr = '00:00') => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h * 60) + m;
};

const getSlotPrice = (court, slotStart) => {
    if (!Array.isArray(court.slot_pricing) || court.slot_pricing.length === 0) {
        return Number(court.price_per_hour) || 0;
    }

    const startMins = toMinutes(slotStart);
    const pricingRule = court.slot_pricing.find((sp) => {
        let ruleStart = toMinutes(sp.start_time);
        let ruleEnd = toMinutes(sp.end_time);
        let candidate = startMins;

        if (ruleEnd <= ruleStart) {
            ruleEnd += 24 * 60;
            if (candidate < ruleStart) candidate += 24 * 60;
        }

        return candidate >= ruleStart && candidate < ruleEnd;
    });

    return pricingRule ? Number(pricingRule.price) : Number(court.price_per_hour) || 0;
};

// @desc    Create a new booking
// @route   POST /api/bookings
router.post('/', async (req, res) => {
    try {
        const { court_id, user_id, booking_date, start_time, end_time } = req.body;
        const court = await Court.findById(court_id);
        if (!court) {
            return res.status(404).json({ message: 'Court not found' });
        }

        const startOfDay = new Date(booking_date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(booking_date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const existingBooking = await Booking.findOne({
            court_id,
            booking_date: { $gte: startOfDay, $lte: endOfDay },
            start_time,
            status: { $in: ['PENDING', 'CONFIRMED'] },
        });

        if (existingBooking) {
            return res.status(400).json({ message: 'This slot is already booked!' });
        }

        const booking = await Booking.create({
            court_id,
            user_id,
            booking_date: new Date(booking_date),
            start_time,
            end_time,
            price_charged: getSlotPrice(court, start_time),
            status: 'CONFIRMED',
            payment_status: 'PARTIAL',
        });

        res.status(201).json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get bookings for a specific user
// @route   GET /api/bookings/user/:userId
router.get('/user/:userId', async (req, res) => {
    try {
        const bookings = await Booking.find({
            user_id: req.params.userId,
            status: { $in: ['PENDING', 'CONFIRMED'] },
        })
            .populate('court_id', 'name sport_type price_per_hour venue_id')
            .sort({ booking_date: -1 });

        // Also populate venue info through court
        const populatedBookings = await Booking.populate(bookings, {
            path: 'court_id.venue_id',
            select: 'name address image',
        });

        res.json(populatedBookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
router.put('/:id/cancel', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status === 'CANCELLED') {
            return res.status(400).json({ message: 'Booking is already cancelled' });
        }

        booking.status = 'CANCELLED';
        await booking.save();

        res.json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
