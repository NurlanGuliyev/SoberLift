import mongoose from "mongoose";

const rideSchema = new mongoose.Schema({
    requestId: String,
    PaymentId: String,
    isActive: Boolean,
    startTime: Date,
    endTime: Date
}, { versionKey: false });

const Ride = mongoose.model('Ride', rideSchema, 'Ride');

async function insertRides() {
}

export { Ride, insertRides };