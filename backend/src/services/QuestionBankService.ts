import Groq from "groq-sdk";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export type QuestionType =
  "Technical" | "Behavioral" | "Situational" | "System Design";

export interface QuestionDef {
  id: string;
  type: QuestionType;
  question: string;
  contextOrScenario?: string;
  keyPointsExpected: string[];
  suggestedAnswerStructure: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface QuestionBankResult {
  industry: string;
  targetRole: string;
  difficulty: string;
  questions: QuestionDef[];
}

/**
 * Defensive JSON parser that extracts JSON out of Markdown code blocks.
 */
function parseDefensiveJson(raw: string): any {
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const cleaned = jsonMatch ? jsonMatch[1].trim() : raw.trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error(
      "[QuestionBankService] Failed to parse AI JSON response:",
      cleaned,
    );
    throw new Error("AI response was not valid JSON");
  }
}

/**
 * Fallback questions grouped by broad industry categories.
 * Ensures 100% uptime even during rate-limits or network failures.
 */
const FALLBACK_BANKS: Record<string, QuestionDef[]> = {
  "Software Engineering": [
    {
      id: "se-1",
      type: "Technical",
      question:
        "Explain the concept of closures in JavaScript. How do they work and what is a common use case?",
      keyPointsExpected: [
        "Lexical scoping",
        "Access to outer function variables",
        "Data privacy/encapsulation",
      ],
      suggestedAnswerStructure:
        "Start with a brief definition, provide a short code example, and explain how it enables private variables.",
      difficulty: "Medium",
    },
    {
      id: "se-2",
      type: "System Design",
      question: "How would you design a URL shortener service like Bitly?",
      contextOrScenario:
        "Assume 100 million new URLs generated per month and 1 billion redirects.",
      keyPointsExpected: [
        "Hashing/Encoding (Base62)",
        "Database choice (NoSQL vs SQL)",
        "Caching layer (Redis)",
        "Load balancing",
      ],
      suggestedAnswerStructure:
        "Outline requirements, scale estimation, database schema, and then draw out the high-level architecture.",
      difficulty: "Hard",
    },
    {
      id: "se-3",
      type: "Behavioral",
      question:
        "Tell me about a time you strongly disagreed with your team lead on a technical decision. How did you handle it?",
      keyPointsExpected: [
        "Respectful communication",
        "Data-driven argumentation",
        "Commitment to team decision once made",
      ],
      suggestedAnswerStructure:
        "Use the STAR method (Situation, Task, Action, Result). Focus on how you communicated your points.",
      difficulty: "Medium",
    },
  ],
  Finance: [
    {
      id: "fin-1",
      type: "Technical",
      question: "Walk me through a Discounted Cash Flow (DCF) model.",
      keyPointsExpected: [
        "Projecting Free Cash Flows",
        "Calculating Terminal Value",
        "Discounting at WACC",
      ],
      suggestedAnswerStructure:
        "List the step-by-step process clearly, mentioning key assumptions like growth rates and WACC.",
      difficulty: "Medium",
    },
    {
      id: "fin-2",
      type: "Situational",
      question:
        "If a company's depreciation increases by $10, how does it affect the three financial statements?",
      keyPointsExpected: [
        "Income statement (Net Income down by $10 * (1-tax rate))",
        "Cash Flow (Add back depreciation, Cash up by tax shield)",
        "Balance Sheet (Assets down, Retained Earnings down, Cash up)",
      ],
      suggestedAnswerStructure:
        "Go through the statements sequentially: Income Statement -> Cash Flow Statement -> Balance Sheet.",
      difficulty: "Hard",
    },
  ],
  Marketing: [
    {
      id: "mkt-1",
      type: "Technical",
      question:
        "How do you calculate Customer Acquisition Cost (CAC) and Lifetime Value (LTV)? Why is their ratio important?",
      keyPointsExpected: [
        "CAC formula (Total Sales/Marketing cost / New Customers)",
        "LTV formula",
        "Ideal LTV:CAC ratio (typically 3:1)",
      ],
      suggestedAnswerStructure:
        "Define both terms, provide the formulas, and explain how the ratio guides marketing spend efficiency.",
      difficulty: "Medium",
    },
    {
      id: "mkt-2",
      type: "Behavioral",
      question:
        "Describe a campaign that failed to meet its objectives. What did you learn?",
      keyPointsExpected: [
        "Ownership of failure",
        "Analytical approach to finding the root cause",
        "Actionable takeaways implemented later",
      ],
      suggestedAnswerStructure:
        "Use STAR. Don't hide the failure; emphasize the metrics you analyzed and what you changed next time.",
      difficulty: "Medium",
    },
  ],
};

