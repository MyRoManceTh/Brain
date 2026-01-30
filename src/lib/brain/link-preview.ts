/**
 * Link Preview Fetcher
 * ดึง Open Graph metadata จาก URL
 */

import { OpenGraphData } from './types';
import { LinkPreview } from '../db/types';

// Timeout for fetch
const FETCH_TIMEOUT = 10000; // 10 seconds

// User Agent
const USER_AGENT = 'Mozilla/5.0 (compatible; SecondBrainBot/1.0)';

/**
 * Fetch URL with timeout
 */
async function fetchWithTimeout(url: string, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Extract meta tag content from HTML
 */
function extractMetaContent(html: string, property: string): string | undefined {
  // Try og: prefix first
  const ogRegex = new RegExp(
    `<meta[^>]*property=["']og:${property}["'][^>]*content=["']([^"']+)["']`,
    'i'
  );
  const ogMatch = html.match(ogRegex);
  if (ogMatch) return ogMatch[1];

  // Try reversed order (content before property)
  const ogRegexReversed = new RegExp(
    `<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:${property}["']`,
    'i'
  );
  const ogMatchReversed = html.match(ogRegexReversed);
  if (ogMatchReversed) return ogMatchReversed[1];

  // Try name attribute
  const nameRegex = new RegExp(
    `<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`,
    'i'
  );
  const nameMatch = html.match(nameRegex);
  if (nameMatch) return nameMatch[1];

  return undefined;
}

/**
 * Extract title from HTML
 */
function extractTitle(html: string): string | undefined {
  // Try og:title first
  const ogTitle = extractMetaContent(html, 'title');
  if (ogTitle) return ogTitle;

  // Try <title> tag
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) return titleMatch[1].trim();

  return undefined;
}

/**
 * Decode HTML entities
 */
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
  };

  return text.replace(/&[^;]+;/g, (entity) => entities[entity] || entity);
}

/**
 * Fetch Open Graph data from URL
 */
export async function fetchOpenGraph(url: string): Promise<OpenGraphData | null> {
  try {
    const response = await fetchWithTimeout(url, FETCH_TIMEOUT);

    if (!response.ok) {
      console.warn(`Failed to fetch ${url}: ${response.status}`);
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      // Not HTML, return basic info
      return {
        url,
        type: contentType.split('/')[0],
      };
    }

    const html = await response.text();

    // Extract Open Graph data
    const ogData: OpenGraphData = {
      url,
      title: extractTitle(html),
      description: extractMetaContent(html, 'description'),
      image: extractMetaContent(html, 'image'),
      siteName: extractMetaContent(html, 'site_name'),
      type: extractMetaContent(html, 'type'),
    };

    // Decode HTML entities
    if (ogData.title) {
      ogData.title = decodeHtmlEntities(ogData.title);
    }
    if (ogData.description) {
      ogData.description = decodeHtmlEntities(ogData.description);
    }

    // Make image URL absolute
    if (ogData.image && !ogData.image.startsWith('http')) {
      const baseUrl = new URL(url);
      ogData.image = new URL(ogData.image, baseUrl.origin).href;
    }

    return ogData;
  } catch (error) {
    console.error(`Error fetching Open Graph for ${url}:`, error);
    return null;
  }
}

/**
 * Convert OpenGraphData to LinkPreview
 */
export function toPreview(ogData: OpenGraphData | null, url: string): LinkPreview {
  if (!ogData) {
    // Return basic preview with URL as title
    const hostname = new URL(url).hostname;
    return {
      title: hostname,
      description: url,
    };
  }

  return {
    title: ogData.title || new URL(url).hostname,
    description: ogData.description || '',
    image: ogData.image,
    siteName: ogData.siteName,
  };
}

/**
 * Fetch link preview (main function)
 */
export async function fetchLinkPreview(url: string): Promise<LinkPreview> {
  const ogData = await fetchOpenGraph(url);
  return toPreview(ogData, url);
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}
