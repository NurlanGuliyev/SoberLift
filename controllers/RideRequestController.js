import { Request } from "../models/request.js";
import { Ride } from "../models/ride.js";
import { generatePayment } from "../models/payment.js"; // Assuming payment generating function is in payment.js

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

async function createRideFromInput(req, res) {
    try {
        // Extract data from the request object body
        const { request, driverId, isActive, fare } = req.body;

        // Get the requestId from the request object
        const requestId = request._id;

        // Create a new ride object
        const newRide = new Ride({
            requestId,
            driverId,
            isActive,
            startTime: null,
            endTime: null
        });

        // Save the new ride object to the database
        const savedRide = await newRide.save();

        // Generate payment details and get the payment ObjectId
        const paymentId = await generatePayment(fare);

        // Assign the payment ObjectId to the ride object's paymentId field
        savedRide.paymentId = paymentId.toString();

        // Save the updated ride object with paymentId
        await savedRide.save();

        // Respond with the saved ride object
        res.status(201).json({ ride: savedRide });
    } catch (error) {
        console.error("Error creating ride:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}





export { createRequestFromInput, createRideFromInput };
