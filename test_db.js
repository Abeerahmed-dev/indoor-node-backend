// Test what the database currently contains
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './db.js';
import User from './models/User.js';

dotenv.config();
await connectDB();

const users = await User.find({}).select('name email password');
console.log('All users in DB:');
users.forEach(u => {
    console.log(`  name: ${u.name}, email: ${u.email}, pwd hash starts with: ${u.password ? u.password.substring(0, 10) : 'NO PASSWORD'}`);
});

// Try matching password for john
const john = await User.findOne({ email: 'john@example.com' });
if (john) {
    console.log('\nJohn found. Testing matchPassword("123456"):');
    const result = await john.matchPassword('123456');
    console.log('  Match result:', result);
} else {
    console.log('\nJohn NOT found in database!');
}

process.exit();
