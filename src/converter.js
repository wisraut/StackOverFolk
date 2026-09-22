const DIGITS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ASCII_MIN = 0;
const ASCII_MAX = 127;

export class ConversionError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'ConversionError';
    this.code = code;
    this.details = details;
  }
}

function assertBase(base) {
  if (!Number.isInteger(base) || base < 2 || base > 36) {
    throw new ConversionError('INVALID_BASE', 'Base must be an integer between 2 and 36', { base });
  }
}

function normalizeIntegerInput(input) {
  if (typeof input !== 'string' || input.trim() === '') {
    throw new ConversionError('EMPTY_INPUT', 'Input must be a non-empty string');
  }

  const trimmed = input.trim();
  const sign = trimmed[0] === '-' ? -1n : 1n;
  const unsigned = trimmed[0] === '-' || trimmed[0] === '+' ? trimmed.slice(1) : trimmed;

  if (unsigned === '') {
    throw new ConversionError('INVALID_NUMBER', 'A sign must be followed by at least one digit');
  }

  return { trimmed, sign, unsigned: unsigned.toUpperCase() };
}

export function parseInteger(input, base) {
  assertBase(base);
  const { sign, unsigned } = normalizeIntegerInput(input);
  const radix = BigInt(base);
  let value = 0n;

  for (const character of unsigned) {
    const digit = DIGITS.indexOf(character);
    if (digit < 0 || digit >= base) {
      throw new ConversionError(
        'INVALID_DIGIT',
        `“${character}” is not valid in base ${base}`,
        { character, base },
      );
    }
    value = value * radix + BigInt(digit);
  }

  return value === 0n ? 0n : value * sign;
}

export function convertInteger(input, fromBase, toBase) {
  assertBase(fromBase);
  assertBase(toBase);
  return parseInteger(input, fromBase).toString(toBase).toUpperCase();
}

// Backwards-compatible API used by the original CLI.
export const convert = convertInteger;

function formatAsciiCode(code, base) {
  const widths = new Map([[2, 8], [8, 3], [16, 2]]);
  return code.toString(base).toUpperCase().padStart(widths.get(base) ?? 1, '0');
}

export function encodeAscii(text, toBase) {
  assertBase(toBase);
  if (typeof text !== 'string' || text.length === 0) {
    throw new ConversionError('EMPTY_INPUT', 'Enter at least one ASCII character');
  }

  const codes = [];
  for (const character of text) {
    const code = character.codePointAt(0);
    if (code < ASCII_MIN || code > ASCII_MAX) {
      throw new ConversionError(
        'NON_ASCII_CHARACTER',
        `“${character}” is outside the ASCII range (0–127)`,
        { character, code },
      );
    }
    codes.push(formatAsciiCode(code, toBase));
  }
  return codes.join(' ');
}

export function decodeAscii(input, fromBase) {
  assertBase(fromBase);
  if (typeof input !== 'string' || input.trim() === '') {
    throw new ConversionError('EMPTY_INPUT', 'Enter one or more ASCII codes separated by spaces');
  }

  return input.trim().split(/\s+/u).map((token) => {
    const value = parseInteger(token, fromBase);
    if (value < ASCII_MIN || value > ASCII_MAX) {
      throw new ConversionError(
        'ASCII_OUT_OF_RANGE',
        `“${token}” resolves to ${value}, outside ASCII 0–127`,
        { token, value: value.toString() },
      );
    }
    return String.fromCharCode(Number(value));
  }).join('');
}

export function escapeAscii(text) {
  return [...text].map((character) => {
    const code = character.charCodeAt(0);
    if (character === '\n') return '\\n';
    if (character === '\r') return '\\r';
    if (character === '\t') return '\\t';
    if (code === 0) return '\\x00';
    if (code < 32 || code === 127) return `\\x${code.toString(16).toUpperCase().padStart(2, '0')}`;
    return character;
  }).join('');
}
