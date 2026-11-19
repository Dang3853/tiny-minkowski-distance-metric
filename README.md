# tiny-minkowski-distance-metric

Computes the Minkowski distance of order `p` between two numeric vectors for any finite `p >= 1`.

```js
import {
  minkowskiDistance,
  minkowskiDistanceSafe,
  MinkowskiInputError,
} from 'tiny-minkowski-distance-metric';

minkowskiDistance([1, 2, 3], [4, 6, 3], 1);   // 7      (Manhattan)
minkowskiDistance([0, 0], [3, 4], 2);         // 5      (Euclidean)
minkowskiDistance([1, 2], [0, 0], 3);         // 2.080...

minkowskiDistanceSafe([1, 2], [1], 2);        // null   (length mismatch)

try {
  minkowskiDistance([1], [2], 0.5);
} catch (err) {
  err instanceof MinkowskiInputError;         // true
}
```

## Why this exists

The Minkowski distance is a one-line formula, but the one-liner hides two decisions: what to do when `p < 1` (the result is not a metric), and what to do when the vectors disagree in length or contain non-finite values. Most inline versions either silently produce `NaN` or throw a generic `Error`, which makes it hard to tell a bad input from a bug in the caller.

This library makes one choice and states it plainly: `p` must be a finite number `>= 1`, both vectors must be arrays of finite numbers of equal length, and violations raise `MinkowskiInputError`. A second entry point, `minkowskiDistanceSafe`, returns `null` for those same violations so callers can skip bad rows in a scoring loop without wrapping every call in `try`/`catch`. It does not try to guess at `p = Infinity` (Chebyshev) or `p < 1` (fractional quasi-metrics); those are different functions with different guarantees.

## API

- `minkowskiDistance(a, b, p) -> number` — throws `MinkowskiInputError` on invalid input.
- `minkowskiDistanceSafe(a, b, p) -> number | null` — returns `null` on invalid input instead of throwing.
- `MinkowskiInputError` — the error class raised for invalid input.

## The awkward edge

Two empty vectors return `0`, not `NaN` and not an error. The empty sum is `0`, and `0^(1/p)` is `0` for any finite `p >= 1`, so this is the only value consistent with the formula. If your domain treats an empty vector as a data error, check `a.length === 0` before calling.
