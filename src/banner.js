import { Jimp } from 'jimp';
import chalk from 'chalk';
import figlet from 'figlet';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function printBanner() {
  const imagePath = join(__dirname, '..', 'StackOverFolk.png');
  const image = await Jimp.read(imagePath);

  const targetWidth = 55;
  const targetHeight = Math.round((image.height / image.width) * targetWidth / 2);

  image.resize({ w: targetWidth, h: targetHeight });

  const lines = [];
  for (let y = 0; y < image.height; y++) {
    let line = '';
    for (let x = 0; x < image.width; x++) {
      const color = image.getPixelColor(x, y);
      const r = (color >> 24) & 0xff;
      const g = (color >> 16) & 0xff;
      const b = (color >> 8) & 0xff;
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

      if (brightness < 85) {
        line += '█';
      } else if (brightness < 170) {
        line += '▓';
      } else {
        line += ' ';
      }
    }
    lines.push(line);
  }

  console.log(chalk.hex('#2D6A3F')(lines.join('\n')));

  const stackOverLines = figlet.textSync('StackOver', { font: 'Standard' }).split('\n');
  const folkLines = figlet.textSync('Folk', { font: 'Standard' }).split('\n');

  const maxLen = Math.max(stackOverLines.length, folkLines.length);
  while (stackOverLines.length < maxLen) stackOverLines.push('');
  while (folkLines.length < maxLen) folkLines.push('');

  for (let i = 0; i < maxLen; i++) {
    console.log(chalk.hex('#C8860A')(stackOverLines[i]) + chalk.hex('#2D6A3F')(folkLines[i]));
  }
}
