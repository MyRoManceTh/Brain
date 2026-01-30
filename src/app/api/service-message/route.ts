/**
 * LINE Mini App - Service Message API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceMessageClient, ServiceMessageParams } from '@/lib/service-message';

const serviceMessageClient = createServiceMessageClient({
  channelId: process.env.LINE_CHANNEL_ID || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
});

interface IssueTokenRequest {
  liffAccessToken: string;
}

interface SendMessageRequest {
  notificationToken: string;
  templateName: string;
  params: ServiceMessageParams;
}

// POST /api/service-message/token - Issue notification token
export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (action === 'token') {
      const body = (await request.json()) as IssueTokenRequest;

      if (!body.liffAccessToken) {
        return NextResponse.json(
          { error: 'liffAccessToken is required' },
          { status: 400 }
        );
      }

      const result = await serviceMessageClient.issueNotificationToken(
        body.liffAccessToken
      );

      return NextResponse.json(result);
    }

    if (action === 'send') {
      const body = (await request.json()) as SendMessageRequest;

      if (!body.notificationToken || !body.templateName) {
        return NextResponse.json(
          { error: 'notificationToken and templateName are required' },
          { status: 400 }
        );
      }

      const result = await serviceMessageClient.sendServiceMessage({
        notificationToken: body.notificationToken,
        templateName: body.templateName,
        params: body.params,
      });

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Service message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
