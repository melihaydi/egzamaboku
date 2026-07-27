import React, { useState } from 'react';
import { 
  Utensils, 
  Search, 
  Plus, 
  Sparkles, 
  HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { FoodLogItem } from '../../types';

export const FoodIntelligence: React.FC = () => {
  const { foodLogs, addFoodLog, correlations } = useApp();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<FoodLogItem['category']>('Yüksek Histaminli');
  const [selectedHistamine, setSelectedHistamine] = useState<'Düşük' | 'Orta' | 'Yüksek'>('Yüksek');

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

  return (
    <div className="space-y-6">
      {/* Üst Şerit */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Utensils className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Yapay Zeka Beslenme & Tetikleyici Takip Modülü
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Yüksek histaminli gıdaları, alerjenleri ve katkı maddelerini kaydeder; 12–72 saat sonraki kaşıntı/alevlenme değişimleri ile istatistiksel korelasyon kurar.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sol Kolon: Öğün Kaydı */}
        <div className="lg:col-span-6 bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-sky-400" />
            Öğün Ekle veya Alerjen Arama
          </h3>

          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Besin adı yazın (Örn: Eski Peynir, Sucuk, Çikolata, Avokado, Domates)..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Kategori</label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="Yüksek Histaminli">Yüksek Histaminli</option>
                  <option value="Yaygın Alerjen">Yaygın Alerjen</option>
                  <option value="İşlenmiş Gıda">İşlenmiş Gıda</option>
                  <option value="Katkı / Boya">Katkı / Sentetik Boya</option>
                  <option value="Güvenli / Anti-Enflamatuar">Güvenli / Anti-Enflamatuar</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Histamin Yükü</label>
                <select
                  value={selectedHistamine}
                  onChange={e => setSelectedHistamine(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="Düşük">Düşük Histamin</option>
                  <option value="Orta">Orta Histamin</option>
                  <option value="Yüksek">Yüksek Histamin</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleAddCustomMeal}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Öğün Günlüğüne Ekle
            </button>
          </div>

          {/* Günlük Listesi */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Kayıtlı Beslenme Günlüğü</span>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {foodLogs.map(item => (
                <div key={item.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">{item.name}</p>
                    <p className="text-[10px] text-slate-500">{item.timestamp} • {item.category}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
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
        <div className="lg:col-span-6 bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">
                Tespit Edilen Belirti - Gıda Korelasyonları
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Tüketilen besinler ile sonraki 12–72 saat içindeki kaşıntı şiddetlenmesi arasındaki istatistiksel ilişki.
            </p>
          </div>

          <div className="space-y-3">
            {correlations.map((corr, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{corr.foodName}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Güvenilirlik: %{corr.confidence}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Reaksiyon Süresi (Gecikme): <strong>+{corr.lagHours} Saat</strong></span>
                  <span className="text-rose-400 font-semibold">Kaşıntı Artış Skoru: +{corr.symptomIncrease} puan</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-sky-400" />
              Korelasyon ve Neden-Sonuç İlişkisi Notu:
            </p>
            <p className="text-[11px] leading-relaxed">
              DermIQ besinler ve belirtiler arasındaki zamansal korelasyonu gösterir; doğrudan tıbbi alerji tanısı koymaz. Alerji testi için immünoloji/alerji uzmanına başvurun.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
