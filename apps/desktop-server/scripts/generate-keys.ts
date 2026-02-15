import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const KEYS_DIR = path.join(__dirname, '../keys');

if (!fs.existsSync(KEYS_DIR)) {
  fs.mkdirSync(KEYS_DIR, { recursive: true });
}

console.log('Generating Ed25519 key pair...');

const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');

const privateKeyPem = privateKey.export({
  type: 'pkcs8',
  format: 'pem',
});

const publicKeyPem = publicKey.export({
  type: 'spki',
  format: 'pem',
});

fs.writeFileSync(path.join(KEYS_DIR, 'private_key.pem'), privateKeyPem);
fs.writeFileSync(path.join(KEYS_DIR, 'public_key.pem'), publicKeyPem);

console.log('Keys generated successfully!');
console.log('Private Key saved to:', path.join(KEYS_DIR, 'private_key.pem'));
console.log('Public Key saved to:', path.join(KEYS_DIR, 'public_key.pem'));

// output public key as a single line string for embedding
console.log('\n--- Public Key for embedding ---');
console.log(publicKeyPem.toString().replace(/\n/g, '\\n'));
