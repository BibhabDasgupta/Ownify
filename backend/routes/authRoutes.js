import express from "express";
import { signup, checkEmail, login, updateProfile, getMe, googleAuth, metamaskAuth } from "../controllers/authController.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/check-email/:email", checkEmail);
router.put("/update-profile", updateProfile);
router.get("/me", getMe);
router.post("/google", googleAuth);
router.post("/metamask", metamaskAuth);

export default router;
