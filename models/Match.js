import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Match title is required'],
            trim: true,
        },
        sport_type: {
            type: String,
            required: [true, 'Sport type is required'],
            trim: true,
        },
        venue_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Venue',
            required: [true, 'Venue is required'],
        },
        date: {
            type: Date,
            required: true,
        },
        time: {
            type: String,
            required: true,
            trim: true,
        },
        team_size: {
            type: String,
            default: '5v5',
        },
        slots_left: {
            type: Number,
            default: 0,
        },
        is_urgent: {
            type: Boolean,
            default: false,
        },
        description: {
            type: String,
            default: '',
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const Match = mongoose.model('Match', matchSchema);

export default Match;
