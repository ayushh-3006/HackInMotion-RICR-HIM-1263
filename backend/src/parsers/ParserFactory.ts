import { IDocumentParser } from "./IDocumentParser.js";
import { PDFParserStrategy } from "./PDFParserStrategy.js";
import { DOCXParserStrategy } from "./DOCXParserStrategy.js";

// OCP: Adding a new parser only requires adding to the strategies array
// DIP: Returns the abstraction (IDocumentParser), not the concrete type
export class ParserFactory {
  private strategies: IDocumentParser[] = [
    new PDFParserStrategy(),
    new DOCXParserStrategy(),
  ];

  getParser(mimetype: string): IDocumentParser {
    const strategy = this.strategies.find((s) => s.canHandle(mimetype));
    if (!strategy) {
      throw new Error(
        `Unsupported file type: ${mimetype}. Supported: PDF, DOCX`,
      );
    }
    return strategy;
  }
}
