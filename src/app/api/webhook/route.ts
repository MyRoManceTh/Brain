/**
 * LINE Webhook Handler
 * รับ events จาก LINE และบันทึกลง Second Brain
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { brainDB } from '@/lib/db';
import { LineWebhookBody, LineWebhookEvent, ParsedContent } from '@/lib/brain/types';
import { parseMessage, detectCategory } from '@/lib/brain/parser';
import { processLineImage } from '@/lib/brain/image-handler';
import { fetchLinkPreview, isValidUrl } from '@/lib/brain/link-preview';
import { summarize, isAIAvailable } from '@/lib/ai';

const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET!;
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN!;
const LINE_REPLY_URL = 'https://api.line.me/v2/bot/message/reply';

/**
 * Validate LINE Webhook Signature
 */
function validateSignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac('SHA256', LINE_CHANNEL_SECRET)
    .update(body)
    .digest('base64');

  return hash === signature;
}

/**
 * Reply to LINE
 */
async function replyMessage(replyToken: string, text: string): Promise<void> {
  try {
    await fetch(LINE_REPLY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        replyToken,
        messages: [{ type: 'text', text }],
      }),
    });
  } catch (error) {
    console.error('Failed to reply:', error);
  }
}

/**
 * Process single event
 */
async function processEvent(event: LineWebhookEvent): Promise<void> {
  // Only process message events
  if (event.type !== 'message' || !event.message) {
    return;
  }

  const userId = event.source.userId;
  if (!userId) {
    console.warn('No userId in event');
    return;
  }

  // Parse message
  const parsed = parseMessage(event.message);
  if (!parsed) {
    // ไม่รองรับประเภทนี้
    if (event.replyToken) {
      await replyMessage(event.replyToken, 'ขออภัย รองรับเฉพาะข้อความและรูปภาพ');
    }
    return;
  }

  try {
    let imageUrl: string | undefined;
    let linkPreview: { title: string; description: string; image?: string; siteName?: string } | undefined;

    // Process based on type
    if (parsed.type === 'image' && parsed.messageId) {
      // Upload image to Supabase
      const imageResult = await processLineImage(
        userId,
        parsed.messageId,
        LINE_CHANNEL_ACCESS_TOKEN
      );
      imageUrl = imageResult.imageUrl;
    } else if (parsed.type === 'link' && parsed.linkUrl && isValidUrl(parsed.linkUrl)) {
      // Fetch link preview
      linkPreview = await fetchLinkPreview(parsed.linkUrl);
    }

    // Detect category
    const category = detectCategory(parsed.content, parsed.tags);

    // Create brain item
    const item = await brainDB.createItem({
      user_id: userId,
      type: parsed.type,
      content: parsed.content,
      title: parsed.title,
      tags: parsed.tags,
      category,
      link_url: parsed.linkUrl,
      link_preview: linkPreview,
      image_url: imageUrl,
    });

    // AI Summary (async, don't wait)
    if (isAIAvailable()) {
      processSummary(item.id, userId, parsed, linkPreview).catch(console.error);
    }

    // Reply confirmation
    if (event.replyToken) {
      const typeEmoji = {
        text: '📝',
        image: '🖼️',
        link: '🔗',
      };
      const emoji = typeEmoji[parsed.type] || '✅';
      await replyMessage(event.replyToken, `${emoji} บันทึกแล้ว!`);
    }
  } catch (error) {
    console.error('Error processing event:', error);
    if (event.replyToken) {
      await replyMessage(event.replyToken, '❌ เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
  }
}

/**
 * Process AI Summary (background)
 */
async function processSummary(
  itemId: string,
  userId: string,
  parsed: ParsedContent,
  linkPreview?: { title: string; description: string }
): Promise<void> {
  try {
    const result = await summarize({
      content: parsed.content,
      type: parsed.type,
      title: parsed.title,
      linkPreview,
    });

    // Update item with AI summary
    if (result.summary || result.suggestedTags.length > 0 || result.suggestedCategory) {
      await brainDB.updateItem(itemId, userId, {
        ai_summary: result.summary || undefined,
        tags: [...new Set([...parsed.tags, ...result.suggestedTags])],
        category: result.suggestedCategory || undefined,
      });
    }
  } catch (error) {
    console.error('Error processing AI summary:', error);
  }
}

/**
 * POST /api/webhook
 * Receive LINE webhook events
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature validation
    const rawBody = await request.text();
    const signature = request.headers.get('x-line-signature');

    // Validate signature
    if (!signature || !validateSignature(rawBody, signature)) {
      console.warn('Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse body
    const body: LineWebhookBody = JSON.parse(rawBody);

    // Process events (don't wait for completion)
    Promise.all(body.events.map(processEvent)).catch(console.error);

    // Return immediately (LINE requires fast response)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * GET /api/webhook
 * For verification
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Second Brain Webhook',
  });
}
