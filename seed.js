import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './db.js';
import Venue from './models/Venue.js';
import Court from './models/Court.js';
import Booking from './models/Booking.js';
import User from './models/User.js';
import Match from './models/Match.js';

dotenv.config();

// Connect to the database
connectDB();

const seedData = async () => {
    try {
        // 1. Clear existing data
        await Venue.deleteMany();
        await Court.deleteMany();
        await Booking.deleteMany();
        await User.deleteMany();
        await Match.deleteMany();
        console.log('Existing data cleared.');

        // 2. Insert Venues
        const venuesData = [
            {
                name: "Spirit Field Outdoor Arena",
                address: "University Road, Karachi",
                image: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600",
                rating: 4.8,
                rating_count: 44,
                sport_type: "Football",
                latitude: 24.9180,
                longitude: 67.0971,
            },
            {
                name: "Clifton Sports Complex",
                address: "Clifton Block 2, Karachi",
                image: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600",
                rating: 4.5,
                rating_count: 32,
                sport_type: "Cricket",
                latitude: 24.8270,
                longitude: 67.0251,
            },
            {
                name: "DHA Paddle Courts",
                address: "DHA Phase 6, Karachi",
                image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600",
                rating: 4.6,
                rating_count: 28,
                sport_type: "Paddle",
                latitude: 24.8050,
                longitude: 67.0620,
            },
            {
                name: "Gulshan Basketball Arena",
                address: "Gulshan-e-Iqbal Block 13, Karachi",
                image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600",
                rating: 4.3,
                rating_count: 21,
                sport_type: "Basketball",
                latitude: 24.9290,
                longitude: 67.0930,
            },
            {
                name: "Karachi Futsal Arena",
                address: "Gulshan-e-Iqbal, Karachi",
                image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600",
                rating: 4.7,
                rating_count: 56,
                sport_type: "Football",
                latitude: 24.9185,
                longitude: 67.0975,
            },
        ];

        const createdVenues = await Venue.insertMany(venuesData);
        console.log(`Inserted ${createdVenues.length} venues.`);

        // 3. Insert Courts
        const courtsData = [
            {
                venue_id: createdVenues[0]._id,
                name: "Pitch A (5v5)",
                sport_type: "Football",
                price_per_hour: 3000,
                open_time: "16:00",
                close_time: "02:00",
                slot_duration: 60,
            },
            {
                venue_id: createdVenues[0]._id,
                name: "Pitch B (7v7)",
                sport_type: "Football",
                price_per_hour: 4500,
                open_time: "16:00",
                close_time: "02:00",
                slot_duration: 60,
            },
            {
                venue_id: createdVenues[1]._id,
                name: "Box Cricket Pro",
                sport_type: "Cricket",
                price_per_hour: 2500,
                open_time: "10:00",
                close_time: "23:00",
                slot_duration: 60,
            },
            {
                venue_id: createdVenues[2]._id,
                name: "Paddle Court 1",
                sport_type: "Paddle",
                price_per_hour: 3500,
                open_time: "08:00",
                close_time: "22:00",
                slot_duration: 60,
            },
            {
                venue_id: createdVenues[3]._id,
                name: "Main Court",
                sport_type: "Basketball",
                price_per_hour: 2000,
                open_time: "09:00",
                close_time: "21:00",
                slot_duration: 60,
            },
        ];

        const createdCourts = await Court.insertMany(courtsData);
        console.log(`Inserted ${createdCourts.length} courts.`);

        // 4. Insert Users (with email and password for auth)
        const user1 = await User.create({ name: "John Doe", email: "john@example.com", password: "123456", role: "USER" });
        const user2 = await User.create({ name: "Jane Smith", email: "jane@example.com", password: "123456", role: "USER" });
        const admin = await User.create({ name: "Admin User", email: "admin@example.com", password: "admin123", role: "ADMIN" });
        console.log('Inserted 3 users.');

        // 5. Insert Bookings
        const bookingsData = [
            {
                court_id: createdCourts[0]._id,
                user_id: user1._id,
                booking_date: new Date('2026-03-15'),
                start_time: "20:00",
                end_time: "21:00",
                status: "CONFIRMED",
                payment_status: "PAID",
            },
            {
                court_id: createdCourts[2]._id,
                user_id: user2._id,
                booking_date: new Date('2026-03-16'),
                start_time: "18:00",
                end_time: "19:00",
                status: "PENDING",
                payment_status: "UNPAID",
            },
        ];

        const createdBookings = await Booking.insertMany(bookingsData);
        console.log(`Inserted ${createdBookings.length} bookings.`);

        // 6. Insert Matches (Play Nearby Now)
        const matchesData = [
            {
                title: "Evening Football Match",
                sport_type: "Football",
                venue_id: createdVenues[0]._id,
                date: new Date('2026-03-15'),
                time: "20:00",
                team_size: "5v5",
                slots_left: 3,
                is_urgent: true,
                description: "Looking for 3 more players to complete the teams. Friendly match, all skill levels welcome.",
            },
            {
                title: "Weekend Cricket Clash",
                sport_type: "Cricket",
                venue_id: createdVenues[1]._id,
                date: new Date('2026-03-16'),
                time: "10:00",
                team_size: "6v6",
                slots_left: 5,
                is_urgent: false,
                description: "Box cricket tournament. Come join us for a weekend of fun! Prizes for the winners.",
            },
            {
                title: "Paddle Tennis Doubles",
                sport_type: "Paddle",
                venue_id: createdVenues[2]._id,
                date: new Date('2026-03-17'),
                time: "18:00",
                team_size: "2v2",
                slots_left: 1,
                is_urgent: true,
                description: "Need one more player for doubles match. Intermediate level preferred.",
            },
            {
                title: "Basketball 3v3 Pickup",
                sport_type: "Basketball",
                venue_id: createdVenues[3]._id,
                date: new Date('2026-03-18'),
                time: "17:00",
                team_size: "3v3",
                slots_left: 4,
                is_urgent: false,
                description: "Casual 3v3 pickup game. All levels welcome. Bring water and good vibes!",
            },
        ];

        const createdMatches = await Match.insertMany(matchesData);
        console.log(`Inserted ${createdMatches.length} matches.`);

        console.log('Seed data inserted successfully!');
        process.exit();

    } catch (error) {
        console.error(`Error with seeding data: ${error.message}`);
        process.exit(1);
    }
};

// Execute the seed function
seedData();
