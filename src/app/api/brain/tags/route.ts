/**
 * Brain Tags API
 * GET /api/brain/tags - ดึง tags ทั้งหมดของ user
 */

import { NextRequest, NextResponse } from 'next/server';
import { brainDB } from '@/lib/db';

/**
 * GET /api/brain/tags
 * Query params: userId
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const tags = await brainDB.getUserTags(userId);
    const categories = await brainDB.getUserCategories(userId);

    return NextResponse.json({
      tags,
      categories,
    });
  } catch (error) {
    console.error('Error getting tags:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
