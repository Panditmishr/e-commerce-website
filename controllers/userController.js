const UserModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const secretKey = "mysecretkey"; // Ideally, move this to .env

// REGISTER USER
const registerUser = async (req, res) => {
  try {
    console.log(req.body, "req.body");

    // Check if email already exists
    const existingUser = await UserModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    // Create user with hashed password
    const userData = { ...req.body, password: hashedPassword };
    await UserModel.create(userData);

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};

// LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET_KEY || secretKey,
      { expiresIn: "1d" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};

// LOGOUT USER
const logoutUser = async (req, res) => {
  try {
    // If using JWT: client should delete token
    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("Error logging out:", err);
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
