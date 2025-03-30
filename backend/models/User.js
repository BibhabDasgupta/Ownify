import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String },
  phone: { type: String },
  did: { type: String },
  registeredDevices: [
    {
      deviceName: { type: String, required: true },
      deviceId: { type: String, required: true },
      registeredAt: { type: Date, default: Date.now },
    },
  ],
  messages: [
    {
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      read: { type: Boolean, default: false },
    },
  ],
});

const User = mongoose.model("User", userSchema);
export default User;
