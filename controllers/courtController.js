import Court from '../models/Court.js';
import Booking from '../models/Booking.js';
import Venue from '../models/Venue.js';

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

// @desc    Search for courts by name or sport
// @route   GET /api/courts/search?q=query
// @access  Public
export const searchCourts = async (req, res) => {
    try {
        const query = req.query.q || '';
        const regex = new RegExp(query, 'i'); // case-insensitive

        // 1. Find Venues matching the query
        const matchingVenues = await Venue.find({ name: regex });
        const venueIds = matchingVenues.map(v => v._id);

        // 2. Find courts matching name, sport type, OR belonging to matching venues
        const courts = await Court.find({
            $or: [
                { name: regex },
                { sport_type: regex },
                { venue_id: { $in: venueIds } }
            ]
        }).populate('venue_id', 'name address'); // Also populate basic venue info

        res.json(courts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get available slots for a court on a specific date
// @route   GET /api/courts/:id/slots?date=YYYY-MM-DD
// @access  Public
export const getCourtSlots = async (req, res) => {
    try {
        const { id } = req.params;
        const dateString = req.query.date || new Date().toISOString().split('T')[0];

        const court = await Court.findById(id);
        if (!court) {
            return res.status(404).json({ message: 'Court not found' });
        }

        // Parse open/close times
        // format expected: "16:00"
        const openTimeParts = court.open_time.split(':').map(Number);
        const closeTimeParts = court.close_time.split(':').map(Number);

        let startMins = openTimeParts[0] * 60 + openTimeParts[1];
        let endMins = closeTimeParts[0] * 60 + closeTimeParts[1];

        // Handle midnight crossover (e.g. 16:00 to 02:00)
        if (endMins <= startMins) {
            endMins += 24 * 60; // Add 24 hours in minutes
        }

        // Generate all possible slots based on start/end time and slot duration
        const duration = court.slot_duration;
        const allSlots = [];

        for (let t = startMins; t + duration <= endMins; t += duration) {
            const slotHour = Math.floor(t / 60) % 24;
            const slotMin = t % 60;
            const timeStr = `${slotHour.toString().padStart(2, '0')}:${slotMin.toString().padStart(2, '0')}`;
            allSlots.push(timeStr);
        }

        // Find conflicting bookings for this court and date
        // Bookings store date as Date object, so we filter by query date
        const startOfDay = new Date(dateString);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(dateString);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const dailyBookings = await Booking.find({
            court_id: id,
            booking_date: {
                $gte: startOfDay,
                $lte: endOfDay
            },
            status: { $in: ['PENDING', 'CONFIRMED'] }
        });

        const bookedStartTimes = dailyBookings.map(b => b.start_time);

        // Filter out booked slots
        const availableSlots = allSlots.filter(s => !bookedStartTimes.includes(s));
        const slotPrices = allSlots.reduce((acc, slot) => {
            acc[slot] = getSlotPrice(court, slot);
            return acc;
        }, {});

        res.json({
            date: dateString,
            court,
            allSlots,
            availableSlots,
            bookedSlots: bookedStartTimes,
            slotPrices,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
