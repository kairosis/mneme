export interface DocumentMetadata {
  filename: string;
  mimeType: string;
}

export interface Chunk {
  text: string;
  index: number;
}

export interface ChunkingStrategy {
  chunk(text: string, metadata: DocumentMetadata): Chunk[];
}
