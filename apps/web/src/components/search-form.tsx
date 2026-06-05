'use client';

import { useState } from 'react';

interface SearchResult {
  score: number;
  payload: Record<string, unknown>;
}

export function SearchForm() {
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<'' | 'event' | 'document'>('');
  const [connector, setConnector] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const body: Record<string, unknown> = { query: query.trim(), topK: 10 };
      const filter: Record<string, unknown> = {};
      if (source) filter['source'] = source;
      if (connector.trim()) filter['connector'] = connector.trim();
      if (Object.keys(filter).length > 0) body['filter'] = filter;

      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = (await res.json()) as { results: SearchResult[] };
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={(e) => void search(e)} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search across all vectors…"
          style={{
            padding: '0.625rem 0.875rem',
            background: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: 6,
            color: '#e5e5e5',
            fontSize: '0.9375rem',
          }}
        />

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as '' | 'event' | 'document')}
            style={{
              flex: 1,
              padding: '0.5rem 0.75rem',
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: 6,
              color: source ? '#e5e5e5' : '#666',
            }}
          >
            <option value="">All sources</option>
            <option value="event">Events</option>
            <option value="document">Documents</option>
          </select>

          <input
            value={connector}
            onChange={(e) => setConnector(e.target.value)}
            placeholder="Connector (e.g. slack)"
            style={{
              flex: 1,
              padding: '0.5rem 0.75rem',
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: 6,
              color: '#e5e5e5',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !query.trim()}
          style={{
            padding: '0.625rem 1.25rem',
            background: '#6366f1',
            border: 'none',
            borderRadius: 6,
            color: '#fff',
            fontWeight: 600,
            opacity: loading || !query.trim() ? 0.5 : 1,
            alignSelf: 'flex-start',
          }}
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && (
        <p style={{ marginTop: '0.75rem', color: '#f87171', fontSize: '0.875rem' }}>{error}</p>
      )}

      {results !== null && (
        <div style={{ marginTop: '1.5rem' }}>
          <p style={{ marginBottom: '0.75rem', color: '#888', fontSize: '0.875rem' }}>
            {results.length} result{results.length !== 1 ? 's' : ''}
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {results.map((r, i) => (
              <li
                key={i}
                style={{
                  padding: '1rem',
                  background: '#1a1a1a',
                  borderRadius: 8,
                  border: '1px solid #2a2a2a',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 600 }}>
                    {String(r.payload['source'])}
                    {r.payload['connector'] ? ` · ${String(r.payload['connector'])}` : ''}
                    {r.payload['eventType'] ? ` · ${String(r.payload['eventType'])}` : ''}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#666' }}>
                    {(r.score * 100).toFixed(1)}%
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#ccc', lineHeight: 1.5 }}>
                  {String(r.payload['normalizedText'])}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
