/**
 * Brain Items API
 * GET /api/brain/items - ดึงรายการ items
 * POST /api/brain/items - สร้าง item ใหม่
 */

import { NextRequest, NextResponse } from 'next/server';
import { brainDB } from '@/lib/db';
import { ContentType } from '@/lib/db/types';
import { parseTextMessage, detectCategory } from '@/lib/brain/parser';
import { fetchLinkPreview, isValidUrl } from '@/lib/brain/link-preview';
import { summarize, isAIAvailable } from '@/lib/ai';

/**
 * GET /api/brain/items
 * Query params: userId, type, category, tags, search, limit, offset
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const type = searchParams.get('type') as ContentType | null;
    const category = searchParams.get('category');
    const tagsParam = searchParams.get('tags');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const tags = tagsParam ? tagsParam.split(',') : undefined;

    const result = await brainDB.getItems({
      user_id: userId,
      type: type || undefined,
      category: category || undefined,
      tags,
      search: search || undefined,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error getting items:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/brain/items
 * Body: { userId, content, type?, title?, tags?, category? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, content, title, tags: customTags, category: customCategory } = body;

    if (!userId || !content) {
      return NextResponse.json(
        { error: 'userId and content are required' },
        { status: 400 }
      );
    }

    // Parse content to determine type
    const parsed = parseTextMessage(content);
    const type = parsed.type;
    const tags = [...new Set([...parsed.tags, ...(customTags || [])])];
    const category = customCategory || detectCategory(content, tags);

    let linkPreview;
    if (type === 'link' && parsed.linkUrl && isValidUrl(parsed.linkUrl)) {
      linkPreview = await fetchLinkPreview(parsed.linkUrl);
    }

    // Create item
    const item = await brainDB.createItem({
      user_id: userId,
      type,
      content,
      title: title || parsed.title,
      tags,
      category,
      link_url: parsed.linkUrl,
      link_preview: linkPreview,
    });

    // AI Summary (async)
    if (isAIAvailable()) {
      summarize({
        content,
        type,
        title: item.title,
        linkPreview,
      })
        .then(async (result) => {
          if (result.summary || result.suggestedTags.length > 0) {
            await brainDB.updateItem(item.id, userId, {
              ai_summary: result.summary || undefined,
              tags: [...new Set([...item.tags, ...result.suggestedTags])],
              category: result.suggestedCategory || item.category,
            });
          }
        })
        .catch(console.error);
    }

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
