import { Jimp } from 'jimp';
import chalk from 'chalk';
import figlet from 'figlet';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const GREEN = '#2D6A3F';
const GOLD = '#C8860A';
const IMAGE_WIDTH = 55;

let cachedBanner;

function pixelBrightness(color) {
  const r = (color >> 24) & 0xff;
  const g = (color >> 16) & 0xff;
  const b = (color >> 8) & 0xff;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

async function createBanner() {
  const imagePath = join(__dirname, '..', 'StackOverFolk.png');
  const image = await Jimp.read(imagePath);
  const targetHeight = Math.round((image.height / image.width) * IMAGE_WIDTH / 2);
  image.resize({ w: IMAGE_WIDTH, h: targetHeight });

  const glasses = [];
  for (let y = 0; y < image.height; y++) {
    let line = '';
    for (let x = 0; x < image.width; x++) {
      const brightness = pixelBrightness(image.getPixelColor(x, y));
      line += brightness < 85 ? '█' : brightness < 170 ? '▓' : ' ';
    }
    glasses.push(line);
  }

  const stackOver = figlet.textSync('StackOver', { font: 'Standard' }).split('\n');
  const folk = figlet.textSync('Folk', { font: 'Standard' }).split('\n');
  const height = Math.max(stackOver.length, folk.length);
  while (stackOver.length < height) stackOver.push('');
  while (folk.length < height) folk.push('');

  return {
    glasses,
    wordmark: stackOver.map((line, index) => ({ stackOver: line, folk: folk[index] })),
  };
}

export async function getBanner() {
  cachedBanner ??= createBanner();
  return cachedBanner;
}

export function renderStaticBanner(banner) {
  return [
    chalk.hex(GREEN)(banner.glasses.join('\n')),
    ...banner.wordmark.map(({ stackOver, folk }) => chalk.hex(GOLD)(stackOver) + chalk.hex(GREEN)(folk)),
  ].join('\n');
}

export async function printBanner() {
  process.stdout.write(`${renderStaticBanner(await getBanner())}\n`);
}

function deterministicNoise(row, column, tick) {
  const alphabet = '01ABCDEF*.: ';
  return alphabet[(row * 19 + column * 7 + tick * 13) % alphabet.length];
}

function cropReveal(line, reveal) {
  return [...line].map((character, index) => index <= reveal ? character : ' ').join('');
}

function revealWord(line, ratio, tick) {
  const count = Math.floor(line.length * ratio);
  return [...line].map((character, index) => {
    if (character === ' ' || index < count) return character;
    return deterministicNoise(0, index, tick);
  }).join('');
}

/** Build deterministic frames for timing tests and the interactive renderer. */
export function renderAnimationFrame(banner, elapsed, duration = 2500) {
  const glassesHeight = banner.glasses.length;
  const tick = Math.floor(elapsed / 40);
  let glasses;
  let wordmark;

  if (elapsed < 400) {
    glasses = banner.glasses.map((line, row) => [...line].map((character, column) => (
      character === ' ' ? ' ' : deterministicNoise(row, column, tick)
    )).join(''));
    wordmark = banner.wordmark.map(() => ({ stackOver: '', folk: '' }));
  } else if (elapsed < 1000) {
    const reveal = Math.floor(IMAGE_WIDTH * ((elapsed - 400) / 600));
    glasses = banner.glasses.map((line) => cropReveal(line, reveal));
    wordmark = banner.wordmark.map(() => ({ stackOver: '', folk: '' }));
  } else {
    glasses = [...banner.glasses];
    wordmark = banner.wordmark.map(({ stackOver, folk }) => ({
      stackOver: elapsed < 1600 ? '' : revealWord(stackOver, Math.min(1, (elapsed - 1600) / 600), tick),
      folk: elapsed < 1600 ? '' : revealWord(folk, Math.min(1, (elapsed - 1600) / 600), tick),
    }));

    if (elapsed < 1600 && glassesHeight > 2) {
      const journeyRow = Math.floor(glassesHeight / 2);
      glasses[journeyRow] = ` 0100 0010 0101 ${chalk.hex(GOLD)('─')} 42 55 49 4C 44 `;
    }
  }

  if (elapsed >= duration) return renderStaticBanner(banner);
  return [
    chalk.hex(GREEN)(glasses.join('\n')),
    ...wordmark.map(({ stackOver, folk }) => chalk.hex(GOLD)(stackOver) + chalk.hex(GREEN)(folk)),
  ].join('\n');
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/** Play in-place and always restore the cursor and stdin state. */
export async function playBannerAnimation({ reducedMotion = false, output = process.stdout, input = process.stdin } = {}) {
  const banner = await getBanner();
  const duration = reducedMotion ? 350 : 2500;
  const frameInterval = reducedMotion ? 80 : 40;
  const totalLines = banner.glasses.length + banner.wordmark.length;
  let started = false;
  let skipped = false;
  const canReadKey = Boolean(input.isTTY && typeof input.setRawMode === 'function');
  const onData = () => { skipped = true; };
  const rewindAndClear = `\x1B[${totalLines}A\r\x1B[0J`;

  if (canReadKey) {
    input.setRawMode(true);
    input.resume();
    input.on('data', onData);
  }

  try {
    output.write('\x1B[?25l');
    const startedAt = Date.now();
    while (!skipped) {
      const elapsed = Math.min(Date.now() - startedAt, duration);
      const timelineElapsed = reducedMotion ? Math.round((elapsed / duration) * 2500) : elapsed;
      if (started) output.write(rewindAndClear);
      output.write(`${renderAnimationFrame(banner, timelineElapsed, 2500)}\n`);
      started = true;
      if (elapsed >= duration) break;
      await sleep(frameInterval);
    }
    if (skipped) output.write(`${rewindAndClear}${renderStaticBanner(banner)}\n`);
  } finally {
    if (canReadKey) {
      input.off('data', onData);
      input.setRawMode(false);
      input.pause();
    }
    output.write('\x1B[?25h');
  }
}
