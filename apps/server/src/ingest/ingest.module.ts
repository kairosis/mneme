import { Module } from '@nestjs/common';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { QdrantModule } from '../qdrant/qdrant.module';
import { EmbeddingModule } from '../embedding/embedding.module';
import { ChunkingModule } from '../chunking/chunking.module';
import { IngestService } from './ingest.service';
import { IngestController } from './ingest.controller';

@Module({
  imports: [RabbitMQModule, QdrantModule, EmbeddingModule, ChunkingModule],
  providers: [IngestService],
  controllers: [IngestController],
})
export class IngestModule {}
