import mongoose, { Schema, Document } from "mongoose";
import {
  IATSRepository,
  SaveATSRecordData,
} from "../interfaces/IATSRepository.js";
import User from "../models/User.js";

interface IATSRecord extends Document {
  userId: string;
  score: number;
  jobRole?: string;
  fileName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ATSRecordSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    score: { type: Number, required: true },
    jobRole: { type: String, required: false },
    fileName: { type: String, required: false },
    missingSkills: { type: [String], required: false, default: [] },
    actionableSuggestions: { type: [String], required: false, default: [] },
  },
  { timestamps: true },
);

// We need to check if the model already exists to prevent errors during hot-reloading
const ATSRecordModel =
  mongoose.models.ATSRecord ||
  mongoose.model<IATSRecord>("ATSRecord", ATSRecordSchema);

/**
 * SOLID — S (Single Responsibility): Only handles ATSRecord DB operations.
 * SOLID — D (Dependency Inversion): Implements IATSRepository interface.
 *
 * OOP — Encapsulation: All Mongoose logic for ATS records lives here.
 */
export class ATSRepository implements IATSRepository {
  async save(data: SaveATSRecordData): Promise<{ id: string }> {
    // Replicate Prisma's connectOrCreate behavior
    await User.updateOne(
      { clerkUserId: data.userId },
      { $setOnInsert: { email: `${data.userId}@clerk.user` } },
      { upsert: true },
    );

    const record = new ATSRecordModel({
      userId: data.userId,
      score: data.score,
      jobRole: data.jobRole ?? null,
      fileName: data.fileName ?? null,
      missingSkills: data.missingSkills ?? [],
      actionableSuggestions: data.actionableSuggestions ?? [],
    });
    const savedRecord = await record.save();
    return { id: savedRecord._id.toString() };
  }

  async findByUserId(userId: string): Promise<any[]> {
    const records = await ATSRecordModel.find({ userId })
      .sort({ createdAt: -1 })
      .exec();

    // Map _id to id to match Prisma output and return all necessary fields
    return records.map((r) => ({
      id: r._id.toString(),
      score: r.score,
      jobRole: r.jobRole,
      fileName: r.fileName,
      missingSkills: r.missingSkills || [],
      actionableSuggestions: r.actionableSuggestions || [],
      createdAt: r.createdAt,
    }));
  }

  async countByUserId(userId: string): Promise<number> {
    return ATSRecordModel.countDocuments({ userId }).exec();
  }

  async averageScoreByUserId(userId: string): Promise<number> {
    const result = await ATSRecordModel.aggregate([
      { $match: { userId } },
      { $group: { _id: null, avgScore: { $avg: "$score" } } },
    ]);

    if (result.length > 0) {
      return Math.round(result[0].avgScore);
    }
    return 0;
  }
}
