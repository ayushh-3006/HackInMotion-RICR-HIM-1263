import mongoose, { Document, Schema } from "mongoose";

export interface IResumeDraft extends Document {
  userId: string;
  title: string;
  theme: string;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeDraftSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    theme: { type: String, required: true, default: "default" },
    data: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

export const ResumeDraft = mongoose.model<IResumeDraft>(
  "ResumeDraft",
  ResumeDraftSchema,
);
