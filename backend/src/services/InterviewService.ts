import Groq from "groq-sdk";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY! });

/* ── Filler‑word scanner ── */
const FILLER_WORDS = [
  "um",
  "uh",
  "like",
  "you know",
  "basically",
  "actually",
  "so",
  "right",
  "i mean",
  "sort of",
  "kind of",
];

export interface FillerResult {
  word: string;
  count: number;
}

function scanFillerWords(text: string): FillerResult[] {
  const lower = text.toLowerCase();
  const results: FillerResult[] = [];
  for (const filler of FILLER_WORDS) {
    // word‑boundary aware match
    const regex = new RegExp(`\\b${filler.replace(/ /g, "\\s+")}\\b`, "gi");
    const matches = lower.match(regex);
    if (matches && matches.length > 0) {
      results.push({ word: filler, count: matches.length });
    }
  }
  return results;
}

function classifyConfidence(
  wpm: number,
  fillerTotal: number,
  toneScore: number,
): string {
  if (wpm > 170) return "Fast-Paced";
  if (wpm < 110 || fillerTotal > 8 || toneScore < 50) return "Hesitant";
  if (toneScore >= 70 && fillerTotal <= 4) return "Confident";
  return "Moderate";
}

// Defensive JSON parser helper
function parseDefensiveJson(result: string): any {
  try {
    const jsonMatch = result.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const cleanStr = jsonMatch ? jsonMatch[1].trim() : result.trim();
    return JSON.parse(cleanStr);
  } catch (e) {
    console.error("Failed to parse AI JSON response:", result);
    throw new Error("AI response was not valid JSON");
  }
}

export class InterviewService {
  /* ── Audio → Text via Groq Whisper ── */
  public async transcribeAudio(
    audioBuffer: Buffer,
    originalName: string,
  ): Promise<string> {
    // Groq's Whisper API requires a File-like object; we write a temp file
    const tmpDir = path.resolve("uploads", "tmp");
    try {
      await fs.promises.mkdir(tmpDir, { recursive: true });
    } catch (err) {
      // Ignore if exists
    }

    const ext = path.extname(originalName) || ".webm";
    // Add randomness to prevent collisions
    const tmpPath = path.join(
      tmpDir,
      `interview_${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`,
    );

    await fs.promises.writeFile(tmpPath, audioBuffer);

    try {
      const transcription = await client.audio.transcriptions.create({
        file: fs.createReadStream(tmpPath),
        model: "whisper-large-v3",
        response_format: "text",
        language: "en",
      });

      return (transcription as any).text ?? String(transcription);
    } catch (error: any) {
      console.error("Whisper transcription failed:", error);
      throw new Error("Failed to transcribe audio.");
    } finally {
      // Clean up temp file
      try {
        fs.unlinkSync(tmpPath);
      } catch {
        /* ignore */
      }
    }
  }

  /* ── Generate interview questions ── */
  public async generateQuestions(
    jobRole: string,
    experience: string,
    difficulty?: string,
  ): Promise<any> {
    const diffLabel = difficulty || "Medium";

    const prompt = `You are an expert interviewer.
Generate EXACTLY 3 ${diffLabel}-difficulty interview questions for a ${experience} level ${jobRole}.
The questions should be a mix of Technical and Behavioral questions tailored to the candidate's target job role.

Return a JSON object with an array of "questions".
SCHEMA:
{
  "questions": [
    { "id": "q1", "text": "Question text here...", "type": "Technical" },
    { "id": "q2", "text": "Question text here...", "type": "Behavioral" },
    { "id": "q3", "text": "Question text here...", "type": "Technical" }
  ]
}
`;

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("AI returned empty response");

    return parseDefensiveJson(content);
  }

  /* ── Evaluate an answer (enhanced) ── */
  public async evaluateAnswer(
    questionText: string,
    transcribedText: string,
    audioDurationSeconds: number,
  ): Promise<any> {
    // Calculate metrics locally
    const wordCount = transcribedText
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
    const wpm =
      audioDurationSeconds > 0
        ? Math.round((wordCount / audioDurationSeconds) * 60)
        : 0;
    const fillerWords = scanFillerWords(transcribedText);
    const fillerTotal = fillerWords.reduce((sum, f) => sum + f.count, 0);

    const prompt = `You are an expert technical interviewer evaluating a candidate's verbal response.

QUESTION: "${questionText}"
CANDIDATE ANSWER (Transcribed Speech): "${transcribedText}"

SPEECH METRICS (already calculated — do NOT recalculate):
- Words Per Minute (WPM): ${wpm} (Ideal range: 130-160. <110 = slow/hesitant, >170 = too fast)
- Total Filler Words detected: ${fillerTotal}
- Audio Duration: ${audioDurationSeconds}s

Evaluate across these dimensions:

1. **Content Quality** (0-100): Technical accuracy, STAR method adherence (Situation-Task-Action-Result for behavioral), completeness, and missing key points.
2. **Tone & Delivery** (0-100): Based on speech metrics, text coherence, and response structure. Consider the WPM and filler word count.

Also provide:
- "strengths": Array of 2-4 specific strong points
- "improvements": Array of 2-4 actionable improvement tips
- "feedback": A 2-3 sentence summary of performance
- "idealAnswer": A concise model answer (3-5 sentences) the candidate could learn from

Return ONLY valid JSON matching this exact schema:
{
  "contentScore": 85,
  "toneScore": 78,
  "strengths": ["Clear explanation", "Good pacing"],
  "improvements": ["Mention time complexity", "Reduce filler words"],
  "feedback": "Great structured response! Work on minimizing pauses.",
  "idealAnswer": "A strong answer would cover X, Y, Z..."
}`;

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("AI returned empty response");

    const aiResult = parseDefensiveJson(content);

    // Classify confidence based on metrics
    const confidenceLabel = classifyConfidence(
      wpm,
      fillerTotal,
      aiResult.toneScore || 0,
    );

    return {
      ...aiResult,
      wpm,
      fillerWords,
      fillerTotal,
      confidenceLabel,
      audioDurationSeconds,
    };
  }
}
