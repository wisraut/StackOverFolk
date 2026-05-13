import { select, input, confirm } from '@inquirer/prompts';
import { convert } from './converter.js';

const BASE_CHOICES = [
  { name: 'Binary (2)', value: 2 },
  { name: 'Octal (8)', value: 8 },
  { name: 'Decimal (10)', value: 10 },
  { name: 'Hexadecimal (16)', value: 16 },
];

export async function askFromBase() {
  return select({
    message: 'Convert from:',
    choices: BASE_CHOICES,
  });
}

export async function askToBase(fromBase) {
  return select({
    message: 'Convert to:',
    choices: BASE_CHOICES.filter(c => c.value !== fromBase),
  });
}

export async function askNumber(fromBase) {
  const baseName = BASE_CHOICES.find(c => c.value === fromBase)?.name ?? `base ${fromBase}`;
  return input({
    message: `Enter a ${baseName} number:`,
    validate(value) {
      if (!value.trim()) return 'Input cannot be empty';
      try {
        convert(value.trim(), fromBase, 10);
        return true;
      } catch (err) {
        return err.message;
      }
    },
  });
}

export async function askAgain() {
  return confirm({
    message: 'Convert another number?',
    default: true,
  });
}
