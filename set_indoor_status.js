import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const setIndoorStatus = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        
        // Mark venues with indoor images or names as INDOOR
        await db.collection('venues').updateMany(
            { $or: [
                { image: { $regex: /indoor|futsal/i } },
                { name: { $regex: /indoor/i } }
            ]},
            { $set: { venue_type: 'INDOOR' } }
        );

        // Mark the rest as OUTDOOR
        await db.collection('venues').updateMany(
            { venue_type: { $exists: false } },
            { $set: { venue_type: 'OUTDOOR' } }
        );

        console.log('Successfully categorized venues into INDOOR/OUTDOOR.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

setIndoorStatus();
