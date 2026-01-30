/**
 * LINE Mini App - Reservation API Route
 * Example: Send reservation confirmation via Service Message
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceMessageClient } from '@/lib/service-message';

const serviceMessageClient = createServiceMessageClient({
  channelId: process.env.LINE_CHANNEL_ID || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
});

interface ReservationRequest {
  liffAccessToken: string;
  storeName: string;
  reservationDate: string;
  reservationTime: string;
  numberOfPeople?: number;
  courseName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ReservationRequest;

    // Validate required fields
    if (
      !body.liffAccessToken ||
      !body.storeName ||
      !body.reservationDate ||
      !body.reservationTime
    ) {
      return NextResponse.json(
        {
          error:
            'liffAccessToken, storeName, reservationDate, and reservationTime are required',
        },
        { status: 400 }
      );
    }

    // Issue notification token
    const tokenResult = await serviceMessageClient.issueNotificationToken(
      body.liffAccessToken
    );

    // Send reservation confirmation
    const messageResult = await serviceMessageClient.sendReservationConfirmation(
      tokenResult.notificationToken,
      {
        storeName: body.storeName,
        reservationDate: body.reservationDate,
        reservationTime: body.reservationTime,
        numberOfPeople: body.numberOfPeople,
        courseName: body.courseName,
      }
    );

    return NextResponse.json({
      success: true,
      remainingCount: messageResult.remainingCount,
    });
  } catch (error) {
    console.error('Reservation error:', error);
    return NextResponse.json(
      { error: 'Failed to send reservation confirmation' },
      { status: 500 }
    );
  }
}
