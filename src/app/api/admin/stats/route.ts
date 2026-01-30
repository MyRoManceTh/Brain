/**
 * Admin Stats API
 * GET /api/admin/stats - ดึงสถิติภาพรวม
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

// Admin password (ควรเก็บใน env)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function validateAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const password = authHeader.slice(7);
  return password === ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  // Validate admin
  if (!validateAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get total items count
    const { count: totalItems } = await supabaseAdmin
      .from('brain_items')
      .select('*', { count: 'exact', head: true });

    // Get items by type
    const { data: typeStats } = await supabaseAdmin
      .from('brain_items')
      .select('type')
      .then(({ data }) => {
        const counts: Record<string, number> = { text: 0, image: 0, link: 0 };
        data?.forEach((item: { type: string }) => {
          counts[item.type] = (counts[item.type] || 0) + 1;
        });
        return { data: counts };
      });

    // Get unique users count
    const { data: usersData } = await supabaseAdmin
      .from('brain_items')
      .select('user_id');

    const uniqueUsers = new Set(usersData?.map((item: { user_id: string }) => item.user_id));
    const totalUsers = uniqueUsers.size;

    // Get items created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: todayItems } = await supabaseAdmin
      .from('brain_items')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    // Get items created this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { count: weekItems } = await supabaseAdmin
      .from('brain_items')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString());

    // Get top tags
    const { data: allItems } = await supabaseAdmin
      .from('brain_items')
      .select('tags');

    const tagCounts: Record<string, number> = {};
    allItems?.forEach((item: { tags: string[] }) => {
      item.tags?.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    // Get top categories
    const { data: categoryData } = await supabaseAdmin
      .from('brain_items')
      .select('category')
      .not('category', 'is', null);

    const categoryCounts: Record<string, number> = {};
    categoryData?.forEach((item: { category: string }) => {
      if (item.category) {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      }
    });

    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    return NextResponse.json({
      overview: {
        totalItems: totalItems || 0,
        totalUsers,
        todayItems: todayItems || 0,
        weekItems: weekItems || 0,
      },
      byType: typeStats,
      topTags,
      topCategories,
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
