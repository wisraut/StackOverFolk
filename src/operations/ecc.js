import {
  createCipheriv,
  createDecipheriv,
  createECDH,
  hkdfSync,
  randomBytes,
} from 'node:crypto';
import { CryptoOperationError } from './hash.js';

const CURVE = 'prime256v1';
const VERSION = 1;
const HKDF_INFO = Buffer.from('StackOverFolk ECC hybrid v1', 'utf8');
const privateKeys = new WeakMap();

function stage(id, title, received, operation, produced, explanation) {
  return { id, title, summary: produced, details: explanation, received, operation, produced, explanation };
}

function toBase64Url(value) {
  return Buffer.from(value).toString('base64url');
}

function fromBase64Url(value, field) {
  if (typeof value !== 'string' || value === '') {
    throw new CryptoOperationError('INVALID_PAYLOAD', `${field} is missing from the payload.`);
  }
  if (!/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new CryptoOperationError('INVALID_PAYLOAD', `${field} is not valid base64url.`);
  }
  try {
    return Buffer.from(value, 'base64url');
  } catch {
    throw new CryptoOperationError('INVALID_PAYLOAD', `${field} is not valid base64url.`);
  }
}

function deriveKey(sharedSecret, salt) {
  return Buffer.from(hkdfSync('sha256', sharedSecret, salt, HKDF_INFO, 32));
}

function requireSession(session, decrypt = false) {
  if (!session || session.curve !== CURVE || typeof session.publicKey !== 'string') {
    throw new CryptoOperationError('INVALID_SESSION', 'Use a P-256 session created by createEccSession().');
  }
  const privateKey = privateKeys.get(session);
  if (decrypt && !privateKey) {
    throw new CryptoOperationError('MISSING_PRIVATE_KEY', 'This session cannot decrypt because its private key is unavailable.');
  }
  return privateKey;
}

function decodePayload(serialized) {
  if (typeof serialized !== 'string' || serialized.trim() === '') {
    throw new CryptoOperationError('INVALID_PAYLOAD', 'Encrypted payload must be a non-empty base64url string.');
  }
  let payload;
  try {
    payload = JSON.parse(Buffer.from(serialized, 'base64url').toString('utf8'));
  } catch {
    throw new CryptoOperationError('INVALID_PAYLOAD', 'Encrypted payload is not valid StackOverFolk JSON.');
  }
  if (!payload || payload.version !== VERSION || payload.curve !== CURVE) {
    throw new CryptoOperationError('UNSUPPORTED_PAYLOAD', 'Payload must use StackOverFolk ECC hybrid version 1 on P-256.');
  }
  return payload;
}

export function createEccSession() {
  const ecdh = createECDH(CURVE);
  const publicKey = ecdh.generateKeys();
  const session = { curve: CURVE, publicKey: toBase64Url(publicKey) };
  privateKeys.set(session, ecdh.getPrivateKey());
  return session;
}

