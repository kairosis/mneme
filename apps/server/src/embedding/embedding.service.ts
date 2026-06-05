import { Injectable, Logger } from '@nestjs/common';
import { embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import { ollama } from 'ollama-ai-provider';

type EmbeddingModel = Parameters<typeof embedMany>[0]['model'];

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private dimensionsCache: number | null = null;

  private createModel(): EmbeddingModel {
    const provider = process.env['EMBEDDING_PROVIDER'] ?? 'ollama';
    const modelName = process.env['EMBEDDING_MODEL'] ?? 'nomic-embed-text';

    switch (provider) {
      case 'openai':
        return openai.embedding(modelName);
      case 'ollama':
        return ollama.embedding(modelName);
      default:
        throw new Error(`Unsupported embedding provider: ${provider}`);
    }
  }

  async embedBatch(texts: string[]): Promise<{ embeddings: number[][]; dimensions: number }> {
    const model = this.createModel();
    const { embeddings } = await embedMany({ model, values: texts });
    const dimensions = embeddings[0]?.length ?? 0;
    this.dimensionsCache = dimensions;
    return { embeddings, dimensions };
  }

  async getDimensions(): Promise<number> {
    if (this.dimensionsCache !== null) return this.dimensionsCache;
    this.logger.log('Probing embedding model for dimensions');
    const { dimensions } = await this.embedBatch(['probe']);
    return dimensions;
  }
}
