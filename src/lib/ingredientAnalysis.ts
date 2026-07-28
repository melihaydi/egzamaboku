import type { IngredientItem, ProductScanResult } from '../types';

interface IngredientRule {
  pattern: RegExp;
  name: string;
  category: IngredientItem['category'];
  riskLevel: IngredientItem['riskLevel'];
  explanation: string;
}

const RULES: IngredientRule[] = [
  { pattern: /fragrance|parfum|perfume|\besans\b/i, name: 'Parfum (Fragrance)', category: 'Parfüm / Fragrance', riskLevel: 'Yüksek', explanation: 'Egzamalı ciltlerde kontakt dermatitin en sık nedenlerinden biridir; parfümsüz (fragrance-free) ürünler tercih edilmelidir.' },
  { pattern: /alcohol denat|isopropyl alcohol|\bethanol\b|\bsd alcohol\b/i, name: 'Alcohol Denat / Kurutucu Alkol', category: 'Alkol', riskLevel: 'Yüksek', explanation: 'Hızla buharlaşarak cildin nem dengesini bozar ve kuruluğu artırabilir.' },
  { pattern: /sodium lauryl sulfate|\bsls\b|sodium laureth sulfate|\bsles\b/i, name: 'Sodium Lauryl/Laureth Sulfate (SLS/SLES)', category: 'SLS / Sülfat', riskLevel: 'Yüksek', explanation: 'Sert bir sürfaktandır; cildin doğal koruyucu yağ tabakasını soyarak bariyeri zayıflatabilir.' },
  { pattern: /methylisothiazolinone|\bmit\b|methylchloroisothiazolinone|\bmci\b/i, name: 'MIT / MCI (Koruyucu)', category: 'MIT / MCI', riskLevel: 'Yüksek', explanation: 'Şiddetli kontakt alerjisi/hassasiyeti oluşturabilen sentetik koruyuculardır.' },
  { pattern: /paraben/i, name: 'Paraben (Koruyucu)', category: 'Paraben', riskLevel: 'Orta', explanation: 'Bazı hassas ciltlerde tahriş bildirilse de genel toksisite kanıtı sınırlıdır; hassasiyet öyküsü varsa dikkatli kullanılmalıdır.' },
  { pattern: /essential oil|limonene|linalool|citral|geraniol|eugenol/i, name: 'Uçucu Yağ / Doğal Esans Bileşeni', category: 'Uçucu Yağ', riskLevel: 'Orta', explanation: '"Doğal" olsa da oksitlendiğinde alerjik kontakt dermatit riski taşıyan bileşenlerdir.' },
  { pattern: /lanolin/i, name: 'Lanolin', category: 'Lanolin', riskLevel: 'Orta', explanation: 'İyi bir nem tutucu olsa da bazı bireylerde (özellikle yün alerjisi olanlarda) kontakt alerjiye yol açabilir.' },
  { pattern: /\burea\b/i, name: 'Urea (Üre)', category: 'Üre', riskLevel: 'Orta', explanation: 'Düşük konsantrasyonda nem tutucu ve keratolitiktir; ancak çatlamış/açık ciltte batma hissi yapabilir.' },
  { pattern: /ceramide/i, name: 'Ceramide (Seramid)', category: 'Seramid', riskLevel: 'Düşük', explanation: 'Cildin hücreler arası lipid yapısını güçlendirir; egzamalı ciltler için önerilen bir bileşendir.' },
  { pattern: /petrolatum|petroleum jelly/i, name: 'Petrolatum', category: 'Petrolatum', riskLevel: 'Düşük', explanation: 'Yüksek tıkama (oklüzyon) kapasitesiyle nem kaybını önemli ölçüde azaltan güvenli bir bariyer maddesidir.' },
  { pattern: /glycerin/i, name: 'Glycerin (Gliserin)', category: 'Gliserin', riskLevel: 'Düşük', explanation: 'Epidermise su çeken, iyi tolere edilen, güvenli bir nemlendirici bileşendir.' }
];

export function analyzeIngredientText(rawText: string): { ingredients: IngredientItem[]; flaggedCount: number; compatibilityScore: number; ratingCategory: ProductScanResult['ratingCategory'] } {
  const ingredients: IngredientItem[] = [];
  let highCount = 0;
  let mediumCount = 0;

  for (const rule of RULES) {
    if (rule.pattern.test(rawText)) {
      ingredients.push({ name: rule.name, category: rule.category, riskLevel: rule.riskLevel, explanation: rule.explanation });
      if (rule.riskLevel === 'Yüksek') highCount++;
      else if (rule.riskLevel === 'Orta') mediumCount++;
    }
  }

  const flaggedCount = highCount + mediumCount;
  const score = Math.max(15, 100 - highCount * 22 - mediumCount * 10);

  let ratingCategory: ProductScanResult['ratingCategory'] = 'Güvenli';
  if (score < 50) ratingCategory = 'Önerilmez';
  else if (score < 80) ratingCategory = 'Dikkatli Kullanılmalı';

  return { ingredients, flaggedCount, compatibilityScore: score, ratingCategory };
}
