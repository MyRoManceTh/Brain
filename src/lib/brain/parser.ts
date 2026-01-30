/**
 * Message Parser
 * ตรวจจับและ parse ข้อความจาก LINE เป็น Brain Content
 */

import { LineMessage, ParsedContent, ParsedTextContent, ParsedLinkContent, ParsedImageContent } from './types';

// URL Regex Pattern
const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi;

// Hashtag Regex Pattern
const HASHTAG_REGEX = /#[\wก-๙]+/g;

/**
 * ตรวจสอบว่าข้อความเป็น URL หรือไม่
 */
export function isUrl(text: string): boolean {
  const trimmed = text.trim();
  return URL_REGEX.test(trimmed);
}

/**
 * ดึง URLs ทั้งหมดจากข้อความ
 */
export function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX);
  return matches || [];
}

/**
 * ดึง Hashtags ทั้งหมดจากข้อความ
 */
export function extractHashtags(text: string): string[] {
  const matches = text.match(HASHTAG_REGEX);
  if (!matches) return [];

  return matches.map(tag => tag.slice(1)); // ตัด # ออก
}

/**
 * สร้าง Title จาก Content
 */
export function generateTitle(content: string, maxLength: number = 50): string {
  // ลบ hashtags และ URLs
  let cleaned = content
    .replace(HASHTAG_REGEX, '')
    .replace(URL_REGEX, '')
    .trim();

  if (!cleaned) {
    // ถ้าไม่มีข้อความเหลือ ใช้ส่วนแรกของ content
    cleaned = content;
  }

  // ตัดให้สั้นลง
  if (cleaned.length > maxLength) {
    return cleaned.slice(0, maxLength - 3) + '...';
  }

  return cleaned;
}

/**
 * Parse LINE Text Message
 */
export function parseTextMessage(text: string): ParsedTextContent | ParsedLinkContent {
  const trimmed = text.trim();
  const urls = extractUrls(trimmed);
  const tags = extractHashtags(trimmed);

  // ถ้ามี URL และข้อความส่วนใหญ่เป็น URL
  if (urls.length > 0 && urls[0].length > trimmed.length * 0.5) {
    return {
      type: 'link',
      content: trimmed,
      linkUrl: urls[0],
      tags,
      title: generateTitle(trimmed),
    };
  }

  // Text ธรรมดา
  return {
    type: 'text',
    content: trimmed,
    tags,
    title: generateTitle(trimmed),
  };
}

/**
 * Parse LINE Image Message
 */
export function parseImageMessage(message: LineMessage): ParsedImageContent {
  return {
    type: 'image',
    content: `Image: ${message.id}`,
    messageId: message.id,
    tags: [],
    title: 'รูปภาพ',
  };
}

/**
 * Parse LINE Message (main function)
 */
export function parseMessage(message: LineMessage): ParsedContent | null {
  switch (message.type) {
    case 'text':
      if (!message.text) return null;
      return parseTextMessage(message.text);

    case 'image':
      return parseImageMessage(message);

    // TODO: เพิ่ม support สำหรับ file, video ในอนาคต
    default:
      return null;
  }
}

/**
 * Detect Content Category (basic)
 */
export function detectCategory(content: string, tags: string[]): string | undefined {
  const lowerContent = content.toLowerCase();
  const lowerTags = tags.map(t => t.toLowerCase());

  // Check common categories
  const categories: Record<string, string[]> = {
    'work': ['งาน', 'work', 'project', 'โปรเจค', 'meeting', 'ประชุม'],
    'learning': ['เรียน', 'learn', 'study', 'อ่าน', 'read', 'book', 'หนังสือ', 'course'],
    'idea': ['idea', 'ไอเดีย', 'คิด', 'think', 'concept'],
    'todo': ['todo', 'ทำ', 'task', 'รายการ'],
    'quote': ['quote', 'คำคม', 'saying'],
    'recipe': ['recipe', 'สูตร', 'อาหาร', 'food', 'cook'],
    'travel': ['travel', 'เที่ยว', 'trip', 'ไป'],
    'finance': ['finance', 'เงิน', 'money', 'invest', 'ลงทุน'],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    for (const keyword of keywords) {
      if (lowerContent.includes(keyword) || lowerTags.includes(keyword)) {
        return category;
      }
    }
  }

  return undefined;
}

/**
 * Clean and normalize content
 */
export function normalizeContent(content: string): string {
  return content
    .replace(/\s+/g, ' ')  // Multiple spaces to single
    .trim();
}
