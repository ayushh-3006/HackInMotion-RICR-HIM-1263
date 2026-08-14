import { IAIProvider } from "../interfaces/IAIProvider.js";
import { IATSRepository } from "../interfaces/IATSRepository.js";
import { ParserFactory } from "../parsers/ParserFactory.js";
import { IATSResult } from "../interfaces/IATSResult.js";

export class ATSService {
  constructor(
    private aiProvider: IAIProvider,
    private parserFactory: ParserFactory,
    private repository: IATSRepository,
  ) {}

  async matchResumeToJob(
    userId: string,
    fileBuffer: Buffer,
    mimetype: string,
    jobDescription: string,
    fileName: string,
  ): Promise<IATSResult> {
    if (!jobDescription || typeof jobDescription !== "string" || !jobDescription.trim()) {
      throw new Error("Job description is required and must be a valid string.");
    }

    if (!this.aiProvider.matchATS) {
      throw new Error("AI Provider does not support ATS matching.");
    }

    // 1. Sanitize the job description (prevent basic prompt injection / huge payloads)
    let sanitizedJD = jobDescription
      .replace(/<[^>]*>?/gm, "") // Strip HTML tags
      .replace(/\\n{3,}/g, "\\n\\n") // Normalize whitespace
      .trim();
      
    if (sanitizedJD.length > 20000) {
      sanitizedJD = sanitizedJD.substring(0, 20000); // Prevent overflow
    }

    // 2. Extract text from the uploaded file
    const parser = this.parserFactory.getParser(mimetype);
    const resumeText = await parser.extractText(fileBuffer);

    if (!resumeText.trim()) {
      throw new Error("Could not extract any text from the provided resume file.");
    }

    // 3. Call the AI Engine for matching
    const result: IATSResult = await this.aiProvider.matchATS(
      resumeText,
      sanitizedJD,
    );

    // 4. Persist the result securely tied to the userId
    await this.repository.save({
      userId,
      score: result.matchScore,
      jobRole: "Job Description Match",
      fileName: fileName,
      missingSkills: result.missingSkills,
      actionableSuggestions: result.actionableSuggestions,
    });

    return result;
  }
}
