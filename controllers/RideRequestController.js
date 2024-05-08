import { Request } from "../models/request.js";

async function createRequestFromInput(req, res) {
    try {
        // Extract data from the request object body
        const { clientId, scheduledTime, pickupLocation, dropOffLocation, distance, fare, status } = req.body;

        // Create a new request object
        const newRequest = new Request({
            clientId,
            scheduledTime,
            pickupLocation,
            dropOffLocation,
            distance,
            fare,
            status
        });

        // Save the new request object to the database
        const savedRequest = await newRequest.save();

        // Respond with the saved request object
        res.status(201).json(savedRequest);
    } catch (error) {
        console.error("Error creating request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export { createRequestFromInput };
