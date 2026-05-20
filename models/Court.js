import mongoose from 'mongoose';

const slotPricingSchema = new mongoose.Schema(
    {
        start_time: {
            type: String,
            required: true,
            trim: true,
        },
        end_time: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: [0, 'Price cannot be negative'],
        },
    },
    { _id: false }
);

const courtSchema = new mongoose.Schema(
    {
        venue_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Venue',
            required: [true, 'Venue ID is required'],
        },
        name: {
            type: String,
            required: [true, 'Court name is required'],
            trim: true, // e.g., "Pitch A (5v5)"
        },
        sport_type: {
            type: String,
            required: [true, 'Sport type is required'],
            trim: true, // e.g., "Futsal", "Box Cricket"
        },
        price_per_hour: {
            type: Number,
            required: [true, 'Price per hour is required'],
            min: [0, 'Price cannot be negative'],
        },
        open_time: {
            type: String, // e.g., "16:00"
            trim: true,
        },
        close_time: {
            type: String, // e.g., "02:00"
            trim: true,
        },
        slot_duration: {
            type: Number,
            default: 60, // Duration in minutes
        },
        slot_pricing: {
            type: [slotPricingSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

const Court = mongoose.model('Court', courtSchema);

export default Court;
