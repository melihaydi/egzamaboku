// Gerçek Piksel Tabanlı Görsel Analiz Motoru
// Bu bir klinik teşhis modeli değildir: eğitilmiş bir derin öğrenme modeli kullanmaz.
// Ancak yüklenen fotoğrafın GERÇEK piksel verisini (renk, doku, kenar yoğunluğu)
// analiz ederek rastgele/sahte sayılar yerine görüntüden türetilmiş ölçümler üretir.

export interface RegionPoint {
  x: number; // % (0-100)
  y: number; // % (0-100)
  radius: number; // %
  severity: number; // 0-1
  label: string;
}

export interface PixelAnalysisResult {
  redness: number;
  dryness: number;
  scaling: number;
  cracking: number;
  oozing: number;
  swelling: number;
  pigmentation: number;
  surfaceAreaCm2: number;
  confidenceScore: number;
  affectedRegions: RegionPoint[];
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function analyzeImagePixels(canvas: HTMLCanvasElement): PixelAnalysisResult {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  if (!ctx || width === 0 || height === 0) {
    return {
      redness: 0, dryness: 0, scaling: 0, cracking: 0, oozing: 0, swelling: 0, pigmentation: 0,
      surfaceAreaCm2: 0, confidenceScore: 0, affectedRegions: []
    };
  }

  const { data } = ctx.getImageData(0, 0, width, height);

  const gridSize = 10;
  const cellW = Math.max(1, Math.floor(width / gridSize));
  const cellH = Math.max(1, Math.floor(height / gridSize));

  const cellRedness: number[][] = [];
  const cellBrown: number[][] = [];
  const cellTextureVariance: number[][] = [];
  const cellEdgeDensity: number[][] = [];
  const cellHighlight: number[][] = [];

  let globalR = 0, globalG = 0, globalB = 0, globalBrightness = 0, globalPixels = 0;
  let overexposed = 0, underexposed = 0;

  for (let gy = 0; gy < gridSize; gy++) {
    cellRedness[gy] = [];
    cellBrown[gy] = [];
    cellTextureVariance[gy] = [];
    cellEdgeDensity[gy] = [];
    cellHighlight[gy] = [];

    for (let gx = 0; gx < gridSize; gx++) {
      const x0 = gx * cellW;
      const y0 = gy * cellH;
      const x1 = Math.min(width, x0 + cellW);
      const y1 = Math.min(height, y0 + cellH);

      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      let lumSum = 0, lumSqSum = 0;
      let edgeCount = 0;
      let highlightCount = 0;
      let prevLum = -1;

      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * width + x) * 4;
          const r = data[i], g = data[i + 1], b = data[i + 2];
          rSum += r; gSum += g; bSum += b; count++;
          globalR += r; globalG += g; globalB += b; globalPixels++;

          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          lumSum += lum;
          lumSqSum += lum * lum;
          globalBrightness += lum;
          if (lum > 245) overexposed++;
          if (lum < 12) underexposed++;

          if (prevLum >= 0 && Math.abs(lum - prevLum) > 28) edgeCount++;
          prevLum = lum;

          // Parlak, düşük doygunluklu (beyazımsı/sarımsı) noktalar -> sızıntı/parlaklık ipucu
          const maxC = Math.max(r, g, b);
          const minC = Math.min(r, g, b);
          const saturation = maxC === 0 ? 0 : (maxC - minC) / maxC;
          if (lum > 190 && saturation < 0.25) highlightCount++;
        }
      }

      const avgR = rSum / count, avgG = gSum / count, avgB = bSum / count;
      const rednessSignal = clamp(avgR - (avgG + avgB) / 2, 0, 255);
      const brownSignal = avgR > avgG && avgG > avgB && (avgR - avgB) > 15 && (0.299 * avgR + 0.587 * avgG + 0.114 * avgB) < 140
        ? clamp((avgR - avgB), 0, 255)
        : 0;

      const meanLum = lumSum / count;
      const variance = lumSqSum / count - meanLum * meanLum;

