import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    fare: Number,
    paymentMethod: String,
    transaction_date: Date,
    credit_card_last4_digit: String
}, { versionKey: false });

const Payment = mongoose.model('Payment', paymentSchema, 'Payment');

async function insertPayments() {
}

export { Payment, insertPayments };