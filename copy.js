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
import { insertUsers } from "./models/user.js";
import { insertMessages } from "./models/message.js";
import { clientLogin, clientRegister, updateClientDetails} from "./controllers/clientController.js"; 
import { driverLogin, driverRegister, findActiveDriversNearLocation, makeActiveInactive, getDriverStatus, updateDriverDetails, updateDriverLocation } from "./controllers/driverController.js";
import { createRequestFromInput, createRideFromInput,findNearbyRequestsForDriver } from "./controllers/RideRequestController.js";
import { sendMessage, getMessages } from "./controllers/messageController.js";
import { Message } from "./models/message.js";
import express from "express";
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
    }
});

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
app.post('/api/sendMessage', sendMessage);
app.get('/api/getMessages/:userId1/:userId2', getMessages);

// Define a route handler for the root URL
app.get('/', (req, res) => {
    res.send('Hello, world!'); // Respond with a simple message
});

dotenv.config();

const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT;
const portForSocket = process.env.PORTSOCKET;

httpServer.listen(portForSocket, () => {
    console.log(`Server is running on port ${portForSocket}`);
});

mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "SoberLift"
}).then(async () => {
    console.log("Connected to MongoDB");

    // Start the server
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit with failure
});

// Socket.IO logic
io.on('connection', (socket) => {
    console.log('A user connected', socket.id);

    socket.on('sendMessage', async (data) => {
        const { senderId, receiverId, content } = data;
        try {
            // Check if senderId and receiverId are valid ObjectIds
            if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
                console.error("Invalid senderId or receiverId");
                return;
            }

            // Create a new message
            const newMessage = new Message({
                senderId,
                receiverId,
                content
            });

            // Save the message to the database
            await newMessage.save();
            console.log(`Message from ${senderId} to ${receiverId}: ${content}`);

            // Broadcast the new message to all connected clients
            io.emit('newMessage', newMessage);

            // Emit a confirmation back to the sender
            socket.emit('messageSent', newMessage);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected', socket.id);
    });
});
