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

const groqApiKey = process.env.GROQ_API_KEY || "";
const atsController = new ATSController(new ATSAnalyzer(groqApiKey), new ParserFactory());
app.use("/api/ats", new ATSRouter(atsController).router);

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
