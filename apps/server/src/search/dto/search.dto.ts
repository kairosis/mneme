export interface SearchFilterDto {
  source?: 'event' | 'document';
  connector?: string;
  eventType?: string;
  from?: string;
  to?: string;
}

export interface SearchDto {
  query: string;
  topK?: number;
  filter?: SearchFilterDto;
}
