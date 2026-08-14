import { Request, Response } from "express";
import { Webhook } from "svix";
import { UserService } from "../services/user.service.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const userService = new UserService();

export const clerkWebhookHandler = async (req: Request, res: Response) => {
  try {
    const payloadString = req.body.toString();
    const svixHeaders = {
      "svix-id": req.headers["svix-id"] as string,
      "svix-timestamp": req.headers["svix-timestamp"] as string,
      "svix-signature": req.headers["svix-signature"] as string,
    };

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");
    let evt: any;
    try {
      evt = wh.verify(payloadString, svixHeaders);
    } catch (err: any) {
      console.error("Webhook verification failed:", err.message);
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const eventType = evt.type;
    if (eventType === "user.created" || eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name } = evt.data;
      const primaryEmail = email_addresses?.find((email: any) => email.id === evt.data.primary_email_address_id)?.email_address || email_addresses?.[0]?.email_address;
      
      if (primaryEmail) {
        const name = `${first_name || ""} ${last_name || ""}`.trim();
        await userService.syncClerkUser(id, primaryEmail, name);
        console.log(`Synced user ${id} to MongoDB`);
      }
    }

    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("Error in webhook handler:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const syncUser = async (req: Request, res: Response): Promise<any> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: "Database connection unavailable" });
    }

    const { clerkUserId, email, firstName, lastName, profilePicture } = req.body;

    if (!clerkUserId || !email) {
      return res.status(400).json({ success: false, message: "Missing clerkUserId or email" });
    }

    const user = await User.findOneAndUpdate(
      { clerkUserId },
      { clerkUserId, email, firstName, lastName, profilePicture },
      { upsert: true, returnDocument: 'after' }
    );

    return res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    console.error("Error syncing user:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
