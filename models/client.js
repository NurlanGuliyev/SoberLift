import mongoose from "mongoose";

// Define a Mongoose schema for the "Client" collection
const clientSchema = new mongoose.Schema({
    name: String,
    surname: String,
    contact_number: String,
    email: String,
    password: String,
    isActive: {
        type: Boolean,
        default: false,
      },
    ratings: [Number],
    rating: Number

}, { versionKey: false });

// Create a Mongoose model for the "Client" collection
const Client = mongoose.model('Client', clientSchema, 'Client');

// Function to insert clients
async function insertClients() {
    const clients = [
        { name: 'John', surname: 'Doe', contact_number: '1234567890', email: 'john@example.com', password: '123123', ratings: [4, 5, 3], rating: 5 },
        { name: 'Jane', surname: 'Smith', contact_number: '9876543210', email: 'jane@example.com', password: '123123', ratings: [5, 5, 4], rating: 5 },
        { name: 'Alice', surname: 'Johnson', contact_number: '4567890123', email: 'alice@example.com', password: '123123', ratings: [3, 4, 3], rating: 5 },
        { name: 'Bob', surname: 'Brown', contact_number: '7890123456', email: 'bob@example.com', password: '123123', ratings: [5, 4, 5], rating: 5 },
        { name: 'Emily', surname: 'Taylor', contact_number: '2345678901', email: 'emily@example.com', password: '123123', ratings: [4, 3, 4], rating: 5 }
    ];

    try {
        const insertedClients = await Client.insertMany(clients);
        console.log("Inserted documents:", insertedClients);
    } catch (error) {
        console.error("Error inserting documents:", error);
    }
}

export { Client, insertClients };
