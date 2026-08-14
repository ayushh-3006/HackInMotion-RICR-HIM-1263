export interface SavePDFExportData {
  userId: string;
  type: string;
  pdfUrl: string;
  title?: string;
}

export interface IPDFExportRepository {
  save(data: SavePDFExportData): Promise<{ id: string }>;
  findByUserId(userId: string): Promise<any[]>;
  countByUserId(userId: string): Promise<number>;
}
