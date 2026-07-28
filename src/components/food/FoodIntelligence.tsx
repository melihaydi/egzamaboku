import React, { useState } from 'react';
import {
  Utensils,
  Search,
  Plus,
  Sparkles,
  HelpCircle,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { useApp } from '../../context/useApp';
import type { FoodLogItem } from '../../types';
import { initialFoodCatalog } from '../../mock/mockData';

export const FoodIntelligence: React.FC = () => {
  const { foodLogs, addFoodLog, correlations } = useApp();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<FoodLogItem['category']>('Yüksek Histaminli');
  const [selectedHistamine, setSelectedHistamine] = useState<'Düşük' | 'Orta' | 'Yüksek'>('Yüksek');
  const [catalogTab, setCatalogTab] = useState<'Tetikleyici Olabilir' | 'Cilt Dostu'>('Tetikleyici Olabilir');

  const handleAddCustomMeal = () => {
    if (!searchTerm) return;
    const newItem: FoodLogItem = {
      id: `f-${Date.now()}`,
      name: searchTerm,
      category: selectedCategory,
      timestamp: new Date().toLocaleString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      histamineLevel: selectedHistamine,
      possibleFlareLink: selectedHistamine === 'Yüksek' ? '24 saatlik rötre takibine alındı' : undefined
    };
    addFoodLog(newItem);
    setSearchTerm('');
  };

  const catalogItems = initialFoodCatalog.filter(item => item.group === catalogTab);

  return (
    <div className="space-y-6">
      {/* Üst Şerit */}
      <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-neutral-800 text-neutral-300 border border-neutral-700">
              <Utensils className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-semibold text-white tracking-tight">
              Beslenme Asistanı
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Tetikleyici olabilecek gıdaları ve cilt dostu besinleri gösterir; kendi öğünlerini günlüğe kaydedip belirtilerinle olan zamansal ilişkiyi takip eder.
          </p>
        </div>
      </div>

      {/* Besin Kataloğu: Tetikleyici Olabilir / Cilt Dostu */}
      <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 space-y-4">
        <div className="flex rounded-2xl bg-neutral-950 p-1 border border-neutral-800 max-w-md">
          <button
            onClick={() => setCatalogTab('Tetikleyici Olabilir')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              catalogTab === 'Tetikleyici Olabilir' ? 'bg-white text-neutral-950' : 'text-neutral-400'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Tetikleyici Olabilir
          </button>
          <button
            onClick={() => setCatalogTab('Cilt Dostu')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              catalogTab === 'Cilt Dostu' ? 'bg-white text-neutral-950' : 'text-neutral-400'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" /> Cilt Dostu
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {catalogItems.map(item => (
            <div key={item.id} className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-white">{item.name}</h4>
                {item.group === 'Tetikleyici Olabilir' ? (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 shrink-0">
                    Risk: %{item.flareRisk}
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 shrink-0">
                    Cilt Dostu
                  </span>
                )}
              </div>
              {item.benefit && <p className="text-[11px] text-neutral-300">{item.benefit}</p>}
              <p className="text-[11px] text-neutral-400 leading-relaxed">{item.rationale}</p>
              <p className="text-[10px] text-neutral-500 leading-relaxed pt-1 border-t border-neutral-800">{item.recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sol Kolon: Öğün Kaydı */}
        <div className="lg:col-span-6 bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-neutral-400" />
            Öğün Ekle veya Ara
          </h3>

          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Besin adı yazın (Örn: Eski Peynir, Sucuk, Çikolata, Avokado, Domates)..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold uppercase text-neutral-500 block mb-1">Kategori</label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value as FoodLogItem['category'])}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:outline-none"
                >
                  <option value="Yüksek Histaminli">Yüksek Histaminli</option>
                  <option value="Yaygın Alerjen">Yaygın Alerjen</option>
                  <option value="İşlenmiş Gıda">İşlenmiş Gıda</option>
                  <option value="Katkı / Boya">Katkı / Sentetik Boya</option>
                  <option value="Güvenli / Anti-Enflamatuar">Güvenli / Anti-Enflamatuar</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase text-neutral-500 block mb-1">Histamin Yükü</label>
                <select
                  value={selectedHistamine}
                  onChange={e => setSelectedHistamine(e.target.value as 'Düşük' | 'Orta' | 'Yüksek')}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:outline-none"
                >
                  <option value="Düşük">Düşük Histamin</option>
                  <option value="Orta">Orta Histamin</option>
                  <option value="Yüksek">Yüksek Histamin</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleAddCustomMeal}
              disabled={!searchTerm.trim()}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-xs shadow-md flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
              Öğün Günlüğüne Ekle
            </button>
          </div>

          {/* Günlük Listesi */}
          <div className="pt-4 border-t border-neutral-800 space-y-2">
            <span className="text-[10px] uppercase font-semibold text-neutral-500 block">Kayıtlı Beslenme Günlüğü</span>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {foodLogs.map(item => (
                <div key={item.id} className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{item.name}</p>
                    <p className="text-[10px] text-neutral-500">{item.timestamp} • {item.category}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${
                    item.histamineLevel === 'Yüksek' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {item.histamineLevel} Histamin
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sağ Kolon: Korelasyon Tespiti */}
        <div className="lg:col-span-6 bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neutral-400" />
              <h3 className="text-sm font-semibold text-white">
                Belirti - Gıda Korelasyonları
              </h3>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Tüketilen besinler ile sonraki 12–72 saat içindeki kaşıntı şiddetlenmesi arasındaki istatistiksel ilişki.
            </p>
          </div>

          <div className="space-y-3">
            {correlations.map((corr, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-xs">{corr.foodName}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                    Güvenilirlik: %{corr.confidence}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Gecikme: <strong>+{corr.lagHours} Saat</strong></span>
                  <span className="text-rose-400 font-semibold">Kaşıntı Artışı: +{corr.symptomIncrease} puan</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-400 space-y-1">
            <p className="font-semibold text-neutral-300 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              Korelasyon ve Neden-Sonuç İlişkisi Notu:
            </p>
            <p className="text-[11px] leading-relaxed">
              Bu bölüm besinler ve belirtiler arasındaki zamansal korelasyonu gösterir; doğrudan tıbbi alerji tanısı koymaz. Alerji testi için immünoloji/alerji uzmanına başvurun.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
