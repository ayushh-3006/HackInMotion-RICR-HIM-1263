import { requireAuth, createClerkClient } from "@clerk/express";
import { Request, Response, NextFunction } from "express";
import User from "../models/User.js";
import { UserService } from "../services/user.service.js";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const userService = new UserService();

// Base Clerk authentication middleware
export const protectRoute = requireAuth();

// Middleware to lazily sync Clerk user with MongoDB on authenticated requests
export const syncUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as any;
    if (!authReq.auth?.userId) return next();

    const clerkId = authReq.auth.userId;

    // Check if user already exists in DB
    let user: any = await User.findOne({ clerkId });

    // If missing, fetch from Clerk and sync to DB
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      
      if (email) {
        const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
        user = await userService.syncClerkUser(clerkId, email, name);
        console.log(`Lazily synced user ${clerkId} to MongoDB`);
      }
    }

    next();
  } catch (error) {
    console.error("Failed to sync user lazily:", error);
    next(error);
  }
};
