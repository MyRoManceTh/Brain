/**
 * AI Module Types
 */

import { ContentType } from '../db/types';

export interface SummaryRequest {
  content: string;
  type: ContentType;
  title?: string;
  linkPreview?: {
    title: string;
    description: string;
  };
}

export interface SummaryResponse {
  summary: string;
  suggestedTags: string[];
  suggestedCategory?: string;
}

export interface TaggingRequest {
  content: string;
  type: ContentType;
  existingTags?: string[];
}

export interface TaggingResponse {
  tags: string[];
  category?: string;
}

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<{
    type: 'text';
    text: string;
  }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}
