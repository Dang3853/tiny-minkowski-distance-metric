/**
 * Minkowski distance of order p between two numeric vectors.
 *
 * The Minkowski distance is
 *
 *     ( sum_i |a_i - b_i|^p )^(1/p)
 *
 * for finite p >= 1. p = 1 is the Manhattan distance, p = 2 the Euclidean
 * distance, and p -> Infinity the Chebyshev distance. We deliberately do not
 * special-case those three here; callers who want them can pass the order.
 */

/**
 * Thrown when the inputs cannot produce a meaningful Minkowski distance.
 *
 * We use a dedicated error class rather than `RangeError`/`TypeError` so that
 * callers can distinguish "bad geometry input" from "bad JavaScript", which
 * matters when vectors arrive from untrusted sources.
 */
export class MinkowskiInputError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MinkowskiInputError';
  }
}

/**
 * Validate a vector and return it as a plain array of numbers.
 *
 * Kept private-ish (not exported) because the error messages mention internal
 * expectations that we do not want to freeze as public API.
 */
function asNumericVector(value, label) {
  if (!Array.isArray(value)) {
    throw new MinkowskiInputError(`${label} must be an array of numbers`);
  }
  const out = new Array(value.length);
  for (let i = 0; i < value.length; i += 1) {
    const n = value[i];
    if (typeof n !== 'number' || !Number.isFinite(n)) {
      throw new MinkowskiInputError(
        `${label}[${i}] must be a finite number, got ${String(n)}`,
      );
    }
    out[i] = n;
  }
  return out;
}

/**
 * Validate the order p.
 *
 * We require p >= 1 and finite. p < 1 is not a metric (the triangle
 * inequality fails), and p = Infinity is the Chebyshev limit which is a
 * different function; accepting either would silently change the meaning of
 * the result.
 */
function assertOrder(p) {
  if (typeof p !== 'number' || !Number.isFinite(p)) {
    throw new MinkowskiInputError(`p must be a finite number, got ${String(p)}`);
  }
  if (p < 1) {
    throw new MinkowskiInputError(`p must be >= 1, got ${p}`);
  }
}

/**
 * Compute the Minkowski distance of order `p` between `a` and `b`.
 *
 * Both vectors must be arrays of finite numbers with the same length. The
 * order `p` must be a finite number >= 1.
 *
 * @param {number[]} a
 * @param {number[]} b
 * @param {number} p
 * @returns {number}
 * @throws {MinkowskiInputError}
 */
export function minkowskiDistance(a, b, p) {
  assertOrder(p);
  const left = asNumericVector(a, 'a');
  const right = asNumericVector(b, 'b');
  if (left.length !== right.length) {
    throw new MinkowskiInputError(
      `vectors must have the same length, got ${left.length} and ${right.length}`,
    );
  }
  if (left.length === 0) {
    // The empty sum is 0, so the distance between two empty vectors is 0.
    // This is the standard convention and keeps the function total.
    return 0;
  }

  let sum = 0;
  for (let i = 0; i < left.length; i += 1) {
    const diff = Math.abs(left[i] - right[i]);
    // Math.pow handles the general case. We do not branch on p === 1 or
    // p === 2 because the branch would not change the result, only add code.
    sum += Math.pow(diff, p);
  }
  return Math.pow(sum, 1 / p);
}

/**
 * Like `minkowskiDistance`, but returns `null` instead of throwing when the
 * inputs are invalid.
 *
 * WHY: distance functions are often called inside scoring loops where a
 * malformed row should be skipped, not crash the batch. Returning `null`
 * keeps the caller in control of the error policy without try/catch noise.
 *
 * @param {number[]} a
 * @param {number[]} b
 * @param {number} p
 * @returns {number | null}
 */
export function minkowskiDistanceSafe(a, b, p) {
  try {
    return minkowskiDistance(a, b, p);
  } catch (err) {
    if (err instanceof MinkowskiInputError) {
      return null;
    }
    throw err;
  }
}
