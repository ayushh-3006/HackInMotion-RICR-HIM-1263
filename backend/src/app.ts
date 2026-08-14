import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import { connectDB } from "./config/db.js";
import webhookRoutes from "./routes/webhook.routes.js";
import userRoutes from "./routes/user.routes.js";
import { syncUser } from "./middlewares/authMiddleware.js";
import { clerkAuth } from "./middlewares/clerkAuth.js";
import mongoose from "mongoose";
import path from "path";

// Load environment variables
dotenv.config();

// Connect to MongoDB
await connectDB();

const app = express();

// Webhook routes (MUST be before express.json() because it needs raw body)
app.use("/api/webhooks", webhookRoutes);

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

// Database readiness check middleware
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

app.use("/api/resume", resumeRoutes);

// Secure file serving — requires authentication and blocks directory traversal
app.get("/api/uploads/:filename", clerkAuth, (req: Request, res: Response) => {
  const filename = req.params.filename as string;

  // Block directory traversal attacks
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    res.status(400).json({ error: "Invalid filename." });
    return;
  }

  const filePath = path.resolve("uploads", filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({ error: "File not found." });
    }
  });
});

import { ResumeDraft } from "./models/ResumeDraft.js";
import { InterviewSession } from "./models/InterviewSession.js";

import { ATSRepository } from "./repositories/ATSRepository.js";

const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
  throw new Error("FATAL: GROQ_API_KEY environment variable is not set. Server cannot start.");
}
const atsController = new ATSController(
  new ATSAnalyzer(groqApiKey),
  new ParserFactory(),
  new ATSRepository()
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


// Interview routes
import { InterviewRoutes } from "./routes/InterviewRoutes.js";
import { InterviewController } from "./controllers/InterviewController.js";

const interviewController = new InterviewController();
app.use("/api/interview", new InterviewRoutes(interviewController).router);

// Industry-Specific Question Bank Generator Route
import { QuestionBankRouter } from "./routes/QuestionBankRouter.js";
app.use("/api/interview/questions", new QuestionBankRouter().router);

// Health check route
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "Server is healthy" });
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
