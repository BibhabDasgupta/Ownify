import User from "../models/User.js"; // Adjust path as needed
import PDFDocument from "pdfkit";
import { ethers } from "ethers";
import nodemailer from "nodemailer";
import Web3 from "web3";

const systemWallet = new ethers.Wallet(process.env.SYSTEM_PRIVATE_KEY);
const systemPublicKey = process.env.SYSTEM_PUBLIC_KEY;

const transporter = nodemailer.createTransport({
  service: "gmail", // Update with your service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendNotificationEmail = async (toEmail, deviceId, originalUserDid, newUserDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Attempt to Re-Register Your Device",
    text: `Someone attempted to re-register your device  (ID: ${deviceId}).\nNew Registrant Details:\n- DID: ${newUserDetails.did}\n- Name: ${newUserDetails.name || "Unknown"}\n- Phone: ${newUserDetails.phone || "N/A"}\n- Email: ${newUserDetails.email || "Unknown"}`,
  };
  await transporter.sendMail(mailOptions);
};

export const checkAndNotify = async (req, res) => {
  const { deviceId, originalUserDid, newUserDid } = req.body;

  try {
    if (!deviceId || !originalUserDid || !newUserDid) {
      return res.status(400).json({ error: "Device ID, Original DID, and New DID are required" });
    }

    //console.log(originalUserDid);
    // Fetch original user details
    console.log(originalUserDid);
    const originalUser = await User.findOne({ did: originalUserDid.toLowerCase() });
    
    if (!originalUser) {
      return res.status(404).json({ error: "Original user not found" });
    }

    // Fetch new user details
    const newUser = await User.findOne({ did: newUserDid });
    if (!newUser) {
      return res.status(404).json({ error: "New user not found" });
    }

    // Prepare notification message
    const messageContent = `Someone attempted to re-register your device (ID: ${deviceId}).\n Details of the registrant:\n- DID: ${newUser.did}\n- Name: ${newUser.name || "Unknown"}\n- Phone: ${newUser.phone || "N/A"}\n- Email: ${newUser.email || "Unknown"}`;

    // Save message to original user's database
    originalUser.messages.push({ content: messageContent });
    await originalUser.save();
   // console.log("Hello1");

    // Send email to original user
    await sendNotificationEmail(originalUser.email, deviceId, originalUserDid, {
      did: newUser.did,
      name: newUser.name,
      phone: newUser.phone,
      email: newUser.email,
    });
    //console.log("Hello2");
    res.status(200).json({ message: "Original user notified successfully" });
  } catch (error) {
    console.error("Check and notify error:", error.message);
    res.status(500).json({ error: error.message });
  }
};


