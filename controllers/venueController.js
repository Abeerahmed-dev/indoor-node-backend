import Venue from '../models/Venue.js';
import Court from '../models/Court.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
    });
};

// @desc    Get all active venues (Nearby Facilities)
// @route   GET /api/venues
// @access  Public
export const getVenues = async (req, res) => {
    try {
        const venues = await Venue.find({ is_active: true }).sort({ rating: -1 });
        res.json(venues);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get venues by sport type
// @route   GET /api/venues/sport/:sport
// @access  Public
export const getVenuesBySport = async (req, res) => {
    try {
        const sport = req.params.sport;
        const regex = new RegExp(sport, 'i');
        const venues = await Venue.find({ sport_type: regex, is_active: true });
        res.json(venues);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single venue by ID
// @route   GET /api/venues/:id
// @access  Public
export const getVenueById = async (req, res) => {
    try {
        const venue = await Venue.findById(req.params.id);
        if (!venue) {
            return res.status(404).json({ message: 'Venue not found' });
        }
        res.json(venue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get unclaimed venues
// @route   GET /api/venues/unclaimed
// @access  Public
export const getUnclaimedVenues = async (req, res) => {
    try {
        const venues = await Venue.find({
            is_active: true,
            $or: [{ status: 'UNCLAIMED' }, { status: { $exists: false } }, { owner_id: null }],
        });
        res.json(venues);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Claim a venue (auto-approval) + create courts
// @route   POST /api/venues/claim
// @access  Private (requires auth)
export const claimVenue = async (req, res) => {
    try {
        const { venueId, venueName, address, description, contact, pitches } = req.body;
        const userId = req.user._id;

        let venue;
        const filePath = req.file ? req.file.path : '';

        if (venueId === 'NEW_VENUE') {
            venue = await Venue.create({
                name: venueName || 'New Full Arena',
                address: address || 'No Address',
                description: description || '',
                contact: contact || '',
                owner_id: userId,
                status: 'CLAIMED',
                is_active: true,
                rating: 0,
                verification_doc: filePath,
            });
        } else {
            // 1. Find the venue
            venue = await Venue.findById(venueId);
            if (!venue) {
                return res.status(404).json({ message: 'Venue not found' });
            }

            // 2. Check if already claimed
            if (venue.owner_id) {
                return res.status(400).json({ message: 'This venue has already been claimed by another user.' });
            }

            // 4. Auto-Approval: Update venue
            venue.owner_id = userId;
            venue.status = 'CLAIMED';
            if (filePath) venue.verification_doc = filePath;
            await venue.save();
        }

        // 5. Create courts/pitches if provided
        let parsedPitches = [];
        try {
            parsedPitches = typeof pitches === 'string' ? JSON.parse(pitches) : (pitches || []);
        } catch (e) {
            parsedPitches = [];
        }

        if (parsedPitches.length > 0) {
            const courtDocs = parsedPitches.map(p => ({
                venue_id: venue._id,
                name: p.name,
                sport_type: p.sport_type || venue.sport_type || 'General',
                price_per_hour: Number(p.price_per_hour) || 1000,
                open_time: p.open_time || '08:00',
                close_time: p.close_time || '22:00',
                slot_duration: 60,
                slot_pricing: Array.isArray(p.slot_pricing)
                    ? p.slot_pricing
                        .filter(sp => sp?.start_time && sp?.end_time)
                        .map(sp => ({
                            start_time: sp.start_time,
                            end_time: sp.end_time,
                            price: Number(sp.price) || Number(p.price_per_hour) || 1000,
                        }))
                    : [],
            }));
            await Court.insertMany(courtDocs);
            venue.number_of_pitches = parsedPitches.length;
            await venue.save();
        }

        // 6. Update user: change role and add to owned venues
        const user = await User.findById(userId);
        user.role = 'VENUE_ADMIN';
        if (req.body.ownerPhone) user.phone = req.body.ownerPhone;
        if (!user.owned_venues.includes(venue._id)) {
            user.owned_venues.push(venue._id);
        }
        await user.save();

        // 7. Return updated user data with new token
        res.json({
            message: 'Venue claimed successfully! You are now a Venue Admin.',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                owned_venues: user.owned_venues,
                token: generateToken(user._id),
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get nearby venues using straight-line distance
// @route   GET /api/venues/nearby
// @access  Public
export const getNearbyVenues = async (req, res) => {
    try {
        const { lat, lng } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        }

        const userLat = parseFloat(req.query.lat);
        const userLng = parseFloat(req.query.lng);
        const radius = parseFloat(req.query.radius) || 100; // km

        console.log(`[NEARBY] Finding venues within ${radius}km of: [${userLng}, ${userLat}]`);

        if (isNaN(userLat) || isNaN(userLng)) {
            return res.status(400).json({ message: 'Invalid coordinates provided' });
        }

        // Use $geoNear aggregation to find nearby venues and calculate distance
        const venues = await Venue.aggregate([
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [userLng, userLat],
                    },
                    distanceField: 'distance', // distance in meters
                    spherical: true,
                    query: { 
                        is_active: true,
                        venue_type: 'INDOOR'
                    },
                    maxDistance: radius * 1000, // convert km to meters
                },
            },
        ]);

        // Map results to include distance in km
        const results = venues.map(v => ({
            ...v,
            distanceKm: (v.distance / 1000).toFixed(1),
        }));

        res.json(results);
    } catch (error) {
        console.error('[NEARBY ERROR]:', error);
        res.status(500).json({ message: 'Error calculating nearby venues', error: error.message });
    }
};

