export const registerDevice = async (req, res) => {
    const { deviceId } = req.body;
    const userId = req.user.id;
  
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
  
    if (user.registeredDevices.some(d => d.deviceId === deviceId)) {
      return res.status(400).json({ message: "Device already registered" });
    }
  
    user.registeredDevices.push({ deviceId, registeredAt: new Date() });
    await user.save();
    res.json({ message: "Device registered successfully" });
  };