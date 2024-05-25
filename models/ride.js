import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    sender: {
        _id: mongoose.Schema.Types.ObjectId,
        name: String
    },
    content: String,
    timestamp: Date
}, { _id: false });  // Set _id to false to avoid having multiple _id fields in the nested schema

const rideSchema = new mongoose.Schema({
    requestId: String,
    paymentId: String,
    driverId: String,
    status: String,
    startTime: Date,
    endTime: Date,
    messages: [messageSchema]  // Define messages as an array of messageSchema
}, { versionKey: false });

const Ride = mongoose.model('Ride', rideSchema, 'Ride');

async function insertRides() {
}

export { Ride, insertRides };