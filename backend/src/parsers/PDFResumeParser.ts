import { PDFParse } from "pdf-parse";
import type { IResumeParser } from "../interfaces/IResumeParser.js";

export class PDFResumeParser implements IResumeParser {
  async parse(fileBuffer: Buffer): Promise<string> {
    let parser: any = null;
    try {
      parser = new PDFParse({ data: fileBuffer });
      const data = await parser.getText();

      if (!data.text || data.text.trim().length === 0) {
        throw new Error(
          "Could not extract text from PDF. Make sure it is not a scanned image.",
        );
      }

      return data.text.trim();
    } catch (error: any) {
      console.error("PDFResumeParser failed:", error);
      throw new Error(`PDF parsing failed: ${error.message}`);
    } finally {
      if (parser && typeof parser.destroy === "function") {
        try {
          await parser.destroy();
        } catch (e) {
          console.error("Error destroying PDF parser instance:", e);
        }
      }
    }
  }
}
