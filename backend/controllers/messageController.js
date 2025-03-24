export const addMessage = async (req, res) => {
    const { message } = req.body;
    const userId = req.user.id;
  
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
  
    user.messages.push(message);
    await user.save();
    res.json({ message: "Message added successfully" });
  };