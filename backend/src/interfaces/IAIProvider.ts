import { IATSResult } from "./IATSResult.js";

export interface IAIProvider {
  enhance(resumeText: string, jobDescription: string): Promise<any>;
  buildResumeFromChat?(chatHistory: any[], currentData: any): Promise<any>;
  enhanceBullet?(bulletPoint: string, role: string): Promise<string>;
  matchATS?(resumeText: string, jobDescription: string): Promise<IATSResult>;
}
