import { createHash } from 'node:crypto';

export class CryptoOperationError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'CryptoOperationError';
    this.code = code;
    this.details = details;
  }
}

function stage(id, title, received, operation, produced, explanation) {
  return {
    id,
    title,
    summary: produced,
    details: explanation,
    received,
    operation,
    produced,
    explanation,
  };
}

function paddingSummary(byteLength, blockSize, lengthFieldBytes) {
  const withMarker = byteLength + 1;
  const zeroBytes = (blockSize - ((withMarker + lengthFieldBytes) % blockSize)) % blockSize;
  const total = withMarker + zeroBytes + lengthFieldBytes;
  return { zeroBytes, total, blocks: total / blockSize };
}

export function createHashJourney(input, algorithm = 'sha256') {
  if (typeof input !== 'string') {
    throw new CryptoOperationError('INVALID_INPUT', 'Hash input must be a UTF-8 string.');
  }
  if (!['sha256', 'sha512'].includes(algorithm)) {
    throw new CryptoOperationError('UNSUPPORTED_HASH', 'Choose sha256 or sha512.', { algorithm });
  }

  const bytes = Buffer.from(input, 'utf8');
  const is512 = algorithm === 'sha512';
  const blockSize = is512 ? 128 : 64;
  const lengthFieldBytes = is512 ? 16 : 8;
  const padding = paddingSummary(bytes.length, blockSize, lengthFieldBytes);
  const digest = createHash(algorithm).update(bytes).digest('hex');
  const label = algorithm.toUpperCase();

  return {
    meta: { algorithm: label, action: 'hash', encoding: 'utf8' },
    output: digest,
    rawOutput: digest,
    result: { value: digest, encoding: 'hex' },
    stages: [
      stage('input', 'Input', input, 'Receive UTF-8 text', `${bytes.length} byte(s)`, 'Hash functions are one-way; this journey never offers decryption.'),
      stage('bytes', 'UTF-8 bytes', input, 'Encode text as UTF-8', bytes.toString('hex').toUpperCase() || '(empty)', 'The digest is calculated from bytes, not JavaScript characters.'),
      stage('padding', 'Padding', `${bytes.length} byte(s)`, 'Append 1 bit, zero bits, then the message length', `${padding.total} byte(s) across ${padding.blocks} block(s)`, `${padding.zeroBytes} zero byte(s) are inserted before the ${lengthFieldBytes}-byte length field.`),
      stage('blocks', 'Message blocks', `${padding.total} padded byte(s)`, `Split into ${blockSize}-byte blocks`, `${padding.blocks} block(s)`, `${label} processes fixed-width blocks.`),
      stage('compression', 'Compression summary', `${padding.blocks} block(s)`, is512 ? 'Apply the SHA-512 compression function (80 rounds per block)' : 'Apply the SHA-256 compression function (64 rounds per block)', `Real ${label} digest computed by node:crypto`, 'Rounds are summarized here so the engine does not invent intermediate state values.'),
      stage('digest', 'Digest', 'Final chaining value', 'Encode as lowercase hexadecimal', digest, `${label} outputs ${is512 ? 512 : 256} bits.`),
    ],
  };
}
