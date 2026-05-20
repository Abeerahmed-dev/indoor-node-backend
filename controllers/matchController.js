import Match from '../models/Match.js';

// @desc    Get upcoming matches (Play Nearby Now)
// @route   GET /api/matches
// @access  Public
export const getMatches = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const matches = await Match.find({ date: { $gte: today }, slots_left: { $gt: 0 } })
            .populate('venue_id', 'name address')
            .sort({ date: 1 })
            .limit(10);
        res.json(matches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new match/request
// @route   POST /api/matches
// @access  Public
export const createMatch = async (req, res) => {
    try {
        const match = await Match.create(req.body);
        res.status(201).json(match);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Join a match
// @route   PUT /api/matches/:id/join
// @access  Public
export const joinMatch = async (req, res) => {
    try {
        const { players_brought } = req.body;
        const match = await Match.findById(req.params.id);

        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        const brought = parseInt(players_brought) || 1;

        if (brought > match.slots_left) {
            return res.status(400).json({ message: 'Cannot bring more players than required' });
        }

        match.slots_left -= brought;
        await match.save();

        res.json(match);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
