export interface EventPoint {
  source: 'event';
  eventId: string;
  eventType: string;
  connector: string;
  routingKey: string;
  timestamp: string;
  normalizedText: string;
}

export interface DocumentPoint {
  source: 'document';
  documentId: string;
  filename: string;
  mimeType: string;
  chunkIndex: number;
  totalChunks: number;
  uploadedAt: string;
  normalizedText: string;
}

export type MnemePoint = EventPoint | DocumentPoint;

export interface SearchResult {
  score: number;
  payload: MnemePoint;
}
