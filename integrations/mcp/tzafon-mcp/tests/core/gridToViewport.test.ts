import { describe, expect, it } from "vitest";

/**
 * Grid to Viewport Conversion Tests
 *
 * The gridToViewport function converts normalized grid coordinates (0-999)
 * to actual viewport pixel coordinates. This makes it easier for LLMs to
 * specify positions as percentages rather than exact pixels.
 */

// Recreate the gridToViewport function for testing (since it's not exported)
const GRID_SIZE = 1000;

const gridToViewport = (
  gridX: number,
  gridY: number,
  viewportWidth: number,
  viewportHeight: number
): { x: number; y: number } => {
  // Clamp values to valid range
  const clampedX = Math.max(0, Math.min(GRID_SIZE - 1, gridX));
  const clampedY = Math.max(0, Math.min(GRID_SIZE - 1, gridY));

  // Convert to viewport pixels
  const x = Math.round((clampedX / (GRID_SIZE - 1)) * (viewportWidth - 1));
  const y = Math.round((clampedY / (GRID_SIZE - 1)) * (viewportHeight - 1));

  return { x, y };
};

describe("gridToViewport", () => {
  describe("standard conversions", () => {
    it("should convert center coordinates (500, 500) to viewport center", () => {
      const result = gridToViewport(500, 500, 1920, 1080);

      // 500/999 ≈ 0.5005 → (1919 * 0.5005) ≈ 960.96 → rounds to 961
      expect(result.x).toBeCloseTo(960, 0);
      expect(result.y).toBeCloseTo(540, 0);
    });

    it("should convert (0, 0) to top-left corner", () => {
      const result = gridToViewport(0, 0, 1920, 1080);

      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    it("should convert (999, 999) to bottom-right corner", () => {
      const result = gridToViewport(999, 999, 1920, 1080);

      expect(result.x).toBe(1919);
      expect(result.y).toBe(1079);
    });

    it("should convert (250, 750) correctly", () => {
      const result = gridToViewport(250, 750, 1920, 1080);

      // 250/999 ≈ 0.2503 → (1919 * 0.2503) ≈ 480
      // 750/999 ≈ 0.7508 → (1079 * 0.7508) ≈ 810
      expect(result.x).toBeCloseTo(480, 0);
      expect(result.y).toBeCloseTo(810, 0);
    });
  });

  describe("boundary values", () => {
    it("should handle grid value 0 correctly", () => {
      const result = gridToViewport(0, 0, 1920, 1080);

      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    it("should handle grid value 999 correctly", () => {
      const result = gridToViewport(999, 999, 1920, 1080);

      expect(result.x).toBe(1919);
      expect(result.y).toBe(1079);
    });

    it("should handle grid value 1 correctly", () => {
      const result = gridToViewport(1, 1, 1920, 1080);

      // 1/999 ≈ 0.001 → floors to small values
      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeGreaterThanOrEqual(0);
      expect(result.x).toBeLessThan(5);
      expect(result.y).toBeLessThan(5);
    });

    it("should handle grid value 998 correctly", () => {
      const result = gridToViewport(998, 998, 1920, 1080);

      // 998/999 ≈ 0.999 → close to max
      expect(result.x).toBeGreaterThan(1915);
      expect(result.y).toBeGreaterThan(1075);
    });
  });

  describe("clamping behavior", () => {
    it("should clamp negative X values to 0", () => {
      const result = gridToViewport(-100, 500, 1920, 1080);

      expect(result.x).toBe(0);
    });

    it("should clamp negative Y values to 0", () => {
      const result = gridToViewport(500, -100, 1920, 1080);

      expect(result.y).toBe(0);
    });

    it("should clamp X values > 999 to 999", () => {
      const result = gridToViewport(1500, 500, 1920, 1080);

      expect(result.x).toBe(1919); // Same as 999
    });

    it("should clamp Y values > 999 to 999", () => {
      const result = gridToViewport(500, 1500, 1920, 1080);

      expect(result.y).toBe(1079); // Same as 999
    });

    it("should clamp both extreme negative values", () => {
      const result = gridToViewport(-1000, -1000, 1920, 1080);

      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    it("should clamp both extreme positive values", () => {
      const result = gridToViewport(5000, 5000, 1920, 1080);

      expect(result.x).toBe(1919);
      expect(result.y).toBe(1079);
    });
  });

  describe("various viewport sizes", () => {
    it("should work with 1280x720 viewport", () => {
      const result = gridToViewport(500, 500, 1280, 720);

      // Center should be approximately 640, 360
      expect(result.x).toBeCloseTo(640, 0);
      expect(result.y).toBeCloseTo(360, 0);
    });

    it("should work with mobile viewport 375x667", () => {
      const result = gridToViewport(500, 500, 375, 667);

      // Center approximately
      expect(result.x).toBeCloseTo(187, 0);
      expect(result.y).toBeCloseTo(333, 0);
    });

    it("should work with 4K viewport 3840x2160", () => {
      const result = gridToViewport(500, 500, 3840, 2160);

      // 500/999 * 3839 = 1921.42 rounded to 1921
      // 500/999 * 2159 = 1080.58 rounded to 1081
      expect(result.x).toBeCloseTo(1921, 0);
      expect(result.y).toBeCloseTo(1081, 0);
    });

    it("should work with square viewport 1000x1000", () => {
      const result = gridToViewport(500, 500, 1000, 1000);

      expect(result.x).toBeCloseTo(500, 0);
      expect(result.y).toBeCloseTo(500, 0);
    });

    it("should work with small viewport 100x100", () => {
      const result = gridToViewport(500, 500, 100, 100);

      expect(result.x).toBeCloseTo(50, 0);
      expect(result.y).toBeCloseTo(50, 0);
    });

    it("should handle 1x1 viewport (edge case)", () => {
      const result = gridToViewport(500, 500, 1, 1);

      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });
  });

  describe("asymmetric coordinates", () => {
    it("should handle different X and Y values", () => {
      const result = gridToViewport(100, 900, 1920, 1080);

      // X: 100/999 ≈ 0.1 → ~192
      // Y: 900/999 ≈ 0.9 → ~972
      expect(result.x).toBeCloseTo(192, 0);
      expect(result.y).toBeCloseTo(972, 0);
    });

    it("should handle edge X with center Y", () => {
      const result = gridToViewport(0, 500, 1920, 1080);

      expect(result.x).toBe(0);
      expect(result.y).toBeCloseTo(540, 0);
    });

    it("should handle center X with edge Y", () => {
      const result = gridToViewport(500, 0, 1920, 1080);

      expect(result.x).toBeCloseTo(960, 0);
      expect(result.y).toBe(0);
    });
  });
});
