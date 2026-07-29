import React, { useState } from 'react';
import {
  Utensils,
  Plus,
  Trash2,
  ChefHat,
  BookOpen,
  Info
} from 'lucide-react';
import { useApp } from '../../context/useApp';
import type { FoodRating } from '../../types';

const RATING_STYLE: Record<FoodRating, string> = {
  'Güvenli': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'Bazen Sorunlu': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'Her Zaman Tetikliyor': 'bg-rose-500/15 text-rose-300 border-rose-500/30'
};

export const FoodIntelligence: React.FC = () => {
  const { foodItems, addFoodItem, updateFoodItem, removeFoodItem, meals, addMeal, removeMeal, recipes, addRecipe, removeRecipe, t } = useApp();
  const [tab, setTab] = useState<'foods' | 'meals' | 'recipes'>('foods');

  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodRating, setNewFoodRating] = useState<FoodRating>('Güvenli');
  const [newFoodNotes, setNewFoodNotes] = useState('');

  const [mealName, setMealName] = useState('');
  const [mealFoods, setMealFoods] = useState('');
  const [reactionSeverity, setReactionSeverity] = useState(0);
  const [reactionNote, setReactionNote] = useState('');

  const [recipeName, setRecipeName] = useState('');
  const [recipeIngredients, setRecipeIngredients] = useState('');
  const [recipeNotes, setRecipeNotes] = useState('');

  const triggeringFoods = foodItems.filter(f => f.rating === 'Her Zaman Tetikliyor');

  const handleAddFood = () => {
    if (!newFoodName.trim()) return;
    addFoodItem({ name: newFoodName.trim(), rating: newFoodRating, notes: newFoodNotes.trim() || undefined });
    setNewFoodName('');
    setNewFoodNotes('');
  };

  const handleAddMeal = () => {
    if (!mealName.trim() || !mealFoods.trim()) return;
    addMeal({
      name: mealName.trim(),
      dateISO: new Date().toISOString().slice(0, 10),
      foodNames: mealFoods.split(',').map(s => s.trim()).filter(Boolean),
      reactionSeverity: reactionSeverity || undefined,
      reactionNote: reactionNote.trim() || undefined
    });
    setMealName('');
    setMealFoods('');
    setReactionSeverity(0);
    setReactionNote('');
  };

  const handleAddRecipe = () => {
    if (!recipeName.trim() || !recipeIngredients.trim()) return;
    addRecipe({
      name: recipeName.trim(),
      ingredients: recipeIngredients.split(',').map(s => s.trim()).filter(Boolean),
      notes: recipeNotes.trim() || undefined
    });
    setRecipeName('');
    setRecipeIngredients('');
    setRecipeNotes('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-neutral-800 text-neutral-300 border border-neutral-700">
            <Utensils className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-semibold text-white tracking-tight">{t('title.food')}</h2>
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          Tamamen senin kontrolünde: kendi besinlerini, öğünlerini ve tariflerini ekle, güvenli/bazen sorunlu/her zaman tetikliyor olarak derecelendir. Uygulama zamanla kendi kayıtlarından örüntü çıkarır — varsayımda bulunmaz.
        </p>
      </div>

      {triggeringFoods.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/25 text-xs text-rose-200 flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Kendi kayıtlarına göre <strong>{triggeringFoods.map(f => f.name).join(', ')}</strong> "Her Zaman Tetikliyor" olarak işaretli ({triggeringFoods.map(f => `${f.timesLogged}x`).join(', ')}).
          </p>
        </div>
      )}

      <div className="flex rounded-2xl bg-neutral-950 p-1 border border-neutral-800 max-w-lg">
        {[
          { id: 'foods' as const, label: 'Besinler', icon: Utensils },
          { id: 'meals' as const, label: 'Öğünler', icon: ChefHat },
          { id: 'recipes' as const, label: 'Tarifler', icon: BookOpen }
        ].map(tabItem => {
          const Icon = tabItem.icon;
          return (
            <button
              key={tabItem.id}
              onClick={() => setTab(tabItem.id)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                tab === tabItem.id ? 'bg-white text-neutral-950' : 'text-neutral-400'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {tabItem.label}
            </button>
          );
        })}
      </div>

      {tab === 'foods' && (
        <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 space-y-4">
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Besin adı (Örn: Yumurta)"
                value={newFoodName}
                onChange={e => setNewFoodName(e.target.value)}
                className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none sm:col-span-1"
              />
              <select
                value={newFoodRating}
                onChange={e => setNewFoodRating(e.target.value as FoodRating)}
                className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 focus:outline-none"
              >
                <option value="Güvenli">Güvenli</option>
                <option value="Bazen Sorunlu">Bazen Sorunlu</option>
                <option value="Her Zaman Tetikliyor">Her Zaman Tetikliyor</option>
              </select>
              <button onClick={handleAddFood} disabled={!newFoodName.trim()} className="px-3 py-2 rounded-xl bg-white text-neutral-950 font-semibold text-xs disabled:opacity-40 flex items-center justify-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Ekle
              </button>
            </div>
            <input
              type="text"
              placeholder="Not (isteğe bağlı)"
              value={newFoodNotes}
              onChange={e => setNewFoodNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {foodItems.map(food => (
              <div key={food.id} className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-white">{food.name}</h4>
                  <button onClick={() => removeFoodItem(food.id)} className="p-1 rounded-lg text-neutral-600 hover:text-rose-400 hover:bg-rose-500/10">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <select
                  value={food.rating}
                  onChange={e => updateFoodItem(food.id, { rating: e.target.value as FoodRating })}
                  className={`text-[10px] font-semibold px-2 py-1 rounded-lg border ${RATING_STYLE[food.rating]}`}
                >
                  <option value="Güvenli">Güvenli</option>
                  <option value="Bazen Sorunlu">Bazen Sorunlu</option>
                  <option value="Her Zaman Tetikliyor">Her Zaman Tetikliyor</option>
                </select>
                <p className="text-[10px] text-neutral-500">{food.timesLogged}x kayıtlı • son: {food.lastLoggedISO}</p>
                {food.notes && <p className="text-[11px] text-neutral-400 italic">"{food.notes}"</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'meals' && (
        <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 space-y-4">
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
            <input
              type="text"
              placeholder="Öğün adı (Örn: Akşam Yemeği)"
              value={mealName}
              onChange={e => setMealName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="İçindeki besinler (virgülle ayır: Yumurta, Domates, Ekmek)"
              value={mealFoods}
              onChange={e => setMealFoods(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none"
            />
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-neutral-400">
                <span>Reaksiyon Şiddeti (varsa)</span>
                <span>{reactionSeverity}/10</span>
              </div>
              <input type="range" min={0} max={10} value={reactionSeverity} onChange={e => setReactionSeverity(Number(e.target.value))} className="w-full accent-white" />
            </div>
            <input
              type="text"
              placeholder="Reaksiyon notu (isteğe bağlı)"
              value={reactionNote}
              onChange={e => setReactionNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none"
            />
            <button onClick={handleAddMeal} disabled={!mealName.trim() || !mealFoods.trim()} className="px-4 py-2 rounded-xl bg-white text-neutral-950 font-semibold text-xs disabled:opacity-40 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Öğün Ekle
            </button>
          </div>

          <div className="space-y-2">
            {meals.map(meal => (
              <div key={meal.id} className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-white">{meal.name}</h4>
                  <p className="text-[11px] text-neutral-400">{meal.foodNames.join(', ')}</p>
                  <p className="text-[10px] text-neutral-500">{meal.dateISO}</p>
                  {meal.reactionSeverity ? (
                    <p className="text-[11px] text-rose-300 mt-1">Reaksiyon: {meal.reactionSeverity}/10{meal.reactionNote ? ` — ${meal.reactionNote}` : ''}</p>
                  ) : null}
                </div>
                <button onClick={() => removeMeal(meal.id)} className="p-1.5 rounded-lg text-neutral-600 hover:text-rose-400 hover:bg-rose-500/10 shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {meals.length === 0 && <p className="text-xs text-neutral-500 text-center py-6">Henüz öğün kaydı yok.</p>}
          </div>
        </div>
      )}

      {tab === 'recipes' && (
        <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 space-y-4">
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
            <input
              type="text"
              placeholder="Tarif adı"
              value={recipeName}
              onChange={e => setRecipeName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Malzemeler (virgülle ayır)"
              value={recipeIngredients}
              onChange={e => setRecipeIngredients(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Not (isteğe bağlı)"
              value={recipeNotes}
              onChange={e => setRecipeNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none"
            />
            <button onClick={handleAddRecipe} disabled={!recipeName.trim() || !recipeIngredients.trim()} className="px-4 py-2 rounded-xl bg-white text-neutral-950 font-semibold text-xs disabled:opacity-40 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Tarif Kaydet
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recipes.map(recipe => (
              <div key={recipe.id} className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white">{recipe.name}</h4>
                  <button onClick={() => removeRecipe(recipe.id)} className="p-1 rounded-lg text-neutral-600 hover:text-rose-400 hover:bg-rose-500/10">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-neutral-400">{recipe.ingredients.join(', ')}</p>
                {recipe.notes && <p className="text-[11px] text-neutral-500 italic">"{recipe.notes}"</p>}
              </div>
            ))}
            {recipes.length === 0 && <p className="text-xs text-neutral-500 text-center py-6 md:col-span-2">Henüz kayıtlı tarif yok.</p>}
          </div>
        </div>
      )}
    </div>
  );
};
