import { IDocumentParser } from "./IDocumentParser.js";
import { PDFParse } from "pdf-parse";

// SRP: This class only handles PDF extraction
export class PDFParserStrategy implements IDocumentParser {
  canHandle(mimetype: string): boolean {
    return mimetype === "application/pdf";
  }

  async extractText(buffer: Buffer): Promise<string> {
    let parser: any = null;
    try {
      parser = new PDFParse({ data: buffer });
      const result = await parser.getText();

      if (!result?.text) {
        return "";
      }
      return result.text.trim();
    } catch (error: any) {
      console.error("PDFParserStrategy failed:", error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    } finally {
      if (parser && typeof parser.destroy === "function") {
        try {
          await parser.destroy();
        } catch (e) {
          console.error("Failed to destroy PDF parser:", e);
        }
      }
    }
  }
}
