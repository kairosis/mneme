import { Module } from '@nestjs/common';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { QdrantModule } from './qdrant/qdrant.module';
import { EmbeddingModule } from './embedding/embedding.module';
import { ChunkingModule } from './chunking/chunking.module';
import { IngestModule } from './ingest/ingest.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [RabbitMQModule, QdrantModule, EmbeddingModule, ChunkingModule, IngestModule, SearchModule],
})
export class AppModule {}
