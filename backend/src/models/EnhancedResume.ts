import mongoose, { Document, Schema } from "mongoose";

export interface IEnhancedResume extends Document {
  userId: string;
  originalText: string;
  enhancedText: string;
  jobDescription: string;
  pdfUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const EnhancedResumeSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    originalText: { type: String, required: true },
    enhancedText: { type: String, required: true },
    jobDescription: { type: String, required: true },
    pdfUrl: { type: String, required: true },
  },
  { timestamps: true },
);

export const EnhancedResume = mongoose.model<IEnhancedResume>(
  "EnhancedResume",
  EnhancedResumeSchema,
);
