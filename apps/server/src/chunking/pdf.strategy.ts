import type { Chunk, ChunkingStrategy, DocumentMetadata } from './chunking.interface';

const CHARS_PER_PAGE = 3000;

export class PdfChunkingStrategy implements ChunkingStrategy {
  chunk(text: string, _metadata: DocumentMetadata): Chunk[] {
    const chunks: Chunk[] = [];
    let i = 0;
    let index = 0;

    while (i < text.length) {
      const slice = text.slice(i, i + CHARS_PER_PAGE);
      const trimmed = slice.trim();
      if (trimmed.length > 0) {
        chunks.push({ text: trimmed, index: index++ });
      }
      i += CHARS_PER_PAGE;
    }

    return chunks;
  }
}
