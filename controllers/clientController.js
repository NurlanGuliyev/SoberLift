import { Client } from '../models/client.js'; // Assuming your model file is named client.js

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

        // Create new client
        const newClient = new Client({
            name,
            surname,
            contact_number,
            email,
            password
        });

        await newClient.save();

        return res.status(201).json({ message: "Client registered successfully", client: newClient });
    } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export { clientLogin, clientRegister };