export const registerDevice = async (req, res) => {
  const { deviceName, deviceId, userSignature, userDid } = req.body;
  // const userDid = req.user.did || req.user.id; // Fallback to id if did is undefined
  console.log("Registering device for DID/ID:", userDid);
  console.log("Request body:", req.body);

  try {
    if (!deviceName || !deviceId || !userSignature || !userDid) {
      return res.status(400).json({ error: "Device Name, Device ID, and User Signature are required" });
    }

    // if (!userDid) {
    //   console.log("No DID or ID found in req.user");
    //   return res.status(400).json({ error: "No DID or ID in token" });
    // }

    let user = await User.findOne({ did: userDid });
    if (!user) {
      // If not found by did, try by _id (assuming id is a MongoDB _id)
      user = await User.findOne({ _id: userDid });
      if (!user) {
        console.log("User not found for DID/ID:", userDid);
        return res.status(404).json({ error: "User not found" });
      }
    }

    if (user.registeredDevices.some((d) => d.deviceId === deviceId)) {
      console.log("Duplicate device ID:", deviceId);
      return res.status(400).json({ error: "Device ID already registered" });
    }

    const hashedDeviceId = ethers.keccak256(ethers.toUtf8Bytes(deviceId));
    const hashedDID = ethers.keccak256(ethers.toUtf8Bytes(userDid));
    const messageHash = ethers.keccak256(
      ethers.solidityPacked(["bytes32", "bytes32"], [hashedDeviceId, hashedDID])
    );


    const systemSignature = await systemWallet.signMessage(ethers.getBytes(messageHash));


    const newDevice = {
      deviceName,
      deviceId,
      registeredAt: new Date(),
    };
    user.registeredDevices.push(newDevice);
    await user.save();
    console.log("Device registered:", newDevice);
    res.status(200).json({
      message: "System signature generated, proceed with blockchain registration",
      device: newDevice,
      hashedDeviceId,
      hashedDID,
      userSignature,
      systemSignature,
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getDevices = async (req, res) => {
  const userDid = req.query.did || req.user.did;
  //console.log("Fetching devices for DID:", userDid);
  try {
    const user = await User.findOne({ did: userDid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user.registeredDevices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDeviceStats = async (req,res) => {
  // const userDid = req.params.userDid || req.query.did || req.user?.did;
  // console.log(userDid);
  try {

    const {userDid} = req.params;
    
    if (!userDid) {
      return res.status(400).json({ error: "No DID provided" });
    }

    console.log(`Fetching stats for DID: ${userDid}`); // Debug log

    const user = await User.findOne({ did: userDid })
      .select('registeredDevices')
      .lean();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const registeredDevices = user.registeredDevices || [];
    const totalDevices = registeredDevices.length;

    // Get the most recent device registration date
    let lastRegisteredDate = null;
    if (totalDevices > 0) {
      // Sort devices by registration date (newest first) and get the first one
      const sortedDevices = [...registeredDevices].sort(
        (a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
      );
      lastRegisteredDate = sortedDevices[0].registeredAt;
    }

    res.status(200).json({
      totalDevices,
      lastRegisteredDate: lastRegisteredDate?.toISOString() || null
    });

  } catch (error) {
    console.error("Error fetching device stats:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Server error" 
    });
  }
};


export const downloadDevicePDF = async (req, res) => {
  const userDid = req.query.userDid || req.user.did;
  console.log("Fetching devices for DID:", userDid);
  const { deviceId } = req.params;
  console.log(deviceId);

  try {
    const user = await User.findOne({ did: userDid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const device = user.registeredDevices.find((d) => d.deviceId === deviceId);
    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    const downloadTimestamp = new Date().toLocaleString();
    const systemPublicKey = process.env.SYSTEM_PRIVATE_KEY;
    // Create PDF
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    res.setHeader("Content-Disposition", `attachment; filename=${device.deviceId}_registration.pdf`);
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    doc.fontSize(20).text("Device Registration Certificate", { align: "center" });
    doc.moveDown(2);

    doc.fontSize(12).text("User Information", { underline: true });
    doc.moveDown(0.5);
    doc.text(`Name: ${user.name}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Phone: ${user.phone || "N/A"}`);
    doc.text(`DID: ${user.did}`);
    doc.moveDown(1.5);

    doc.fontSize(12).text("Device Information", { underline: true });
    doc.moveDown(0.5);
    doc.text(`Device Name: ${device.deviceName}`);
    doc.text(`Device ID: ${device.deviceId}`);
    doc.text(`Registered At: ${device.registeredAt.toLocaleString()}`);
    doc.text(`System Public Key: ${systemPublicKey}`);
    doc.moveDown(1.5);

    doc.fontSize(12).text("Download Information", { underline: true }); // New section
    doc.moveDown(0.5);
    doc.text(`Downloaded At: ${downloadTimestamp}`); // Add download timestamp
    doc.moveDown(1.5);

    doc.fontSize(10).text(
      "This certificate verifies that the above device is genuinely registered by the user listed.",
      { align: "center" }
    );
    doc.text(`Generated on: ${downloadTimestamp}`, { align: "center" }); // Update existing line
    //doc.fontSize(8).text("Powered by xAI", 50, doc.page.height - 50, { align: "center" });

    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }};


  export const getUserByAddress = async (req, res) => {
    const { address } = req.query;
    console.log("Fetching user by address:", address);
  
    try {
      if (!address) {
        return res.status(400).json({ error: "Address is required" });
      }
  
      // Assuming DID is stored in the format "did:ethr:0x..." and we extract the address part
      const lowerCaseAddress = address.toLowerCase();

    // Assuming DID is stored as "did:ethr:0x..." and we match the address part
    const user = await User.findOne({ did: lowerCaseAddress });
      if (!user) {
        return res.status(404).json({ error: "No user found with this address" });
      }
  
      res.status(200).json({
        name: user.name,
        email: user.email,
        did: user.did,
      });
    } catch (error) {
      console.error("Get user by address error:", error.message);
      res.status(500).json({ error: error.message });
    }
};


// Fetch user messages
export const getUserMessages = async (req, res) => {
  try {
    const { userDid } = req.body;
   // const userDid = req.user.did; // Assuming DID is available in req.user from auth middleware
   // console.log(userDid);
    const user = await User.findOne({ did: userDid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ messages: user.messages });
  } catch (error) {
    console.error("Get messages error:", error.message);
    res.status(500).json({ error: error.message });
  }
};


// In your backend controller
export const markMessageAsRead = async (req, res) => {
  try {
    const { messageId, userDid } = req.body;
    
    const user = await User.findOneAndUpdate(
      { did: userDid, "messages._id": messageId },
      { $set: { "messages.$.read": true } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User or message not found" });
    }

    res.status(200).json({ message: "Message marked as read" });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ error: error.message });
  }
};