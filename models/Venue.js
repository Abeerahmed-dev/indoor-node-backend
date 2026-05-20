import mongoose from 'mongoose';

const venueSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Venue name is required'],
            trim: true,
        },
        address: {
            type: String,
            required: [true, 'Venue address is required'],
            trim: true,
        },
        image: {
            type: String,
            default: '',
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        rating_count: {
            type: Number,
            default: 0,
        },
        sport_type: {
            type: String,
            trim: true,
            default: 'General',
        },
        venue_type: {
            type: String,
            enum: ['INDOOR', 'OUTDOOR'],
            default: 'OUTDOOR',
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        contact: {
            type: String,
            trim: true,
            default: '',
        },
        amenities: {
            type: [String],
            default: [],
        },
        number_of_pitches: {
            type: Number,
            default: 1,
            min: 1,
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true,
            },
        },
        is_active: {
            type: Boolean,
            default: true,
        },
        owner_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        status: {
            type: String,
            enum: ['UNCLAIMED', 'CLAIMED'],
            default: 'UNCLAIMED',
        },
        verification_doc: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

venueSchema.index({ location: '2dsphere' });

const Venue = mongoose.model('Venue', venueSchema);

export default Venue;
