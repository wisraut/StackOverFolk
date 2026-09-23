import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { getBanner, playBannerAnimation, renderAnimationFrame, renderStaticBanner } from '../src/banner.js';

const banner = {
  glasses: [' ██ ', '█  █', ' ██ '],
  wordmark: [{ stackOver: 'STACK', folk: 'FOLK' }],
};

test('the final animation frame is the unchanged static banner', () => {
  assert.equal(renderAnimationFrame(banner, 2500), renderStaticBanner(banner));
  assert.equal(renderAnimationFrame(banner, 3000), renderStaticBanner(banner));
});

test('the source image becomes a centered high-detail half-block silhouette', async () => {
  const generated = await getBanner();
  assert.ok(generated.glasses.length >= 10);
  assert.match(generated.glasses.join('\n'), /[▀▄]/u);
  assert.doesNotMatch(generated.glasses.join('\n'), /▓/u);
});

test('animation has distinct scan, lens, journey, and wordmark phases', () => {
  assert.notEqual(renderAnimationFrame(banner, 0), renderAnimationFrame(banner, 700));
  assert.match(renderAnimationFrame(banner, 1200), /0100 0010/);
  assert.match(renderAnimationFrame(banner, 2000), /S/);
});

test('a key skips animation and restores terminal cursor state', async () => {
  class MockInput extends EventEmitter {
    isTTY = true;
    setRawMode() {}
    resume() {}
    pause() {}
    on(event, listener) {
      const result = super.on(event, listener);
      if (event === 'data') setTimeout(() => this.emit('data', Buffer.from('x')), 0);
      return result;
    }
  }
  const input = new MockInput();
  let output = '';
  await playBannerAnimation({ input, output: { write: (chunk) => { output += chunk; } } });
  assert.match(output, /\x1B\[\?25l/);
  assert.match(output, /\x1B\[\?25h/);
  assert.match(output, /\x1B\[0J/);
  assert.match(output, /____/);
});
