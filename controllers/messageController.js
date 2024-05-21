// controllers/messageController.js

import mongoose from 'mongoose';
import { Message } from '../models/message.js';
import { User } from '../models/user.js';

// Function to send a message
async function sendMessage(req, res) {
    const { senderId, receiverId, content } = req.body;

    try {
        // Create a new message
        const newMessage = new Message({
            senderId,
            receiverId,
            content
        });

        // Save the message to the database
        await newMessage.save();

        res.status(201).json({ message: "Message sent successfully", data: newMessage });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Function to get messages between two users
async function getMessages(req, res) {
    const { userId1, userId2 } = req.params;

    try {
        // Find messages between the two users
        const messages = await Message.find({
            $or: [
                { senderId: userId1, receiverId: userId2 },
                { senderId: userId2, receiverId: userId1 }
            ]
        }).sort({ timestamp: 1 }); // Sort by timestamp in ascending order

        res.status(200).json({ messages });
    } catch (error) {
        console.error("Error retrieving messages:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export {sendMessage, getMessages};