import { Module } from '@nestjs/common';
import { QdrantModule } from '../qdrant/qdrant.module';
import { EmbeddingModule } from '../embedding/embedding.module';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [QdrantModule, EmbeddingModule],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
