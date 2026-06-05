import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { SearchService } from './search.service';
import type { SearchDto } from './dto/search.dto';
import type { SearchResult } from '@mneme/qdrant';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) { }

  @Post()
  @HttpCode(200)
  async search(@Body() dto: SearchDto): Promise<{ results: SearchResult[] }> {
    return this.searchService.search(dto);
  }
}
