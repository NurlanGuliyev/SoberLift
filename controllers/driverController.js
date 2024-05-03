import { Driver } from '../models/driver.js'; // Assuming your model file is named driver.js
import nodemailer from 'nodemailer';

// Function to handle driver login
async function driverLogin(req, res) {
    const { email, password } = req.body;

    try {
        const driver = await Driver.findOne({ email });

        if (!driver || driver.password !== password) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Set driver as active
        driver.isActive = true;
        await driver.save();

        return res.status(200).json({ message: "Login successful", driver });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Function to handle driver registration
async function driverRegister(req, res) {
    const { name, surname, contact_number, email, password, drivingLicense } = req.body;

    try {
        // Check if email already exists
        const existingDriver = await Driver.findOne({ email });
        if (existingDriver) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Create new driver
        const newDriver = new Driver({
            name,
            surname,
            contact_number,
            email,
            password,
            drivingLicense
        });

        await newDriver.save();

        // Send confirmation code to the driver's email
        await sendConfirmationCode(email);

        return res.status(201).json({ message: "Driver registered successfully" });
    } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Function to confirm code
async function driverconfirmCode(req, res) {
    const { email, code } = req.body;

    try {
        const driver = await Driver.findOne({ email });

        // Check if driver exists and code matches
        if (!driver || driver.confirmationCode !== code) {
            return res.status(400).json({ message: "Invalid confirmation code" });
        }

        // Update driver's confirmation status and clear code
        driver.isConfirmed = true;
        driver.confirmationCode = null;
        await driver.save();

        return res.status(200).json({ message: "Email confirmed successfully", driver });
    } catch (error) {
        console.error("Error confirming code:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Function to generate a random confirmation code
function generateConfirmationCode() {
    // Generate a random 6-digit code
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to send confirmation code email
async function sendConfirmationCode(email) {
    const confirmationCode = generateConfirmationCode();

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
            to: email, // Receiver's address
            subject: 'Confirmation Code', // Subject line
            text: `Your confirmation code is: ${confirmationCode}`, // Plain text body
            html: `<b>Your confirmation code is: ${confirmationCode}</b>` // HTML body
        });

        console.log("Message sent: %s", info.messageId);
        
        // Save the confirmation code to the driver's document
        await Driver.updateOne({ email }, { confirmationCode });
    } catch (error) {
        console.error("Error sending confirmation code email:", error);
        throw new Error("Error sending confirmation code email");
    }
}

export { driverLogin, driverRegister, driverconfirmCode };
