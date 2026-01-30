/**
 * LINE Mini App - LIFF Client Wrapper
 * A comprehensive wrapper for LIFF SDK
 */

import liff from '@line/liff';
import type {
  LiffProfile,
  LiffContext,
  LiffDecodedIdToken,
  LiffMessage,
  TextMessage,
  FlexMessage,
  ShareTargetPickerResult,
  ScanCodeResult,
  LiffOS,
  LiffInitConfig,
  OpenWindowParams,
  PermissionState,
} from './types';

class LiffClient {
  private initialized = false;
  private liffId: string | null = null;

  /**
   * Initialize LIFF SDK
   * Must be called before using any other LIFF methods
   */
  async init(config: LiffInitConfig): Promise<void> {
    if (this.initialized) {
      console.warn('LIFF already initialized');
      return;
    }

    try {
      await liff.init({
        liffId: config.liffId,
        withLoginOnExternalBrowser: config.withLoginOnExternalBrowser,
      });
      this.initialized = true;
      this.liffId = config.liffId;
      console.log('LIFF initialized successfully');
    } catch (error) {
      console.error('LIFF initialization failed:', error);
      throw error;
    }
  }

  /**
   * Check if LIFF is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    this.ensureInitialized();
    return liff.isLoggedIn();
  }

  /**
   * Login user (for external browser)
   */
  login(redirectUri?: string): void {
    this.ensureInitialized();
    liff.login({ redirectUri });
  }

  /**
   * Logout user
   */
  logout(): void {
    this.ensureInitialized();
    liff.logout();
  }

  /**
   * Get user profile
   * Requires 'profile' scope
   */
  async getProfile(): Promise<LiffProfile> {
    this.ensureInitialized();
    this.ensureLoggedIn();
    return await liff.getProfile();
  }

  /**
   * Get decoded ID token
   * Requires 'openid' scope
   */
  getDecodedIdToken(): LiffDecodedIdToken | null {
    this.ensureInitialized();
    return liff.getDecodedIDToken();
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    this.ensureInitialized();
    return liff.getAccessToken();
  }

  /**
   * Get ID token
   */
  getIdToken(): string | null {
    this.ensureInitialized();
    return liff.getIDToken();
  }

  /**
   * Get LIFF context
   */
  getContext(): LiffContext | null {
    this.ensureInitialized();
    return liff.getContext();
  }

  /**
   * Check if running in LINE app
   */
  isInClient(): boolean {
    this.ensureInitialized();
    return liff.isInClient();
  }

  /**
   * Get operating system
   */
  getOS(): LiffOS {
    this.ensureInitialized();
    return liff.getOS() as LiffOS;
  }

  /**
   * Get LINE version
   */
  getLineVersion(): string | null {
    this.ensureInitialized();
    return liff.getLineVersion();
  }

  /**
   * Get LIFF language
   */
  getLanguage(): string {
    this.ensureInitialized();
    return liff.getLanguage();
  }

  /**
   * Send messages to current chat
   * Maximum 5 messages per call
   * Only works in LIFF browser
   */
  async sendMessages(messages: LiffMessage[]): Promise<void> {
    this.ensureInitialized();
    this.ensureLoggedIn();

    if (messages.length > 5) {
      throw new Error('Maximum 5 messages allowed per call');
    }

    if (!liff.isInClient()) {
      throw new Error('sendMessages only works in LINE app');
    }

    await liff.sendMessages(messages);
  }

  /**
   * Send a simple text message
   */
  async sendTextMessage(text: string): Promise<void> {
    const message: TextMessage = { type: 'text', text };
    await this.sendMessages([message]);
  }

  /**
   * Share message using target picker
   */
  async shareTargetPicker(
    messages: LiffMessage[],
    isMultiple = true
  ): Promise<ShareTargetPickerResult | null> {
    this.ensureInitialized();
    this.ensureLoggedIn();

    if (!liff.isApiAvailable('shareTargetPicker')) {
      throw new Error('shareTargetPicker is not available');
    }

    const result = await liff.shareTargetPicker(messages, { isMultiple });
    return result as ShareTargetPickerResult | null;
  }

  /**
   * Scan QR code
   */
  async scanCode(): Promise<ScanCodeResult> {
    this.ensureInitialized();
    return await liff.scanCodeV2();
  }

  /**
   * Open URL in browser
   */
  openWindow(params: OpenWindowParams): void {
    this.ensureInitialized();
    liff.openWindow(params);
  }

  /**
   * Close LIFF window
   */
  closeWindow(): void {
    this.ensureInitialized();
    liff.closeWindow();
  }

  /**
   * Create permanent link
   */
  async createPermanentLink(additionalPath?: string): Promise<string> {
    this.ensureInitialized();

    if (additionalPath) {
      const currentUrl = new URL(window.location.href);
      currentUrl.pathname += additionalPath;
      return await liff.permanentLink.createUrlBy(currentUrl.href);
    }

    return await liff.permanentLink.createUrl();
  }

  /**
   * Check if API is available
   */
  isApiAvailable(apiName: string): boolean {
    this.ensureInitialized();
    return liff.isApiAvailable(apiName);
  }

  /**
   * Query permission state
   */
  async queryPermission(permission: string): Promise<PermissionState> {
    this.ensureInitialized();
    return await liff.permission.query(permission);
  }

  /**
   * Get all granted permissions
   */
  async getGrantedPermissions(): Promise<string[]> {
    this.ensureInitialized();
    const permissions = await liff.permission.getGrantedAll();
    return permissions;
  }

  /**
   * Check if add to home screen is available
   */
  isAddToHomeScreenAvailable(): boolean {
    this.ensureInitialized();
    return liff.isApiAvailable('createShortcutOnHomeScreen');
  }

  /**
   * Add to home screen (verified Mini Apps only)
   */
  async addToHomeScreen(): Promise<void> {
    this.ensureInitialized();

    if (!this.isAddToHomeScreenAvailable()) {
      throw new Error('Add to home screen is not available');
    }

    await liff.createShortcutOnHomeScreen();
  }

  /**
   * Get friendship status with LINE Official Account
   */
  async getFriendship(): Promise<{ friendFlag: boolean }> {
    this.ensureInitialized();
    return await liff.getFriendship();
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('LIFF not initialized. Call init() first.');
    }
  }

  private ensureLoggedIn(): void {
    if (!this.isLoggedIn()) {
      throw new Error('User not logged in');
    }
  }
}

// Export singleton instance
export const liffClient = new LiffClient();
export default liffClient;
