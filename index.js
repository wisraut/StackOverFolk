#!/usr/bin/env node

import React from 'react';
import { render } from 'ink';
import { App } from './src/app.js';
import { playBannerAnimation, printBanner } from './src/banner.js';

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

  if (shouldAnimate(args)) {
    await playBannerAnimation({ reducedMotion: process.env.STACKOVERFOLK_REDUCED_MOTION === '1' });
  } else {
    await printBanner();
  }

  const application = render(React.createElement(App));
  await application.waitUntilExit();
}

main().catch((error) => {
  process.stderr.write(`StackOverFolk could not start: ${error.message}\n`);
  process.exitCode = 1;
});
