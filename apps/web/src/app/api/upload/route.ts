import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const formData = await req.formData();
  const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3000';

  const response = await fetch(`${apiUrl}/ingest/document`, {
    method: 'POST',
    body: formData,
  });

  const data: unknown = await response.json();
  return NextResponse.json(data, { status: response.status });
}
