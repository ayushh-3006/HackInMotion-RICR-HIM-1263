import mongoose, { Schema, Document } from "mongoose";

export interface IATSResult extends Document {
  clerkUserId: string;
  jobRole: string;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ATSResultSchema: Schema = new Schema(
  {
    clerkUserId: { type: String, required: true, index: true },
    jobRole: { type: String, required: true, default: "General" },
    score: { type: Number, required: true, default: 0 },
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
  },
  { timestamps: true },
);

export const ATSResult = mongoose.model<IATSResult>(
  "ATSResult",
  ATSResultSchema,
);
