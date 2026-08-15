import Groq from "groq-sdk";
import dotenv from "dotenv";
import { IAIProvider } from "../interfaces/IAIProvider.js";
dotenv.config();

if (!process.env.GROQ_API_KEY) {
  throw new Error("FATAL: GROQ_API_KEY environment variable is not set.");
}
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * SOLID — S (Single Responsibility): Only job is calling Groq AI and returning text.
 * SOLID — D (Dependency Inversion): Implements IAIProvider interface.
 *
 * OOP — Encapsulation: All Groq-specific details (model name, prompt structure,
 *                      temperature) are hidden inside this class.
 *                      The rest of the app has no idea we are using Groq.
 *
 * To switch to OpenAI: create OpenAIProvider that implements IAIProvider.
 * Nothing else changes.
 */

export class AIProvider implements IAIProvider {
  async enhance(resumeText: string, jobDescription: string): Promise<any> {
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are an expert resume parser and enhancer.
                    Your goal is to extract information from a raw resume text and enhance it to match a specific job description.
                    
                    STRICT RULES:
                    1. Return ONLY valid JSON.
                    2. Do not change the structure of the JSON.
                    3. Do not add explanations or markdown.
                    4. Enhance the wording of summaries, bullet points, and details to be more impactful and keyword-rich for the target role.
                    5. Keep all original facts (dates, companies, degrees) exactly as they are.
                    
                    SCHEMA:
                    {
                        "name": "string",
                        "email": "string",
                        "phone": "string",
                        "links": ["string"],
                        "summary": "string (enhanced professional summary)",
                        "education": [{ "institution": "string", "degree": "string", "dates": "string", "location": "string", "details": ["string"] }],
                        "experience": [{ "company": "string", "role": "string", "dates": "string", "location": "string", "bullets": ["enhanced bullet 1", "enhanced bullet 2"] }],
                        "projects": [{ "title": "string", "dates": "string", "bullets": ["enhanced bullet 1"] }],
                        "skills": [{ "category": "string", "items": ["string"] }],
                        "extraCurricular": ["string"]
                    }`,
        },
        {
          role: "user",
          content: `JOB DESCRIPTION:\n${jobDescription}\n\nRAW RESUME TEXT:\n${resumeText}`,
        },
      ],
      temperature: 0.2, // Lower temperature for more stable JSON
      response_format: { type: "json_object" },
    });

    const result = response.choices[0]?.message?.content;
    if (!result) throw new Error("AI returned empty response");

    try {
      return JSON.parse(result);
    } catch (e) {
      console.error("Failed to parse AI JSON response:", result);
      throw new Error("AI response was not valid JSON");
    }
  }

  async buildResumeFromChat(
    chatHistory: any[],
    currentData: any,
  ): Promise<any> {
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are an expert AI Resume Builder.
                    Your goal is to iteratively build and refine a JSON resume based on a conversation with the user.
                    
                    STRICT RULES:
                    1. Return ONLY valid JSON.
                    2. Maintain the schema structure exactly as provided.
                    3. Update the JSON based on the latest user messages in the chat history.
                    4. If the user provides a target job role or experience, incorporate it to enhance their resume bullet points.
                    5. Ensure dates, names, and contact info stay accurate based on user input.
                    
                    CURRENT RESUME DATA:
                    ${JSON.stringify(currentData, null, 2)}
                    
                    SCHEMA EXPECTED:
                    {
                        "id": "string",
                        "personalInfo": {
                            "fullName": "string",
                            "email": "string",
                            "phone": "string",
                            "portfolio": "string",
                            "linkedin": "string",
                            "github": "string",
                            "twitter": "string",
                            "leetcode": "string",
                            "codeforces": "string"
                        },
                        "careerDetails": {
                            "objective": "string"
                        },
                        "experience": [{
                            "id": "string",
                            "jobTitle": "string",
                            "company": "string",
                            "duration": "string",
                            "description": "string"
                        }],
                        "education": [{
                            "id": "string",
                            "degree": "string",
                            "institution": "string",
                            "year": "string"
                        }],
                        "projects": [{
                            "id": "string",
                            "name": "string",
                            "date": "string",
                            "description": "string"
                        }],
                        "certifications": [{
                            "id": "string",
                            "name": "string",
                            "issuer": "string",
                            "date": "string"
                        }]
                    }`,
        },
        ...chatHistory,
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const result = response.choices[0]?.message?.content;
    if (!result) throw new Error("AI returned empty response");

    try {
      return JSON.parse(result);
    } catch (e) {
      console.error("Failed to parse AI JSON response:", result);
      throw new Error("AI response was not valid JSON");
    }
  }

  async enhanceBullet(bulletPoint: string, role: string): Promise<string> {
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are an Expert Resume Writer AI. 
Your task is to upgrade the provided resume bullet point to be ATS-friendly and highly impactful for the target role.
STRICT RULES:
1. Start with a strong action verb.
2. Incorporate metrics or results where possible, or improve the wording significantly.
3. Tailor the tone and keywords for the target role.
4. RETURN ONLY THE ENHANCED STRING. Do not include quotes, markdown, conversational filler, or explanations.`,
        },
        {
          role: "user",
          content: `TARGET ROLE: ${role}\nBULLET POINT: ${bulletPoint}`,
        },
      ],
      temperature: 0.7,
    });

    const result = response.choices[0]?.message?.content;
    if (!result) throw new Error("AI returned empty response");

    return result.trim();
  }

  async matchATS(resumeText: string, jobDescription: string): Promise<any> {
    try {
      const response = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile", // Or llama-3.1-8b-instant depending on preference, rubric mentions 3
        temperature: 0,
        messages: [
          {
            role: "system",
            content: `You are an expert ATS (Applicant Tracking System) parser and technical recruiter.
Your objective is to compare the given resume against the provided job description and evaluate the candidate's fit.

STRICT RULES:
1. Return ONLY valid JSON. No explanation, no markdown formatting (do not wrap in \`\`\`json), no conversational filler.
2. The JSON MUST exactly match the following schema:
{
  "matchScore": <number between 0 and 100>,
  "missingSkills": [<array of strings of key skills mentioned in JD but missing in resume>],
  "actionableSuggestions": [<array of specific, tailored strings advising how to bridge the gap based on the resume>]
}
3. The actionableSuggestions must be highly specific to the missing skills or missing experience, do not give generic advice.`,
          },
          {
            role: "user",
            content: `JOB DESCRIPTION:\n${jobDescription}\n\nRESUME TEXT:\n${resumeText}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const resultText = response.choices[0]?.message?.content;
      if (!resultText) throw new Error("AI returned empty response");

      try {
        const parsed = JSON.parse(resultText);
        if (
          typeof parsed.matchScore !== "number" ||
          !Array.isArray(parsed.missingSkills) ||
          !Array.isArray(parsed.actionableSuggestions)
        ) {
          throw new Error("AI response did not match expected schema");
        }
        return parsed;
      } catch (parseError) {
        console.error("JSON Parsing Error on output:", resultText);
        throw new Error("Failed to parse ATS match result from AI.");
      }
    } catch (error: any) {
      console.error("Groq ATS match failed:", error.message || error);
      throw new Error(
        `Failed to process ATS matching: ${error.message || "Unknown API error"}`,
      );
    }
  }
}
