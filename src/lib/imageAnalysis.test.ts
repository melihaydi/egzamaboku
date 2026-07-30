import { describe, it, expect } from 'vitest';
import { analyzeImagePixels, estimateInfectionRisk } from './imageAnalysis';

function makeFakeCanvas(width: number, height: number, pixel: (x: number, y: number) => [number, number, number]): HTMLCanvasElement {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const [r, g, b] = pixel(x, y);
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }
  const ctx = {
    getImageData: () => ({ data, width, height, colorSpace: 'srgb' as PredefinedColorSpace })
  };
  return { width, height, getContext: () => ctx } as unknown as HTMLCanvasElement;
}

describe('analyzeImagePixels', () => {
  it('returns an empty, low-confidence result for a zero-sized canvas', () => {
    const canvas = makeFakeCanvas(0, 0, () => [0, 0, 0]);
    const result = analyzeImagePixels(canvas);
    expect(result.redness).toBe(0);
    expect(result.confidenceScore).toBe(0);
    expect(result.affectedRegions).toEqual([]);
    expect(result.reasoning).toEqual(['Görüntü okunamadı.']);
  });

  it('measures near-zero redness for a uniform neutral gray image', () => {
    const canvas = makeFakeCanvas(50, 50, () => [128, 128, 128]);
    const result = analyzeImagePixels(canvas);
    expect(result.redness).toBe(0);
    expect(result.affectedRegions).toEqual([]);
  });

  it('measures high redness for a uniformly deep-red image', () => {
    const canvas = makeFakeCanvas(50, 50, () => [220, 60, 60]);
    const result = analyzeImagePixels(canvas);
    expect(result.redness).toBeGreaterThan(50);
  });

  it('is deterministic: the same image always yields the same measurements', () => {
    const pixel = (x: number, y: number): [number, number, number] => [(x * 7) % 255, (y * 13) % 255, (x + y) % 255];
    const canvas1 = makeFakeCanvas(40, 40, pixel);
    const canvas2 = makeFakeCanvas(40, 40, pixel);
    expect(analyzeImagePixels(canvas1)).toEqual(analyzeImagePixels(canvas2));
  });

  it('reports a low confidence score for a mostly overexposed (blown-out white) image', () => {
    const canvas = makeFakeCanvas(50, 50, () => [255, 255, 255]);
    const result = analyzeImagePixels(canvas);
    expect(result.confidenceScore).toBeLessThan(96);
  });
});

describe('estimateInfectionRisk', () => {
  it('returns Düşük for low oozing/redness/swelling', () => {
    expect(estimateInfectionRisk({
      redness: 10, scaling: 0, swelling: 5, crusting: 0, oozing: 5, pigmentation: 0,
      surfaceAreaCm2: 0, confidenceScore: 90, affectedRegions: [], reasoning: []
    })).toBe('Düşük');
  });

  it('returns Yüksek when oozing and redness are both severe', () => {
    expect(estimateInfectionRisk({
      redness: 90, scaling: 0, swelling: 80, crusting: 0, oozing: 90, pigmentation: 0,
      surfaceAreaCm2: 0, confidenceScore: 60, affectedRegions: [], reasoning: []
    })).toBe('Yüksek');
  });

  it('returns Orta for a moderate combined signal', () => {
    expect(estimateInfectionRisk({
      redness: 50, scaling: 0, swelling: 40, crusting: 0, oozing: 40, pigmentation: 0,
      surfaceAreaCm2: 0, confidenceScore: 80, affectedRegions: [], reasoning: []
    })).toBe('Orta');
  });
});
