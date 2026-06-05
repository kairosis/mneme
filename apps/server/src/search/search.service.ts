import { Injectable } from '@nestjs/common';
import { QdrantService } from '../qdrant/qdrant.service';
import { EmbeddingService } from '../embedding/embedding.service';
import type { MnemePoint, SearchResult } from '@mneme/qdrant';
import type { SearchDto, SearchFilterDto } from './dto/search.dto';

@Injectable()
export class SearchService {
  constructor(
    private readonly qdrant: QdrantService,
    private readonly embedding: EmbeddingService,
  ) {}

  async search(dto: SearchDto): Promise<{ results: SearchResult[] }> {
    const { embeddings } = await this.embedding.embedBatch([dto.query]);
    const queryVector = embeddings[0] as number[];

    const filter = this.buildFilter(dto.filter);
    const raw = await this.qdrant.search(queryVector, dto.topK ?? 10, filter);

    const results: SearchResult[] = raw.map((r) => ({
      score: r.score,
      payload: r.payload as unknown as MnemePoint,
    }));

    return { results };
  }

  private buildFilter(filter?: SearchFilterDto): Record<string, unknown> | undefined {
    if (!filter) return undefined;

    const must: unknown[] = [];

    if (filter.source) must.push({ key: 'source', match: { value: filter.source } });
    if (filter.connector) must.push({ key: 'connector', match: { value: filter.connector } });
    if (filter.eventType) must.push({ key: 'eventType', match: { value: filter.eventType } });

    if (filter.from ?? filter.to) {
      const range: Record<string, string> = {};
      if (filter.from) range['gte'] = filter.from;
      if (filter.to) range['lte'] = filter.to;
      must.push({ key: 'timestamp', range });
    }

    return must.length > 0 ? { must } : undefined;
  }
}
