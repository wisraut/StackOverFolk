import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { render } from 'ink-testing-library';
import { App, logoLoopTimeline } from '../src/app.js';

const wait = () => new Promise((resolve) => setTimeout(resolve, 30));
async function type(app, value) { app.stdin.write(value); await wait(); }
async function submit(app) { app.stdin.write(String.fromCharCode(13)); await wait(); }

test('logo animation starts a new cycle every five seconds', () => {
  assert.equal(logoLoopTimeline(0), 0);
  assert.equal(logoLoopTimeline(2499), 2499);
  assert.equal(logoLoopTimeline(3000), 2500);
  assert.equal(logoLoopTimeline(5000), 0);
  assert.equal(logoLoopTimeline(5350, true), 2500);
});

test('starts at a direct operation menu', () => {
  const app = render(React.createElement(App));
  assert.match(app.lastFrame(), /CRYPTO & CONVERSION LAB/);
  assert.match(app.lastFrame(), /Base \/ ASCII Converter/);
  assert.match(app.lastFrame(), /ECC Hybrid Encrypt/);
  app.unmount();
});

test('number shortcut opens SHA-256 and computes a digest', async () => {
  const app = render(React.createElement(App));
  await type(app, '2');
  await type(app, 'abc'); await submit(app);
  assert.match(app.lastFrame(), /SHA-256 HASH/);
  assert.match(app.lastFrame(), /ba7816bf8f01cfea/);
  app.unmount();
});

test('Esc returns to Home', async () => {
  const app = render(React.createElement(App));
  await type(app, '8');
  assert.match(app.lastFrame(), /ECC HYBRID ENCRYPT/);
  await type(app, '\u001B');
  assert.match(app.lastFrame(), /CRYPTO & CONVERSION LAB/);
  app.unmount();
});

test('Ctrl+O also returns to the operation menu', async () => {
  const app = render(React.createElement(App));
  await type(app, '3');
  assert.match(app.lastFrame(), /SHA-512 HASH/);
  await type(app, String.fromCharCode(15));
  assert.match(app.lastFrame(), /CRYPTO & CONVERSION LAB/);
  app.unmount();
});

test('Backspace requires two empty presses before returning to the menu', async () => {
  const app = render(React.createElement(App));
  await type(app, '2');
  await type(app, 'x');
  await type(app, String.fromCharCode(8));
  assert.match(app.lastFrame(), /SHA-256 HASH/);
  await type(app, String.fromCharCode(8));
  assert.match(app.lastFrame(), /กด Backspace อีกครั้ง/);
  assert.match(app.lastFrame(), /SHA-256 HASH/);
  await type(app, String.fromCharCode(8));
  assert.match(app.lastFrame(), /CRYPTO & CONVERSION LAB/);
  app.unmount();
});

test('DES encrypt switches directly to decrypt and reuses output', async () => {
  const app = render(React.createElement(App));
  await type(app, '4');
  await type(app, 'hello'); await submit(app);
  await type(app, String.fromCharCode(1));
  assert.match(app.lastFrame(), /DES DECRYPT/);
  await submit(app);
  assert.match(app.lastFrame(), /ผลล่าสุด: hello/);
  app.unmount();
});
