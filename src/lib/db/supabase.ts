import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BrainItem, CreateBrainItemInput, UpdateBrainItemInput, BrainItemsQuery, BrainItemsResponse } from './types';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Client สำหรับ client-side (ใช้ anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client สำหรับ server-side (ใช้ service key สำหรับ admin operations)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase;

/**
 * Brain Items Database Operations
 */
export class BrainDB {
  private client: SupabaseClient;

  constructor(client: SupabaseClient = supabaseAdmin) {
    this.client = client;
  }

  /**
   * สร้าง Brain Item ใหม่
   */
  async createItem(input: CreateBrainItemInput): Promise<BrainItem> {
    const { data, error } = await this.client
      .from('brain_items')
      .insert({
        ...input,
        tags: input.tags || [],
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create brain item: ${error.message}`);
    }

    return data as BrainItem;
  }

  /**
   * ดึง Brain Item ตาม ID
   */
  async getItem(id: string, userId: string): Promise<BrainItem | null> {
    const { data, error } = await this.client
      .from('brain_items')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to get brain item: ${error.message}`);
    }

    return data as BrainItem;
  }

  /**
   * ดึง Brain Items ตามเงื่อนไข
   */
  async getItems(query: BrainItemsQuery): Promise<BrainItemsResponse> {
    const { user_id, type, category, tags, search, limit = 20, offset = 0 } = query;

    let queryBuilder = this.client
      .from('brain_items')
      .select('*', { count: 'exact' })
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (type) {
      queryBuilder = queryBuilder.eq('type', type);
    }

    if (category) {
      queryBuilder = queryBuilder.eq('category', category);
    }

    if (tags && tags.length > 0) {
      queryBuilder = queryBuilder.overlaps('tags', tags);
    }

    if (search) {
      // Full-text search using generated column
      queryBuilder = queryBuilder.textSearch('search_vector', search, {
        type: 'websearch',
      });
    }

    const { data, error, count } = await queryBuilder
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to get brain items: ${error.message}`);
    }

    return {
      items: (data || []) as BrainItem[],
      total: count || 0,
      hasMore: (count || 0) > offset + limit,
    };
  }

  /**
   * อัปเดต Brain Item
   */
  async updateItem(id: string, userId: string, input: UpdateBrainItemInput): Promise<BrainItem> {
    const { data, error } = await this.client
      .from('brain_items')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update brain item: ${error.message}`);
    }

    return data as BrainItem;
  }

  /**
   * ลบ Brain Item
   */
  async deleteItem(id: string, userId: string): Promise<void> {
    const { error } = await this.client
      .from('brain_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete brain item: ${error.message}`);
    }
  }

  /**
   * ดึง Tags ทั้งหมดของ User
   */
  async getUserTags(userId: string): Promise<{ tag: string; count: number }[]> {
    const { data, error } = await this.client
      .from('brain_items')
      .select('tags')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to get user tags: ${error.message}`);
    }

    // นับ tags
    const tagCounts: Record<string, number> = {};
    (data || []).forEach((item: { tags: string[] }) => {
      (item.tags || []).forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * ดึง Categories ทั้งหมดของ User
   */
  async getUserCategories(userId: string): Promise<{ category: string; count: number }[]> {
    const { data, error } = await this.client
      .from('brain_items')
      .select('category')
      .eq('user_id', userId)
      .not('category', 'is', null);

    if (error) {
      throw new Error(`Failed to get user categories: ${error.message}`);
    }

    // นับ categories
    const categoryCounts: Record<string, number> = {};
    (data || []).forEach((item: { category: string }) => {
      if (item.category) {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      }
    });

    return Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }
}

// Default instance
export const brainDB = new BrainDB();
