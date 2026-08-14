import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Zoom Workplace Serverless Cloud API',
    timestamp: new Date().toISOString(),
    platform: 'Vercel Serverless',
  });
}
