import Groq from "groq-sdk";
import dotenv from "dotenv";
import { IAIProvider } from "../interfaces/IAIProvider.js";
import { aiPrompts } from "../config/aiPrompts.js";
import { parseDefensiveJson } from "../utils/aiUtils.js";
dotenv.config();

if (!process.env.GROQ_API_KEY) {
  throw new Error("FATAL: GROQ_API_KEY environment variable is not set.");
}
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export class AIProvider implements IAIProvider {
  async enhance(resumeText: string, jobDescription: string): Promise<any> {
    const config = aiPrompts.resumeBuilderChat; // Use a general builder or create an enhancer specific prompt if needed
    // Using a simplified inline prompt here for the original enhance function, though buildResumeFromChat is standard
    const response = await client.chat.completions.create({
      model: config.model,
      messages: [
        {
          role: "system",
          content: `You are an expert resume parser and enhancer.
Your goal is to extract information from a raw resume text and enhance it to match a specific job description.
STRICT RULES:
1. Return ONLY valid JSON.
2. Apply the Google XYZ Formula to bullet points: "Accomplished [X] as measured by [Y], by doing [Z]".
3. Keep all original facts exactly as they are.
SCHEMA: { "name": "string", "email": "string", "summary": "string", "experience": [...], "education": [...] }`
        },
        {
          role: "user",
          content: `JOB DESCRIPTION:\n${jobDescription}\n\nRAW RESUME TEXT:\n${resumeText}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 4500,
    });

    const result = response.choices[0]?.message?.content;
    if (!result) throw new Error("AI returned empty response");
    return parseDefensiveJson(result);
  }

  async buildResumeFromChat(
    chatHistory: any[],
    currentData: any,
  ): Promise<any> {
    const config = aiPrompts.resumeBuilderChat;
    const response = await client.chat.completions.create({
      model: config.model,
      messages: [
        {
          role: "system",
          content: `${config.systemPrompt}\n\nCURRENT RESUME DATA:\n${JSON.stringify(currentData, null, 2)}`,
        },
        // Keep only the last 6 messages to prevent hitting the 8000 TPM limit
        ...chatHistory.slice(-6),
      ],
      temperature: config.temperature,
      max_tokens: config.max_tokens,
      response_format: config.response_format as any,
    });

    const result = response.choices[0]?.message?.content;
    if (!result) throw new Error("AI returned empty response");
    return parseDefensiveJson(result);
  }

  async enhanceBullet(bulletPoint: string, role: string): Promise<string> {
    const config = aiPrompts.enhanceBullet;
    const response = await client.chat.completions.create({
      model: config.model,
      messages: [
        { role: "system", content: config.systemPrompt },
        { role: "user", content: `TARGET ROLE: ${role}\nBULLET POINT: ${bulletPoint}` },
      ],
      temperature: config.temperature,
      max_tokens: config.max_tokens,
    });

    const result = response.choices[0]?.message?.content;
    if (!result) throw new Error("AI returned empty response");

    return result.trim();
  }

  async matchATS(resumeText: string, jobDescription: string): Promise<any> {
    const config = aiPrompts.atsMatch;
    try {
      const response = await client.chat.completions.create({
        model: config.model,
        temperature: config.temperature,
        max_tokens: config.max_tokens,
        messages: [
          { role: "system", content: config.systemPrompt },
          { role: "user", content: `JOB DESCRIPTION:\n${jobDescription}\n\nRESUME TEXT:\n${resumeText}` },
        ],
        response_format: config.response_format as any,
      });

      const resultText = response.choices[0]?.message?.content;
      if (!resultText) throw new Error("AI returned empty response");

      const parsed = parseDefensiveJson(resultText);
      if (
        typeof parsed.matchScore !== "number" ||
        !Array.isArray(parsed.missingSkills) ||
        !Array.isArray(parsed.actionableSuggestions)
      ) {
        throw new Error("AI response did not match expected schema");
      }
      return parsed;
    } catch (error: any) {
      console.error("Groq ATS match failed:", error.message || error);
      throw new Error(`Failed to process ATS matching: ${error.message || "Unknown API error"}`);
    }
  }
}
