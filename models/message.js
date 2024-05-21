// models/message.js

import mongoose from 'mongoose';


const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
