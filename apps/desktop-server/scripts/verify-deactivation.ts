import * as crypto from 'crypto';

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(
    'Usage: npx ts-node scripts/verify-deactivation.ts <LICENSE_KEY> <DEACTIVATION_PROOF>',
  );
  console.log(
    'Example: npx ts-node scripts/verify-deactivation.ts BZFL-ABCD-... DEACT-ABCD-1234...',
  );
  process.exit(1);
}

const licenseKey = args[0] as string;
const proofString = args[1] as string;

console.log('--- License Deactivation Verification ---');
console.log(`License Key: ${licenseKey}`);
console.log(`Proof String: ${proofString}`);

const parts = proofString.split('-');
if (parts.length !== 3 || parts[0] !== 'DEACT') {
  console.error('❌ Invalid proof format. Expected: DEACT-[PREFIX]-[HASH]');
  process.exit(1);
}

const keyPrefix = parts[1];
const proofHash = parts[2];

// Check Key Prefix
const actualPrefix = licenseKey.split('-')[1] || 'UNKNOWN';
if (keyPrefix !== actualPrefix) {
  console.error(
    `❌ Key prefix mismatch! Proof says ${keyPrefix}, actual is ${actualPrefix}`,
  );
} else {
  console.log('✅ Key prefix matches.');
}

// IF we want to strictly verify the hash, we need the Machine ID.
// Let's ask the user to provide it if they want strict verification.
const machineIdFromUser = args[2];

if (machineIdFromUser) {
  console.log(`\nVerifying against Machine ID: ${machineIdFromUser}`);

  const expectedPayload = `${licenseKey}-${machineIdFromUser}-DEACT`;
  const expectedHash = crypto
    .createHash('sha256')
    .update(expectedPayload)
    .digest('hex')
    .substring(0, 16)
    .toUpperCase();

  if (expectedHash === proofHash) {
    console.log(
      '✅ VALID PROOF! The hash matches the provided Machine ID and License Key.',
    );
  } else {
    console.error('❌ INVALID PROOF! Hash mismatch.');
    console.error(`Expected: ${expectedHash}`);
    console.error(`Actual:   ${proofHash}`);
  }
} else {
  console.log('\n⚠️  No Machine ID provided for strict verification.');
  console.log('To strictly verify, run:');
  console.log(
    `npx ts-node scripts/verify-deactivation.ts <LICENSE_KEY> <DEACTIVATION_PROOF> <OLD_MACHINE_ID>`,
  );
}
