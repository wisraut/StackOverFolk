import test from 'node:test';
import assert from 'node:assert/strict';
import { createHashJourney } from '../src/operations/hash.js';
import { createDesJourney, desBlockHex, tripleDesBlockHex } from '../src/operations/des.js';
import { createEccSession, createEccEncryptJourney, createEccDecryptJourney } from '../src/operations/ecc.js';

test('SHA-256 and SHA-512 match published abc vectors', () => {
  assert.equal(createHashJourney('abc', 'sha256').output, 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.equal(createHashJourney('abc', 'sha512').output, 'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f');
});

test('DES matches the standard single-block known-answer vector', () => {
  const encrypted = desBlockHex('0123456789ABCDEF', '133457799BBCDFF1');
  assert.equal(encrypted, '85E813540F0AB405');
  assert.equal(desBlockHex(encrypted, '133457799BBCDFF1', 'decrypt'), '0123456789ABCDEF');
});

test('3DES EDE block operation decrypts its own ciphertext', () => {
  const key = '0123456789ABCDEFFEDCBA98765432100011223344556677';
  const encrypted = tripleDesBlockHex('0123456789ABCDEF', key);
  assert.equal(tripleDesBlockHex(encrypted, key, 'decrypt'), '0123456789ABCDEF');
});

for (const algorithm of ['DES', '3DES']) {
  test(`${algorithm} CBC journey round-trips UTF-8 text`, () => {
    const encrypted = createDesJourney('เรียนรู้ crypto', { algorithm, action: 'encrypt' });
    const decrypted = createDesJourney(encrypted.output, { algorithm, action: 'decrypt' });
    assert.equal(decrypted.output, 'เรียนรู้ crypto');
    assert.equal(encrypted.stages.at(-1).summary, encrypted.output);
  });
}

test('ECC hybrid journey round-trips within one session', () => {
  const session = createEccSession();
  const encrypted = createEccEncryptJourney('secret message', session);
  const decrypted = createEccDecryptJourney(encrypted.output, session);
  assert.equal(decrypted.output, 'secret message');
  assert.equal(encrypted.meta.curve, 'prime256v1');
});

test('ECC hybrid rejects a payload authenticated for another session', () => {
  const encrypted = createEccEncryptJourney('secret message', createEccSession());
  assert.throws(() => createEccDecryptJourney(encrypted.output, createEccSession()), { code: 'AUTHENTICATION_FAILED' });
});