export function createEccEncryptJourney(input, session) {
  if (typeof input !== 'string') {
    throw new CryptoOperationError('INVALID_INPUT', 'Encryption input must be a UTF-8 string.');
  }
  requireSession(session);
  const recipientPublicKey = fromBase64Url(session.publicKey, 'recipient public key');
  const ephemeral = createECDH(CURVE);
  const ephemeralPublicKey = ephemeral.generateKeys();
  let sharedSecret;
  try {
    sharedSecret = ephemeral.computeSecret(recipientPublicKey);
  } catch {
    throw new CryptoOperationError('INVALID_PUBLIC_KEY', 'Recipient public key is not a valid P-256 key.');
  }

  const plaintext = Buffer.from(input, 'utf8');
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = deriveKey(sharedSecret, salt);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  const payload = {
    version: VERSION,
    curve: CURVE,
    ephemeralPublicKey: toBase64Url(ephemeralPublicKey),
    salt: toBase64Url(salt),
    iv: toBase64Url(iv),
    tag: toBase64Url(tag),
    ciphertext: toBase64Url(ciphertext),
  };
  const output = toBase64Url(Buffer.from(JSON.stringify(payload), 'utf8'));

  return {
    meta: { algorithm: 'ECC P-256 hybrid', action: 'encrypt', curve: CURVE, version: VERSION },
    output,
    rawOutput: output,
    result: { value: output, encoding: 'base64url-json' },
    stages: [
      stage('input', 'Input', input, 'Encode as UTF-8', `${plaintext.length} plaintext byte(s)`, 'ECC is used for key agreement; AES-GCM encrypts the message.'),
      stage('recipient', 'Recipient public key', session.publicKey, 'Use recipient P-256 public key', 'P-256 public key accepted', 'The recipient private key is never displayed.'),
      stage('ephemeral', 'Ephemeral key pair', 'Fresh P-256 key pair', 'Generate sender ephemeral key pair', toBase64Url(ephemeralPublicKey), 'A fresh public key is packaged; the ephemeral private key stays inside this operation.'),
      stage('ecdh', 'ECDH shared secret', 'Ephemeral private key + recipient public key', 'Derive shared secret with P-256 ECDH', `${sharedSecret.length}-byte secret derived`, 'The raw shared secret is intentionally not displayed.'),
      stage('kdf', 'HKDF-SHA256', 'ECDH secret + random salt', 'Derive 256-bit AES key', `salt ${toBase64Url(salt)}`, 'HKDF binds the key derivation to this protocol version.'),
      stage('encrypt', 'AES-256-GCM', `${plaintext.length} plaintext byte(s)`, 'Encrypt with random 12-byte IV and authenticate', `${ciphertext.length} ciphertext byte(s), tag ${toBase64Url(tag)}`, 'GCM provides confidentiality and tamper detection.'),
      stage('package', 'Packaged payload', 'Protocol fields', 'Serialize JSON and base64url encode', output, 'Payload contains version, curve, ephemeral public key, salt, IV, tag, and ciphertext.'),
    ],
  };
}

export function createEccDecryptJourney(serialized, session) {
  const privateKey = requireSession(session, true);
  const payload = decodePayload(serialized);
  const ephemeralPublicKey = fromBase64Url(payload.ephemeralPublicKey, 'ephemeral public key');
  const salt = fromBase64Url(payload.salt, 'salt');
  const iv = fromBase64Url(payload.iv, 'iv');
  const tag = fromBase64Url(payload.tag, 'tag');
  const ciphertext = fromBase64Url(payload.ciphertext, 'ciphertext');
  if (iv.length !== 12 || tag.length !== 16 || salt.length < 8) {
    throw new CryptoOperationError('INVALID_PAYLOAD', 'Payload IV, authentication tag, or salt has an invalid length.');
  }

  const recipient = createECDH(CURVE);
  recipient.setPrivateKey(privateKey);
  let sharedSecret;
  try {
    sharedSecret = recipient.computeSecret(ephemeralPublicKey);
  } catch {
    throw new CryptoOperationError('INVALID_PUBLIC_KEY', 'Payload ephemeral public key is not a valid P-256 key.');
  }
  const key = deriveKey(sharedSecret, salt);
  let plaintext;
  try {
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch {
    throw new CryptoOperationError('AUTHENTICATION_FAILED', 'Payload authentication failed: it may have been changed or uses another recipient key.');
  }
  const output = plaintext.toString('utf8');

  return {
    meta: { algorithm: 'ECC P-256 hybrid', action: 'decrypt', curve: CURVE, version: VERSION },
    output,
    rawOutput: output,
    result: { value: output, encoding: 'utf8' },
    stages: [
      stage('package', 'Packaged payload', serialized, 'Base64url decode and validate protocol fields', `${ciphertext.length} ciphertext byte(s)`, 'The payload version and curve are checked before decryption.'),
      stage('ecdh', 'ECDH shared secret', 'Recipient private key + ephemeral public key', 'Derive P-256 shared secret', `${sharedSecret.length}-byte secret derived`, 'The recipient private key is never displayed.'),
      stage('kdf', 'HKDF-SHA256', `salt ${payload.salt}`, 'Derive the same 256-bit AES key', 'AES-256 key derived', 'The raw shared secret and AES key remain hidden.'),
      stage('authenticate', 'AES-256-GCM authentication', `tag ${payload.tag}`, 'Verify tag before releasing plaintext', 'Authentication accepted', 'A modified payload fails here.'),
      stage('plaintext', 'Plaintext', `${ciphertext.length} ciphertext byte(s)`, 'Decrypt UTF-8 bytes', output, 'Authenticated decryption completed.'),
    ],
  };
}
