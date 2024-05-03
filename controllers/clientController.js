import { Client } from '../models/client.js';
import nodemailer from 'nodemailer';

async function clientLogin(req, res) {
    const { email, password } = req.body;

    try {
        const client = await Client.findOne({ email });

        if (!client || client.password !== password) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        client.isActive = true;
        await client.save();

        return res.status(200).json({ message: "Login successful", client });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

async function clientRegister(req, res) {
    const { name, surname, contact_number, email, password } = req.body;

    try {
        const existingClient = await Client.findOne({ email });
        if (existingClient) {
            return res.status(400).json({ message: "Email already exists" });
        }

        let confirmationCode;
        let clientExistsWithCode = true;

        // Ensure confirmation code is unique
        while (clientExistsWithCode) {
            confirmationCode = generateConfirmationCode();
            clientExistsWithCode = await Client.exists({ confirmationCode });
        }

        await sendConfirmationEmail(email, confirmationCode);

        const newClient = new Client({
            name,
            surname,
            contact_number,
            email,
            password,
            confirmationCode
        });

        await newClient.save();

        return res.status(201).json({ message: "Confirmation code sent to your email" });
    } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

async function clientverifyConfirmationCode(req, res) {
    const { email, code } = req.body;

    try {
        const client = await Client.findOne({ email });

        if (!client || client.confirmationCode !== code) {
            return res.status(400).json({ message: "Invalid confirmation code" });
        }

        client.isActive = true;
        client.confirmationCode = null;
        await client.save();

        return res.status(200).json({ message: "Email confirmed successfully", client });
    } catch (error) {
        console.error("Error verifying confirmation code:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

function generateConfirmationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendConfirmationEmail(email, code) {
    try {
        let transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'nurlan.guliyev2002@gmail.com',
                pass: 'Furkan123!'
            }
        });

        let info = await transporter.sendMail({
            from: '"Nurlan Guliyev" <nurlan.guliyev2002@gmail.com>',
            to: email,
            subject: 'Confirmation Code',
            text: `Your confirmation code is: ${code}`,
            html: `<b>Your confirmation code is: ${code}</b>`
        });

        console.log("Message sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending confirmation email:", error);
        throw new Error("Error sending confirmation email");
    }
}

export { clientLogin, clientRegister, clientverifyConfirmationCode };
