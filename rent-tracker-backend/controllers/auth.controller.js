const User = require("../models/user.model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Login controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log("Login attempt for email:", email);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email (case insensitive)
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    });
    console.log("User found:", user ? `Yes - ${user.email}` : "No");

    if (!user) {
      console.log("User not found with email:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    console.log("Comparing passwords...");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Get JWT secret from environment
    const JWT_SECRET = process.env.JWT_SECRET;
    console.log('🔐 JWT Secret for token creation:', JWT_SECRET ? 'Exists' : 'Missing!');
    
    if (!JWT_SECRET) {
      console.log('❌ JWT_SECRET environment variable is not set!');
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email 
      },
      JWT_SECRET, // Use only the environment variable
      { expiresIn: "7d" }
    );

    // Return user data (without password) and token
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    };

    console.log("✅ Login successful for user:", user.email);
    
    res.status(200).json({
      message: "Login successful",
      token,
      user: userData
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// Register controller
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("Registration attempt:", { name, email });

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check if user already exists (case insensitive)
    const existingUser = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    await newUser.save();
    console.log("User created successfully:", newUser.email);

    // Get JWT secret from environment
    const JWT_SECRET = process.env.JWT_SECRET;
    console.log('🔐 JWT Secret for token creation:', JWT_SECRET ? 'Exists' : 'Missing!');
    
    if (!JWT_SECRET) {
      console.log('❌ JWT_SECRET environment variable is not set!');
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser._id.toString(),
        email: newUser.email 
      },
      JWT_SECRET, // Use only the environment variable
      { expiresIn: "7d" }
    );

    // Return user data (without password) and token
    const userData = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt
    };

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: userData
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

module.exports = {
  login,
  register
};