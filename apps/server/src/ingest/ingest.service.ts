import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { QdrantService } from '../qdrant/qdrant.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { ChunkingService } from '../chunking/chunking.service';
import { NormalizerRegistry } from '../normalizers/normalizer.registry';
import type { EventPoint, DocumentPoint } from '@mneme/qdrant';

interface KairosisEvent {
  id: string;
  type: string;
  workspaceId: string;
  connectorId: string;
  occurredAt: string;
  payload: Record<string, unknown>;
}

const CONNECTOR_BINDINGS: Array<{ queue: string; routingKey: string }> = [
  { queue: 'mneme.slack',     routingKey: 'slack.#' },
  { queue: 'mneme.github',    routingKey: 'github.#' },
  { queue: 'mneme.email',     routingKey: 'email.#' },
  { queue: 'mneme.spotify',   routingKey: 'spotify.#' },
  { queue: 'mneme.calendar',  routingKey: 'calendar.#' },
  { queue: 'mneme.browser',   routingKey: 'browser.#' },
  { queue: 'mneme.desktop',   routingKey: 'desktop.#' },
  { queue: 'mneme.terminal',  routingKey: 'terminal.#' },
];

@Injectable()
export class IngestService implements OnModuleInit {
  private readonly logger = new Logger(IngestService.name);

  constructor(
    private readonly rabbitMQ: RabbitMQService,
    private readonly qdrant: QdrantService,
    private readonly embedding: EmbeddingService,
    private readonly chunking: ChunkingService,
  ) {}

  async onModuleInit(): Promise<void> {
    const dimensions = await this.embedding.getDimensions();
    await this.qdrant.ensureCollection(dimensions);

    for (const { queue, routingKey } of CONNECTOR_BINDINGS) {
      await this.rabbitMQ.bindQueue(queue, routingKey, (content, rk) =>
        this.handleEvent(content, rk),
      );
    }
  }

  async handleEvent(content: Buffer, routingKey: string): Promise<void> {
    const event = JSON.parse(content.toString('utf-8')) as KairosisEvent;
    const normalizer = NormalizerRegistry[event.type];

    if (!normalizer) {
      this.logger.warn(`No normalizer for event type: ${event.type} — skipping`);
      return;
    }

    const text = normalizer(event.payload);
    const { embeddings } = await this.embedding.embedBatch([text]);

    const point: EventPoint = {
      source: 'event',
      eventId: event.id,
      eventType: event.type,
      connector: event.connectorId,
      routingKey,
      timestamp: event.occurredAt,
      normalizedText: text,
    };

    await this.qdrant.upsertPoints([point], embeddings);
  }

  async handleDocument(
    file: Express.Multer.File,
  ): Promise<{ documentId: string; chunks: number; status: string }> {
    const documentId = uuidv4();
    const uploadedAt = new Date().toISOString();

    const chunks = await this.chunking.chunk(file.buffer, file.mimetype, {
      filename: file.originalname,
      mimeType: file.mimetype,
    });

    if (chunks.length === 0) {
      this.logger.warn(`No chunks produced for ${file.originalname}`);
      return { documentId, chunks: 0, status: 'skipped' };
    }

    const texts = chunks.map((c) => c.text);
    const { embeddings } = await this.embedding.embedBatch(texts);

    const points: DocumentPoint[] = chunks.map((chunk) => ({
      source: 'document',
      documentId,
      filename: file.originalname,
      mimeType: file.mimetype,
      chunkIndex: chunk.index,
      totalChunks: chunks.length,
      uploadedAt,
      normalizedText: chunk.text,
    }));

    await this.qdrant.upsertPoints(points, embeddings);
    this.logger.log(`Ingested ${file.originalname}: ${chunks.length} chunks`);

    return { documentId, chunks: chunks.length, status: 'ok' };
  }
}
