-- =====================================================
-- Second Brain Database Schema for Supabase
-- =====================================================

-- Brain Items Table
CREATE TABLE IF NOT EXISTS brain_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'image', 'link')),
  content TEXT NOT NULL,
  title TEXT,
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  ai_summary TEXT,
  link_url TEXT,
  link_preview JSONB,
  image_url TEXT,
  thumbnail_url TEXT,
  ocr_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_brain_items_user_id ON brain_items(user_id);
CREATE INDEX IF NOT EXISTS idx_brain_items_type ON brain_items(type);
CREATE INDEX IF NOT EXISTS idx_brain_items_category ON brain_items(category);
CREATE INDEX IF NOT EXISTS idx_brain_items_created_at ON brain_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_brain_items_tags ON brain_items USING gin(tags);

-- Full-text search vector (generated column)
ALTER TABLE brain_items ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple',
      coalesce(title, '') || ' ' ||
      coalesce(content, '') || ' ' ||
      coalesce(ai_summary, '') || ' ' ||
      coalesce(ocr_text, '') || ' ' ||
      array_to_string(tags, ' ')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_brain_items_search ON brain_items USING gin(search_vector);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_brain_items_updated_at ON brain_items;
CREATE TRIGGER update_brain_items_updated_at
  BEFORE UPDATE ON brain_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Storage Bucket for Images
-- =====================================================
-- Run this in Supabase Dashboard > Storage:
-- Create bucket: brain-images
-- Public: false
-- Allowed mime types: image/jpeg, image/png, image/gif, image/webp

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE brain_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own items
CREATE POLICY "Users can view own items" ON brain_items
  FOR SELECT USING (true);  -- Will filter by user_id in application

-- Policy: Users can insert their own items
CREATE POLICY "Users can insert own items" ON brain_items
  FOR INSERT WITH CHECK (true);

-- Policy: Users can update their own items
CREATE POLICY "Users can update own items" ON brain_items
  FOR UPDATE USING (true);

-- Policy: Users can delete their own items
CREATE POLICY "Users can delete own items" ON brain_items
  FOR DELETE USING (true);

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to search items with Thai language support
CREATE OR REPLACE FUNCTION search_brain_items(
  p_user_id TEXT,
  p_query TEXT,
  p_type TEXT DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user_id TEXT,
  type TEXT,
  content TEXT,
  title TEXT,
  tags TEXT[],
  category TEXT,
  ai_summary TEXT,
  created_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bi.id,
    bi.user_id,
    bi.type,
    bi.content,
    bi.title,
    bi.tags,
    bi.category,
    bi.ai_summary,
    bi.created_at,
    ts_rank(bi.search_vector, websearch_to_tsquery('simple', p_query)) as rank
  FROM brain_items bi
  WHERE bi.user_id = p_user_id
    AND (p_type IS NULL OR bi.type = p_type)
    AND (
      bi.search_vector @@ websearch_to_tsquery('simple', p_query)
      OR bi.content ILIKE '%' || p_query || '%'
      OR bi.title ILIKE '%' || p_query || '%'
    )
  ORDER BY rank DESC, bi.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
