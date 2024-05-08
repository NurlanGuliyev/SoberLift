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

// Function to handle driver registration
async function driverRegister(req, res) {
    const { name, surname, contact_number, email, password, drivingLicense } = req.body;

    try {
        // Check if email already exists
        const existingDriver = await Driver.findOne({ email });
        if (existingDriver) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Create new driver
        const newDriver = new Driver({
            name,
            surname,
            contact_number,
            email,
            password,
            drivingLicense
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
        const { locationId } = req.body;
        
        // Step 1: Check if locationId is a valid ObjectId
        const isValidObjectId = mongoose.Types.ObjectId.isValid(locationId);
        if (!isValidObjectId) {
            return res.status(400).json({ message: 'Invalid locationId format' });
        }

        // Step 2: Get latitude and longitude from the location document
        const location = await Location.findById(locationId);
        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        const { latitude: locLat, longitude: locLon } = location;

        // Step 3: Retrieve all active drivers
        const activeDrivers = await Driver.find({ status: 'active' });

        // Step 4: Calculate distance for each driver
        const radiusInKm = 20; // Adjust as needed
        const nearbyDrivers = await Promise.all(activeDrivers.map(async (driver) => {
            try {
                const location = await Location.findById(driver.locationId);
                if (!location) {
                    throw new Error('Location not found');
                }
        
                const { latitude: driverLat, longitude: driverLon } = location;
                const distance = calculateDistance(locLat, locLon, driverLat, driverLon);
        
                return {
                    ...driver.toObject(),
                    distance // Add the distance to the driver object
                };
            } catch (error) {
                console.error(`Error finding location for driver ${driver._id}:`, error);
                return null;
            }
        }));

        // Filter nearby drivers after Promise.all
        const filteredNearbyDrivers = nearbyDrivers.filter(driver => driver !== null && driver.distance <= radiusInKm);

        return res.status(200).json(filteredNearbyDrivers);
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








export { driverLogin, driverRegister, findActiveDriversNearLocation, makeActiveInactive };
