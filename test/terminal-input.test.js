import test from 'node:test';
import assert from 'node:assert/strict';
import { handoffInputToInk } from '../src/terminal-input.js';

test('hands stdin to Ink and restores the paused state after exit', () => {
  const input = {
    paused: true,
    resume() { this.paused = false; },
    pause() { this.paused = true; },
  };

  const releaseInput = handoffInputToInk(input);
  assert.equal(input.paused, false);
  releaseInput();
  assert.equal(input.paused, true);
});
