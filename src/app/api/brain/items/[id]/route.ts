/**
 * Brain Item Detail API
 * GET /api/brain/items/[id] - ดึง item เฉพาะ
 * PUT /api/brain/items/[id] - แก้ไข item
 * DELETE /api/brain/items/[id] - ลบ item
 */

import { NextRequest, NextResponse } from 'next/server';
import { brainDB } from '@/lib/db';
import { deleteImage } from '@/lib/brain/image-handler';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/brain/items/[id]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const item = await brainDB.getItem(id, userId);

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error getting item:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * PUT /api/brain/items/[id]
 * Body: { userId, title?, tags?, category?, ai_summary? }
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, title, tags, category, ai_summary } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Check if item exists
    const existing = await brainDB.getItem(id, userId);
    if (!existing) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Update item
    const item = await brainDB.updateItem(id, userId, {
      title,
      tags,
      category,
      ai_summary,
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * DELETE /api/brain/items/[id]
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Check if item exists and get image URL
    const existing = await brainDB.getItem(id, userId);
    if (!existing) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Delete image from storage if exists
    if (existing.image_url) {
      try {
        await deleteImage(existing.image_url);
      } catch (error) {
        console.warn('Failed to delete image:', error);
      }
    }

    // Delete item
    await brainDB.deleteItem(id, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