/**
 * Provides a dynamic, AI-generated tailored question bank.
 */
export class QuestionBankService {
  public async generateBank(
    industry: string,
    targetRole: string,
    experienceLevel: string,
    questionCount: number = 5,
    includeBehavioral: boolean = true,
    jobDescription?: string,
  ): Promise<QuestionBankResult> {
    const systemPrompt = `You are an expert technical interviewer and hiring manager in the "${industry}" industry.
Your task is to generate a highly tailored, industry-specific interview question bank for a "${targetRole}" at the "${experienceLevel}" level.

STRICT RULES:
1. Return ONLY valid JSON. No markdown wrappers or conversational text.
2. Generate exactly ${questionCount} questions.
3. ${includeBehavioral ? "Ensure a mix of Technical, Situational, and Behavioral questions." : "Focus entirely on Technical and System Design / Domain-specific questions."}
4. Each question must include 'keyPointsExpected' (what an ideal answer must contain) and 'suggestedAnswerStructure' (how the candidate should frame their answer, e.g., STAR method).
5. Ensure the difficulty aligns perfectly with the "${experienceLevel}" level.

REQUIRED JSON SCHEMA:
{
  "industry": "string",
  "targetRole": "string",
  "difficulty": "string",
  "questions": [
    {
      "id": "uuid string",
      "type": "Technical | Behavioral | Situational | System Design",
      "question": "string",
      "contextOrScenario": "string (optional background context)",
      "keyPointsExpected": ["string", "string"],
      "suggestedAnswerStructure": "string",
      "difficulty": "Easy | Medium | Hard"
    }
  ]
}`;

    const userPrompt = `Generate the question bank now.
Industry: ${industry}
Target Role: ${targetRole}
Experience Level: ${experienceLevel}
${jobDescription ? `Job Description / Context:\n${jobDescription}` : ""}`;

    try {
      const response = await client.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("AI returned empty response");

      const parsed = parseDefensiveJson(content);

      // Ensure IDs are populated and valid
      if (Array.isArray(parsed.questions)) {
        parsed.questions = parsed.questions.map((q: any) => ({
          ...q,
          id: q.id && q.id.length > 5 ? q.id : uuidv4(),
        }));
      }

      return {
        industry: parsed.industry || industry,
        targetRole: parsed.targetRole || targetRole,
        difficulty: parsed.difficulty || experienceLevel,
        questions: parsed.questions || [],
      };
    } catch (error: any) {
      console.error(
        "[QuestionBankService] Failed to generate AI questions, returning fallback.",
        error.message,
      );
      return this.getFallbackBank(industry, targetRole, experienceLevel);
    }
  }

  /**
   * Safe fallback dictionary if the LLM crashes.
   */
  private getFallbackBank(
    industry: string,
    targetRole: string,
    exp: string,
  ): QuestionBankResult {
    const defaultIndustry = "Software Engineering";
    let matchedIndustry = Object.keys(FALLBACK_BANKS).find((k) =>
      industry.toLowerCase().includes(k.toLowerCase()),
    );

    if (!matchedIndustry) {
      matchedIndustry = defaultIndustry;
    }

    const fallbackQs = FALLBACK_BANKS[matchedIndustry].map((q) => ({
      ...q,
      id: uuidv4(),
    }));

    return {
      industry: matchedIndustry,
      targetRole,
      difficulty: exp,
      questions: fallbackQs,
    };
  }
}
