import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import { connectDB } from "./config/db.js";
import webhookRoutes from "./routes/webhook.routes.js";
import userRoutes from "./routes/user.routes.js";
import { syncUser } from "./middleware/authMiddleware.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
await connectDB();

const app = express();

// Webhook routes (MUST be before express.json() because it needs raw body)
app.use("/api/webhooks", webhookRoutes);

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());
app.use(syncUser); // Lazily sync Clerk users on any authenticated API call

// User routes
app.use("/api/users", userRoutes);

// Mock Dashboard Stats Route
app.get("/api/dashboard/stats", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      totalDrafts: 12,
      totalATSScans: 45,
      totalPDFs: 8,
      avgATSScore: 82,
    },
  });
});

// Mock ATS History Route
app.get("/api/ats/history", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: [
      { id: "1", score: 85, jobRole: "Frontend Developer", fileName: "resume_v1.pdf", createdAt: new Date().toISOString() },
      { id: "2", score: 62, jobRole: "Software Engineer", fileName: "resume_old.pdf", createdAt: new Date(Date.now() - 86400000).toISOString() }
    ],
  });
});

// Health check route
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "Server is healthy" });
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
