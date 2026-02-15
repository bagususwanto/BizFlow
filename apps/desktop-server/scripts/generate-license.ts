import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const KEYS_DIR = path.join(__dirname, '../keys');
const PRIVATE_KEY_PATH = path.join(KEYS_DIR, 'private_key.pem');

if (!fs.existsSync(PRIVATE_KEY_PATH)) {
  console.error('Private key not found! Run generate-keys.ts first.');
  process.exit(1);
}

const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf-8');

const machineId = process.argv[2];

if (!machineId) {
  console.log('Usage: npx ts-node scripts/generate-license.ts <MACHINE_ID>');
  console.log(
    'Example: npx ts-node scripts/generate-license.ts 7F3A-9B2C-4D1E',
  );
  process.exit(1);
}

// Data to sign: BZFL-[MACHINE_ID]
const dataToSign = `BZFL-${machineId}`;

// Sign data
const signature = crypto.sign(null, Buffer.from(dataToSign), privateKey);

const signatureHex = signature.toString('hex').toUpperCase();

// Final Key: BZFL-[MACHINE_ID]-[SIGNATURE]
const licenseKey = `${dataToSign}-${signatureHex}`;

console.log('\n--- Generated License Key ---');
console.log(licenseKey);
console.log('\n--- Validation Info ---');
console.log('Machine ID:', machineId);
console.log('Signature Length:', signatureHex.length);
