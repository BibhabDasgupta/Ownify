import express from "express";
import { addMessage } from "../controllers/messageController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/add", authMiddleware, addMessage);

export default router;
