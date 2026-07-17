"""Coordinate conversion.

Northstar returns coordinates in a 0-999 model space; the computer takes
pixels. Since the 2026-04-08 breaking change (Python SDK 2.35.0, TypeScript
SDK 0.8) the API no longer pre-scales anything — every caller denormalizes.

    "All of them. Coordinates always come back in the 0-999 model space,
     so you always denormalize in your code."
    https://docs.lightcone.ai/guides/coordinates/#which-apis-return-raw-coordinates

One implementation lives here so the formula cannot drift between modules.
https://docs.lightcone.ai/guides/coordinates/#converting-to-pixel-coordinates
"""

from __future__ import annotations

# Docs default; also what the computer_use tool declares in these examples.
DISPLAY_WIDTH = 1280
DISPLAY_HEIGHT = 720


def to_px(coord: float, dim: int) -> int:
    """Denormalize one 0-999 model coordinate onto a pixel dimension."""
    return int(coord / 1000 * dim)


def scale_coordinates(
    model_x: float,
    model_y: float,
    viewport_width: int = DISPLAY_WIDTH,
    viewport_height: int = DISPLAY_HEIGHT,
) -> tuple[int, int]:
    """Denormalize an (x, y) pair from model space to pixels."""
    return to_px(model_x, viewport_width), to_px(model_y, viewport_height)
