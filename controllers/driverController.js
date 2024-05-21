import { Driver } from '../models/driver.js'; // Assuming your model file is named driver.js
import { Location } from '../models/location.js'; // Import the Location model
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
            status: "inactive" // Set initial status
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



export { driverLogin, driverRegister, findActiveDriversNearLocation, makeActiveInactive, getDriverStatus, updateDriverDetails, updateDriverLocation };
