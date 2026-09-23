import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { render } from 'ink-testing-library';
import { App } from '../src/app.js';

const waitForRender = () => new Promise((resolve) => setTimeout(resolve, 25));

async function type(app, value) {
  app.stdin.write(value);
  await waitForRender();
}

async function submit(app) {
  app.stdin.write(String.fromCharCode(13));
  await waitForRender();
}

test('Ink app keeps the current configuration and renders a conversion result', async () => {
  const app = render(React.createElement(App));
  await submit(app);
  await type(app, '42');
  await submit(app);
  assert.match(app.lastFrame(), /การตั้งค่าปัจจุบัน: Decimal \(10\)  →  Binary \(2\)/);
  assert.match(app.lastFrame(), /ผลล่าสุด: 101010/);
  app.unmount();
});

test('uppercase ASCII remains input instead of triggering a shortcut', async () => {
  const app = render(React.createElement(App, { initialFrom: 'ascii', initialTo: 16 }));
  await submit(app);
  await type(app, 'S');
  await submit(app);
  assert.match(app.lastFrame(), /การตั้งค่าปัจจุบัน: ASCII  →  Hexadecimal \(16\)/);
  assert.match(app.lastFrame(), /ผลล่าสุด: 53/);
  app.unmount();
});

test('swap reuses the latest output as the next input', async () => {
  const app = render(React.createElement(App));
  await submit(app);
  await type(app, '10');
  await submit(app);
  await type(app, String.fromCharCode(19)); // Ctrl+S
  assert.match(app.lastFrame(), /การตั้งค่าปัจจุบัน: Binary \(2\)  →  Decimal \(10\)/);
  assert.match(app.lastFrame(), /กรอกค่า  1010/);
  app.unmount();
});

test('changing only the target recomputes the previous source input', async () => {
  const app = render(React.createElement(App));
  await submit(app);
  await type(app, '10');
  await submit(app);
  await type(app, String.fromCharCode(20)); // Ctrl+T
  await type(app, '\u001B[C');
  await submit(app);
  assert.match(app.lastFrame(), /การตั้งค่าปัจจุบัน: Decimal \(10\)  →  Octal \(8\)/);
  assert.match(app.lastFrame(), /ผลล่าสุด: 12/);
  app.unmount();
});

test('Ctrl+B opens one combined source and target picker', async () => {
  const app = render(React.createElement(App));
  await submit(app);
  await type(app, String.fromCharCode(2)); // Ctrl+B
  assert.match(app.lastFrame(), /เลือกฐานต้นทางและปลายทาง/);
  assert.match(app.lastFrame(), /SOURCE/);
  assert.match(app.lastFrame(), /TARGET/);
  await type(app, '\u001B[B');
  await type(app, '\u001B[C');
  await submit(app);
  assert.match(app.lastFrame(), /Hexadecimal \(16\)  →  Octal \(8\)/);
  app.unmount();
});

test('Backspace closes the combined base picker', async () => {
  const app = render(React.createElement(App));
  await submit(app);
  await type(app, String.fromCharCode(2)); // Ctrl+B
  assert.match(app.lastFrame(), /เลือกฐานต้นทางและปลายทาง/);
  await type(app, String.fromCharCode(8)); // Backspace
  assert.match(app.lastFrame(), /BASE \/ ASCII CONVERTER/);
  assert.doesNotMatch(app.lastFrame(), /เลือกฐานต้นทางและปลายทาง/);
  app.unmount();
});

test('a new value uses the same source and target without reopening setup', async () => {
  const app = render(React.createElement(App));
  await submit(app);
  await type(app, '10');
  await submit(app);
  await type(app, '7');
  await submit(app);
  assert.match(app.lastFrame(), /การตั้งค่าปัจจุบัน: Decimal \(10\)  →  Binary \(2\)/);
  assert.match(app.lastFrame(), /ผลล่าสุด: 111/);
  app.unmount();
});
