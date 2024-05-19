import { Request } from "../models/request.js";
import { Ride } from "../models/ride.js";
import { generatePayment } from "../models/payment.js"; // Assuming payment generating function is in payment.js
import {Location} from "../models/location.js"

async function createRequestFromInput(req, res) {
    try {
        // Extract data from the request object body
        const { clientId, scheduledTime, pickupLocation, dropOffLocation, distance, fare} = req.body;

        // Create a new request object
        const newRequest = new Request({
            clientId,
            scheduledTime,
            pickupLocation,
            dropOffLocation,
            distance,
            fare,
            status: "unaccepted"
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
        const { request, driverId } = req.body;

        // Get the requestId and fare from the request object
        const { _id: requestId, fare } = request;

        // Create a new ride object
        const newRide = new Ride({
            requestId: requestId.toString(),
            driverId,
            status: "pending",
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

// Function to calculate distance between two points (in kilometers)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180; // Convert degrees to radians
    const dLon = (lon1 - lon2) * Math.PI / 180; // Convert degrees to radians
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
}

// Function to find requests within 10 km proximity of a driver
export async function findNearbyRequestsForDriver(req, res) {
    try {
        const driver = req.body;

        // Retrieve the driver's location using locationId
        const location = await Location.findById(driver.locationId);
        if (!location) {
            throw new Error('Location not found');
        }

        const { latitude: driverLat, longitude: driverLon } = location;

        // Retrieve all request documents
        const requests = await Request.find();

        // Filter requests based on proximity to the driver's location
        const nearbyRequests = requests.filter(request => {
            const { latitude: pickupLat, longitude: pickupLon } = request.pickupLocation;
            const distance = calculateDistance(driverLat, driverLon, pickupLat, pickupLon);
            return distance <= 100; // Check if within 10 km
        });

        // Return the nearby requests
        return res.status(200).json(nearbyRequests);
    } catch (error) {
        console.error("Error finding nearby requests for driver:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}





export { createRequestFromInput, createRideFromInput };
