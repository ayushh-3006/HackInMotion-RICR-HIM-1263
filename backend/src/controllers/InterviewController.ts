import { Request, Response } from 'express';
import { InterviewService } from '../services/InterviewService.js';
import { InterviewSession } from '../models/InterviewSession.js';

const interviewService = new InterviewService();

export class InterviewController {

  /* ── POST /interview/start ── */
  public async startInterview(req: Request, res: Response): Promise<void> {
    try {
      const { jobRole, interviewType, experience, category, difficulty } = req.body;
      const clerkUserId = (req as any).userId;

      if (!clerkUserId) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }
      if (!jobRole || !interviewType) {
        res.status(400).json({ error: "Missing required fields: jobRole, interviewType" });
        return;
      }

      const aiResponse = await interviewService.generateQuestions(
        jobRole,
        interviewType,
        experience || 'mid',
        category,
        difficulty
      );

      const session = new InterviewSession({
        clerkUserId,
        jobRole,
        interviewType,
        category: category || interviewType,
        difficulty: difficulty || 'Medium',
        questions: aiResponse.questions,
        answers: [],
        status: 'in-progress'
      });

      await session.save();

      res.status(201).json({ success: true, session });
    } catch (error: any) {
      console.error("Error in startInterview:", error);
      res.status(500).json({ error: error.message || "Failed to start interview" });
    }
  }

  /* ── POST /interview/transcribe ── */
  public async transcribeAudio(req: Request, res: Response): Promise<void> {
    try {
      const clerkUserId = (req as any).userId;
      if (!clerkUserId) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const file = (req as any).file;
      if (!file) {
        res.status(400).json({ error: "No audio file provided" });
        return;
      }

      const transcript = await interviewService.transcribeAudio(
        file.buffer,
        file.originalname || 'audio.webm'
      );

      res.status(200).json({ success: true, transcript });
    } catch (error: any) {
      console.error("Error in transcribeAudio:", error);
      res.status(500).json({ error: error.message || "Failed to transcribe audio" });
    }
  }

  /* ── POST /interview/submit-answer ── */
  public async submitAnswer(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, questionId, transcribedText, audioDurationSeconds } = req.body;

      if (!sessionId || !questionId || !transcribedText) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      const session = await InterviewSession.findById(sessionId);
      if (!session) {
        res.status(404).json({ error: "Session not found" });
        return;
      }

      const question = session.questions.find(q => q.id === questionId);
      if (!question) {
        res.status(404).json({ error: "Question not found" });
        return;
      }

      // AI evaluation with enhanced metrics
      const evaluation = await interviewService.evaluateAnswer(
        question.text,
        transcribedText,
        audioDurationSeconds || 0
      );

      const newAnswer = {
        questionId,
        userAnswer: transcribedText,
        transcribedText,
        contentScore: evaluation.contentScore,
        toneScore: evaluation.toneScore,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        wpm: evaluation.wpm,
        fillerWords: evaluation.fillerWords,
        confidenceLabel: evaluation.confidenceLabel,
        idealAnswer: evaluation.idealAnswer || '',
        audioDurationSeconds: evaluation.audioDurationSeconds || 0
      };

      session.answers.push(newAnswer as any);
      await session.save();

      res.status(200).json({ success: true, evaluation, session });
    } catch (error: any) {
      console.error("Error in submitAnswer:", error);
      res.status(500).json({ error: error.message || "Failed to submit answer" });
    }
  }

  /* ── POST /interview/complete ── */
  public async completeInterview(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        res.status(400).json({ error: "Missing sessionId" });
        return;
      }

      const session = await InterviewSession.findById(sessionId);
      if (!session) {
        res.status(404).json({ error: "Session not found" });
        return;
      }

      let totalContent = 0;
      let totalTone = 0;
      session.answers.forEach(a => {
        totalContent += a.contentScore;
        totalTone += a.toneScore;
      });

      const count = session.answers.length || 1;
      const avgContent = Math.round(totalContent / count);
      const avgTone = Math.round(totalTone / count);
      const overallScore = Math.round((avgContent + avgTone) / 2);

      session.overallScore = overallScore;
      session.status = 'completed';
      session.overallFeedback = `Content: ${avgContent}/100 | Delivery: ${avgTone}/100`;
      await session.save();

      res.status(200).json({ success: true, session });
    } catch (error: any) {
      console.error("Error in completeInterview:", error);
      res.status(500).json({ error: error.message || "Failed to complete interview" });
    }
  }

  /* ── GET /interview/history ── */
  public async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const clerkUserId = (req as any).userId;
      if (!clerkUserId) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const sessions = await InterviewSession.find({ clerkUserId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      res.status(200).json({ success: true, data: sessions });
    } catch (error: any) {
      console.error("Error in getHistory:", error);
      res.status(500).json({ error: error.message || "Failed to fetch history" });
    }
  }
}
