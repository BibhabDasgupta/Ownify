import Contact from "../models/Contact.js";

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, reason, message } = req.body;
    
    const newContact = new Contact({
      name,
      email,
      phone,
      reason,
      message
    });

    await newContact.save();

    res.status(201).json({ message: "Contact form submitted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};