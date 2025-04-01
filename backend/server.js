import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import contactRoutes from "./routes/contactRoutes.js"
import cors from "cors"; // Import cors

dotenv.config();
connectDB();

const app = express();

// Enable CORS for all origins (or specify your frontend origin)
app.use(cors({
  origin: "http://localhost:8080", // Allow requests from this origin
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
  credentials: true, // Allow cookies or auth headers if needed
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/device", deviceRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/user", contactRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));