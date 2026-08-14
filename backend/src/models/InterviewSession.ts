import mongoose, { Schema, Document } from 'mongoose';

export interface IFillerWord {
  word: string;
  count: number;
}

export interface IAnswer {
  questionId: string;
  userAnswer: string;
  transcribedText: string;
  contentScore: number;
  toneScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  wpm: number;
  fillerWords: IFillerWord[];
  confidenceLabel: string;
  idealAnswer: string;
  audioDurationSeconds: number;
}

export interface IInterviewSession extends Document {
  clerkUserId: string;
  jobRole: string;
  interviewType: string; // 'Technical' or 'Behavioral'
  category: string; // 'Frontend' | 'Backend' | 'Behavioral' | 'System Design'
  difficulty: string; // 'Easy' | 'Medium' | 'Hard'
  questions: { id: string; text: string }[];
  answers: IAnswer[];
  overallScore: number;
  overallFeedback: string;
  status: 'in-progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const FillerWordSchema = new Schema<IFillerWord>({
  word: { type: String, required: true },
  count: { type: Number, required: true, default: 0 }
});

const AnswerSchema = new Schema<IAnswer>({
  questionId: { type: String, required: true },
  userAnswer: { type: String },
  transcribedText: { type: String },
  contentScore: { type: Number, default: 0 },
  toneScore: { type: Number, default: 0 },
  feedback: { type: String },
  strengths: [{ type: String }],
  improvements: [{ type: String }],
  wpm: { type: Number, default: 0 },
  fillerWords: [FillerWordSchema],
  confidenceLabel: { type: String, default: 'Neutral' },
  idealAnswer: { type: String, default: '' },
  audioDurationSeconds: { type: Number, default: 0 }
});

const InterviewSessionSchema = new Schema<IInterviewSession>({
  clerkUserId: { type: String, required: true, index: true },
  jobRole: { type: String, required: true },
  interviewType: { type: String, required: true },
  category: { type: String, default: 'Technical' },
  difficulty: { type: String, default: 'Medium' },
  questions: [{ id: String, text: String }],
  answers: [AnswerSchema],
  overallScore: { type: Number, default: 0 },
  overallFeedback: { type: String },
  status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' }
}, {
  timestamps: true
});

export const InterviewSession = mongoose.model<IInterviewSession>('InterviewSession', InterviewSessionSchema);
