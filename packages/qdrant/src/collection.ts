import { QdrantClient } from '@qdrant/js-client-rest';

export const COLLECTION_NAME = 'mneme';

export async function ensureCollection(client: QdrantClient, vectorSize: number): Promise<void> {
  const { collections } = await client.getCollections();
  const exists = collections.some((c) => c.name === COLLECTION_NAME);

  if (!exists) {
    await client.createCollection(COLLECTION_NAME, {
      vectors: { size: vectorSize, distance: 'Cosine' },
    });
  }
}
