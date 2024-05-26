import { Driver } from '../models/driver.js'; // Assuming your model file is named driver.js
import { Location } from '../models/location.js'; // Import the Location model
import { Ride } from '../models/ride.js';
import { Request } from '../models/request.js';
import mongoose from 'mongoose';

// Function to handle driver login
async function driverLogin(req, res) {
    const { email, password } = req.body;

    try {
        const driver = await Driver.findOne({ email });

        if (!driver || driver.password !== password) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Set driver as active
        driver.isActive = true;
        await driver.save();

        return res.status(200).json({ message: "Login successful", driver });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

async function driverRegister(req, res) {
    const { name, surname, contact_number, email, password, drivingLicense } = req.body;

    try {
        // Check if email already exists
        const existingDriver = await Driver.findOne({ email });
        if (existingDriver) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Create a new location object with latitude and longitude set to null
        const newLocation = new Location({
            latitude: null,
            longitude: null,
            updatedAt: new Date() // Setting the updatedAt field to current date
        });

        // Save the new location object to the database
        const savedLocation = await newLocation.save();

        // Create new driver with the saved location's ID
        const newDriver = new Driver({
            name,
            surname,
            contact_number,
            email,
            password,
            drivingLicense,
            locationId: savedLocation._id, // Assign the location ID to the driver
            isActive: false, // Set default status to inactive
            status: "inactive", // Set initial status
            rating: 5
        });

        await newDriver.save();

        return res.status(201).json({ message: "Driver registered successfully", driver: newDriver });
    } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
// Function to calculate distance between two points (in kilometers)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180; // Convert degrees to radians
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
}

// Function to find active drivers near a location without using geospatial queries
async function findActiveDriversNearLocation(req, res) {
    try {
        const { latitude, longitude } = req.body; // Assuming latitude and longitude are provided in the request body
        
        // Step 1: Retrieve all active drivers
        const activeDrivers = await Driver.find({ status: 'active' });

        // Step 2: Calculate distance for each driver and filter based on the 20km radius
        const radiusInKm = 20; // Adjust as needed
        const nearbyLocations = await Promise.all(activeDrivers.map(async (driver) => {
            try {
                const location = await Location.findById(driver.locationId);
                if (!location) {
                    throw new Error('Location not found');
                }
        
                const { latitude: driverLat, longitude: driverLon } = location;
                const distance = calculateDistance(latitude, longitude, driverLat, driverLon);
        
                if (distance <= radiusInKm) {
                    return location.toObject(); // Add the location object to the array
                } else {
                    return null;
                }
            } catch (error) {
                console.error(`Error finding location for driver ${driver._id}:`, error);
                return null;
            }
        }));

        // Filter out null values and return the nearby location objects
        const filteredNearbyLocations = nearbyLocations.filter(location => location !== null);

        return res.status(200).json(filteredNearbyLocations);
    } catch (error) {
        console.error("Error finding active drivers near location:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

async function makeActiveInactive(req, res) {
    const { id } = req.params;

    try {
        const driver = await Driver.findById(id);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        // Toggle the status
        driver.status = driver.status === 'active' ? 'inactive' : 'active';
        await driver.save();

        return res.status(200).json({ message: 'Driver status updated', status: driver.status });
    } catch (error) {
        console.error('Error updating driver status:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function getDriverStatus(req, res) {
    const { driverId } = req.body;

    try {
        // Check if driverId is a valid ObjectId
        const isValidObjectId = mongoose.Types.ObjectId.isValid(driverId);
        if (!isValidObjectId) {
            return res.status(400).json({ message: 'Invalid driverId format' });
        }

        // Find the driver by ID
        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        // Return the driver's status
        return res.status(200).json({ status: driver.status });
    } catch (error) {
        console.error("Error retrieving driver status:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

async function updateDriverDetails(req, res) {
    const { driverId, name, surname, email } = req.body;

    try {
        // Check if driverId is a valid ObjectId
        const isValidObjectId = mongoose.Types.ObjectId.isValid(driverId);
        if (!isValidObjectId) {
            return res.status(400).json({ message: 'Invalid driverId format' });
        }

        // Find the driver by ID and update the details
        const updatedDriver = await Driver.findByIdAndUpdate(
            driverId,
            { name, surname, email },
            { new: true } // Return the updated document
        );

        if (!updatedDriver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        // Return the updated driver object
        return res.status(200).json(updatedDriver);
    } catch (error) {
        console.error("Error updating driver details:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Function to update driver location
async function updateDriverLocation(req, res) {
    const { driverId } = req.params;
    const { latitude, longitude } = req.body.location;

    try {
        // Find the driver by driverId
        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({ message: "Driver not found" });
        }

        // Get the locationId from the driver document
        const locationId = driver.locationId;
        if (!locationId) {
            return res.status(404).json({ message: "Location not found for this driver" });
        }

        // Find the location by locationId and update latitude and longitude
        const location = await Location.findByIdAndUpdate(
            locationId,
            { latitude, longitude, updatedAt: new Date() },
            { new: true } // Return the updated document
        );

        if (!location) {
            return res.status(404).json({ message: "Location not found" });
        }

        return res.status(200).json({ message: "Location updated successfully", location });
    } catch (error) {
        console.error("Error updating location:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

async function getDriverRides(req,res){
    const { driverId } = req.body;

    try {
        // Check if the driverId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(driverId)) {
            return res.status(400).json({ error: 'Invalid driverId' });
        }

        // Find rides with the given driverId
        const rides = await Ride.find({ driverId });

        // If no rides found, return an empty array
        if (!rides.length) {
            return res.status(200).json([]);
        }

        // Extract requestIds from the rides
        const requestIds = rides.map(ride => ride.requestId);

        // Find requests with the given requestIds
        const requests = await Request.find({ _id: { $in: requestIds } });

        // Create a map of requestId to request document
        const requestMap = {};
        requests.forEach(request => {
            requestMap[request._id.toString()] = request;
        });

        // Replace the requestId field in the ride with the actual request document
        const ridesWithRequests = rides.map(ride => ({
            ...ride.toObject(),
            request: requestMap[ride.requestId] ? requestMap[ride.requestId].toObject() : null
        }));

        // Return the modified rides
        res.status(200).json(ridesWithRequests);
    } catch (error) {
        console.error("Error retrieving driver rides:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

async function getDriverLocation(req, res) {
    try {
        const { driverId } = req.body;

        // Find the driver by the given driverId
        const driver = await Driver.findById(driverId);

        if (!driver) {
            return res.status(404).json({ message: "Driver not found" });
        }

        const locationId = driver.locationId;

        if (!locationId) {
            return res.status(404).json({ message: "Location ID not found for the driver" });
        }

        // Find the location by locationId
        const location = await Location.findById(locationId);

        if (!location) {
            return res.status(404).json({ message: "Location not found" });
        }

        // Return the location document
        res.status(200).json(location);
    } catch (error) {
        console.error("Error retrieving driver's location:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Function to rate a driver
export async function rateDriver(req, res) {
    try {
        const { driverId } = req.params;
        const { rating } = req.body;

        // Find the driver by driverId
        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({ message: "Driver not found" });
        }

        // Add the new rating to the ratings array
        driver.ratings.push(rating);

        // Calculate the new average rating
        const totalRatings = driver.ratings.length;
        const sumOfRatings = driver.ratings.reduce((acc, curr) => acc + curr, 0);
        driver.rating = sumOfRatings / totalRatings;

        // Save the updated client document
        await driver.save();

        // Return the updated rating
        return res.status(200).json({ rating: driver.rating });
    } catch (error) {
        console.error("Error rating client:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Function to delete a driver by driverId
export async function deleteDriver(req, res) {
    try {
        const { driverId } = req.params;

        // Check if the driverId is provided
        if (!driverId) {
            return res.status(400).json({ message: "Driver ID is required" });
        }

        // Find and delete the driver by driverId
        const deletedDriver = await Driver.findByIdAndDelete(driverId);

        // Check if the driver was found and deleted
        if (!deletedDriver) {
            return res.status(404).json({ message: "Driver not found" });
        }

        // Respond with a success message
        return res.status(200).json({ message: "Driver deleted successfully" });
    } catch (error) {
        console.error("Error deleting driver:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export { driverLogin, driverRegister, findActiveDriversNearLocation, makeActiveInactive, getDriverStatus, updateDriverDetails, updateDriverLocation, getDriverRides, getDriverLocation };
