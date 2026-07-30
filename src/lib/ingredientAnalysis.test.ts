import { describe, it, expect } from 'vitest';
import { analyzeIngredientText } from './ingredientAnalysis';

describe('analyzeIngredientText', () => {
  it('returns a clean, safe result for a short benign ingredient list', () => {
    const result = analyzeIngredientText('Aqua, Glycerin, Ceramide NP, Petrolatum');
    expect(result.flaggedCount).toBe(0);
    expect(result.compatibilityScore).toBe(100);
    expect(result.ratingCategory).toBe('Güvenli');
    expect(result.ingredients.map(i => i.name)).toEqual(
      expect.arrayContaining(['Ceramide (Seramid)', 'Petrolatum', 'Glycerin (Gliserin)'])
    );
  });

  it('flags high-risk ingredients like fragrance and SLS and lowers the score', () => {
    const result = analyzeIngredientText('Aqua, Parfum, Sodium Lauryl Sulfate, Methylisothiazolinone');
    expect(result.flaggedCount).toBe(3);
    expect(result.ingredients.every(i => i.riskLevel === 'Yüksek')).toBe(true);
    expect(result.compatibilityScore).toBeLessThan(50);
    expect(result.ratingCategory).toBe('Önerilmez');
  });

  it('rates a single medium-risk ingredient as needing caution rather than unsafe', () => {
    const result = analyzeIngredientText('Aqua, Paraben, Glycerin');
    expect(result.flaggedCount).toBe(1);
    expect(result.ingredients[0].riskLevel).toBe('Orta');
    expect(result.compatibilityScore).toBe(90);
    expect(result.ratingCategory).toBe('Güvenli');
  });

  it('never lets the score drop below the floor of 15', () => {
    const result = analyzeIngredientText('Fragrance, Alcohol Denat, Sodium Lauryl Sulfate, Methylisothiazolinone, Parabens, Essential Oil, Lanolin, Urea');
    expect(result.compatibilityScore).toBeGreaterThanOrEqual(15);
  });

  it('is case-insensitive when matching ingredient names', () => {
    const result = analyzeIngredientText('FRAGRANCE, glycerin');
    expect(result.ingredients.some(i => i.name === 'Parfum (Fragrance)')).toBe(true);
  });
});
