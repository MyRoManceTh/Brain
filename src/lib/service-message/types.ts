/**
 * LINE Mini App - Service Message Types
 */

export interface ServiceMessageConfig {
  channelId: string;
  channelSecret: string;
}

export interface ChannelAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface NotificationTokenRequest {
  liffAccessToken: string;
}

export interface NotificationTokenResponse {
  notificationToken: string;
  expiresIn: number;
  sessionId: string;
  remainingCount: number;
}

export interface ServiceMessageRequest {
  notificationToken: string;
  templateName: string;
  params: ServiceMessageParams;
}

export interface ServiceMessageParams {
  [key: string]: string | number | ServiceMessageDetail[];
}

export interface ServiceMessageDetail {
  key: string;
  value: string;
}

export interface ServiceMessageResponse {
  notificationToken: string;
  expiresIn: number;
  remainingCount: number;
}

// Pre-defined template types
export type ServiceMessageTemplateCategory =
  | 'reservation'
  | 'queue'
  | 'delivery'
  | 'order'
  | 'payment'
  | 'notification';

export interface ReservationConfirmParams {
  storeName: string;
  reservationDate: string;
  reservationTime: string;
  numberOfPeople?: number;
  courseName?: string;
  reservationNumber?: string;
  details?: ServiceMessageDetail[];
}

export interface QueueNotificationParams {
  storeName: string;
  queueNumber: string;
  estimatedWaitTime?: string;
  currentNumber?: string;
  details?: ServiceMessageDetail[];
}

export interface DeliveryNotificationParams {
  storeName: string;
  orderNumber: string;
  deliveryStatus: string;
  estimatedDeliveryTime?: string;
  trackingUrl?: string;
  details?: ServiceMessageDetail[];
}

export interface OrderConfirmParams {
  storeName: string;
  orderNumber: string;
  orderDate: string;
  totalAmount: string;
  items?: ServiceMessageDetail[];
  details?: ServiceMessageDetail[];
}

export interface PaymentConfirmParams {
  storeName: string;
  paymentDate: string;
  amount: string;
  paymentMethod?: string;
  transactionId?: string;
  details?: ServiceMessageDetail[];
}
