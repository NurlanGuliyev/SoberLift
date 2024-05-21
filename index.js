import mongoose from "mongoose";
import dotenv from "dotenv";
import { insertClients } from "./models/client.js";
import { insertRequests } from "./models/request.js";
import { insertLocations } from "./models/location.js";
import { insertDrivers } from "./models/driver.js";
import { insertFeedbacks } from "./models/feedback.js";
import { insertRides } from "./models/ride.js";
import { insertPayments } from "./models/payment.js";
import { insertCards } from "./models/card.js";
import { clientLogin, clientRegister, updateClientDetails} from "./controllers/clientController.js"; // Import verifyConfirmationCode
import { driverLogin, driverRegister, findActiveDriversNearLocation, makeActiveInactive, getDriverStatus, updateDriverDetails, updateDriverLocation } from "./controllers/driverController.js"; // Import confirmCode
import { createRequestFromInput, createRideFromInput,findNearbyRequestsForDriver } from "./controllers/RideRequestController.js";
import express from "express";
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Routes
app.post('/api/clientlogin', clientLogin);
app.post('/api/clientregister', clientRegister);
app.post('/api/driverlogin', driverLogin);
app.post('/api/driverregister', driverRegister);
app.post('/api/nearbydrivers', findActiveDriversNearLocation);
app.put('/api/makeactiveinactive/:id', makeActiveInactive);
app.post('/api/createrequest', createRequestFromInput);
app.post('/api/create-ride', createRideFromInput);
app.post('/api/isActive', getDriverStatus);
app.put('/api/updatedriverdetails', updateDriverDetails);
app.put('/api/updateclientdetails', updateClientDetails);
app.post('/api/nearbyrequests', findNearbyRequestsForDriver);
app.put('/api/updateLocation/:driverId', updateDriverLocation);



// Define a route handler for the root URL
app.get('/', (req, res) => {
    res.send('Hello, world!'); // Respond with a simple message
});

dotenv.config();

const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT;

mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "SoberLift" // Specify the database name here
}).then(async () => {
    console.log("Connected to MongoDB");

    // Call the insertClients function from client.js to insert clients
    //await insertClients();
    //await insertRequests();
    //await insertLocations();
    //await insertDrivers();
    //await insertFeedbacks();
    //await insertRides();
    //await insertPayments();
    //await insertCards();
    // Start the server
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit with failure
});
