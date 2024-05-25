// controllers/messageController.js

import mongoose from 'mongoose';
import { Message } from '../models/message.js';
import { Ride } from '../models/ride.js';

// Function to send a message
export async function sendMessage(req, res) {
    try {
        const { sender, rideId, content } = req.body;

        // Create a new message object with sender as an embedded document
        const newMessage = new Message({
            sender: {
                _id: sender._id,
                name: sender.name
            },
            rideId,
            content
        });

        // Save the new message object to the Message collection
        const savedMessage = await newMessage.save();
        console.log("Saved message:", savedMessage);

        // Find the corresponding ride and update its messages field
        const ride = await Ride.findById(rideId);
        if (!ride) {
            return res.status(404).json({ message: "Ride not found" });
        }

        // Ensure messages is an array
        if (!Array.isArray(ride.messages)) {
            ride.messages = [];
        }

        // Explicitly create a new message object to push into the ride's messages array
        const messageObject = {
            _id: savedMessage._id,
            sender: savedMessage.sender,
            content: savedMessage.content,
            timestamp: savedMessage.timestamp
        };

        // Push the new message into the messages array
        console.log("Before push, ride.messages:", ride.messages);
        ride.messages.push(messageObject);
        console.log("After push, ride.messages:", ride.messages);

        // Save the updated ride document
        const updatedRide = await ride.save();
        console.log("Updated ride:", updatedRide);

        // Respond with the saved message object
        res.status(201).json({ message: savedMessage });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getMessages(req, res) {
    try {
        const { rideId } = req.params;

        // Find the ride document by rideId
        const ride = await Ride.findById(rideId);

        // Check if the ride is found
        if (!ride) {
            return res.status(404).json({ message: "Ride not found" });
        }

        // Check if the ride has any messages
        if (!ride.messages || ride.messages.length === 0) {
            return res.status(200).json({ message: "No messages found for this ride" });
        }

        // Respond with the messages array
        res.status(200).json({ messages: ride.messages });
    } catch (error) {
        console.error("Error retrieving messages:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}