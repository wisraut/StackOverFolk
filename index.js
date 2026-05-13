#!/usr/bin/env node

import chalk from 'chalk';
import { askFromBase, askToBase, askNumber, askAgain } from './src/prompts.js';
import { convert } from './src/converter.js';
import { printBanner } from './src/banner.js';

async function main() {
  await printBanner();
  console.log(chalk.gray('Convert numbers between binary, octal, decimal, and hex\n'));

  let running = true;

  while (running) {
    const fromBase = await askFromBase();
    const toBase = await askToBase(fromBase);
    const input = await askNumber(fromBase);

    const result = convert(input, fromBase, toBase);

    console.log(
      '\n' +
      chalk.green('Result: ') +
      chalk.white.bold(input) +
      chalk.gray(` (base ${fromBase})`) +
      chalk.yellow('  →  ') +
      chalk.white.bold(result) +
      chalk.gray(` (base ${toBase})`) +
      '\n'
    );

    running = await askAgain();
  }

  console.log(chalk.cyan('\nGoodbye!\n'));
}

main();
