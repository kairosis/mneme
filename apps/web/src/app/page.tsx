import { UploadForm } from '@/components/upload-form';
import { SearchForm } from '@/components/search-form';

export default function Home() {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ marginBottom: '2rem', fontSize: '1.75rem' }}>Mneme</h1>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem', color: '#a0a0a0' }}>
          Upload Document
        </h2>
        <UploadForm />
      </section>

      <section>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem', color: '#a0a0a0' }}>
          Semantic Search
        </h2>
        <SearchForm />
      </section>
    </main>
  );
}
