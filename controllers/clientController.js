import { Client } from '../models/client.js'; // Assuming your model file is named client.js
import nodemailer from 'nodemailer';

// Function to handle client login
async function clientLogin(req, res) {
    const { email, password } = req.body;

    try {
        const client = await Client.findOne({ email });

        if (!client || client.password !== password) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Set client as active
        client.isActive = true;
        await client.save();

        return res.status(200).json({ message: "Login successful", client });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Function to handle client registration
async function clientRegister(req, res) {
    const { name, surname, contact_number, email, password } = req.body;

    try {
        // Check if email already exists
        const existingClient = await Client.findOne({ email });
        if (existingClient) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Generate confirmation code
        const confirmationCode = generateConfirmationCode();

        // Send confirmation email
        await sendConfirmationEmail(email, confirmationCode);

        // Create new client without saving it yet
        const newClient = new Client({
            name,
            surname,
            contact_number,
            email,
            password,
            confirmationCode
        });

        // Save the client to the database
        await newClient.save();

        return res.status(200).json({ message: "Confirmation code sent to your email" });
    } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Function to verify confirmation code
async function clientverifyConfirmationCode(req, res) {
    const { email, code } = req.body;

    try {
        // Find the client by email
        const client = await Client.findOne({ email });

        // Check if client exists and confirmation code matches
        if (!client || client.confirmationCode !== code) {
            return res.status(400).json({ message: "Invalid confirmation code" });
        }

        // Update client status to active
        client.isActive = true;
        client.confirmationCode = null; // Clear confirmation code
        await client.save();

        return res.status(200).json({ message: "Email confirmed successfully", client });
    } catch (error) {
        console.error("Error verifying confirmation code:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Function to generate a random confirmation code
function generateConfirmationCode() {
    // Generate a random 6-digit code
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to send confirmation email
async function sendConfirmationEmail(email, code) {
    try {
        // Create transporter object using SMTP transport
        let transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'your_email@gmail.com', // Your email address
                pass: 'your_password' // Your email password
            }
        });

        // Send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"Your Name" <your_email@gmail.com>', // Sender address
            to: email, // List of receivers
            subject: 'Confirmation Code', // Subject line
            text: `Your confirmation code is: ${code}`, // Plain text body
            html: `<b>Your confirmation code is: ${code}</b>` // HTML body
        });

        console.log("Message sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending confirmation email:", error);
        throw new Error("Error sending confirmation email");
    }
}

export { clientLogin, clientRegister, clientverifyConfirmationCode };
