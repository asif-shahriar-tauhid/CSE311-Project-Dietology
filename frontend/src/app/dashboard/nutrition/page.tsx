'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, X, Search, Leaf } from 'lucide-react';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pushAppNotification } from '@/lib/utils';
import { cubicEase, staggerContainer, staggerItem } from '@/lib/animations';

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs" style={{ borderColor: 'rgba(148,163,184,0.15)' }}>
      <span style={{ color: p.payload.color }}>{p.name}: </span>
      <span className="mono font-semibold text-white">{Math.round(p.value)} kcal</span>
    </div>
  );
};

function GIBadge({ value }: { value: number | null }) {
  if (value === null || value === undefined) return <span className="mono text-xs px-1.5 py-0.5 rounded" style={{ background: '#64748B18', color: '#64748B' }}>N/A</span>;
  const { color, label } = value === 0
    ? { color: '#64748B', label: 'N/A' }
    : value < 35
    ? { color: '#10B981', label: `Low ${value}` }
    : value < 55
    ? { color: '#F59E0B', label: `Med ${value}` }
    : { color: '#EF4444', label: `High ${value}` };
  return <span className="mono text-xs px-1.5 py-0.5 rounded" style={{ background: `${color}18`, color }}>{label}</span>;
}

function NutritionContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [qty, setQty] = useState(100);
  const [mealType, setMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Lunch');
  const [targetProtein, setTargetProtein] = useState(155);
  const [targetCarbs, setTargetCarbs] = useState(240);
  const [targetFat, setTargetFat] = useState(73);

  const { data: foodsData, isLoading: loadingFoods } = useQuery({ queryKey: ['foods'], queryFn: api.getFoods });
  const { data: mealsData } = useQuery({ queryKey: ['meals'], queryFn: api.getMeals });

  const addMealMutation = useMutation({
    mutationFn: api.addMeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      pushAppNotification(
        'Meal Logged',
        `Logged ${selectedFood?.food_name || 'Meal'} (${qty}g) successfully.`,
        'nutrition'
      );
      setShowModal(false);
      setSelectedFood(null);
      setQty(100);
    }
  });

  const foods = Array.isArray(foodsData) ? foodsData : [];
  const meals = Array.isArray(mealsData) ? mealsData : [];

  const todayMealsFiltered = meals.filter((m: any) => {
    if (!m.logged_at) return true;
    const dateStr = typeof m.logged_at === 'string' ? m.logged_at.replace(' ', 'T') : m.logged_at;
    const logDate = new Date(dateStr);
    return isNaN(logDate.getTime()) || logDate.toDateString() === new Date().toDateString();
  });

  const todayMeals = todayMealsFiltered.length > 0 ? todayMealsFiltered : meals;

  const totalProtein = todayMeals.reduce((acc: number, m: any) => {
    if (m.protein !== undefined && m.protein !== null) return acc + parseFloat(m.protein);
    return acc + (parseFloat(m.protein_g || 0) * (parseFloat(m.quantity_g || 100) / 100));
  }, 0);

  const totalCarbs = todayMeals.reduce((acc: number, m: any) => {
    if (m.carbs !== undefined && m.carbs !== null) return acc + parseFloat(m.carbs);
    return acc + (parseFloat(m.carbs_g || 0) * (parseFloat(m.quantity_g || 100) / 100));
  }, 0);

  const totalFat = todayMeals.reduce((acc: number, m: any) => {
    if (m.fat !== undefined && m.fat !== null) return acc + parseFloat(m.fat);
    return acc + (parseFloat(m.fat_g || 0) * (parseFloat(m.quantity_g || 100) / 100));
  }, 0);

  const totalFiber = todayMeals.reduce((acc: number, m: any) => {
    if (m.fiber !== undefined && m.fiber !== null) return acc + parseFloat(m.fiber);
    return acc + (parseFloat(m.fiber_g || 0) * (parseFloat(m.quantity_g || 100) / 100));
  }, 0);

  const MACRO_TOTALS = { protein: totalProtein, carbs: totalCarbs, fat: totalFat, fiber: totalFiber };

  const PIE_DATA = [
    { name: 'Protein', value: MACRO_TOTALS.protein * 4, color: '#10B981' },
    { name: 'Carbs', value: MACRO_TOTALS.carbs * 4, color: '#6366F1' },
    { name: 'Fat', value: MACRO_TOTALS.fat * 9, color: '#F59E0B' },
  ];

  const TOTAL_CAL = PIE_DATA.reduce((a, b) => a + b.value, 0) || 0;

  const filtered = foods.filter((f: any) =>
    f.food_name?.toLowerCase().includes(search.toLowerCase()) ||
    f.category_name?.toLowerCase().includes(search.toLowerCase())
  );

  const liveMacros = selectedFood ? {
    cal: Math.round((parseFloat(selectedFood.calories_per_100g || 0) * qty) / 100),
    protein: +((parseFloat(selectedFood.protein_g || 0) * qty) / 100).toFixed(1),
    carbs: +((parseFloat(selectedFood.carbs_g || 0) * qty) / 100).toFixed(1),
    fat: +((parseFloat(selectedFood.fat_g || 0) * qty) / 100).toFixed(1),
  } : null;

  const handleLogMeal = () => {
    if (!selectedFood) return;
    addMealMutation.mutate({
      food_id: selectedFood.food_id,
      meal_type: mealType,
      quantity_g: qty,
      logged_at: new Date().toISOString(),
    });
  };

  const deleteMealMutation = useMutation({
    mutationFn: api.deleteMeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
    }
  });

  if (loadingFoods) {
    return <div className="p-8 text-center text-slate-400">Loading nutrition catalog...</div>;
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: cubicEase }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Nutrition & Meals</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(148,163,184,0.6)' }}>Food catalog, meal logging, and macro tracking.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { setSelectedFood(foods[0] || null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all glow-emerald cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #10B981, #14B8A6)', color: '#fff' }}
        >
          <Plus size={15} /> Log Meal
        </motion.button>
      </motion.div>

      {/* Macro summary */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass rounded-2xl p-6"
          style={{ borderColor: 'rgba(148,163,184,0.08)' }}
        >
          <h2 className="font-semibold text-sm mb-4 text-white">Today&apos;s Macro Split</h2>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={100} height={100}>
              <PieChart>
                <Pie data={TOTAL_CAL > 0 ? PIE_DATA : [{value: 1, color: '#334155'}]} cx="50%" cy="50%" innerRadius={32} outerRadius={46} paddingAngle={3} dataKey="value">
                  {TOTAL_CAL > 0 ? PIE_DATA.map((d, i) => <Cell key={i} fill={d.color} />) : <Cell fill="#334155" />}
                </Pie>
                {TOTAL_CAL > 0 && <Tooltip content={<CustomTooltip />} />}
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {PIE_DATA.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    <span style={{ color: 'rgba(148,163,184,0.7)' }}>{d.name}</span>
                  </div>
                  <span className="mono font-medium" style={{ color: d.color }}>
                    {TOTAL_CAL > 0 ? Math.round((d.value / TOTAL_CAL) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass rounded-2xl p-6 lg:col-span-2"
          style={{ borderColor: 'rgba(148,163,184,0.08)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm text-white">Daily Targets</h2>
            <span className="text-xs" style={{ color: 'rgba(148,163,184,0.4)' }}>Drag sliders to adjust</span>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Protein', actual: Math.round(MACRO_TOTALS.protein), target: targetProtein, set: setTargetProtein, color: '#10B981', max: 300 },
              { label: 'Carbs', actual: Math.round(MACRO_TOTALS.carbs), target: targetCarbs, set: setTargetCarbs, color: '#6366F1', max: 500 },
              { label: 'Fat', actual: Math.round(MACRO_TOTALS.fat), target: targetFat, set: setTargetFat, color: '#F59E0B', max: 200 },
            ].map(m => (
              <div key={m.label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-medium text-slate-200">{m.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="mono text-xs" style={{ color: m.color }}>{m.actual}g</span>
                    <span className="text-xs" style={{ color: 'rgba(148,163,184,0.4)' }}>/ {m.target}g</span>
                  </div>
                </div>
                <div className="relative">
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(148,163,184,0.1)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(((m.actual || 0) / m.target) * 100, 100)}%` }}
                      transition={{ duration: 0.6, ease: cubicEase }}
                      className="h-full rounded-full"
                      style={{ background: m.color }}
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={50}
                  max={m.max}
                  value={m.target}
                  onChange={e => m.set(+e.target.value)}
                  className="w-full mt-1 accent-emerald-500 h-1 cursor-pointer"
                  style={{ accentColor: m.color }}
                />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Food catalog table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="glass rounded-2xl overflow-hidden"
        style={{ borderColor: 'rgba(148,163,184,0.08)' }}
      >
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(148,163,184,0.07)' }}>
          <div>
            <h2 className="font-semibold text-sm text-white">Food Catalog</h2>
            <p className="text-xs text-slate-400">Click any row to quickly log a meal.</p>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(148,163,184,0.4)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search foods…"
              className="pl-8 pr-4 py-2 rounded-lg text-xs outline-none w-48 transition-all focus:border-emerald-500/50"
              style={{ background: 'rgba(11,15,23,0.5)', border: '1px solid rgba(148,163,184,0.1)', color: '#E2E8F0' }}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
                {['Food', 'Category', 'Cal/100g', 'Protein', 'Carbs', 'Fat', 'GI', 'Avail.'].map(h => (
                  <th key={h} className="px-4 py-3 text-left mono font-medium" style={{ color: 'rgba(148,163,184,0.45)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((f: any, i: number) => (
                <motion.tr
                  key={f.food_id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  onClick={() => { setSelectedFood(f); setShowModal(true); }}
                  className="cursor-pointer hover:bg-emerald-500/10 transition-colors"
                  style={{ borderBottom: '1px solid rgba(148,163,184,0.04)' }}
                >
                  <td className="px-4 py-3 font-medium text-slate-200">{f.food_name}</td>
                  <td className="px-4 py-3" style={{ color: 'rgba(148,163,184,0.55)' }}>{f.category_name || 'N/A'}</td>
                  <td className="px-4 py-3 mono" style={{ color: '#10B981' }}>{parseFloat(f.calories_per_100g)}</td>
                  <td className="px-4 py-3 mono" style={{ color: '#10B981' }}>{parseFloat(f.protein_g)}g</td>
                  <td className="px-4 py-3 mono" style={{ color: '#6366F1' }}>{parseFloat(f.carbs_g)}g</td>
                  <td className="px-4 py-3 mono" style={{ color: '#F59E0B' }}>{parseFloat(f.fat_g)}g</td>
                  <td className="px-4 py-3"><GIBadge value={f.glycemic_index !== null ? parseInt(f.glycemic_index) : null} /></td>
                  <td className="px-4 py-3">
                    {f.availability_score ? (
                      <div className="flex items-center gap-1.5">
                        <Leaf size={10} color="#14B8A6" />
                        <span className="mono" style={{ color: '#14B8A6' }}>{f.availability_score}</span>
                      </div>
                    ) : '--'}
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">No foods found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Logged Meals List */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="glass rounded-2xl overflow-hidden"
        style={{ borderColor: 'rgba(148,163,184,0.08)' }}
      >
        <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(148,163,184,0.07)' }}>
          <h2 className="font-semibold text-sm text-white">Meal Log History</h2>
        </div>
        <div className="divide-y" style={{ borderColor: 'rgba(148,163,184,0.04)' }}>
          <AnimatePresence>
            {meals.map((m: any, i: number) => {
              const cal = Math.round(m.calories ?? (parseFloat(m.calories_per_100g || 0) * (m.quantity_g / 100)));
              const p = Math.round(m.protein ?? (parseFloat(m.protein_g || 0) * (m.quantity_g / 100)));
              const c = Math.round(m.carbs ?? (parseFloat(m.carbs_g || 0) * (m.quantity_g / 100)));
              const f = Math.round(m.fat ?? (parseFloat(m.fat_g || 0) * (m.quantity_g / 100)));
              return (
                <motion.div
                  key={m.meal_log_id || i}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-800/30 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{m.meal_type || 'Meal'}</span>
                      <span className="text-xs text-slate-400">• {m.food_name} ({m.quantity_g}g)</span>
                    </div>
                    <div className="flex gap-3 text-xs mt-1 text-slate-400">
                      <span style={{ color: '#10B981' }}>P: {p}g</span>
                      <span style={{ color: '#6366F1' }}>C: {c}g</span>
                      <span style={{ color: '#F59E0B' }}>F: {f}g</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="mono font-bold text-emerald-400 text-sm">{cal} kcal</span>
                    <button
                      onClick={() => deleteMealMutation.mutate(m.meal_log_id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {meals.length === 0 && (
            <div className="p-6 text-center text-slate-400 text-sm">No meals logged yet.</div>
          )}
        </div>
      </motion.div>

      {/* Meal log modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.25, ease: cubicEase }}
              className="glass rounded-2xl p-6 w-full max-w-md shadow-2xl"
              style={{ borderColor: 'rgba(16,185,129,0.2)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-white">Log a Meal</h2>
                <button onClick={() => setShowModal(false)} className="cursor-pointer hover:text-white transition-colors" style={{ color: 'rgba(148,163,184,0.5)' }}>
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(148,163,184,0.7)' }}>Select Food</label>
                  <select
                    value={selectedFood?.food_id ?? ''}
                    onChange={e => setSelectedFood(foods.find((f: any) => f.food_id === +e.target.value) ?? null)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
                    style={{ background: 'rgba(11,15,23,0.5)', border: '1px solid rgba(148,163,184,0.12)', color: '#E2E8F0' }}
                  >
                    <option value="" style={{ background: '#0F172A' }}>— Choose food —</option>
                    {foods.map((f: any) => <option key={f.food_id} value={f.food_id} style={{ background: '#0F172A' }}>{f.food_name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium mb-1.5 flex justify-between" style={{ color: 'rgba(148,163,184,0.7)' }}>
                    <span>Quantity</span><span className="mono" style={{ color: '#10B981' }}>{qty}g</span>
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={500}
                    value={qty}
                    onChange={e => setQty(+e.target.value)}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(148,163,184,0.7)' }}>Meal Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setMealType(t)}
                        className="py-2 rounded-lg text-xs font-medium transition-all cursor-pointer"
                        style={{
                          background: mealType === t ? 'rgba(16,185,129,0.15)' : 'rgba(30,41,59,0.4)',
                          border: `1px solid ${mealType === t ? 'rgba(16,185,129,0.4)' : 'rgba(148,163,184,0.08)'}`,
                          color: mealType === t ? '#10B981' : 'rgba(148,163,184,0.6)',
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {liveMacros && (
                  <div className="grid grid-cols-4 gap-2 p-3 rounded-xl" style={{ background: 'rgba(11,15,23,0.4)' }}>
                    {[
                      { label: 'Calories', value: liveMacros.cal, unit: 'kcal', color: '#10B981' },
                      { label: 'Protein', value: liveMacros.protein, unit: 'g', color: '#6366F1' },
                      { label: 'Carbs', value: liveMacros.carbs, unit: 'g', color: '#14B8A6' },
                      { label: 'Fat', value: liveMacros.fat, unit: 'g', color: '#F59E0B' },
                    ].map(m => (
                      <div key={m.label} className="text-center">
                        <div className="mono font-bold text-sm" style={{ color: m.color }}>{m.value}</div>
                        <div className="text-xs" style={{ color: 'rgba(148,163,184,0.45)' }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
                  style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(148,163,184,0.12)', color: '#E2E8F0' }}
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleLogMeal}
                  disabled={addMealMutation.isPending || !selectedFood}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #10B981, #14B8A6)', color: '#fff' }}
                >
                  {addMealMutation.isPending ? 'Logging…' : 'Log Meal'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Nutrition() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading nutrition catalog...</div>}>
      <NutritionContent />
    </Suspense>
  );
}
