import type { Chunk, ChunkingStrategy, DocumentMetadata } from './chunking.interface';

const MAX_SENTENCES = 10;
const OVERLAP_SENTENCES = 2;

export class PlainTextChunkingStrategy implements ChunkingStrategy {
  chunk(text: string, _metadata: DocumentMetadata): Chunk[] {
    const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
    const chunks: Chunk[] = [];
    let i = 0;
    let index = 0;

    while (i < sentences.length) {
      const window = sentences.slice(i, i + MAX_SENTENCES).join(' ').trim();
      if (window.length > 0) {
        chunks.push({ text: window, index: index++ });
      }
      i += MAX_SENTENCES - OVERLAP_SENTENCES;
    }

    return chunks;
  }
}
