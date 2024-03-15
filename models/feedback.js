import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    submittedBy: String,
    submittedTo: String,
    contact_number: String,
    rating: Number,
    comment: String
}, { versionKey: false });

const Feedback = mongoose.model('Feedback', feedbackSchema, 'Feedback');

async function insertFeedbacks() {
}


export { Feedback, insertFeedbacks };