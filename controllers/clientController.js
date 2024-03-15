// Import necessary modules
const { Client } = require("../models/client");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const moment = require("moment");

// Define your private key and configure nodemailer transporter
const privateKey = "ironmaiden";
const transporter = nodemailer.createTransport({
  // Configure your email transporter here
});

// Function to register a new client
async function register(req, res) {
  try {
    let email = req.body?.email.toLowerCase();
    let existingClient = await Client.findOne({ email: email });
    if (existingClient) {
      return res.status(500).json({ msg: "This user already exists!!!" });
    }

    const newClient = new Client({
      email: email,
      username: req.body.username,
      password: req.body.password, // Hash password before saving in real-world scenario
    });

    await newClient.save();
    res.json({ email });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// Function to confirm user's email and generate JWT token
async function confirm(req, res) {
  try {
    const code = req.body.code;
    const email = req.body.email;

    let user = await Client.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.codeCounter === 0) {
      return res.status(500).json({ message: "BLOCK!!" });
    }

    if (user.code === code) {
      if (moment(user.codeExpire).isAfter(moment())) {
        const token = jwt.sign(email, privateKey);
        user.isActive = true;
        user.codeCounter = 3;
        await user.save();
        res.json({ token });
      } else {
        res.status(500).json({ message: "Expire Date Error!" });
      }
    } else {
      user.codeCounter -= 1;
      await user.save();
      res.status(404).json({ message: "Confirm code error!", remainingAttempts: user.codeCounter });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// Function to login a user
async function login(req, res) {
  try {
    let user = await Client.findOne({ email: req.body.email, password: req.body.password });
    if (!user) {
      return res.status(404).json({ message: "Email or password wrong!" });
    }

    if (!user.isActive) {
      return res.status(203).json({ email: req.body.email });
    }

    const token = jwt.sign(req.body.email, privateKey);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// Function to verify JWT token
async function token(req, res) {
  try {
    const token = req.body.token;
    const email = jwt.verify(token, privateKey);
    let user = await Client.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user: user });
  } catch (error) {
    res.status(500).json({ message: "Token error!", error: error.message });
  }
}

// Function to handle forgot password
async function forgotPassword(req, res) {
  try {
    const email = req.body.email;
    let user = await Client.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const randomToken = Math.floor(Math.random() * 10000);
    user.forgotPassword = randomToken;
    await user.save();

    sendForgotPasswordEmail(email, randomToken);

    res.status(200).json({ message: "Password reset email sent." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// Function to reset user's password
async function resetPassword(req, res) {
  try {
    const { userId, randomToken, newPassword } = req.body;

    let user = await Client.findOne({ _id: userId, forgotPassword: randomToken });
    if (!user) {
      return res.status(404).json({ message: "User not found or invalid token." });
    }

    user.password = newPassword; // Hash newPassword before saving
    await user.save();
    res.json({ message: "Password changed successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// Function to send forgot password email
function sendForgotPasswordEmail(to, password) {
  transporter.sendMail({
    from: "c8657545@gmail.com",
    to: to,
    subject: "Password Reset",
    text: "Your new password is: " + password,
  });
}

// Export all functions
module.exports = {
  register,
  confirm,
  login,
  token,
  forgotPassword,
  resetPassword
};
