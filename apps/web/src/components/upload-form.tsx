'use client';

import { useRef, useState } from 'react';

interface UploadResult {
  documentId: string;
  chunks: number;
  status: string;
}

interface UploadHistoryEntry extends UploadResult {
  filename: string;
}

export function UploadForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [history, setHistory] = useState<UploadHistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const result = (await res.json()) as UploadResult;
      setHistory((prev) => [{ ...result, filename: file.name }, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void upload(file);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void upload(file);
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? '#6366f1' : '#333'}`,
          borderRadius: 8,
          padding: '2rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'border-color 0.15s',
          background: dragging ? '#1a1a2e' : '#1a1a1a',
        }}
      >
        <input ref={inputRef} type="file" style={{ display: 'none' }} onChange={onChange} />
        <p style={{ color: '#888' }}>
          {uploading ? 'Uploading…' : 'Drop a file here or click to select (PDF, Markdown, TXT)'}
        </p>
      </div>

      {error && (
        <p style={{ marginTop: '0.75rem', color: '#f87171', fontSize: '0.875rem' }}>{error}</p>
      )}

      {history.length > 0 && (
        <ul style={{ marginTop: '1rem', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {history.map((entry) => (
            <li
              key={entry.documentId}
              style={{
                padding: '0.75rem 1rem',
                background: '#1a1a1a',
                borderRadius: 6,
                fontSize: '0.875rem',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ color: '#e5e5e5' }}>{entry.filename}</span>
              <span style={{ color: '#6366f1' }}>
                {entry.chunks} chunk{entry.chunks !== 1 ? 's' : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
