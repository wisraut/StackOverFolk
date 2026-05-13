const VALID_CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';

function isValidForBase(input, base) {
  const validSet = VALID_CHARS.slice(0, base);
  return input.toLowerCase().split('').every(char => validSet.includes(char));
}

export function convert(input, fromBase, toBase) {
  if (fromBase < 2 || fromBase > 36 || toBase < 2 || toBase > 36) {
    throw new Error('Base must be between 2 and 36');
  }

  if (!input || typeof input !== 'string') {
    throw new Error('Input must be a non-empty string');
  }

  const normalized = input.toLowerCase();

  if (!isValidForBase(normalized, fromBase)) {
    throw new Error(`"${input}" is not valid in base ${fromBase}`);
  }

  const decimal = parseInt(normalized, fromBase);

  if (isNaN(decimal)) {
    throw new Error(`Cannot parse "${input}" as base ${fromBase}`);
  }

  return decimal.toString(toBase).toUpperCase();
}
