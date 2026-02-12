import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';

export interface LicenseInfo {
  key: string;
  email: string;
  activatedAt: Date;
  expiresAt: Date | null; // null = lifetime license
  isValid: boolean;
  deviceId: string;
}

export type LicenseStatus = 'active' | 'expired' | 'invalid' | 'none';

export class LicenseManager extends EventEmitter {
  private licenseFilePath: string;
  private licenseInfo: LicenseInfo | null = null;
  private deviceId: string;

  constructor() {
    super();
    const userDataPath = app.getPath('userData');
    this.licenseFilePath = path.join(userDataPath, 'license.json');
    this.deviceId = this.generateDeviceId();

    // Load existing license if available
    this.loadLicense();

    console.log('[LICENSE] Initialized. Device ID:', this.deviceId);
  }

  /**
   * Generate unique device ID based on machine info
   */
  private generateDeviceId(): string {
    const os = require('os');
    const machineId = `${os.hostname()}-${os.platform()}-${os.arch()}`;
    return crypto.createHash('sha256').update(machineId).digest('hex');
  }

  /**
   * Load license from file
   */
  private loadLicense(): void {
    try {
      if (fs.existsSync(this.licenseFilePath)) {
        const data = fs.readFileSync(this.licenseFilePath, 'utf-8');
        const parsed = JSON.parse(data);

        // Convert date strings to Date objects
        this.licenseInfo = {
          ...parsed,
          activatedAt: new Date(parsed.activatedAt),
          expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : null,
        };

        console.log('[LICENSE] Loaded existing license');
      }
    } catch (error) {
      console.error('[LICENSE] Failed to load license:', error);
      this.licenseInfo = null;
    }
  }

  /**
   * Save license to file
   */
  private saveLicense(): void {
    try {
      if (this.licenseInfo) {
        fs.writeFileSync(
          this.licenseFilePath,
          JSON.stringify(this.licenseInfo, null, 2),
        );
        console.log('[LICENSE] License saved');
      }
    } catch (error) {
      console.error('[LICENSE] Failed to save license:', error);
    }
  }

  /**
   * Validate license key format and signature
   */
  private validateLicenseKey(key: string): boolean {
    // Simple validation: key format should be XXXXX-XXXXX-XXXXX-XXXXX
    const keyPattern = /^[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/;
    return keyPattern.test(key);
  }

  /**
   * Activate license with key and email
   * In production, this would call a license server API
   */
  async activateLicense(
    key: string,
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    console.log('[LICENSE] Attempting to activate license:', key);

    // Validate key format
    if (!this.validateLicenseKey(key)) {
      return {
        success: false,
        message:
          'Invalid license key format. Expected: XXXXX-XXXXX-XXXXX-XXXXX',
      };
    }

    // In production, you would:
    // 1. Call license server API to validate key
    // 2. Check if key is already activated on another device
    // 3. Get expiry date from server
    // For now, we'll simulate activation

    // Demo: Accept any valid format key
    // In production, verify with server
    const isLifetime = key.startsWith('LIFE-');
    const expiresAt = isLifetime
      ? null
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now

    this.licenseInfo = {
      key,
      email,
      activatedAt: new Date(),
      expiresAt,
      isValid: true,
      deviceId: this.deviceId,
    };

    this.saveLicense();
    this.emit('license-activated', this.licenseInfo);

    console.log('[LICENSE] License activated successfully');
    return {
      success: true,
      message: isLifetime
        ? 'Lifetime license activated successfully!'
        : `License activated successfully! Expires on ${expiresAt?.toLocaleDateString()}`,
    };
  }

  /**
   * Deactivate current license
   */
  async deactivateLicense(): Promise<void> {
    console.log('[LICENSE] Deactivating license');

    // In production, call license server API to deactivate

    if (this.licenseInfo) {
      this.emit('license-deactivated', this.licenseInfo);
    }

    this.licenseInfo = null;

    // Delete license file
    if (fs.existsSync(this.licenseFilePath)) {
      fs.unlinkSync(this.licenseFilePath);
    }

    console.log('[LICENSE] License deactivated');
  }

  /**
   * Check if license is valid and not expired
   */
  isLicenseValid(): boolean {
    if (!this.licenseInfo) {
      return false;
    }

    // Check if expired
    if (this.licenseInfo.expiresAt) {
      const now = new Date();
      if (now > this.licenseInfo.expiresAt) {
        console.log('[LICENSE] License expired');
        return false;
      }
    }

    // Check device ID match
    if (this.licenseInfo.deviceId !== this.deviceId) {
      console.log('[LICENSE] Device ID mismatch');
      return false;
    }

    return this.licenseInfo.isValid;
  }

  /**
   * Get license status
   */
  getLicenseStatus(): LicenseStatus {
    if (!this.licenseInfo) {
      return 'none';
    }

    if (!this.licenseInfo.isValid) {
      return 'invalid';
    }

    if (this.licenseInfo.expiresAt) {
      const now = new Date();
      if (now > this.licenseInfo.expiresAt) {
        return 'expired';
      }
    }

    return 'active';
  }

  /**
   * Get license info
   */
  getLicenseInfo(): LicenseInfo | null {
    return this.licenseInfo;
  }

  /**
   * Get days until expiry (null if lifetime)
   */
  getDaysUntilExpiry(): number | null {
    if (!this.licenseInfo || !this.licenseInfo.expiresAt) {
      return null; // Lifetime license
    }

    const now = new Date();
    const diff = this.licenseInfo.expiresAt.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return days > 0 ? days : 0;
  }

  /**
   * Check if license is expiring soon (within 30 days)
   */
  isExpiringSoon(): boolean {
    const days = this.getDaysUntilExpiry();
    return days !== null && days <= 30 && days > 0;
  }

  /**
   * Get device ID
   */
  getDeviceId(): string {
    return this.deviceId;
  }
}
