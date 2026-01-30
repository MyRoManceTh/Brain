/**
 * Image Handler
 * ดาวน์โหลดรูปจาก LINE และ upload ไป Supabase Storage
 */

import { supabaseAdmin } from '../db/supabase';
import { ImageUploadResult } from './types';

const LINE_CONTENT_URL = 'https://api-data.line.me/v2/bot/message';
const BUCKET_NAME = 'brain-images';

/**
 * ดาวน์โหลดรูปจาก LINE API
 */
export async function downloadLineImage(
  messageId: string,
  channelAccessToken: string
): Promise<Buffer> {
  const url = `${LINE_CONTENT_URL}/${messageId}/content`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${channelAccessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * ดึง Content-Type จาก LINE API
 */
export async function getImageContentType(
  messageId: string,
  channelAccessToken: string
): Promise<string> {
  const url = `${LINE_CONTENT_URL}/${messageId}/content`;

  const response = await fetch(url, {
    method: 'HEAD',
    headers: {
      Authorization: `Bearer ${channelAccessToken}`,
    },
  });

  return response.headers.get('content-type') || 'image/jpeg';
}

/**
 * สร้างชื่อไฟล์จาก messageId และ content-type
 */
function generateFileName(messageId: string, contentType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
  };

  const ext = extensions[contentType] || 'jpg';
  const timestamp = Date.now();

  return `${messageId}-${timestamp}.${ext}`;
}

/**
 * Upload รูปไป Supabase Storage
 */
export async function uploadToSupabase(
  userId: string,
  messageId: string,
  imageBuffer: Buffer,
  contentType: string
): Promise<ImageUploadResult> {
  const fileName = generateFileName(messageId, contentType);
  const filePath = `${userId}/${fileName}`;

  // Upload to Supabase Storage
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(filePath, imageBuffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return {
    imageUrl: urlData.publicUrl,
    size: imageBuffer.length,
  };
}

/**
 * Process และ upload รูปจาก LINE
 */
export async function processLineImage(
  userId: string,
  messageId: string,
  channelAccessToken: string
): Promise<ImageUploadResult> {
  // 1. ดึง content type
  const contentType = await getImageContentType(messageId, channelAccessToken);

  // 2. ดาวน์โหลดรูป
  const imageBuffer = await downloadLineImage(messageId, channelAccessToken);

  // 3. Upload ไป Supabase
  const result = await uploadToSupabase(userId, messageId, imageBuffer, contentType);

  return result;
}

/**
 * ลบรูปจาก Supabase Storage
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  // Extract path from URL
  const url = new URL(imageUrl);
  const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/brain-images\/(.+)/);

  if (!pathMatch) {
    throw new Error('Invalid image URL');
  }

  const filePath = pathMatch[1];

  const { error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}
