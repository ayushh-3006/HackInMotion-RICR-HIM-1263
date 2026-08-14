import { Request, Response } from 'express';
import Groq from 'groq-sdk';
import { InterviewSession } from '../models/InterviewSession.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export class VisionAnalysisController {
  
  public async analyzeVideoFrames(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, questionId, frames } = req.body;
      const clerkUserId = (req as any).userId;

      if (!clerkUserId) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }
      if (!sessionId || !questionId || !frames || !Array.isArray(frames)) {
        res.status(400).json({ error: "Missing required fields or invalid frames array." });
        return;
      }

      const messages: any[] = [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "You are an expert interview coach analyzing a candidate's body language. These are consecutive frames from their video response. Provide concise, constructive feedback on their posture, eye contact, and facial expressions. Keep it under 3 sentences." 
            }
          ]
        }
      ];

      // Limit to max 4 frames to avoid exceeding payload limits
      const sampledFrames = frames.slice(0, 4);
      for (const frame of sampledFrames) {
        messages[0].content.push({
          type: "image_url",
          image_url: { url: frame }
        });
      }

      const chatCompletion = await groq.chat.completions.create({
        messages,
        model: "llama-3.2-11b-vision-preview",
        temperature: 0.5,
        max_tokens: 256,
      });

      const feedback = chatCompletion.choices[0]?.message?.content || "No body language feedback available.";

      const session = await InterviewSession.findOne({ _id: sessionId, clerkUserId });
      if (!session) {
        res.status(404).json({ error: "Session not found" });
        return;
      }

      const answerIndex = session.answers.findIndex(a => a.questionId === questionId);
      if (answerIndex > -1) {
        session.answers[answerIndex].bodyLanguageFeedback = feedback;
        await session.save();
      }

      res.status(200).json({ feedback, session });
    } catch (error: any) {
      console.error('Vision Analysis Error:', error);
      res.status(500).json({ error: error.message || "Failed to analyze video frames" });
    }
  }
}
