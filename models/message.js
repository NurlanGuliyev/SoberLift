// models/message.js

import mongoose from 'mongoose';


const senderSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    }
}, { _id: false });

const messageSchema = new mongoose.Schema({
    sender: {
        type: senderSchema,
        required: true
    },
    rideId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ride',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { versionKey: false });

const Message = mongoose.model('Message', messageSchema, 'Message');

async function insertMessages() {
}

export {Message, insertMessages};
