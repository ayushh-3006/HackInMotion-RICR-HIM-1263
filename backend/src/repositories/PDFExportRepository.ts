import { PDFExportModel } from "../models/PDFExport.js";
import {
  IPDFExportRepository,
  SavePDFExportData,
} from "../interfaces/IPDFExportRepository.js";

export class PDFExportRepository implements IPDFExportRepository {
  async save(data: SavePDFExportData): Promise<{ id: string }> {
    throw new Error("Not implemented with MongoDB yet");
  }

  async findByUserId(userId: string): Promise<any[]> {
    throw new Error("Not implemented with MongoDB yet");
  }

  async countByUserId(userId: string): Promise<number> {
    throw new Error("Not implemented with MongoDB yet");
  }
}
