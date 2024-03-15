import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
    userId: String,
    name: String,
    surname: String,
    card16Digits: String,
    expireDate: String
}, { versionKey: false });

const Card = mongoose.model('Card', cardSchema, 'Card');



async function insertCards() {
}


export { Card, insertCards };