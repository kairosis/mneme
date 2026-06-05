import { Injectable } from '@nestjs/common';
import pdfParse from 'pdf-parse';
import type { Chunk, ChunkingStrategy, DocumentMetadata } from './chunking.interface';
import { PdfChunkingStrategy } from './pdf.strategy';
import { MarkdownChunkingStrategy } from './markdown.strategy';
import { PlainTextChunkingStrategy } from './plaintext.strategy';

@Injectable()
export class ChunkingService {
  private readonly strategies = new Map<string, ChunkingStrategy>([
    ['application/pdf', new PdfChunkingStrategy()],
    ['text/markdown', new MarkdownChunkingStrategy()],
    ['text/x-markdown', new MarkdownChunkingStrategy()],
    ['text/plain', new PlainTextChunkingStrategy()],
  ]);

  async chunk(buffer: Buffer, mimeType: string, metadata: DocumentMetadata): Promise<Chunk[]> {
    let text: string;

    if (mimeType === 'application/pdf') {
      const data = await pdfParse(buffer);
      text = data.text;
    } else {
      text = buffer.toString('utf-8');
    }

    const strategy = this.strategies.get(mimeType) ?? new PlainTextChunkingStrategy();
    return strategy.chunk(text, metadata);
  }
}
