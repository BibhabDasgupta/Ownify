import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { z } from "zod";
import  {OAuth2Client} from "google-auth-library";
import { ethers } from "ethers";

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("GOOGLE_CLIENT_ID is not defined in environment variables");
}

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  did: z.string().min(1),
});

export const signup = async (req, res) => {
  try {
    const { name, email, password } = signupSchema.parse(req.body);
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(400).json({ message: "Invalid input", error: error.errors });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });
    res.json({ token, message: "Login successful" });
  } catch (error) {
    res.status(400).json({ message: "Invalid input", error: error.errors });
  }
};

export const checkEmail = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    const { email } = req.params;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user._id.toString() !== decoded.id) return res.status(403).json({ message: "Unauthorized" });

    res.json({ name: user.name, phone: user.phone, did: user.did });
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};


// export const updateProfile = async (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) return res.status(401).json({ message: "No token provided" });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
//     const { name, email, phone, did } = profileSchema.parse(req.body);

//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: "User not found" });
//     if (user._id.toString() !== decoded.id) return res.status(403).json({ message: "Unauthorized" });

//     user.name = name;
//     user.phone = phone;
//     user.did = did;
//     await user.save();

//     res.json({ message: "Profile updated successfully" });
//   } catch (error) {
//     console.log("Validation error:", error.errors);
//     res.status(400).json({ message: "Invalid input", error: error.errors });
//   }
// };


export const updateProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    const { name, email, phone, did } = req.body;

    const user = await User.findByIdAndUpdate(
      decoded.id,
      { name, email, phone, did },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      message: "Profile updated successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        did: user.did,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};


export const getMe = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    const user = await User.findById(decoded.id).select("name email phone did");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      did: user.did || "",
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ message: "Access token is required" });
    }

    // Verify the access token using getTokenInfo
    const tokenInfo = await client.getTokenInfo(accessToken);
    const email = tokenInfo.email;
    

    if (!email) {
      return res.status(400).json({ message: "No email found in token info" });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      // Sign up new user
      user = new User({
        email,
        name: tokenInfo.name || email.split("@")[0], // Use name from token if available
        password: null, // No password for Google users
      });
      await user.save();
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );
    console.log("Backend response:", { token, email });
    res.json({ token, email });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(400).json({ message: "Invalid Google token", error: error.message });
  }
};


export const metamaskAuth = async (req, res) => {
  try {
    const { address, signature, message } = req.body;

    if (!address || !signature || !message) {
      return res.status(400).json({ message: "Address, signature, and message are required" });
    }

    // Verify the signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    // Check if user exists
    let user = await User.findOne({ did: address });
    if (!user) {
      // Create new user with did as MetaMask address
      user = new User({
        did: address,
        name: address.slice(0, 6), // Default name (e.g., "0x1234")
        email: "", // Placeholder, to be filled in profile
        phone: "",
      });
      await user.save({ validateBeforeSave: false }); // Bypass password validation
    }


    console.log("User profile:", {
      name: user.name,
      phone: user.phone,
      did: user.did,
      isProfileComplete: user.name && user.phone && user.did,
    });

    // Check profile completeness
    const isProfileComplete = Boolean(user.name && user.phone && user.did);
    const redirectPath = isProfileComplete ? "/dashboard" : "/profile";

    console.log("User profile:", {
      name: user.name,
      phone: user.phone,
      did: user.did,
      isProfileComplete: user.name && user.phone && user.did,
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );

    res.json({ token, redirectPath });
  } catch (error) {
    console.error("MetaMask auth error:", error);
    res.status(400).json({ message: "MetaMask authentication failed", error: error.message });
  }
};