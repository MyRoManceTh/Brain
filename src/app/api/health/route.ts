/**
 * LINE Mini App - Health Check API
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'LINE Mini App',
  });
}
