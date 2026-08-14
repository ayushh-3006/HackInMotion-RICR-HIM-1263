import { Request, Response } from "express";
import { ATSAnalyzer } from "../services/ATSAnalyzerModule.js";
import { ParserFactory } from "../parsers/ParserFactory.js";
import { IATSRepository } from "../interfaces/IATSRepository.js";

import { ATSService } from "../services/ATSService.js";

export class ATSController {
  constructor(
    private analyzer: ATSAnalyzer,
    private parserFactory: ParserFactory,
    private repository: IATSRepository,
    private atsService?: ATSService
  ) {}

  calculateFromText = async (req: Request, res: Response): Promise<void> => {
    try {
      const { resumeText, jobDescription } = req.body;

      if (!resumeText || !jobDescription || typeof jobDescription !== "string" || !jobDescription.trim()) {
        res.status(400).json({
          error: "resumeText and jobDescription (string) are required",
        });
        return;
      }

      let result;
      try {
        result = await this.analyzer.analyzeText(resumeText, jobDescription);
      } catch (aiError) {
        console.error("AI Error:", aiError);
        res.status(502).json({ error: "Failed to communicate with AI provider" });
        return;
      }

      const mappedResult = this.mapResult(result);
      const userId = (req as any).auth?.userId || (req as any).userId;

      if (userId) {
        await this.repository.save({
          userId,
          score: mappedResult.score,
          jobRole: "Parsed from Text",
          fileName: "Pasted Text",
        });
      }

      res.status(200).json(mappedResult);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Internal Server Error" });
    }
  };

  calculateFromFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const file = (req as any).file;
      const { jobDescription } = req.body;

      if (!file) {
        res.status(400).json({ error: "resumeFile is required" });
        return;
      }

      if (!jobDescription || typeof jobDescription !== "string" || !jobDescription.trim()) {
        res.status(400).json({ error: "jobDescription (string) is required" });
        return;
      }

      const parser = this.parserFactory.getParser(file.mimetype);
      const resumeText = await parser.extractText(file.buffer);

      if (!resumeText.trim()) {
        res.status(400).json({ error: "Could not extract text from the provided file." });
        return;
      }

      let result;
      try {
        result = await this.analyzer.analyzeText(resumeText, jobDescription);
      } catch (aiError) {
        console.error("AI Error:", aiError);
        res.status(502).json({ error: "Failed to communicate with AI provider" });
        return;
      }

      const mappedResult = this.mapResult(result);
      const userId = (req as any).auth?.userId || (req as any).userId;

      if (userId) {
        await this.repository.save({
          userId,
          score: mappedResult.score,
          jobRole: "Parsed from Document",
          fileName: file.originalname || "Uploaded File",
        });
      }

      res.status(200).json(mappedResult);
    } catch (err: any) {
      res.status(err.message?.includes("Unsupported") ? 415 : 500).json({
        error: err.message || "Internal Server Error",
      });
    }
  };

  getHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).auth?.userId || (req as any).userId;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const history = await this.repository.findByUserId(userId);
      res.status(200).json({ success: true, data: history });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Internal Server Error" });
    }
  };

  private mapResult(result: any) {
    const { finalScore, basicChecks, aiAnalysis } = result;

    const keywordDensity: Record<string, number> = {};
    if (aiAnalysis?.matchedKeywords) {
      aiAnalysis.matchedKeywords.forEach((k: string) => {
        keywordDensity[k] = (
          result.resumeText.match(new RegExp(k, "gi")) || []
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
        skills: basicChecks.sections.skills ? 100 : 40,
        experience: basicChecks.sections.experience ? 100 : 40,
        education: basicChecks.sections.education ? 100 : 40,
        projects: 70,
      },
      aiSummary: aiAnalysis
        ? `Analysis complete. AI Score: ${aiAnalysis.aiScore}/60, Basic Score: ${basicChecks.basicScore}/40.`
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

      if (!jobDescription || typeof jobDescription !== "string" || !jobDescription.trim()) {
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
        file.originalname || "Uploaded File"
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
