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

async function generatePayment(fare) {
    try {
        // Generate payment details
        const paymentMethodOptions = ["Credit Card", "Debit Card", "PayPal"];
        const randomPaymentMethod = paymentMethodOptions[Math.floor(Math.random() * paymentMethodOptions.length)];
        const transactionDate = new Date();
        const creditCardLast4Digit = Math.floor(Math.random() * 10000).toString().padStart(4, "0");

        // Create a new payment object
        const newPayment = new Payment({
            fare,
            paymentMethod: randomPaymentMethod,
            transaction_date: transactionDate,
            credit_card_last4_digit: creditCardLast4Digit
        });

        // Save the new payment object to the database
        const savedPayment = await newPayment.save();

        // Return the ObjectId of the newly created payment
        return savedPayment._id;
    } catch (error) {
        console.error("Error generating payment:", error);
        return null;
    }
}

export { generatePayment };


export { Payment, insertPayments };