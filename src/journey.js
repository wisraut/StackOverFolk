import {
  convertInteger,
  decodeAscii,
  encodeAscii,
  escapeAscii,
  parseInteger,
} from './converter.js';

export const ASCII_MODE = 'ascii';
export const UI_BASES = [2, 8, 10, 16];

function baseLabel(base) {
  const labels = new Map([[2, 'Binary'], [8, 'Octal'], [10, 'Decimal'], [16, 'Hexadecimal']]);
  return labels.get(base) ?? `Base ${base}`;
}

function stage(id, title, summary, details) {
  return { id, title, summary, details };
}

function digitExpansion(input, base) {
  const normalized = input.trim().replace(/^[+-]/u, '').toUpperCase();
  const digits = normalized.split('');
  if (digits.length > 12) return `${digits.length} digits evaluated with positional notation`;
  return digits.map((digit, index) => {
    const power = digits.length - index - 1;
    return `${digit}×${base}^${power}`;
  }).join(' + ');
}

function divisionTrace(value, base) {
  const steps = [];
  const radix = BigInt(base);
  let current = value < 0n ? -value : value;
  if (current === 0n) return ['0 ÷ ' + base + ' = 0 remainder 0'];
  while (current > 0n && steps.length < 16) {
    const quotient = current / radix;
    const remainder = current % radix;
    steps.push(`${current} ÷ ${base} = ${quotient} remainder ${remainder}`);
    current = quotient;
  }
  if (current > 0n) steps.push('… remaining steps hidden for readability');
  return steps;
}

function createNumericJourney(input, fromBase, toBase) {
  const value = parseInteger(input, fromBase);
  const output = convertInteger(input, fromBase, toBase);
  return {
    mode: 'number',
    output,
    rawOutput: output,
    stages: [
      stage('input', 'Input', input.trim(), `Read as ${baseLabel(fromBase)} (base ${fromBase})`),
      stage('validate', 'Validation', 'Every digit is valid', `Accepted digits for base ${fromBase}`),
      stage('parse', 'Parse', `Decimal value: ${value}`, digitExpansion(input, fromBase)),
      stage('convert', 'Convert', `Repeated division by ${toBase}`, divisionTrace(value, toBase).join('\n')),
      stage('result', 'Result', output, `${baseLabel(toBase)} (base ${toBase})`),
    ],
  };
}

function createAsciiEncodeJourney(input, toBase) {
  const output = encodeAscii(input, toBase);
  const codes = [...input].map((character) => character.charCodeAt(0));
  return {
    mode: 'ascii-encode',
    output,
    rawOutput: output,
    stages: [
      stage('input', 'Text Input', escapeAscii(input), `${input.length} ASCII character(s)`),
      stage('validate', 'Validation', 'All characters are ASCII', 'Every code point is between 0 and 127'),
      stage('codes', 'Character Codes', codes.join(' · '), [...input].map((c, i) => `${escapeAscii(c)} → ${codes[i]}`).join('\n')),
      stage('format', 'Base Formatting', `Format each code in base ${toBase}`, output),
      stage('result', 'Result', output, `${baseLabel(toBase)} ASCII codes separated by spaces`),
    ],
  };
}

function createAsciiDecodeJourney(input, fromBase) {
  const decoded = decodeAscii(input, fromBase);
  const tokens = input.trim().split(/\s+/u);
  const values = tokens.map((token) => parseInteger(token, fromBase));
  const display = escapeAscii(decoded);
  return {
    mode: 'ascii-decode',
    output: display,
    rawOutput: decoded,
    stages: [
      stage('input', 'Code Input', tokens.join(' '), `${tokens.length} code(s) in base ${fromBase}`),
      stage('validate', 'Validation', 'Every value is valid ASCII', 'All values resolve inside 0–127'),
      stage('values', 'Decimal Values', values.join(' · '), tokens.map((token, i) => `${token} → ${values[i]}`).join('\n')),
      stage('characters', 'Character Mapping', display, values.map((value, i) => `${value} → ${escapeAscii(decoded[i])}`).join('\n')),
      stage('result', 'Result', display, 'Decoded ASCII text'),
    ],
  };
}

export function createConversionJourney(input, from, to) {
  if (from === ASCII_MODE && to === ASCII_MODE) {
    throw new Error('ASCII cannot be converted directly to ASCII');
  }
  if (from === ASCII_MODE) return createAsciiEncodeJourney(input, to);
  if (to === ASCII_MODE) return createAsciiDecodeJourney(input, from);
  return createNumericJourney(input, from, to);
}

export function formatMode(mode) {
  return mode === ASCII_MODE ? 'ASCII' : `${baseLabel(mode)} (${mode})`;
}
