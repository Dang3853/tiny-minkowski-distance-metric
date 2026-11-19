/**
 * Public entry point for tiny-minkowski-distance-metric.
 *
 * Re-exporting from a single index keeps the package surface small and makes
 * the README's import path honest: consumers import the package name, not a
 * deep file path, so internal refactors do not break them.
 */
export {
  minkowskiDistance,
  minkowskiDistanceSafe,
  MinkowskiInputError,
} from './core.js';
