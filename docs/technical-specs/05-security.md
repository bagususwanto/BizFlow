# Security Specifications

## Authentication & Authorization

```typescript
// JWT Token structure
interface JWTPayload {
  sub: string; // User ID
  username: string;
  role: string;
  permissions: string[];
  outletIds: string[];
  iat: number; // Issued at
  exp: number; // Expiration
}

// Token configuration
const tokenConfig = {
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: '15m',
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: '7d',
  },
};

// Permission structure
type Permission = `${Module}:${Action}`;
type Module =
  | 'pos'
  | 'products'
  | 'sales'
  | 'purchases'
  | 'inventory'
  | 'finance'
  | 'reports'
  | 'settings';
type Action = 'create' | 'read' | 'update' | 'delete' | 'export';

// Example permissions
const ownerPermissions: Permission[] = [
  'pos:*',
  'products:*',
  'sales:*',
  'purchases:*',
  'inventory:*',
  'finance:*',
  'reports:*',
  'settings:*',
];

const kasirPermissions: Permission[] = [
  'pos:create',
  'pos:read',
  'products:read',
  'sales:read',
];
```

---

## Data Security

| Aspek              | Implementation                              |
| ------------------ | ------------------------------------------- |
| **Password**       | bcrypt with cost factor 12                  |
| **Sensitive Data** | AES-256-GCM encryption at rest              |
| **Transport**      | HTTPS (TLS 1.3) required for cloud          |
| **Session**        | HTTP-only, Secure, SameSite cookies         |
| **CSRF**           | Double-submit cookie pattern                |
| **Rate Limiting**  | 100 req/min per IP (auth endpoints: 10/min) |

---

## Password Management

| Feature                   | Security Measure                                     |
| ------------------------- | ---------------------------------------------------- |
| **Reset Token**           | 32-byte cryptographically secure random string       |
| **Token Expiry**          | 1 hour                                               |
| **Token Usage**           | Single-use (marked `usedAt` upon reset)              |
| **Invalidation**          | Old tokens invalidated when new one requested        |
| **Email Enumeration**     | Generic success message regardless of user existence |
| **On-Premise Mode (Dev)** | Token returned in API response for easy reset        |

---

## License Validation

```typescript
// packages/license/src/validator.ts
import { createVerify } from 'crypto';

interface LicenseData {
  machineId: string;
  package: 'starter' | 'business' | 'enterprise';
  features: string[];
  maxUsers: number;
  maxOutlets: number;
  validFrom: Date;
  validUntil: Date | null; // null = perpetual
}

class LicenseValidator {
  private publicKey: string;

  constructor() {
    this.publicKey = process.env.LICENSE_PUBLIC_KEY;
  }

  validate(licenseKey: string, machineId: string): LicenseData {
    const [header, payload, signature] = licenseKey.split('.');

    // Verify signature using public key
    const verifier = createVerify('RSA-SHA256');
    verifier.update(`${header}.${payload}`);

    if (!verifier.verify(this.publicKey, signature, 'base64url')) {
      throw new Error('Invalid license signature');
    }

    // Decode and validate payload
    const data = JSON.parse(
      Buffer.from(payload, 'base64url').toString(),
    ) as LicenseData;

    // Check machine ID
    if (data.machineId !== machineId) {
      throw new Error('License not valid for this machine');
    }

    return data;
  }

  getMachineId(): string {
    // Generate unique machine fingerprint
    // Based on: CPU ID, MAC address, disk serial
    return generateMachineFingerprint();
  }
}
```
