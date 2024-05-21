// models/user.js

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    // Add any other fields you need for your users
}, { versionKey: false });

const User = mongoose.model('User', userSchema, 'User');

async function insertUsers() {
}

export {User, insertUsers};
