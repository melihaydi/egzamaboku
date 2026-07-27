import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Tag, 
  CheckCircle2, 
  Award
} from 'lucide-react';
import { initialKnowledgeArticles } from '../../mock/mockData';
import type { KnowledgeArticle } from '../../types';

export const DermatologyKB: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [activeArticle, setActiveArticle] = useState<KnowledgeArticle>(initialKnowledgeArticles[0]);

  const categories = ['Tümü', 'İlaçlar & Biyolojikler', 'Topikal Tedaviler', 'Egzama Türleri', 'Çocuk & Hamilelik', 'Günlük Bakım'];

  const filteredArticles = initialKnowledgeArticles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchTerm.toLowerCase()) || art.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'Tümü' || art.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Üst Şerit */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <BookOpen className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Klinik Dermatoloji Bilgi Bankası & Araştırma Merkezi
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Kanıta dayalı tıbbi rehberler: Dupixent biyolojik tedavisi, topikal kortizon, kalsinörin inhibitörleri, ıslak sargı ve pediatrik bakım.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sol Kolon: Makale Arama & Liste */}
        <div className="lg:col-span-5 bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Konu ara (Örn: Dupixent, Takrolimus, Kortizon, Islak Sargı)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Kategori Etiketleri */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Makale Listesi */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredArticles.map(art => (
              <button
                key={art.id}
                onClick={() => setActiveArticle(art)}
                className={`w-full p-4 rounded-2xl border text-left transition-all space-y-2 ${
                  activeArticle.id === art.id
                    ? 'bg-slate-800 border-purple-500/50 shadow-lg'
                    : 'bg-slate-950 border-slate-850 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                    {art.category}
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-semibold">
                    {art.evidenceLevel}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white leading-snug">{art.title}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2">{art.summary}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Sağ Kolon: Makale Okuyucu */}
        <div className="lg:col-span-7 bg-slate-900 p-6 lg:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="border-b border-slate-800 pb-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-purple-400" />
                {activeArticle.evidenceLevel}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white tracking-tight">
              {activeArticle.title}
            </h3>
            <p className="text-xs text-slate-300 italic">
              {activeArticle.summary}
            </p>
          </div>

          <div className="prose prose-invert max-w-none text-xs leading-relaxed text-slate-300 whitespace-pre-line">
            {activeArticle.content}
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Klinik Özet Noktaları:
            </span>
            <ul className="space-y-1 text-xs text-slate-300">
              {activeArticle.keyTakeaways.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {activeArticle.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                <Tag className="w-3 h-3 text-purple-400" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
