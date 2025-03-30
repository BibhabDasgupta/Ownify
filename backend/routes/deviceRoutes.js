import express from "express";
import { registerDevice, getDevices, downloadDevicePDF, getUserByAddress, checkAndNotify, getUserMessages, markMessageAsRead} from "../controllers/deviceController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Register a device
router.post("/register", authMiddleware, registerDevice);

// Get all registered devices for the authenticated user
router.get("/devices", authMiddleware, getDevices);

// Download PDF for a specific device
router.get("/download/:deviceId", authMiddleware, downloadDevicePDF);

router.get("/by-address", getUserByAddress);


router.post("/check-and-notify", checkAndNotify);


router.post("/messages", getUserMessages);

router.post("/mark-as-read", markMessageAsRead)

export default router;