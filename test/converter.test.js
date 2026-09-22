import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ConversionError,
  convertInteger,
  decodeAscii,
  encodeAscii,
  escapeAscii,
} from '../src/converter.js';

test('converts every supported UI base without Number precision loss', () => {
  assert.equal(convertInteger('11111111111111111111111111111111111111111111111111111', 2, 16), '1FFFFFFFFFFFFF');
  assert.equal(convertInteger('  -000255 ', 10, 16), '-FF');
  assert.equal(convertInteger('deadbeef', 16, 2), '11011110101011011011111011101111');
  assert.equal(convertInteger('777', 8, 10), '511');
});

test('reports useful error codes for invalid numeric input', () => {
  assert.throws(() => convertInteger('', 10, 2), (error) => error instanceof ConversionError && error.code === 'EMPTY_INPUT');
  assert.throws(() => convertInteger('2', 2, 10), (error) => error instanceof ConversionError && error.code === 'INVALID_DIGIT');
  assert.throws(() => convertInteger('-', 10, 2), (error) => error instanceof ConversionError && error.code === 'INVALID_NUMBER');
});

test('encodes and decodes strict seven-bit ASCII', () => {
  assert.equal(encodeAscii('A\n', 2), '01000001 00001010');
  assert.equal(encodeAscii('A\n', 8), '101 012');
  assert.equal(encodeAscii('A\n', 16), '41 0A');
  assert.equal(decodeAscii('41 0A', 16), 'A\n');
  assert.equal(escapeAscii(decodeAscii('0 9 127', 10)), '\\x00\\t\\x7F');
});

test('rejects Unicode and non-ASCII code points', () => {
  assert.throws(() => encodeAscii('é', 16), (error) => error instanceof ConversionError && error.code === 'NON_ASCII_CHARACTER');
  assert.throws(() => decodeAscii('80', 16), (error) => error instanceof ConversionError && error.code === 'ASCII_OUT_OF_RANGE');
});
