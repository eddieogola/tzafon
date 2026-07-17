/**
 * Coordinate conversion.
 *
 * Northstar returns coordinates in a 0-999 model space; the computer takes
 * pixels. Since the 2026-04-08 breaking change (Python SDK 2.35.0, TypeScript
 * SDK 0.8) the API no longer pre-scales anything — every caller denormalizes.
 *
 *   "All of them. Coordinates always come back in the 0-999 model space,
 *    so you always denormalize in your code."
 *   https://docs.lightcone.ai/guides/coordinates/#which-apis-return-raw-coordinates
 *
 * One implementation lives here so the formula cannot drift between modules.
 * https://docs.lightcone.ai/guides/coordinates/#converting-to-pixel-coordinates
 */

/** Docs default; also what the computer_use tool declares in these examples. */
export const DISPLAY_WIDTH = 1280;
export const DISPLAY_HEIGHT = 720;

/** Denormalize one 0-999 model coordinate onto a pixel dimension. */
export function toPx(coord: number, dim: number): number {
  return Math.floor((coord / 1000) * dim);
}

/** Denormalize an (x, y) pair from model space to pixels. */
export function scaleCoordinates(
  modelX: number,
  modelY: number,
  viewportWidth: number = DISPLAY_WIDTH,
  viewportHeight: number = DISPLAY_HEIGHT,
): [number, number] {
  return [toPx(modelX, viewportWidth), toPx(modelY, viewportHeight)];
}
