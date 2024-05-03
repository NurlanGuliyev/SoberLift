import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
    userId: String,
    longitude: Number,
    latitude: Number,
    updatedAt: Date
}, { versionKey: false });

const Location = mongoose.model('Location', locationSchema, 'Location');

async function insertLocations() {
    const locations = [
        { userId: "1", longitude: 26.767850, latitude: 38.314178, updatedAt: new Date() }, // IYTE Main Entrance
        { userId: "2", longitude: 26.767323, latitude: 38.315430, updatedAt: new Date() }, // Near IYTE Library
        { userId: "3", longitude: 26.767936, latitude: 38.313234, updatedAt: new Date() }, // Near IYTE Cafeteria
        { userId: "4", longitude: 26.765951, latitude: 38.314169, updatedAt: new Date() }, // IYTE Faculty Building
        { userId: "5", longitude: 26.767483, latitude: 38.312857, updatedAt: new Date() }  // Near IYTE Dormitories
    ];

    try {
        const insertedLocations = await Location.insertMany(locations);
        console.log("Inserted locations:", insertedLocations);
    } catch (error) {
        console.error("Error inserting locations:", error);
    }
}

export { Location, insertLocations };
