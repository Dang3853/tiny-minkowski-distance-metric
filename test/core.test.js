import test from 'node:test';
import assert from 'node:assert/strict';

import {
  minkowskiDistance,
  minkowskiDistanceSafe,
  MinkowskiInputError,
} from '../src/index.js';

const EPS = 1e-12;

function closeTo(got, want, eps = EPS) {
  assert.ok(
    Math.abs(got - want) < eps,
    `expected ${got} to be within ${eps} of ${want}`,
  );
}

test('p = 1 is the Manhattan distance', () => {
  closeTo(minkowskiDistance([1, 2, 3], [4, 6, 3], 1), 7);
});

test('p = 2 is the Euclidean distance', () => {
  closeTo(minkowskiDistance([0, 0], [3, 4], 2), 5);
});

test('p = 3 matches a hand-computed value', () => {
  // |1-0|^3 + |2-0|^3 = 1 + 8 = 9, then 9^(1/3).
  closeTo(minkowskiDistance([1, 2], [0, 0], 3), Math.cbrt(9));
});

test('distance from a vector to itself is zero', () => {
  closeTo(minkowskiDistance([1.5, -2, 0], [1.5, -2, 0], 2.5), 0);
});

test('distance is symmetric', () => {
  const a = [1, 2, 3];
  const b = [4, 0, -1];
  closeTo(minkowskiDistance(a, b, 1.7), minkowskiDistance(b, a, 1.7));
});

test('two empty vectors have distance zero', () => {
  assert.equal(minkowskiDistance([], [], 2), 0);
});

test('single-element vectors reduce to absolute difference', () => {
  closeTo(minkowskiDistance([5], [-3], 4), 8);
});

test('non-integer p is supported', () => {
  // |4-1|^1.5 = 5.196..., then ^(1/1.5).
  closeTo(minkowskiDistance([4], [1], 1.5), Math.pow(3, 1.5) ** (1 / 1.5));
});

test('mismatched lengths throw MinkowskiInputError', () => {
  assert.throws(
    () => minkowskiDistance([1, 2], [1], 2),
    MinkowskiInputError,
  );
});

test('p below 1 throws MinkowskiInputError', () => {
  assert.throws(() => minkowskiDistance([1], [2], 0.5), MinkowskiInputError);
});

test('non-finite p throws MinkowskiInputError', () => {
  assert.throws(() => minkowskiDistance([1], [2], Infinity), MinkowskiInputError);
  assert.throws(() => minkowskiDistance([1], [2], NaN), MinkowskiInputError);
});

test('non-numeric vector entries throw MinkowskiInputError', () => {
  assert.throws(
    () => minkowskiDistance([1, '2'], [1, 2], 2),
    MinkowskiInputError,
  );
  assert.throws(
    () => minkowskiDistance([1, NaN], [1, 2], 2),
    MinkowskiInputError,
  );
});

test('non-array inputs throw MinkowskiInputError', () => {
  assert.throws(() => minkowskiDistance('nope', [1], 2), MinkowskiInputError);
  assert.throws(() => minkowskiDistance([1], null, 2), MinkowskiInputError);
});

test('safe variant returns null on bad input', () => {
  assert.equal(minkowskiDistanceSafe([1, 2], [1], 2), null);
  assert.equal(minkowskiDistanceSafe([1], [2], 0.5), null);
});

test('safe variant returns the number on good input', () => {
  closeTo(minkowskiDistanceSafe([0, 0], [3, 4], 2), 5);
});
