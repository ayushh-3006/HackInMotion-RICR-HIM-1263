import { Request, Response } from "express";
import { ATSAnalyzer } from "../services/ATSAnalyzerModule.js";
import { ParserFactory } from "../parsers/ParserFactory.js";
import { ATSResult } from "../models/ATSResult.js";
import { IATSRepository } from "../interfaces/IATSRepository.js";
import { ATSService } from "../services/ATSService.js";

export class ATSController {
  constructor(
    private analyzer: ATSAnalyzer,
    private parserFactory: ParserFactory,
    private repository: IATSRepository,
    private atsService?: ATSService,
  ) {}

  calculateFromText = async (req: Request, res: Response): Promise<void> => {
    try {
      const { resumeText, jobDescription, jobRole, experience, jobSkills } =
        req.body;

      let finalJobDescription = jobDescription;
      if (
        !finalJobDescription ||
        typeof finalJobDescription !== "string" ||
        !finalJobDescription.trim()
      ) {
        if (!jobRole && !jobSkills) {
          res.status(400).json({
            error: "resumeText and jobDescription (string) are required",
          });
          return;
        }
        finalJobDescription = `Role: ${jobRole || "Any"}, Experience: ${experience || "Any"}, Skills: ${jobSkills || "None"}`;
      }

      const result = await this.analyzer.analyzeText(
        resumeText,
        finalJobDescription,
      );
      const mapped = this.mapResult(result);

      const clerkUserId = (req as any).userId || (req as any).auth?.userId;
      if (clerkUserId) {
        // Legacy save
        await ATSResult.create({
          clerkUserId,
          jobRole: jobRole || "General",
          score: mapped.score,
          matchedSkills: mapped.matchedSkills,
          missingSkills: mapped.missingSkills,
        });

        // Save for dashboard stats and history list
        if (this.repository) {
          await this.repository.save({
            userId: clerkUserId,
            score: mapped.score,
            jobRole: jobRole || "General",
            fileName: "Pasted Text",
            missingSkills: mapped.missingSkills,
            actionableSuggestions: mapped.suggestions,
          });
        }
      }

      res.status(200).json(mapped);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Internal Server Error" });
    }
  };

  calculateFromFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const file = (req as any).file;
      const { jobDescription, jobRole, experience, jobSkills } = req.body;

      if (!file) {
        res.status(400).json({ error: "resumeFile is required" });
        return;
      }

      let finalJobDescription = jobDescription;
      if (
        !finalJobDescription ||
        typeof finalJobDescription !== "string" ||
        !finalJobDescription.trim()
      ) {
        if (!jobRole && !jobSkills) {
          res
            .status(400)
            .json({ error: "jobDescription (string) is required" });
          return;
        }
        finalJobDescription = `Role: ${jobRole || "Any"}, Experience: ${experience || "Any"}, Skills: ${jobSkills || "None"}`;
      }

      const parser = this.parserFactory.getParser(file.mimetype);
      const resumeText = await parser.extractText(file.buffer);

      if (!resumeText.trim()) {
        res
          .status(400)
          .json({ error: "Could not extract text from the provided file." });
        return;
      }

      let result;
      try {
        result = await this.analyzer.analyzeText(
          resumeText,
          finalJobDescription,
        );
      } catch (aiError) {
        console.error("AI Error:", aiError);
        res
          .status(502)
          .json({ error: "Failed to communicate with AI provider" });
        return;
      }

      const mapped = this.mapResult(result);

      const clerkUserId = (req as any).userId || (req as any).auth?.userId;
      if (clerkUserId) {
        // Legacy save
        await ATSResult.create({
          clerkUserId,
          jobRole: jobRole || "General",
          score: mapped.score,
          matchedSkills: mapped.matchedSkills,
          missingSkills: mapped.missingSkills,
        });

        // Save for dashboard stats and history list
        if (this.repository) {
          await this.repository.save({
            userId: clerkUserId,
            score: mapped.score,
            jobRole: jobRole || "General",
            fileName: file?.originalname || "Uploaded Resume",
            missingSkills: mapped.missingSkills,
            actionableSuggestions: mapped.suggestions,
          });
        }
      }

      res.status(200).json(mapped);
    } catch (err: any) {
      res.status(err.message?.includes("Unsupported") ? 415 : 500).json({
        error: err.message || "Internal Server Error",
      });
    }
  };

  getHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const clerkUserId = (req as any).auth?.userId || (req as any).userId;
      if (!clerkUserId) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      let history;
      if (
        this.repository &&
        typeof this.repository.findByUserId === "function"
      ) {
        history = await this.repository.findByUserId(clerkUserId);
      } else {
        history = await ATSResult.find({ clerkUserId })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean();
      }

      res.status(200).json({ success: true, data: history });
    } catch (err: any) {
      console.error("Error fetching ATS history:", err);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  };

  private mapResult(result: any) {
    const { finalScore, basicChecks, aiAnalysis } = result;

    const keywordDensity: Record<string, number> = {};
    if (aiAnalysis?.matchedKeywords) {
      aiAnalysis.matchedKeywords.forEach((k: string) => {
        keywordDensity[k] = (
          result.resumeText?.match(new RegExp(k, "gi")) || []
        ).length;
      });
    }

    return {
      score: finalScore,
      matchedSkills: aiAnalysis?.matchedKeywords || [],
      missingSkills: aiAnalysis?.missingKeywords || [],
      suggestions: aiAnalysis?.suggestions || [],
      keywordDensity,
      sectionScores: {
        skills: basicChecks?.sections?.skills ? 100 : 40,
        experience: basicChecks?.sections?.experience ? 100 : 40,
        education: basicChecks?.sections?.education ? 100 : 40,
        projects: 70,
      },
      aiSummary: aiAnalysis
        ? `Analysis complete. AI Score: ${aiAnalysis.aiScore}/60, Basic Score: ${basicChecks?.basicScore}/40.`
        : "AI analysis unavailable. Showing basic rule-based score.",
      atsCompatible: finalScore >= 60,
    };
  }

  match = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!this.atsService) {
        res.status(501).json({ error: "ATSService is not configured." });
        return;
      }

      const file = (req as any).file;
      const { jobDescription } = req.body;

      if (!file) {
        res.status(400).json({ error: "resume file is required" });
        return;
      }

      if (
        !jobDescription ||
        typeof jobDescription !== "string" ||
        !jobDescription.trim()
      ) {
        res.status(400).json({ error: "jobDescription (string) is required" });
        return;
      }

      const userId = (req as any).auth?.userId || (req as any).userId;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const result = await this.atsService.matchResumeToJob(
        userId,
        file.buffer,
        file.mimetype,
        jobDescription,
        file.originalname || "Uploaded File",
      );

      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.message?.includes("Unsupported") ? 415 : 500).json({
        success: false,
        error: err.message || "Internal Server Error",
      });
    }
  };
}
