/**
 * LINE Mini App - LIFF Types
 */

export interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export interface LiffContext {
  type: 'utou' | 'group' | 'room' | 'external' | 'none';
  userId?: string;
  groupId?: string;
  roomId?: string;
  utouId?: string;
}

export interface LiffDecodedIdToken {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  name?: string;
  picture?: string;
  email?: string;
}

export interface LiffMessage {
  type: 'text' | 'image' | 'video' | 'audio' | 'location' | 'template' | 'flex';
  text?: string;
  originalContentUrl?: string;
  previewImageUrl?: string;
  title?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  altText?: string;
  contents?: Record<string, unknown>;
  template?: Record<string, unknown>;
}

export interface TextMessage {
  type: 'text';
  text: string;
}

export interface ImageMessage {
  type: 'image';
  originalContentUrl: string;
  previewImageUrl: string;
}

export interface FlexMessage {
  type: 'flex';
  altText: string;
  contents: FlexContainer;
}

export interface FlexContainer {
  type: 'bubble' | 'carousel';
  body?: FlexBox;
  header?: FlexBox;
  footer?: FlexBox;
  contents?: FlexBubble[];
}

export interface FlexBubble {
  type: 'bubble';
  body?: FlexBox;
  header?: FlexBox;
  footer?: FlexBox;
}

export interface FlexBox {
  type: 'box';
  layout: 'horizontal' | 'vertical' | 'baseline';
  contents: FlexComponent[];
  spacing?: string;
  margin?: string;
}

export interface FlexComponent {
  type: 'text' | 'button' | 'image' | 'box' | 'separator' | 'spacer';
  text?: string;
  size?: string;
  color?: string;
  weight?: string;
  action?: FlexAction;
}

export interface FlexAction {
  type: 'uri' | 'message' | 'postback';
  label?: string;
  uri?: string;
  text?: string;
  data?: string;
}

export interface ShareTargetPickerResult {
  status: 'success' | 'failed';
}

export interface ScanCodeResult {
  value: string;
}

export type LiffOS = 'ios' | 'android' | 'web';

export interface LiffError {
  code: string;
  message?: string;
}

export interface LiffInitConfig {
  liffId: string;
  withLoginOnExternalBrowser?: boolean;
}

export interface OpenWindowParams {
  url: string;
  external?: boolean;
}

export interface PermissionState {
  state: 'granted' | 'prompt' | 'unavailable';
}
