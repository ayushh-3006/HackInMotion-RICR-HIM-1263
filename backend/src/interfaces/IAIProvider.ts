export interface IAIProvider {
  enhance(resumeText: string, jobDescription: string): Promise<any>;
  buildResumeFromChat?(chatHistory: any[], currentData: any): Promise<any>;
}