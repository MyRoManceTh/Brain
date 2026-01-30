/**
 * Brain Search API
 * GET /api/brain/search - ค้นหา items
 */

import { NextRequest, NextResponse } from 'next/server';
import { brainDB } from '@/lib/db';
import { ContentType } from '@/lib/db/types';

/**
 * GET /api/brain/search
 * Query params: userId, q (search query), type, limit, offset
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get('userId');
    const query = searchParams.get('q');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (!query || query.trim().length < 1) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const type = searchParams.get('type') as ContentType | null;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const result = await brainDB.getItems({
      user_id: userId,
      type: type || undefined,
      search: query.trim(),
      limit,
      offset,
    });

    return NextResponse.json({
      query: query.trim(),
      ...result,
    });
  } catch (error) {
    console.error('Error searching items:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
