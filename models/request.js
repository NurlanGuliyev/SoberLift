import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
    clientId: String,
    scheduledTime: Date,
    pickupLocation: Object,
    dropOffLocation: Object,
    distance: Number,
    fare: Number,
    status: String
}, { versionKey: false });


const Request = mongoose.model('Request', requestSchema, 'Request');

async function insertRequests() {
}

export { Request, insertRequests };