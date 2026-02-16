import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEALpjWprmpAIBt0WS15WNjY28PiRVr/+PNhNRJkMrVfGk=
-----END PUBLIC KEY-----`;

export interface LicenseInfo {
  key: string;
  activatedAt: Date;
  expiresAt: Date | null; // null = lifetime license
  isValid: boolean;
  deviceId: string;
}

export type LicenseStatus = 'active' | 'expired' | 'invalid' | 'none';

export interface LicenseManagerEvents {
  'license-activated': (info: LicenseInfo) => void;
  'license-deactivated': (info: LicenseInfo) => void;
}

export class LicenseManager extends EventEmitter {
  // -- Typed emit/on overrides --
  emit<K extends keyof LicenseManagerEvents>(
    event: K,
    ...args: Parameters<LicenseManagerEvents[K]>
  ): boolean {
    return super.emit(event, ...args);
  }

  on<K extends keyof LicenseManagerEvents>(
    event: K,
    listener: LicenseManagerEvents[K],
  ): this {
    return super.on(event, listener);
  }

  once<K extends keyof LicenseManagerEvents>(
    event: K,
    listener: LicenseManagerEvents[K],
  ): this {
    return super.once(event, listener);
  }

  private licenseFilePath: string;
  private licenseInfo: LicenseInfo | null = null;
  private deviceId: string;

  constructor() {
    super();
    const userDataPath = app.getPath('userData');
    this.licenseFilePath = path.join(userDataPath, 'license.json');
    this.revokedKeysPath = path.join(userDataPath, 'revoked_licenses.json');
    this.deviceId = this.generateDeviceId();

    // Load existing license if available
    this.loadRevokedKeys();
    this.loadLicense();

    console.log('[LICENSE] Initialized. Device ID:', this.deviceId);
  }

  /**
   * Generate unique device ID based on machine info
   */
  private generateDeviceId(): string {
    const os = require('os');
    const machineId = `${os.hostname()}-${os.platform()}-${os.arch()}-${os.cpus()[0]?.model}`;
    const hash = crypto.createHash('sha256').update(machineId).digest('hex');

    // Return format: XXXX-XXXX-XXXX (first 12 chars)
    return hash
      .substring(0, 12)
      .toUpperCase()
      .replace(/(.{4})/g, '$1-')
      .slice(0, 14);
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
    // Key format: BZFL-[MACHINE_ID]-[SIGNATURE]
    // Example: BZFL-7F3A-9B2C-4D1E-SIGNATURESTRING...
    const parts = key.split('-');
    if (parts.length < 5 || parts[0] !== 'BZFL') {
      return false;
    }

    // Extract Machine ID from key (indices 1, 2, 3)
    const keyMachineId = parts.slice(1, 4).join('-');

    // Check if Machine ID matches this device
    if (keyMachineId !== this.deviceId) {
      console.log(
        `[LICENSE] Key intended for ${keyMachineId}, but this is ${this.deviceId}`,
      );
      return false;
    }

    try {
      // Reconstruct the data that was signed: "BZFL-MACHINE_ID"
      const dataToVerify = `BZFL-${keyMachineId}`;

      // The rest of the key is the signature (hex)
      const signatureHex = parts.slice(4).join('');
      const signature = Buffer.from(signatureHex, 'hex');

      // Verify signature
      const isVerified = crypto.verify(
        null,
        Buffer.from(dataToVerify),
        PUBLIC_KEY,
        signature,
      );

      return isVerified;
    } catch (error) {
      console.error('[LICENSE] Verification error:', error);
      return false;
    }
  }

  /**
   * Activate license with key
   */
  async activateLicense(
    key: string,
  ): Promise<{ success: boolean; message: string }> {
    console.log('[LICENSE] Attempting to activate license:', key);

    // Check if key is in revoked list (local blacklist)
    if (this.isKeyRevoked(key)) {
      console.log('[LICENSE] Key is locally revoked');
      return {
        success: false,
        message:
          'This license has been deactivated on this machine and cannot be reused.',
      };
    }

    // Real cryptographic validation
    if (!this.validateLicenseKey(key)) {
      return {
        success: false,
        message: 'Invalid license key. Please check the key and try again.',
      };
    }

    const isLifetime = true;
    const expiresAt = null;

    this.licenseInfo = {
      key,
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
      message: 'License activated successfully!',
    };
  }

  /**
   * Deactivate current license and generate proof
   */
  async deactivateLicense(): Promise<{ success: boolean; proof?: string }> {
    console.log('[LICENSE] Deactivating license');

    if (!this.licenseInfo) {
      return { success: false };
    }

    const oldKey = this.licenseInfo.key;
    const machineId = this.deviceId;

    // Generate Deactivation Proof: Hash(Key + MachineID + "DEACT")
    // We use a simple hash to prove the user had the key and decided to deactivate it
    const proofString = `${oldKey}-${machineId}-DEACT`;
    const proofHash = crypto
      .createHash('sha256')
      .update(proofString)
      .digest('hex')
      .substring(0, 16)
      .toUpperCase();

    // Format: DEACT-[FIRST_8_CHARS_OF_KEY]-[PROOF_HASH]
    // This makes it easy to identify which key was deactivated
    const keyPrefix = oldKey.split('-')[1] || 'UNKNOWN';
    const finalProof = `DEACT-${keyPrefix}-${proofHash}`;

    // Add to local blacklist to prevent reuse on this machine
    this.addToRevokedList(oldKey);

    this.emit('license-deactivated', this.licenseInfo);
    this.licenseInfo = null;

    // Delete license file
    if (fs.existsSync(this.licenseFilePath)) {
      fs.unlinkSync(this.licenseFilePath);
    }

    console.log('[LICENSE] License deactivated. Proof:', finalProof);
    return { success: true, proof: finalProof };
  }

  private revokedKeysPath: string;
  private revokedKeys: string[] = [];

  private loadRevokedKeys(): void {
    try {
      if (fs.existsSync(this.revokedKeysPath)) {
        const data = fs.readFileSync(this.revokedKeysPath, 'utf-8');
        this.revokedKeys = JSON.parse(data);
      }
    } catch (e) {
      this.revokedKeys = [];
    }
  }

  private addToRevokedList(key: string): void {
    if (!this.revokedKeys.includes(key)) {
      this.revokedKeys.push(key);
      fs.writeFileSync(this.revokedKeysPath, JSON.stringify(this.revokedKeys));
    }
  }

  private isKeyRevoked(key: string): boolean {
    return this.revokedKeys.includes(key);
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
