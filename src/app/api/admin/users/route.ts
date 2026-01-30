/**
 * Admin Users API
 * GET /api/admin/users - ดึงรายชื่อ users ทั้งหมด
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function validateAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  return authHeader.slice(7) === ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!validateAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Get all items grouped by user
    const { data: items } = await supabaseAdmin
      .from('brain_items')
      .select('user_id, type, created_at')
      .order('created_at', { ascending: false });

    // Group by user
    const userStats: Record<string, {
      user_id: string;
      itemCount: number;
      textCount: number;
      imageCount: number;
      linkCount: number;
      lastActive: string;
      firstSeen: string;
    }> = {};

    items?.forEach((item: { user_id: string; type: string; created_at: string }) => {
      if (!userStats[item.user_id]) {
        userStats[item.user_id] = {
          user_id: item.user_id,
          itemCount: 0,
          textCount: 0,
          imageCount: 0,
          linkCount: 0,
          lastActive: item.created_at,
          firstSeen: item.created_at,
        };
      }

      const user = userStats[item.user_id];
      user.itemCount++;

      if (item.type === 'text') user.textCount++;
      if (item.type === 'image') user.imageCount++;
      if (item.type === 'link') user.linkCount++;

      if (new Date(item.created_at) > new Date(user.lastActive)) {
        user.lastActive = item.created_at;
      }
      if (new Date(item.created_at) < new Date(user.firstSeen)) {
        user.firstSeen = item.created_at;
      }
    });

    // Convert to array and sort by item count
    const users = Object.values(userStats)
      .sort((a, b) => b.itemCount - a.itemCount)
      .slice(offset, offset + limit);

    return NextResponse.json({
      users,
      total: Object.keys(userStats).length,
      hasMore: Object.keys(userStats).length > offset + limit,
    });
  } catch (error) {
    console.error('Error getting users:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
