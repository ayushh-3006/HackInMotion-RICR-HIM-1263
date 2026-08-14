import { IResumeRepository, SaveResumeData } from "../interfaces/IResumeRepository.js";
import { EnhancedResume } from "../models/EnhancedResume.js";

export class ResumeRepository implements IResumeRepository {
  async save(data: SaveResumeData): Promise<{ id: string }> {
    const resume = new EnhancedResume({
      userId: data.userId,
      originalText: data.originalText,
      enhancedText: data.enhancedText,
      jobDescription: data.jobDescription,
      pdfUrl: data.pdfUrl,
    });
    const saved = await resume.save();
    return { id: saved._id.toString() };
  }

  async findByUserId(userId: string): Promise<any[]> {
    return EnhancedResume.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  async findById(id: string): Promise<any | null> {
    return EnhancedResume.findById(id).lean();
  }
}