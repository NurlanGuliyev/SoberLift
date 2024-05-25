import { Client } from '../models/client.js'; // Assuming your model file is named client.js
import mongoose from 'mongoose';
import { Request } from '../models/request.js';
import { Ride } from '../models/ride.js';

// Function to handle client login
async function clientLogin(req, res) {
    const { email, password } = req.body;

    try {
        const client = await Client.findOne({ email });

        if (!client || client.password !== password) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Set client as active
        client.isActive = true;
        await client.save();

        return res.status(200).json({ message: "Login successful", client });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Function to handle client registration
async function clientRegister(req, res) {
    const { name, surname, contact_number, email, password } = req.body;

    try {
        // Check if email already exists
        const existingClient = await Client.findOne({ email });
        if (existingClient) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Create new client
        const newClient = new Client({
            name,
            surname,
            contact_number,
            email,
            password,
            rating: 5
        });

        await newClient.save();

        return res.status(201).json({ message: "Client registered successfully", client: newClient });
    } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

async function updateClientDetails(req, res) {
    const { clientId, name, surname, email } = req.body;

    try {
        // Check if driverId is a valid ObjectId
        const isValidObjectId = mongoose.Types.ObjectId.isValid(clientId);
        if (!isValidObjectId) {
            return res.status(400).json({ message: 'Invalid clientId format' });
        }

        // Find the driver by ID and update the details
        const updatedClient = await Client.findByIdAndUpdate(
            clientId,
            { name, surname, email },
            { new: true } // Return the updated document
        );

        if (!updatedClient) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Return the updated driver object
        return res.status(200).json(updatedClient);
    } catch (error) {
        console.error("Error updating client details:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

async function getClientRides(req, res){
    const { clientId } = req.body;

    try {
        // Check if the clientId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({ error: 'Invalid clientId' });
        }

        // Find requests with the given clientId
        const requests = await Request.find({ clientId });

        // If no requests found, return an empty array
        if (!requests.length) {
            return res.status(200).json([]);
        }

        // Extract requestIds
        const requestIds = requests.map(request => request._id.toString());

        // Find rides with the given requestIds
        const rides = await Ride.find({ requestId: { $in: requestIds } });

        // Replace the requestId field in the ride with the actual request document
        const ridesWithRequests = rides.map(ride => {
            const request = requests.find(req => req._id.toString() === ride.requestId);
            return {
                ...ride.toObject(),
                request: request ? request.toObject() : null
            };
        });

        // Return the modified rides
        res.status(200).json(ridesWithRequests);
    } catch (error) {
        console.error("Error retrieving client rides:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Function to rate a client
export async function rateClient(req, res) {
    try {
        const { clientId } = req.params;
        const { rating } = req.body;

        // Find the client by clientId
        const client = await Client.findById(clientId);
        if (!client) {
            return res.status(404).json({ message: "Client not found" });
        }

        // Add the new rating to the ratings array
        client.ratings.push(rating);

        // Calculate the new average rating
        const totalRatings = client.ratings.length;
        const sumOfRatings = client.ratings.reduce((acc, curr) => acc + curr, 0);
        client.rating = sumOfRatings / totalRatings;

        // Save the updated client document
        await client.save();

        // Return the updated rating
        return res.status(200).json({ rating: client.rating });
    } catch (error) {
        console.error("Error rating client:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
export { clientLogin, clientRegister, updateClientDetails, getClientRides };