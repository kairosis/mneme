import type { Chunk, ChunkingStrategy, DocumentMetadata } from './chunking.interface';

export class MarkdownChunkingStrategy implements ChunkingStrategy {
  chunk(text: string, _metadata: DocumentMetadata): Chunk[] {
    const sections = text.split(/(?=\n#{1,3} )/);
    return sections
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s, index) => ({ text: s, index }));
  }
}
