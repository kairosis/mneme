import { QdrantClient } from '@qdrant/js-client-rest';

export function createQdrantClient(url: string): QdrantClient {
  return new QdrantClient({ url });
}
