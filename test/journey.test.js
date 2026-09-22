import test from 'node:test';
import assert from 'node:assert/strict';
import { ASCII_MODE, createConversionJourney } from '../src/journey.js';

test('numeric journeys include real parsing and result stages', () => {
  const journey = createConversionJourney('255', 10, 16);
  assert.equal(journey.output, 'FF');
  assert.equal(journey.stages[2].summary, 'Decimal value: 255');
  assert.equal(journey.stages.at(-1).title, 'Result');
});

test('ASCII journeys switch between text and base-encoded codes', () => {
  const encoded = createConversionJourney('Hi', ASCII_MODE, 16);
  const decoded = createConversionJourney('48 69', 16, ASCII_MODE);
  assert.equal(encoded.output, '48 69');
  assert.equal(decoded.rawOutput, 'Hi');
});
