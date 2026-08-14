import { Router, Request, Response } from "express";
import { QuestionBankService } from "../services/QuestionBankService.js";
import { clerkAuth } from "../middlewares/clerkAuth.js";

/**
 * SRP: Sets up the route and delegates to QuestionBankService.
 * Clean integration separate from core interview flow to avoid regressions.
 */
export class QuestionBankRouter {
  public router: Router;
  private service: QuestionBankService;

  constructor() {
    this.router = Router();
    this.service = new QuestionBankService();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    // Note: clerkAuth is optional depending on if we want this public or protected.
    // Making it protected to match standard interview flow.
    this.router.post("/generate", clerkAuth, this.generateBank);
  }

  /**
   * POST /api/interview/questions/generate
   */
  private generateBank = async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        industry, 
        targetRole, 
        experienceLevel, 
        questionCount, 
        includeBehavioral, 
        jobDescription 
      } = req.body;

      // Validate required fields
      if (!industry || typeof industry !== "string") {
        res.status(400).json({ success: false, error: "Missing required string field: industry" });
        return;
      }
      if (!targetRole || typeof targetRole !== "string") {
        res.status(400).json({ success: false, error: "Missing required string field: targetRole" });
        return;
      }
      if (!experienceLevel || typeof experienceLevel !== "string") {
        res.status(400).json({ success: false, error: "Missing required string field: experienceLevel" });
        return;
      }

      // Default optional fields
      const count = typeof questionCount === "number" ? questionCount : 5;
      const behavioral = typeof includeBehavioral === "boolean" ? includeBehavioral : true;

      const result = await this.service.generateBank(
        industry,
        targetRole,
        experienceLevel,
        count,
        behavioral,
        jobDescription
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      console.error("[QuestionBankRouter] Unexpected error:", err);
      res.status(500).json({
        success: false,
        error: err.message || "Internal Server Error",
      });
    }
  };
}
