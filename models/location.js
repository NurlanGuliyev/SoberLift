import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
    userId: String,
    longitude: Number,
    latitude: Number,
    updatedAt: Date
}, { versionKey: false });

const Location = mongoose.model('Location', locationSchema, 'Location');

async function insertLocations() {
}

export { Location, insertLocations };
