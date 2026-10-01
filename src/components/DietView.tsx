import React, { useState } from 'react';
import {
  Utensils,
  Plus,
  Trash2,
  Sparkles,
  Info,
  X,
  Check,
} from 'lucide-react';
import { DayLog, MealItem, MealType, UserProfile } from '../types';
import { MEAL_LABELS, PORTION_GUIDES, PRESET_FOODS } from '../utils/constants';
import { calculateDailyTotals } from '../utils/storage';

interface DietViewProps {
  dayLog: DayLog;
  profile: UserProfile;
  onUpdateDayLog: (updated: Partial<DayLog>) => void;
  onAskCoachQuestion: (question: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const DietView: React.FC<DietViewProps> = ({
  dayLog,
  profile,
  onUpdateDayLog,
  onAskCoachQuestion,
  onNavigateTab,
}) => {
  const { totalCalories, totalProtein, totalCarbs, totalFat } = calculateDailyTotals(dayLog);

  const [activeAddMeal, setActiveAddMeal] = useState<MealType | null>(null);
  const [showPortionGuide, setShowPortionGuide] = useState(false);
  const [customFood, setCustomFood] = useState({
    name: '',
    portion: '1 serving',
    calories: '',
    protein: '',
    isVeg: true,
  });
  const [addMode, setAddMode] = useState<'preset' | 'custom'>('preset');

  const caloriesRemaining = Math.max(0, profile.caloriesGoal - totalCalories);
  const proteinRemaining = Math.max(0, profile.proteinGoalGrams - totalProtein);

  const mealTypes: MealType[] = [
    'breakfast',
    'midMorning',
    'lunch',
    'eveningSnack',
    'dinner',
    'nightMeal',
  ];

  const handleAddPreset = (mealType: MealType, preset: Omit<MealItem, 'id'>) => {
    const newItem: MealItem = {
      ...preset,
      id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    const currentMeals = { ...dayLog.meals };
    currentMeals[mealType] = [...(currentMeals[mealType] || []), newItem];
    onUpdateDayLog({ meals: currentMeals });
    setActiveAddMeal(null);
  };

  const handleAddCustom = (mealType: MealType) => {
    if (!customFood.name.trim()) return;
    const newItem: MealItem = {
      id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: customFood.name.trim(),
      portion: customFood.portion.trim() || '1 serving',
      calories: parseInt(customFood.calories, 10) || 0,
      protein: parseInt(customFood.protein, 10) || 0,
      isVeg: customFood.isVeg,
    };
    const currentMeals = { ...dayLog.meals };
    currentMeals[mealType] = [...(currentMeals[mealType] || []), newItem];
    onUpdateDayLog({ meals: currentMeals });
    setCustomFood({ name: '', portion: '1 serving', calories: '', protein: '', isVeg: true });
    setActiveAddMeal(null);
  };

  const handleRemoveMealItem = (mealType: MealType, itemId: string) => {
    const currentMeals = { ...dayLog.meals };
    currentMeals[mealType] = (currentMeals[mealType] || []).filter((item) => item.id !== itemId);
    onUpdateDayLog({ meals: currentMeals });
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Top Banner & Targets (Glass Card) */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="text-2xl">🥗</span>
              <h2 className="text-2xl font-bold text-[#F5F7FA]">Diet & Nutrition Tracker</h2>
            </div>
            <p className="text-[#9AA8BC] text-xs sm:text-sm">
              Preference: <span className="text-[#00D9B5] font-semibold">{profile.dietaryPreference}</span> · Track your calories and protein balance.
            </p>
          </div>

          <button
            onClick={() => setShowPortionGuide(!showPortionGuide)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl glass-capsule text-[#00D9B5] hover:bg-white/[0.08] text-xs font-semibold active:scale-95 transition-all self-start sm:self-auto"
          >
            <Info className="w-4 h-4" />
            <span>Portion Guidance</span>
          </button>
        </div>

        {/* Nutritional Summary Progress Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Calories */}
          <div className="glass-panel-subtle rounded-2xl p-4 border border-white/[0.08]">
            <span className="text-[11px] font-bold text-[#66758A] uppercase tracking-wider">Calories</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-black text-[#F5F7FA]">{totalCalories}</span>
              <span className="text-xs text-[#9AA8BC]">/ {profile.caloriesGoal} kcal</span>
            </div>
            <div className="w-full bg-white/[0.06] rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#FFB020] to-[#FF5C6C] h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (totalCalories / profile.caloriesGoal) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-[#9AA8BC] mt-1.5 block">
              {caloriesRemaining > 0 ? `${caloriesRemaining} kcal remaining` : 'Daily budget reached'}
            </span>
          </div>

          {/* Protein */}
          <div className="glass-panel-subtle rounded-2xl p-4 border border-white/[0.08]">
            <span className="text-[11px] font-bold text-[#66758A] uppercase tracking-wider">Protein</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-black text-[#00D9B5]">{totalProtein}g</span>
              <span className="text-xs text-[#9AA8BC]">/ {profile.proteinGoalGrams}g</span>
            </div>
            <div className="w-full bg-white/[0.06] rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#00D9B5] to-[#20D68A] h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (totalProtein / profile.proteinGoalGrams) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-[#9AA8BC] mt-1.5 block">
              {proteinRemaining > 0 ? `${proteinRemaining}g remaining` : 'Target hit! 💪'}
            </span>
          </div>

          {/* Carbs */}
          <div className="glass-panel-subtle rounded-2xl p-4 border border-white/[0.08]">
            <span className="text-[11px] font-bold text-[#66758A] uppercase tracking-wider">Carbs</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-black text-[#00C8FF]">{totalCarbs}g</span>
              <span className="text-xs text-[#9AA8BC]">approx</span>
            </div>
            <div className="w-full bg-white/[0.06] rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div className="bg-[#00C8FF] h-full rounded-full" style={{ width: `${Math.min(100, (totalCarbs / 250) * 100)}%` }} />
            </div>
            <span className="text-[10px] text-[#9AA8BC] mt-1.5 block">Energy & grains</span>
          </div>

          {/* Fats */}
          <div className="glass-panel-subtle rounded-2xl p-4 border border-white/[0.08]">
            <span className="text-[11px] font-bold text-[#66758A] uppercase tracking-wider">Healthy Fats</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-black text-[#4D9FFF]">{totalFat}g</span>
              <span className="text-xs text-[#9AA8BC]">approx</span>
            </div>
            <div className="w-full bg-white/[0.06] rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div className="bg-[#4D9FFF] h-full rounded-full" style={{ width: `${Math.min(100, (totalFat / 65) * 100)}%` }} />
            </div>
            <span className="text-[10px] text-[#9AA8BC] mt-1.5 block">Nuts, seeds & oils</span>
          </div>
        </div>

        {/* Portion Guidance Drawer */}
        {showPortionGuide && (
          <div className="mt-6 p-5 rounded-2xl glass-panel-subtle border border-[#00D9B5]/30">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-[#00D9B5] flex items-center gap-2">
                <Info className="w-4 h-4" />
                Hand-Based Portion Measurement Guide
              </h4>
              <button
                onClick={() => setShowPortionGuide(false)}
                className="text-[#9AA8BC] hover:text-[#F5F7FA]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {PORTION_GUIDES.map((guide, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="font-semibold text-[#F5F7FA] mb-1">{guide.title}</p>
                  <p className="text-[#00D9B5] font-medium mb-1">{guide.portion}</p>
                  <p className="text-[#9AA8BC] text-[11px] leading-relaxed">{guide.tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Meal Sections: Transparent Meal Rows */}
      <div className="space-y-4">
        {mealTypes.map((mealType) => {
          const info = MEAL_LABELS[mealType];
          const items = dayLog.meals[mealType] || [];
          const mealCalories = items.reduce((acc, item) => acc + (item.calories || 0), 0);
          const mealProtein = items.reduce((acc, item) => acc + (item.protein || 0), 0);
          const isDinner = mealType === 'dinner';

          return (
            <div
              key={mealType}
              className="glass-panel rounded-2xl p-4 sm:p-5 transition-all hover:border-white/[0.16]"
            >
              {/* Meal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/[0.04] flex items-center justify-center text-lg border border-white/[0.08]">
                    {mealType === 'breakfast' && '🌅'}
                    {mealType === 'midMorning' && '🍵'}
                    {mealType === 'lunch' && '🍛'}
                    {mealType === 'eveningSnack' && '🥜'}
                    {mealType === 'dinner' && '🍲'}
                    {mealType === 'nightMeal' && '🥛'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#F5F7FA] text-base">{info.title}</h3>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.04] text-[#9AA8BC] border border-white/[0.06]">
                        {info.time}
                      </span>
                    </div>
                    <p className="text-xs text-[#9AA8BC]">{info.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {items.length > 0 && (
                    <div className="text-right text-xs">
                      <span className="font-bold text-[#F5F7FA]">{mealCalories} kcal</span>
                      <span className="text-[#00D9B5] ml-2 font-medium">({mealProtein}g protein)</span>
                    </div>
                  )}
                  <button
                    onClick={() => setActiveAddMeal(mealType)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00D9B5]/15 hover:bg-[#00D9B5]/25 text-[#00D9B5] font-semibold text-xs border border-[#00D9B5]/30 active:scale-95 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>

              {/* Logged Items List: Transparent Meal Rows */}
              {items.length > 0 ? (
                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.isVeg !== false ? 'bg-[#20D68A]' : 'bg-[#FF5C6C]'
                          }`}
                          title={item.isVeg !== false ? 'Vegetarian' : 'Non-veg'}
                        />
                        <div>
                          <p className="text-sm font-medium text-[#F5F7FA]">{item.name}</p>
                          <p className="text-xs text-[#9AA8BC]">{item.portion}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right text-xs">
                          <span className="font-semibold text-[#F5F7FA]">{item.calories} kcal</span>
                          <span className="text-[#00D9B5] ml-2 font-medium">{item.protein}g protein</span>
                        </div>
                        <button
                          onClick={() => handleRemoveMealItem(mealType, item.id)}
                          className="text-[#66758A] hover:text-[#FF5C6C] p-1 rounded-lg transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-3 text-center border-t border-white/[0.04] flex flex-col items-center justify-center">
                  <p className="text-xs text-[#66758A]">No items logged for {info.title.toLowerCase()} yet.</p>
                  {isDinner && (
                    <button
                      onClick={() => {
                        onNavigateTab('coach');
                        onAskCoachQuestion('What should I eat for dinner?');
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-medium"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ask AI Coach: "What should I eat for dinner?"</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Food Glass Modal */}
      {activeAddMeal && (
        <div className="fixed inset-0 bg-[#050B18]/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="glass-panel border border-white/[0.12] rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🥗</span>
                <h3 className="font-bold text-[#F5F7FA] text-lg">
                  Add to {MEAL_LABELS[activeAddMeal].title}
                </h3>
              </div>
              <button
                onClick={() => setActiveAddMeal(null)}
                className="text-[#9AA8BC] hover:text-[#F5F7FA] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab switch: Presets vs Custom */}
            <div className="flex items-center gap-2 my-3.5 p-1 rounded-2xl glass-panel-subtle border border-white/[0.08]">
              <button
                onClick={() => setAddMode('preset')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition ${
                  addMode === 'preset'
                    ? 'bg-[#00D9B5] text-[#050B18] shadow'
                    : 'text-[#9AA8BC] hover:text-[#F5F7FA]'
                }`}
              >
                Popular Healthy Options ({PRESET_FOODS[activeAddMeal]?.length || 0})
              </button>
              <button
                onClick={() => setAddMode('custom')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition ${
                  addMode === 'custom'
                    ? 'bg-[#00D9B5] text-[#050B18] shadow'
                    : 'text-[#9AA8BC] hover:text-[#F5F7FA]'
                }`}
              >
                Custom Food
              </button>
            </div>

            {/* Presets List */}
            {addMode === 'preset' ? (
              <div className="overflow-y-auto flex-1 space-y-2 pr-1">
                {(PRESET_FOODS[activeAddMeal] || []).map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleAddPreset(activeAddMeal, preset)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-[#00D9B5]/40 cursor-pointer transition group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${preset.isVeg ? 'bg-[#20D68A]' : 'bg-[#FF5C6C]'}`}
                        />
                        <p className="text-sm font-semibold text-[#F5F7FA] group-hover:text-[#00D9B5]">
                          {preset.name}
                        </p>
                      </div>
                      <p className="text-xs text-[#9AA8BC]">{preset.portion}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-[#F5F7FA] block">{preset.calories} kcal</span>
                      <span className="text-[11px] font-semibold text-[#00D9B5]">{preset.protein}g protein</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Custom food form */
              <div className="space-y-4 py-2 flex-1 overflow-y-auto">
                <div>
                  <label className="text-xs font-semibold text-[#9AA8BC] block mb-1">Food Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 Besan Chillas, Paneer Wrap..."
                    value={customFood.name}
                    onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-3.5 py-2 text-sm text-[#F5F7FA] focus:outline-none focus:border-[#00D9B5]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#9AA8BC] block mb-1">Portion Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 bowl (150g) / 2 pieces"
                    value={customFood.portion}
                    onChange={(e) => setCustomFood({ ...customFood, portion: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-3.5 py-2 text-sm text-[#F5F7FA] focus:outline-none focus:border-[#00D9B5]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#9AA8BC] block mb-1">Calories (kcal)</label>
                    <input
                      type="number"
                      placeholder="e.g. 280"
                      value={customFood.calories}
                      onChange={(e) => setCustomFood({ ...customFood, calories: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-3.5 py-2 text-sm text-[#F5F7FA] focus:outline-none focus:border-[#00D9B5]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#9AA8BC] block mb-1">Protein (grams)</label>
                    <input
                      type="number"
                      placeholder="e.g. 15"
                      value={customFood.protein}
                      onChange={(e) => setCustomFood({ ...customFood, protein: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-3.5 py-2 text-sm text-[#F5F7FA] focus:outline-none focus:border-[#00D9B5]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isVegCheck"
                    checked={customFood.isVeg}
                    onChange={(e) => setCustomFood({ ...customFood, isVeg: e.target.checked })}
                    className="w-4 h-4 rounded text-[#00D9B5] focus:ring-[#00D9B5]"
                  />
                  <label htmlFor="isVegCheck" className="text-xs text-[#9AA8BC]">
                    Vegetarian food
                  </label>
                </div>

                <button
                  onClick={() => handleAddCustom(activeAddMeal)}
                  disabled={!customFood.name.trim()}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00D9B5] to-[#00C8FF] hover:opacity-90 disabled:opacity-40 text-[#050B18] font-bold text-sm transition shadow-lg shadow-[#00D9B5]/25 active:scale-98"
                >
                  Save Food Item
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
