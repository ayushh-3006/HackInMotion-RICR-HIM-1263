import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import { connectDB } from "./config/db.js";
import webhookRoutes from "./routes/webhook.routes.js";
import userRoutes from "./routes/user.routes.js";
import { syncUser } from "./middlewares/authMiddleware.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
await connectDB();

const app = express();

// Webhook routes (MUST be before express.json() because it needs raw body)
app.use("/api/webhooks", webhookRoutes);

app.use(cors());
app.use(express.json());

// Database readiness check middleware
import mongoose from "mongoose";
app.use((req: Request, res: Response, next: express.NextFunction) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      error: "Service Unavailable: Database connection is not established.",
      details:
        "The backend is running but cannot reach MongoDB. Please check your IP whitelist and DATABASE_URL.",
    });
    return;
  }
  next();
});

app.use(clerkMiddleware());
app.use(syncUser); // Lazily sync Clerk users on any authenticated API call

// User routes
app.use("/api/users", userRoutes);

// Resume Builder routes
import resumeBuilderRoutes from "./routes/ResumeBuilderRouter.js";
app.use("/api/resume-builder", resumeBuilderRoutes);

// ATS routes
import { ATSRouter } from "./routes/ATSRouter.js";
import { ATSController } from "./controllers/ATSController.js";
import { ATSAnalyzer } from "./services/ATSAnalyzerModule.js";
import { ParserFactory } from "./parsers/ParserFactory.js";

// Resume Routes
import resumeRoutes from "./routes/ResumeRoutes.js";
import path from "path";

app.use("/api/resume", resumeRoutes);
app.use("/uploads", express.static(path.resolve("uploads")));

import { clerkAuth } from "./middlewares/clerkAuth.js";
import { ResumeDraft } from "./models/ResumeDraft.js";
import { InterviewSession } from "./models/InterviewSession.js";

const groqApiKey = process.env.GROQ_API_KEY || "";
const atsController = new ATSController(
  new ATSAnalyzer(groqApiKey),
  new ParserFactory(),
);
app.use("/api/ats", new ATSRouter(atsController).router);

// Real Dashboard Stats Route
app.get("/api/dashboard/stats", clerkAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const totalDrafts = await ResumeDraft.countDocuments({ userId });
    const totalInterviews = await InterviewSession.countDocuments({ clerkUserId: userId });
    
    const completedInterviews = await InterviewSession.find({ clerkUserId: userId, status: 'completed' });
    let avgInterviewScore = 0;
    if (completedInterviews.length > 0) {
      const sum = completedInterviews.reduce((acc, curr) => acc + (curr.overallScore || 0), 0);
      avgInterviewScore = Math.round(sum / completedInterviews.length);
    }

    res.status(200).json({
      success: true,
      data: {
        totalDrafts,
        totalInterviews,
        avgInterviewScore,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch stats" });
  }
});

// Mock ATS History Route
app.get("/api/ats/history", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: [
      {
        id: "1",
        score: 85,
        jobRole: "Frontend Developer",
        fileName: "resume_v1.pdf",
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        score: 62,
        jobRole: "Software Engineer",
        fileName: "resume_old.pdf",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
  });
});

// Interview routes
import { InterviewRoutes } from "./routes/InterviewRoutes.js";
import { InterviewController } from "./controllers/InterviewController.js";

const interviewController = new InterviewController();
app.use("/api/interview", new InterviewRoutes(interviewController).router);

// Health check route
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "Server is healthy" });
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
