import express from "express";
import {submitContactForm } from "../controllers/contactController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Register a device
router.post("/contact", submitContactForm);

export default router;