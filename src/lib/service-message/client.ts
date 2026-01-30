/**
 * LINE Mini App - Service Message API Client
 * Server-side only - Do not use in browser
 */

import axios, { AxiosInstance } from 'axios';
import type {
  ServiceMessageConfig,
  ChannelAccessTokenResponse,
  NotificationTokenResponse,
  ServiceMessageRequest,
  ServiceMessageResponse,
} from './types';

const LINE_API_BASE = 'https://api.line.me';
const OAUTH_TOKEN_URL = `${LINE_API_BASE}/oauth2/v2.1/token`;
const NOTIFIER_BASE = `${LINE_API_BASE}/message/v3/notifier`;

export class ServiceMessageClient {
  private channelId: string;
  private channelSecret: string;
  private httpClient: AxiosInstance;
  private channelAccessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(config: ServiceMessageConfig) {
    this.channelId = config.channelId;
    this.channelSecret = config.channelSecret;
    this.httpClient = axios.create({
      timeout: 30000,
    });
  }

  /**
   * Get channel access token (stateless)
   */
  async getChannelAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.channelAccessToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.channelAccessToken;
    }

    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.channelId,
      client_secret: this.channelSecret,
    });

    const response = await this.httpClient.post<ChannelAccessTokenResponse>(
      OAUTH_TOKEN_URL,
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    this.channelAccessToken = response.data.access_token;
    this.tokenExpiresAt = Date.now() + response.data.expires_in * 1000;

    return this.channelAccessToken;
  }

  /**
   * Issue notification token from LIFF access token
   */
  async issueNotificationToken(
    liffAccessToken: string
  ): Promise<NotificationTokenResponse> {
    const channelAccessToken = await this.getChannelAccessToken();

    const response = await this.httpClient.post<NotificationTokenResponse>(
      `${NOTIFIER_BASE}/token`,
      {
        liffAccessToken,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${channelAccessToken}`,
        },
      }
    );

    return response.data;
  }

  /**
   * Send service message
   */
  async sendServiceMessage(
    request: ServiceMessageRequest
  ): Promise<ServiceMessageResponse> {
    const channelAccessToken = await this.getChannelAccessToken();

    const response = await this.httpClient.post<ServiceMessageResponse>(
      `${NOTIFIER_BASE}/send?target=service`,
      {
        notificationToken: request.notificationToken,
        templateName: request.templateName,
        params: request.params,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${channelAccessToken}`,
        },
      }
    );

    return response.data;
  }

  /**
   * Send reservation confirmation message
   */
  async sendReservationConfirmation(
    notificationToken: string,
    params: {
      storeName: string;
      reservationDate: string;
      reservationTime: string;
      numberOfPeople?: number;
      courseName?: string;
      reservationNumber?: string;
    }
  ): Promise<ServiceMessageResponse> {
    return this.sendServiceMessage({
      notificationToken,
      templateName: 'reservation_confirmation',
      params: {
        store_name: params.storeName,
        reservation_date: params.reservationDate,
        reservation_time: params.reservationTime,
        ...(params.numberOfPeople && { number_of_people: params.numberOfPeople }),
        ...(params.courseName && { course_name: params.courseName }),
        ...(params.reservationNumber && { reservation_number: params.reservationNumber }),
      },
    });
  }

  /**
   * Send queue notification message
   */
  async sendQueueNotification(
    notificationToken: string,
    params: {
      storeName: string;
      queueNumber: string;
      estimatedWaitTime?: string;
      currentNumber?: string;
    }
  ): Promise<ServiceMessageResponse> {
    return this.sendServiceMessage({
      notificationToken,
      templateName: 'queue_notification',
      params: {
        store_name: params.storeName,
        queue_number: params.queueNumber,
        ...(params.estimatedWaitTime && { estimated_wait_time: params.estimatedWaitTime }),
        ...(params.currentNumber && { current_number: params.currentNumber }),
      },
    });
  }

  /**
   * Send delivery notification message
   */
  async sendDeliveryNotification(
    notificationToken: string,
    params: {
      storeName: string;
      orderNumber: string;
      deliveryStatus: string;
      estimatedDeliveryTime?: string;
    }
  ): Promise<ServiceMessageResponse> {
    return this.sendServiceMessage({
      notificationToken,
      templateName: 'delivery_notification',
      params: {
        store_name: params.storeName,
        order_number: params.orderNumber,
        delivery_status: params.deliveryStatus,
        ...(params.estimatedDeliveryTime && {
          estimated_delivery_time: params.estimatedDeliveryTime,
        }),
      },
    });
  }

  /**
   * Send order confirmation message
   */
  async sendOrderConfirmation(
    notificationToken: string,
    params: {
      storeName: string;
      orderNumber: string;
      orderDate: string;
      totalAmount: string;
    }
  ): Promise<ServiceMessageResponse> {
    return this.sendServiceMessage({
      notificationToken,
      templateName: 'order_confirmation',
      params: {
        store_name: params.storeName,
        order_number: params.orderNumber,
        order_date: params.orderDate,
        total_amount: params.totalAmount,
      },
    });
  }

  /**
   * Send payment confirmation message
   */
  async sendPaymentConfirmation(
    notificationToken: string,
    params: {
      storeName: string;
      paymentDate: string;
      amount: string;
      paymentMethod?: string;
      transactionId?: string;
    }
  ): Promise<ServiceMessageResponse> {
    return this.sendServiceMessage({
      notificationToken,
      templateName: 'payment_confirmation',
      params: {
        store_name: params.storeName,
        payment_date: params.paymentDate,
        amount: params.amount,
        ...(params.paymentMethod && { payment_method: params.paymentMethod }),
        ...(params.transactionId && { transaction_id: params.transactionId }),
      },
    });
  }
}

// Factory function
export function createServiceMessageClient(
  config: ServiceMessageConfig
): ServiceMessageClient {
  return new ServiceMessageClient(config);
}
