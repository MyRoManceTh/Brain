/**
 * Claude AI Client
 * ใช้สำหรับสรุปเนื้อหาและแนะนำ tags
 */

import { SummaryRequest, SummaryResponse, TaggingRequest, TaggingResponse, ClaudeResponse } from './types';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-3-haiku-20240307'; // ใช้ Haiku เพื่อประหยัด cost

/**
 * Call Claude API
 */
async function callClaude(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 500,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${error}`);
  }

  const data: ClaudeResponse = await response.json();
  return data.content[0].text;
}

/**
 * สรุปเนื้อหา
 */
export async function summarize(request: SummaryRequest): Promise<SummaryResponse> {
  const systemPrompt = `คุณเป็น AI ช่วยจัดการข้อมูลส่วนตัว (Second Brain)
ภารกิจ: สรุปเนื้อหาให้กระชับ และแนะนำ tags และหมวดหมู่

ตอบเป็น JSON format:
{
  "summary": "สรุปสั้นๆ 1-2 ประโยค",
  "suggestedTags": ["tag1", "tag2"],
  "suggestedCategory": "หมวดหมู่"
}

หมวดหมู่ที่เป็นไปได้: work, learning, idea, todo, quote, recipe, travel, finance, health, other`;

  let userMessage = `ประเภท: ${request.type}\n`;

  if (request.title) {
    userMessage += `หัวข้อ: ${request.title}\n`;
  }

  if (request.linkPreview) {
    userMessage += `Link Title: ${request.linkPreview.title}\n`;
    userMessage += `Link Description: ${request.linkPreview.description}\n`;
  }

  userMessage += `\nเนื้อหา:\n${request.content}`;

  try {
    const responseText = await callClaude(systemPrompt, userMessage);

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Claude');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      summary: parsed.summary || '',
      suggestedTags: parsed.suggestedTags || [],
      suggestedCategory: parsed.suggestedCategory,
    };
  } catch (error) {
    console.error('Error summarizing content:', error);

    // Return fallback response
    return {
      summary: '',
      suggestedTags: [],
    };
  }
}

/**
 * แนะนำ Tags และ Category
 */
export async function suggestTags(request: TaggingRequest): Promise<TaggingResponse> {
  const systemPrompt = `คุณเป็น AI ช่วยจัด tags สำหรับข้อมูล
แนะนำ 2-5 tags ที่เหมาะสม และหมวดหมู่

ตอบเป็น JSON format:
{
  "tags": ["tag1", "tag2"],
  "category": "หมวดหมู่"
}

หมวดหมู่: work, learning, idea, todo, quote, recipe, travel, finance, health, other
Tags ควรเป็นคำสั้นๆ ภาษาไทยหรืออังกฤษ`;

  const userMessage = `ประเภท: ${request.type}\nเนื้อหา:\n${request.content}`;

  try {
    const responseText = await callClaude(systemPrompt, userMessage);

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      tags: parsed.tags || [],
      category: parsed.category,
    };
  } catch (error) {
    console.error('Error suggesting tags:', error);

    return {
      tags: [],
    };
  }
}

/**
 * ตรวจสอบว่า AI พร้อมใช้งานหรือไม่
 */
export function isAIAvailable(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}