      cellRedness[gy][gx] = rednessSignal;
      cellBrown[gy][gx] = brownSignal;
      cellTextureVariance[gy][gx] = Math.sqrt(Math.max(0, variance));
      cellEdgeDensity[gy][gx] = edgeCount / count;
      cellHighlight[gy][gx] = highlightCount / count;
    }
  }

  const flatRedness = cellRedness.flat();
  const flatBrown = cellBrown.flat();
  const flatTexture = cellTextureVariance.flat();
  const flatEdge = cellEdgeDensity.flat();
  const flatHighlight = cellHighlight.flat();

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const maxOf = (arr: number[]) => Math.max(...arr);

  // Kızarıklık: R kanalının G/B ortalamasına göre baskınlığı
  const redness = clamp((avg(flatRedness) / 55) * 100, 0, 100);

  // Kuruluk / Soyulma: yerel doku varyansı (pürüzlü, mikro-kontrastlı yüzey kuru/pullu ciltte daha yüksektir)
  const textureScore = clamp((avg(flatTexture) / 38) * 100, 0, 100);
  const dryness = textureScore;
  const scaling = clamp(textureScore * 0.85 + maxOf(flatTexture) / 2, 0, 100);

  // Çatlama: keskin yerel parlaklık geçişlerinin (kenar) yoğunluğu
  const cracking = clamp(avg(flatEdge) * 900, 0, 100);

  // Sızıntı/Akıntı: düşük doygunluklu parlak (ıslak görünümlü) bölge oranı
  const oozing = clamp(avg(flatHighlight) * 260, 0, 100);

  // Şişlik: yüksek kızarıklığa sahip hücrelerin ne kadar geniş/bitişik bir alan kapladığı
  const highRednessCells = flatRedness.filter(v => v > 30).length;
  const swelling = clamp((highRednessCells / flatRedness.length) * 140, 0, 100);

  // Pigmentasyon: kahverengi/post-enflamatuar ton sinyali
  const pigmentation = clamp((avg(flatBrown) / 40) * 100, 0, 100);

  // Etkilenen alan tahmini: kızarıklık eşiğini aşan hücrelerin oranı, standart bir çerçeve alanına ölçeklenir
  const affectedRatio = flatRedness.filter(v => v > 22).length / flatRedness.length;
  const surfaceAreaCm2 = Math.round(affectedRatio * 320 * 10) / 10;

  // Güven skoru: pozlama kalitesine dayalı gerçek bir sinyal (çok karanlık/çok parlak görüntüler daha az güvenilir)
  const exposureIssues = (overexposed + underexposed) / globalPixels;
  const confidenceScore = Math.round(clamp(96 - exposureIssues * 180, 55, 98));

  // Isı haritası noktaları: en yüksek kızarıklık sinyaline sahip 3 hücre
  const cellsWithIndex: Array<{ gx: number; gy: number; val: number }> = [];
  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      cellsWithIndex.push({ gx, gy, val: cellRedness[gy][gx] });
    }
  }
  cellsWithIndex.sort((a, b) => b.val - a.val);
  const topCells = cellsWithIndex.slice(0, 3).filter(c => c.val > 15);

  const affectedRegions: RegionPoint[] = topCells.map(c => ({
    x: ((c.gx + 0.5) / gridSize) * 100,
    y: ((c.gy + 0.5) / gridSize) * 100,
    radius: 8 + (c.val / 255) * 10,
    severity: clamp(c.val / 120, 0, 1),
    label: c.val > 60 ? 'Belirgin Eritem Bölgesi' : 'Hafif Kızarıklık Bölgesi'
  }));

  return {
    redness: Math.round(redness),
    dryness: Math.round(dryness),
    scaling: Math.round(scaling),
    cracking: Math.round(cracking),
    oozing: Math.round(oozing),
    swelling: Math.round(swelling),
    pigmentation: Math.round(pigmentation),
    surfaceAreaCm2,
    confidenceScore,
    affectedRegions
  };
}

export function estimateInfectionRisk(result: PixelAnalysisResult): 'Düşük' | 'Orta' | 'Yüksek' {
  const infectionSignal = result.oozing * 0.5 + result.redness * 0.3 + result.swelling * 0.2;
  if (infectionSignal > 55) return 'Yüksek';
  if (infectionSignal > 30) return 'Orta';
  return 'Düşük';
}

export function estimateScoradIndex(result: PixelAnalysisResult): number {
  const extentScore = clamp(result.surfaceAreaCm2 / 6, 0, 100) * 0.1;
  const intensitySum = result.redness + result.dryness + result.scaling + result.cracking + result.oozing + result.swelling;
  const intensityScore = (intensitySum / 6) * 0.7;
  return Math.round((extentScore + intensityScore) * 10) / 10;
}
