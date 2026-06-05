import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import { createQdrantClient, ensureCollection, COLLECTION_NAME } from '@mneme/qdrant';
import type { MnemePoint } from '@mneme/qdrant';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QdrantService implements OnModuleInit {
  private readonly logger = new Logger(QdrantService.name);
  private client!: QdrantClient;

  async onModuleInit(): Promise<void> {
    const url = process.env['QDRANT_URL'] ?? 'http://localhost:3933';
    this.client = createQdrantClient(url);
    this.logger.log('Qdrant client initialized');
  }

  async ensureCollection(vectorSize: number): Promise<void> {
    await ensureCollection(this.client, vectorSize);
    this.logger.log(`Collection "${COLLECTION_NAME}" ready (size=${vectorSize})`);
  }

  async upsertPoints(payloads: MnemePoint[], vectors: number[][]): Promise<void> {
    const collectionName = process.env['QDRANT_COLLECTION'] ?? COLLECTION_NAME;
    const points = payloads.map((payload, i) => ({
      id: uuidv4(),
      vector: vectors[i] as number[],
      payload: payload as unknown as Record<string, unknown>,
    }));
    await this.client.upsert(collectionName, { points });
  }

  async search(
    vector: number[],
    limit: number,
    filter?: Record<string, unknown>,
  ): Promise<Array<{ score: number; payload: Record<string, unknown> | null | undefined }>> {
    const collectionName = process.env['QDRANT_COLLECTION'] ?? COLLECTION_NAME;
    const results = await this.client.search(collectionName, {
      vector,
      limit,
      filter: filter as Parameters<QdrantClient['search']>[1]['filter'],
      with_payload: true,
    });
    return results.map((r) => ({ score: r.score, payload: r.payload }));
  }
}
