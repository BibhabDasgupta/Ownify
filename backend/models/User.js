import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String },
  phone: { type: String },
  did: { type: String },
  registeredDevices: [{ deviceId: String, registeredAt: Date }],
  messages: [{ type: String }],
});

const User = mongoose.model("User", userSchema);
export default User;