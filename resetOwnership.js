import dotenv from 'dotenv';
import connectDB from './db.js';
import Venue from './models/Venue.js';
import User from './models/User.js';

dotenv.config();

const resetOwnership = async () => {
    await connectDB();
    await Venue.updateMany({}, { $set: { owner_id: null, status: 'UNCLAIMED', verification_doc: '' } });
    console.log('All venues reset to UNCLAIMED');
    await User.updateMany({}, { $set: { role: 'USER', owned_venues: [] } });
    console.log('All users reset to USER role');
    process.exit(0);
};

resetOwnership();
