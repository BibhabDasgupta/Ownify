// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  const authHeader = req.header("Authorization");
  if (!authHeader) return res.status(401).json({ message: "Access Denied: No token provided" });

  // Check for "Bearer " prefix and extract the token
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
  if (!token) return res.status(401).json({ message: "Access Denied: Invalid token format" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Verified token payload:", verified); // Log for debugging
    req.user = verified;
    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    res.status(400).json({ message: "Invalid Token" });
  }
}