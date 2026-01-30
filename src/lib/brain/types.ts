/**
 * Brain Module Types
 * Types for LINE Webhook parsing and content processing
 */

import { ContentType, LinkPreview } from '../db/types';

// LINE Webhook Event Types
export interface LineWebhookEvent {
  type: 'message' | 'follow' | 'unfollow' | 'postback';
  replyToken?: string;
  source: LineSource;
  timestamp: number;
  message?: LineMessage;
  postback?: LinePostback;
}

export interface LineSource {
  type: 'user' | 'group' | 'room';
  userId?: string;
  groupId?: string;
  roomId?: string;
}

export interface LineMessage {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'sticker';
  text?: string;
  contentProvider?: {
    type: 'line' | 'external';
    originalContentUrl?: string;
    previewImageUrl?: string;
  };
}

export interface LinePostback {
  data: string;
  params?: Record<string, string>;
}

export interface LineWebhookBody {
  destination: string;
  events: LineWebhookEvent[];
}

// Parsed Content Types
export interface ParsedContent {
  type: ContentType;
  content: string;
  title?: string;
  tags: string[];
  linkUrl?: string;
  messageId?: string;  // สำหรับดาวน์โหลดรูป
}

export interface ParsedTextContent extends ParsedContent {
  type: 'text';
}

export interface ParsedLinkContent extends ParsedContent {
  type: 'link';
  linkUrl: string;
}

export interface ParsedImageContent extends ParsedContent {
  type: 'image';
  messageId: string;
}

// Processing Result
export interface ProcessingResult {
  success: boolean;
  itemId?: string;
  error?: string;
}

// Link Preview Types
export interface OpenGraphData {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  url?: string;
  type?: string;
}

// Image Processing
export interface ImageUploadResult {
  imageUrl: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  size?: number;
}

// Reply Message
export interface ReplyMessage {
  type: 'text' | 'flex';
  text?: string;
  altText?: string;
  contents?: unknown;
}
