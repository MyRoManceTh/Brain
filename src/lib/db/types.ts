/**
 * Database Types for Second Brain System
 */

export type ContentType = 'text' | 'image' | 'link';

export interface LinkPreview {
  title: string;
  description: string;
  image?: string;
  siteName?: string;
}

export interface BrainItem {
  id: string;
  user_id: string;
  type: ContentType;
  content: string;
  title?: string;
  tags: string[];
  category?: string;
  ai_summary?: string;
  link_url?: string;
  link_preview?: LinkPreview;
  image_url?: string;
  thumbnail_url?: string;
  ocr_text?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBrainItemInput {
  user_id: string;
  type: ContentType;
  content: string;
  title?: string;
  tags?: string[];
  category?: string;
  link_url?: string;
  link_preview?: LinkPreview;
  image_url?: string;
  thumbnail_url?: string;
}

export interface UpdateBrainItemInput {
  title?: string;
  tags?: string[];
  category?: string;
  ai_summary?: string;
  link_preview?: LinkPreview;
  ocr_text?: string;
}

export interface BrainItemsQuery {
  user_id: string;
  type?: ContentType;
  category?: string;
  tags?: string[];
  search?: string;
  limit?: number;
  offset?: number;
}

export interface BrainItemsResponse {
  items: BrainItem[];
  total: number;
  hasMore: boolean;
}
