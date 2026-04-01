import axios from "axios";
import { prisma } from "../lib/prisma.js";

const TERMII_API_KEY = process.env.TERMII_API_KEY;
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID || "SanadHealth";
const TERMII_URL = "https://api.ng.termii.com/api/sms/send";

/**
 * Sends an SMS using the Termii API and logs it to the Notification table.
 */
export const sendSMS = async (userId, phone, message, type = "tip") => {
  try {
    // If we don't have API keys yet (development), just log and store it
    if (!TERMII_API_KEY) {
      console.log(`[SMS Simulation] To ${phone}: ${message}`);
      
      await prisma.notification.create({ // Ensure lowercase notification model
        data: {
          userId,
          message,
          type,
          sent: true,
        },
      });
      return true;
    }

    // Call Termii
    const response = await axios.post(TERMII_URL, {
      to: phone,
      from: TERMII_SENDER_ID,
      sms: message,
      type: "plain",
      channel: "generic",
      api_key: TERMII_API_KEY,
    });

    // Save success record
    await prisma.notification.create({
      data: {
        userId,
        message,
        type,
        sent: true,
      },
    });

    return true;
  } catch (error) {
    console.error("SMS Sending failed:", error?.response?.data || error.message);
    
    // Save failure record
    await prisma.notification.create({
      data: {
        userId,
        message,
        type,
        sent: false,
      },
    });

    return false;
  }
};
