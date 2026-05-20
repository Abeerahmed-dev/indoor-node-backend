import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const updateImages = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        const venues = await db.collection('venues').find({}).toArray();

        for (const v of venues) {
            let img = '/images/venues/football.png';
            const sport = v.sport_type?.toLowerCase();
            const name = v.name?.toLowerCase();

            if (sport === 'cricket') img = '/images/venues/cricket_indoor.png';
            else if (sport === 'basketball') img = '/images/venues/basketball_indoor.png';
            else if (name.includes('indoor') || sport === 'futsal') img = '/images/venues/futsal.png';
            else if (sport === 'football') img = '/images/venues/futsal.png'; // Assume indoor for now or rooftop

            await db.collection('venues').updateOne(
                { _id: v._id },
                { $set: { image: img } }
            );
        }

        console.log(`Successfully updated ${venues.length} venues with premium indoor/outdoor images.`);
        process.exit(0);
    } catch (error) {
        console.error('Error updating images:', error);
        process.exit(1);
    }
};

updateImages();
