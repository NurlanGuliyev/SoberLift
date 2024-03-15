import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
    clientId: String,
    driverId: String,
    scheduledTime: Date,
    pickupLocation: [Number],
    dropOffLocation: [Number],
    distance: Number,
    fare: Number,
    status: String
}, { versionKey: false });


const Request = mongoose.model('Request', requestSchema, 'Request');

async function insertRequests() {
}

export { Request, insertRequests };