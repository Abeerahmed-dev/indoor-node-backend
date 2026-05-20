import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

console.log('Cleanup script started...');

const cleanupUsers = async () => {
    try {
        console.log(`Connecting to: ${process.env.MONGO_URI}`);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB successfully.');

        const result = await User.deleteMany({});
        console.log(`Successfully deleted ${result.deletedCount} users (including admins).`);

        console.log('Closing connection...');
        await mongoose.connection.close();
        console.log('Cleanup finished.');
        process.exit(0);
    } catch (error) {
        console.error(`Error during cleanup: ${error.message}`);
        process.exit(1);
    }
};

cleanupUsers();
