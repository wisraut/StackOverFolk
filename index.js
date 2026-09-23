#!/usr/bin/env node

import React from 'react';
import { render } from 'ink';
import { App } from './src/app.js';
import { getBanner, printBanner } from './src/banner.js';
import { handoffInputToInk } from './src/terminal-input.js';

function shouldAnimate(args) {
  if (args.includes('--no-animation')) return false;
  if (process.env.CI === 'true') return false;
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

async function main() {
  const args = process.argv.slice(2);
  const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY && process.env.CI !== 'true');

  if (!interactive) {
    await printBanner();
    return;
  }

  const releaseInput = handoffInputToInk();
  const application = render(React.createElement(App, {
    banner: await getBanner(),
    animateLogo: shouldAnimate(args),
    reducedMotion: process.env.STACKOVERFOLK_REDUCED_MOTION === '1',
  }));
  try {
    await application.waitUntilExit();
  } finally {
    releaseInput();
  }
}

main().catch((error) => {
  process.stderr.write(`StackOverFolk could not start: ${error.message}\n`);
  process.exitCode = 1;
});
