import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
    {
        court_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Court',
            required: [true, 'Court ID is required'],
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Assuming you will have a User model
            required: [true, 'User ID is required'],
        },
        booking_date: {
            type: Date,
            required: [true, 'Booking date is required'], // e.g., 2026-03-10
        },
        start_time: {
            type: String,
            required: [true, 'Start time is required'], // e.g., "20:00"
            trim: true,
        },
        end_time: {
            type: String,
            required: [true, 'End time is required'], // e.g., "21:00"
            trim: true,
        },
        price_charged: {
            type: Number,
            default: 0,
            min: [0, 'Price charged cannot be negative'],
        },
        status: {
            type: String,
            enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
            default: 'PENDING',
        },
        payment_status: {
            type: String,
            enum: ['UNPAID', 'PARTIAL', 'PAID'],
            default: 'UNPAID',
        },
        customer_name: {
            type: String,
            default: '', // Used for manual/offline bookings
        },
        amount_paid: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
