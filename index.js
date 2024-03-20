import mongoose from "mongoose";
import dotenv from "dotenv";
import { insertClients } from "./models/client.js";
import { insertRequests } from "./models/request.js";
import { insertLocations } from "./models/location.js";
import { insertDrivers } from "./models/driver.js";
import { insertFeedbacks} from "./models/feedback.js";
import { insertRides} from "./models/ride.js";
import { insertPayments} from "./models/payment.js";
import { insertCards} from "./models/card.js";
import { login } from "./controllers/clientController.js";
import express from "express";
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Route for the login endpoint
app.post('/api/login', login);

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
    console.log("Nurlan Guliyev");
    // Start the server
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit with failure
});
