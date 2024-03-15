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


dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "SoberLift" // Specify the database name here
}).then(async () => {
    console.log("Connected to MongoDB");

    // Call the insertClients function from client.js to insert clients
    await insertClients();
    //await insertRequests();
    //await insertLocations();
    await insertDrivers();
    //await insertFeedbacks();
    //await insertRides();
    //await insertPayments();
    //await insertCards();
    console.log("Nurlan Guliyev");

    mongoose.disconnect(); // Close the MongoDB connection after insertion
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit with failure
});
