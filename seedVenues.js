import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Venue from './models/Venue.js';
import connectDB from './db.js';

dotenv.config({ path: path.join(process.cwd(), 'backend', '.env') });
connectDB();

const seedVenues = async () => {
    try {
        await Venue.deleteMany();

        const venues = [
            {
                name: 'Gulshan Turf Arena',
                address: 'Block 13, Gulshan-e-Iqbal, Karachi',
                location: {
                    type: 'Point',
                    coordinates: [67.0924, 24.9180],
                },
                sport_type: 'Football',
                description: 'Premium football turf in Gulshan.',
                contact: '0300-1234567',
                status: 'UNCLAIMED',
            },
            {
                name: 'DHA Sport Complex',
                address: 'Phase 5, DHA, Karachi',
                location: {
                    type: 'Point',
                    coordinates: [67.0583, 24.8153],
                },
                sport_type: 'Cricket',
                description: 'World-class cricket academy.',
                contact: '0300-7654321',
                status: 'UNCLAIMED',
            },
            {
                name: 'North Nazimabad Arena',
                address: 'Block H, North Nazimabad, Karachi',
                location: {
                    type: 'Point',
                    coordinates: [67.0427, 24.9372],
                },
                sport_type: 'Futsal',
                description: 'State-of-the-art futsal pitch.',
                contact: '0300-9998887',
                status: 'UNCLAIMED',
            },
            {
                name: 'Clifton Elite Arena',
                address: 'Sea View Road, Clifton, Karachi',
                location: {
                    type: 'Point',
                    coordinates: [67.0315, 24.8285],
                },
                sport_type: 'Football',
                description: 'Play with a view of the ocean.',
                contact: '0300-4443332',
                status: 'UNCLAIMED',
            },
            {
                name: 'F.B Area Sports Club',
                address: 'Block 15, Federal B Area, Karachi',
                location: {
                    type: 'Point',
                    coordinates: [67.0700, 24.9200],
                },
                sport_type: 'Cricket',
                description: 'Local community sports club.',
                contact: '0300-5556667',
                status: 'UNCLAIMED',
            },
            {
                name: 'Malir Cantt Turf',
                address: 'Jinnah Avenue, Malir Cantt, Karachi',
                location: {
                    type: 'Point',
                    coordinates: [67.2000, 24.9000],
                },
                sport_type: 'Football',
                description: 'Professional grade turf in a secure area.',
                contact: '0300-8887776',
                status: 'UNCLAIMED',
            },
        ];

        await Venue.insertMany(venues);
        console.log('Database Seeded!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedVenues();
