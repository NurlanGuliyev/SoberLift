import { Request } from "../models/request.js";
import { Ride } from "../models/ride.js";
import { generatePayment } from "../models/payment.js"; // Assuming payment generating function is in payment.js
import {Location} from "../models/location.js"
import { Driver } from "../models/driver.js";
import { Client } from "../models/client.js";

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

        // Find the request document and update its status to "accepted"
        const updatedRequest = await Request.findByIdAndUpdate(
            requestId,
            { status: "accepted" },
            { new: true }
        );

        if (!updatedRequest) {
            return res.status(404).json({ message: "Request not found" });
        }

        // Create a new ride object
        const newRide = new Ride({
            requestId: requestId.toString(),
            driverId,
            status: "pending",
            startTime: null,
            endTime: null
        });

        newRide.startTime = new Date();

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

// Function to find nearby requests for a driver with the specified criteria
export async function findNearbyRequestsForDriver(req, res) {
    try {
        const { driver } = req.body; // Access the driver object from the request body

        // Check if locationId is present
        if (!driver.locationId) {
            return res.status(400).json({ message: "Driver locationId is missing" });
        }

        // Retrieve the driver's location using locationId
        const location = await Location.findById(driver.locationId);
        if (!location) {
            throw new Error('Location not found');
        }

        const { latitude: driverLat, longitude: driverLon } = location;

        // Retrieve all request documents
        const requests = await Request.find();

        // Get the current time and the time 30 minutes from now
        const now = new Date();
        const thirtyMinutesLater = new Date(now.getTime() + 30 * 60000); // 30 minutes in milliseconds

        // Filter requests based on proximity to the driver's location and scheduled time
        const nearbyRequests = requests.filter(request => {
            if (!request.pickupLocation || !request.pickupLocation.latitude || !request.pickupLocation.longitude) {
                return false; // Skip if pickupLocation or its properties are null/undefined
            }

            const { latitude: pickupLat, longitude: pickupLon } = request.pickupLocation;
            const distance = calculateDistance(driverLat, driverLon, pickupLat, pickupLon);
            const scheduledTime = new Date(request.scheduledTime);

            // Check if within 10 km and the scheduled time is in the past or within the next 30 minutes
            return distance <= 10 && (scheduledTime <= now || (scheduledTime > now && scheduledTime <= thirtyMinutesLater));
        });

        // Fetch the full client documents for each request
        const populatedRequests = await Promise.all(
            nearbyRequests.map(async (request) => {
                const client = await Client.findById(request.clientId);
                const requestObj = request.toObject();
                requestObj.client = client; // Assign the client document to a new field 'client'
                delete requestObj.clientId; // Optionally, you can remove the clientId field
                return requestObj;
            })
        );

        // Return the nearby requests with full client details
        return res.status(200).json(populatedRequests);
    } catch (error) {
        console.error("Error finding nearby requests for driver:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

async function isRequestAccepted(req, res) {
    try {
        const { requestId } = req.body;

        // Find the request document by its ID
        const request = await Request.findById(requestId);

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        // Check the status of the request
        const isAccepted = request.status === "accepted";

        if (isAccepted){
            return res.status(200).json(true);
        }
        else{
            return res.status(200).json(false);
        }

        // Return the boolean result
        //res.status(200).json({ isAccepted });
    } catch (error) {
        console.error("Error checking request status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function getRideByRequestId(req, res) {
    try {
        const { requestId } = req.body;

        console.log(`Received requestId: ${requestId}`);

        // Find the ride document that contains the given requestId
        const ride = await Ride.findOne({ requestId: requestId.toString() });

        if (!ride) {
            console.log(`Ride not found for requestId: ${requestId}`);
            return res.status(404).json({ message: "Ride not found" });
        }

        // Find the request document that has the given requestId
        const request = await Request.findById(requestId);
        if (!request) {
            console.log(`Request not found for requestId: ${requestId}`);
            return res.status(404).json({ message: "Request not found" });
        }

        // Find the driver document that has the driverId in the ride document
        const driver = await Driver.findById(ride.driverId);
        if (!driver) {
            console.log(`Driver not found for driverId: ${ride.driverId}`);
            return res.status(404).json({ message: "Driver not found" });
        }

        // Replace the requestId and driverId fields in the ride document with the actual request and driver documents
        const rideWithDetails = {
            ...ride.toObject(),
            request: request,
            driver: driver
        };

        // Remove the requestId and driverId fields from the response
        delete rideWithDetails.requestId;
        delete rideWithDetails.driverId;

        console.log('Ride with details:', rideWithDetails);

        // Return the modified ride document
        return res.status(200).json(rideWithDetails);
    } catch (error) {
        console.error("Error retrieving ride by request ID:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export default getRideByRequestId;

// Function to finish a ride
export async function finishRide(req, res) {
    const { rideId } = req.params;

    try {
        const ride = await Ride.findById(rideId);
        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        // Set the status to "finished"
        ride.status = "finished";

        // Set the endTime to the current time
        ride.endTime = new Date();

        // Save the updated ride document
        await ride.save();

        return res.status(200).json({ message: 'Ride status updated', status: ride.status, endTime: ride.endTime });
    } catch (error) {
        console.error('Error updating ride status:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function cancelRide(req, res) {
    const { rideId } = req.params;

    try {
        const ride = await Ride.findById(rideId);
        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        // Toggle the status
        ride.status = "canceled";
        await ride.save();

        return res.status(200).json({ message: 'Ride status updated', status: ride.status });
    } catch (error) {
        console.error('Error updating ride status:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


async function cancelRequest(req, res) {
    const { requestId } = req.params;

    try {
        const request = await Request.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Toggle the status
        request.status = "canceled";
        await request.save();

        return res.status(200).json({ message: 'Request status updated', status: request.status });
    } catch (error) {
        console.error('Error updating ride status:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}




export { createRequestFromInput, createRideFromInput, isRequestAccepted, getRideByRequestId, cancelRide, cancelRequest};
