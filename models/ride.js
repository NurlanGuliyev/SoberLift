import mongoose from "mongoose";

const rideSchema = new mongoose.Schema({
    requestId: String,
    paymentId: String,
    driverId: String,
    status: String,
    startTime: Date,
    endTime: Date
}, { versionKey: false });

const Ride = mongoose.model('Ride', rideSchema, 'Ride');

async function insertRides() {
}

export { Ride, insertRides };