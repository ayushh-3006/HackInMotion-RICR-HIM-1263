import {
  IResumeBuilderRepository,
  SaveDraftData,
  UpdateDraftData,
} from "../interfaces/IResumeBuilderRepository.js";
import { ResumeDraft } from "../models/ResumeDraft.js";

export class ResumeBuilderRepository implements IResumeBuilderRepository {
  async create(data: SaveDraftData): Promise<{ id: string }> {
    const draft = new ResumeDraft({
      userId: data.userId,
      title: data.title,
      theme: data.theme,
      data: data.data,
    });
    const saved = await draft.save();
    return { id: saved._id.toString() };
  }

  async update(
    id: string,
    userId: string,
    data: UpdateDraftData,
  ): Promise<{ id: string }> {
    const updated = await ResumeDraft.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { new: true },
    );
    if (!updated) throw new Error("Draft not found or unauthorized");
    return { id: updated._id.toString() };
  }

  async findByUserId(userId: string): Promise<any[]> {
    return ResumeDraft.find({ userId }).sort({ updatedAt: -1 }).lean();
  }

  async findById(id: string, userId: string): Promise<any | null> {
    return ResumeDraft.findOne({ _id: id, userId }).lean();
  }

  async delete(id: string, userId: string): Promise<void> {
    await ResumeDraft.deleteOne({ _id: id, userId });
  }

  async countByUserId(userId: string): Promise<number> {
    return ResumeDraft.countDocuments({ userId });
  }
}
