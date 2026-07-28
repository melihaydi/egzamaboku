// Piksel Tabanlı Görsel Analiz Motoru
// Eğitilmiş bir derin öğrenme modeli DEĞİLDİR; klinik teşhis koymaz.
// Yüklenen fotoğrafın GERÇEK piksel verisini (renk kanalları, doku/kenar yoğunluğu, parlaklık dağılımı)
// deterministik biçimde ölçer: aynı fotoğraf her zaman aynı sonucu üretir (rastgele sayı üretilmez).

export interface RegionPoint {
  x: number; // % (0-100)
  y: number; // % (0-100)
  radius: number; // %
  severity: number; // 0-1
  label: string;
}

export interface PixelAnalysisResult {
  redness: number;
  scaling: number;
  swelling: number;
  crusting: number;
  oozing: number;
  pigmentation: number;
  surfaceAreaCm2: number;
  confidenceScore: number;
  affectedRegions: RegionPoint[];
  reasoning: string[];
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
      redness: 0, scaling: 0, swelling: 0, crusting: 0, oozing: 0, pigmentation: 0,
      surfaceAreaCm2: 0, confidenceScore: 0, affectedRegions: [], reasoning: ['Görüntü okunamadı.']
    };
  }

  const { data } = ctx.getImageData(0, 0, width, height);

  const gridSize = 10;
  const cellW = Math.max(1, Math.floor(width / gridSize));
  const cellH = Math.max(1, Math.floor(height / gridSize));

  const cellRedness: number[][] = [];
  const cellBrown: number[][] = [];
  const cellTextureVariance: number[][] = [];
  const cellDarkRoughness: number[][] = [];
  const cellHighlight: number[][] = [];

  let overexposed = 0, underexposed = 0, globalPixels = 0;

  for (let gy = 0; gy < gridSize; gy++) {
    cellRedness[gy] = [];
    cellBrown[gy] = [];
    cellTextureVariance[gy] = [];
    cellDarkRoughness[gy] = [];
    cellHighlight[gy] = [];

    for (let gx = 0; gx < gridSize; gx++) {
      const x0 = gx * cellW;
      const y0 = gy * cellH;
      const x1 = Math.min(width, x0 + cellW);
      const y1 = Math.min(height, y0 + cellH);

      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      let lumSum = 0, lumSqSum = 0;
      let highlightCount = 0;
      let darkEdgeCount = 0;
      let prevLum = -1;

      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * width + x) * 4;
          const r = data[i], g = data[i + 1], b = data[i + 2];
          rSum += r; gSum += g; bSum += b; count++;
          globalPixels++;

          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          lumSum += lum;
          lumSqSum += lum * lum;
          if (lum > 245) overexposed++;
          if (lum < 12) underexposed++;

          if (prevLum >= 0 && Math.abs(lum - prevLum) > 28 && lum < 110) darkEdgeCount++;
          prevLum = lum;

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
      cellDarkRoughness[gy][gx] = darkEdgeCount / count;
      cellHighlight[gy][gx] = highlightCount / count;
    }
  }

  const flatRedness = cellRedness.flat();
  const flatBrown = cellBrown.flat();
  const flatTexture = cellTextureVariance.flat();
  const flatDarkRoughness = cellDarkRoughness.flat();
  const flatHighlight = cellHighlight.flat();

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const maxOf = (arr: number[]) => Math.max(...arr);

  const avgRedness = avg(flatRedness);
  const redness = clamp((avgRedness / 55) * 100, 0, 100);

  const avgTexture = avg(flatTexture);
  const scaling = clamp((avgTexture / 38) * 100 * 0.85 + maxOf(flatTexture) / 2, 0, 100);

  const highRednessCells = flatRedness.filter(v => v > 30).length;
  const swelling = clamp((highRednessCells / flatRedness.length) * 140, 0, 100);

  const avgDarkRoughness = avg(flatDarkRoughness);
  const crusting = clamp(avgDarkRoughness * 950, 0, 100);

  const avgHighlight = avg(flatHighlight);
  const oozing = clamp(avgHighlight * 260, 0, 100);

  const avgBrown = avg(flatBrown);
  const pigmentation = clamp((avgBrown / 40) * 100, 0, 100);

  const affectedRatio = flatRedness.filter(v => v > 22).length / flatRedness.length;
  const surfaceAreaCm2 = Math.round(affectedRatio * 320 * 10) / 10;

  const exposureIssues = (overexposed + underexposed) / globalPixels;
  const confidenceScore = Math.round(clamp(96 - exposureIssues * 180, 55, 98));

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

  // Şeffaflık: her ölçümün hangi somut piksel sinyaline dayandığını açıkla
  const reasoning: string[] = [
    `Kızarıklık %${Math.round(redness)}: kırmızı renk kanalı, yeşil/mavi kanal ortalamasının ${Math.round(avgRedness)} birim üzerinde ölçüldü (${topCells.length} bölgede yoğunlaşmış).`,
    `Soyulma/kuruluk görünümü %${Math.round(scaling)}: yerel parlaklık varyansı (doku pürüzlülüğü) ${avgTexture.toFixed(1)} birim, düz/nemli ciltten daha yüksek.`,
    `Şişlik göstergesi %${Math.round(swelling)}: kızarıklık eşiğini aşan hücrelerin alana oranı %${Math.round((highRednessCells / flatRedness.length) * 100)}.`,
    `Kabuklanma %${Math.round(crusting)}: koyu tonlu bölgelerde keskin yerel kontrast geçişleri (kenar) tespit edildi.`,
    `Sızıntı/akıntı %${Math.round(oozing)}: düşük doygunluklu parlak (ıslak görünümlü) piksellerin oranı %${(avgHighlight * 100).toFixed(1)}.`,
    `Etkilenen alan ${surfaceAreaCm2} cm²: kareye bölünen ${gridSize * gridSize} hücreden kızarıklık eşiğini aşanların oranına göre tahmin edildi.`,
    `Güven skoru %${confidenceScore}: aşırı karanlık/parlak piksel oranı %${(exposureIssues * 100).toFixed(1)} (düşük oran = güvenilir pozlama).`
  ];

  return {
    redness: Math.round(redness),
    scaling: Math.round(scaling),
    swelling: Math.round(swelling),
    crusting: Math.round(crusting),
    oozing: Math.round(oozing),
    pigmentation: Math.round(pigmentation),
    surfaceAreaCm2,
    confidenceScore,
    affectedRegions,
    reasoning
  };
}

export function estimateInfectionRisk(result: PixelAnalysisResult): 'Düşük' | 'Orta' | 'Yüksek' {
  const infectionSignal = result.oozing * 0.5 + result.redness * 0.3 + result.swelling * 0.2;
  if (infectionSignal > 55) return 'Yüksek';
  if (infectionSignal > 30) return 'Orta';
  return 'Düşük';
}
