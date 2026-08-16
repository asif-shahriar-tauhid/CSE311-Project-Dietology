'use client';

import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Heart, Droplets, Flame, Zap, Moon, Wind, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import { cubicEase, staggerContainer, staggerItem } from '@/lib/animations';

function StatCard({ icon, label, value, unit, color, trend }: {
  icon: React.ReactNode; label: string; value: string; unit: string; color: string; trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2, ease: cubicEase } }}
      whileTap={{ scale: 0.98 }}
      className="glass rounded-2xl p-5 cursor-pointer"
      style={{ borderColor: 'rgba(148,163,184,0.08)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs" style={{ color: trend === 'up' ? '#EF4444' : '#10B981' }}>
            {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          </div>
        )}
      </div>
      <div className="mono text-2xl font-bold mb-0.5" style={{ color }}>{value}</div>
      <div className="text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>{label}</div>
      <div className="text-xs mono" style={{ color: 'rgba(148,163,184,0.4)' }}>{unit}</div>
    </motion.div>
  );
}

function MacroProgress({ name, consumed, target, unit, color }: any) {
  const pct = Math.min(((consumed || 0) / (target || 1)) * 100, 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-slate-200">{name}</span>
        <span className="mono text-xs" style={{ color }}>
          {consumed}<span style={{ color: 'rgba(148,163,184,0.4)' }}>/{target} {unit}</span>
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(148,163,184,0.1)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: cubicEase }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 text-xs" style={{ borderColor: 'rgba(148,163,184,0.15)' }}>
      <div className="font-semibold mb-1.5 text-white">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: 'rgba(148,163,184,0.7)' }}>{p.name}:</span>
          <span className="mono font-medium text-slate-200">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function Overview() {
  const user = useAuthStore((s) => s.user);

  const { data: biometrics } = useQuery({ queryKey: ['biometrics'], queryFn: api.getBiometrics });
  const { data: meals, refetch: refetchMeals } = useQuery({ queryKey: ['meals'], queryFn: api.getMeals });
  const { data: sleepLogs } = useQuery({ queryKey: ['sleep'], queryFn: api.getSleepLogs });
  const { data: environments } = useQuery({ queryKey: ['environments'], queryFn: api.getEnvironments });

  const biometricsList = Array.isArray(biometrics) ? biometrics : [];
  const mealsList = Array.isArray(meals) ? meals : [];
  const sleepLogsList = Array.isArray(sleepLogs) ? sleepLogs : [];
  const environmentsList = Array.isArray(environments) ? environments : [];

  const latestBiometric = biometricsList.length ? biometricsList[biometricsList.length - 1] : null;
  const todayMeals = mealsList.filter((m: any) => new Date(m.logged_at).toDateString() === new Date().toDateString());
  const latestSleep = sleepLogsList.length ? sleepLogsList[sleepLogsList.length - 1] : null;
  const latestEnvironment = environmentsList.length ? environmentsList[0] : null;

  // Calculate Macros
  const totalCalories = todayMeals.reduce((acc: number, m: any) => acc + parseFloat(m.calories_per_100g || 0) * (m.quantity_g / 100), 0);
  const totalProtein = todayMeals.reduce((acc: number, m: any) => acc + parseFloat(m.protein_g || 0) * (m.quantity_g / 100), 0);
  const totalCarbs = todayMeals.reduce((acc: number, m: any) => acc + parseFloat(m.carbs_g || 0) * (m.quantity_g / 100), 0);
  const totalFat = todayMeals.reduce((acc: number, m: any) => acc + parseFloat(m.fat_g || 0) * (m.quantity_g / 100), 0);
  const totalFiber = todayMeals.reduce((acc: number, m: any) => acc + parseFloat(m.fiber_g || 0) * (m.quantity_g / 100), 0);

  const MACRO_DATA = [
    { name: 'Calories', consumed: Math.round(totalCalories), target: 2200, unit: 'kcal', color: '#10B981' },
    { name: 'Protein', consumed: Math.round(totalProtein), target: 155, unit: 'g', color: '#6366F1' },
    { name: 'Carbs', consumed: Math.round(totalCarbs), target: 240, unit: 'g', color: '#14B8A6' },
    { name: 'Fat', consumed: Math.round(totalFat), target: 73, unit: 'g', color: '#F59E0B' },
    { name: 'Fiber', consumed: Math.round(totalFiber), target: 30, unit: 'g', color: '#8B5CF6' },
  ];

  const GLUCOSE_TREND = biometricsList.slice(-10).map((b: any) => ({
    time: new Date(b.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    glucose: parseFloat(b.blood_glucose_mg_dl) || 0,
    weight: parseFloat(b.weight_kg) || 0
  })) || [];

  const bmrToday = latestBiometric?.weight_kg ? Math.round(10 * parseFloat(latestBiometric.weight_kg) + 6.25 * (user?.height_cm || 170) - 5 * 30 + (user?.gender === 'male' ? 5 : -161)) : 1800;
  const totalBurn = bmrToday + 500;

  const handleDeleteMeal = async (id: number) => {
    try {
      await api.deleteMeal(id);
      refetchMeals();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: cubicEase }}
      >
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Good evening, {user?.full_name?.split(' ')[0] ?? 'User'} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(148,163,184,0.6)' }}>
          Here&apos;s your metabolic snapshot for today.
        </p>
      </motion.div>

      {/* Biometric stat cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard icon={<Droplets size={16} color="#14B8A6" />} label="Blood Glucose" value={latestBiometric?.blood_glucose_mg_dl || '--'} unit="mg/dL · latest" color="#14B8A6" />
        <StatCard icon={<Heart size={16} color="#EF4444" />} label="Resting Heart Rate" value={latestBiometric?.resting_heart_rate || '--'} unit="bpm · latest" color="#EF4444" />
        <StatCard icon={<Zap size={16} color="#10B981" />} label="BMR Today" value={bmrToday.toLocaleString()} unit="kcal/day estimated" color="#10B981" />
        <StatCard icon={<Flame size={16} color="#F59E0B" />} label="Total Burn" value={totalBurn.toLocaleString()} unit="kcal TDEE" color="#F59E0B" />
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Daily macro targets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: cubicEase }}
          className="glass rounded-2xl p-6"
          style={{ borderColor: 'rgba(148,163,184,0.08)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-sm text-white">Daily Nutrition Targets</h2>
            <span className="mono text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
              {Math.min(Math.round((totalCalories / 2200) * 100), 100)}% complete
            </span>
          </div>
          <div className="space-y-4">
            {MACRO_DATA.map((m) => <MacroProgress key={m.name} {...m} />)}
          </div>
        </motion.div>

        {/* Blood glucose chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: cubicEase }}
          className="glass rounded-2xl p-6 lg:col-span-2"
          style={{ borderColor: 'rgba(148,163,184,0.08)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-sm text-white">Blood Glucose History</h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ background: '#14B8A6' }} />
                Glucose (mg/dL)
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={GLUCOSE_TREND} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(148,163,184,0.06)" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'rgba(148,163,184,0.5)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(148,163,184,0.5)' }} axisLine={false} tickLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="glucose" stroke="#14B8A6" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#14B8A6' }} name="Glucose" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Meal timeline + Sleep/Env */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: cubicEase }}
          className="glass rounded-2xl p-6 lg:col-span-2"
          style={{ borderColor: 'rgba(148,163,184,0.08)' }}
        >
          <h2 className="font-semibold text-sm mb-5 text-white">Today&apos;s Meal Timeline</h2>
          <div className="space-y-3">
            {todayMeals.length === 0 ? (
              <div className="text-sm text-slate-400">No meals logged today.</div>
            ) : (
              <AnimatePresence>
                {todayMeals.map((meal: any, i: number) => {
                  const cal = Math.round(parseFloat(meal.calories_per_100g) * (meal.quantity_g / 100));
                  const color = meal.meal_type === 'Breakfast' ? '#F59E0B' : meal.meal_type === 'Lunch' ? '#10B981' : meal.meal_type === 'Snack' ? '#6366F1' : '#14B8A6';
                  return (
                    <motion.div
                      key={meal.meal_log_id || i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center gap-4 p-3 rounded-xl transition-colors group cursor-pointer"
                      style={{ background: 'rgba(11,15,23,0.4)', border: '1px solid rgba(148,163,184,0.05)' }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{ background: `${color}15`, color: color }}
                      >
                        {meal.meal_type?.charAt(0) || 'M'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-white">{meal.meal_type || 'Meal'}</span>
                          <span className="text-xs" style={{ color: 'rgba(148,163,184,0.45)' }}>
                            {new Date(meal.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-xs truncate" style={{ color: 'rgba(148,163,184,0.55)' }}>
                          {meal.food_name} ({meal.quantity_g}g)
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="mono text-sm font-semibold" style={{ color: color }}>{cal}</span>
                        <span className="text-xs" style={{ color: 'rgba(148,163,184,0.4)' }}>kcal</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteMeal(meal.meal_log_id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg cursor-pointer"
                          style={{ color: 'rgba(148,163,184,0.4)' }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(148,163,184,0.4)')}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
          <div className="mt-4 pt-4 flex justify-between items-center" style={{ borderTop: '1px solid rgba(148,163,184,0.07)' }}>
            <span className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>Total consumed</span>
            <span className="mono font-bold" style={{ color: '#10B981' }}>{Math.round(totalCalories)} / 2,200 kcal</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: cubicEase }}
          className="space-y-4"
        >
          {/* Sleep */}
          <div className="glass rounded-2xl p-5" style={{ borderColor: 'rgba(148,163,184,0.08)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Moon size={15} color="#6366F1" />
              <span className="text-sm font-semibold text-white">Last Night&apos;s Sleep</span>
            </div>
            <div className="flex gap-4">
              <div>
                <div className="mono text-2xl font-bold" style={{ color: '#6366F1' }}>
                  {latestSleep ? `${Math.floor(latestSleep.duration_minutes / 60)}h ${latestSleep.duration_minutes % 60}m` : '--'}
                </div>
                <div className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>Duration</div>
              </div>
              <div>
                <div className="mono text-2xl font-bold" style={{ color: '#8B5CF6' }}>{latestSleep?.sleep_quality_score || '--'}</div>
                <div className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>Quality /10</div>
              </div>
            </div>
            <div className="mt-3 text-xs px-2 py-1.5 rounded-lg" style={{ background: 'rgba(99,102,241,0.08)', color: '#6366F1' }}>
              Metabolic readiness: {latestSleep && parseFloat(latestSleep.sleep_quality_score) >= 8 ? 'High' : 'Moderate'}
            </div>
          </div>

          {/* Environment */}
          <div className="glass rounded-2xl p-5" style={{ borderColor: 'rgba(148,163,184,0.08)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Wind size={15} color="#F59E0B" />
              <span className="text-sm font-semibold text-white">Environmental Factors</span>
            </div>
            {latestEnvironment ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span style={{ color: 'rgba(148,163,184,0.6)' }}>Temperature</span>
                  <span className="mono font-medium text-slate-200">
                    {environmentsList.find((f: any) => f.factor_name === 'Temperature')?.factor_value || '--'}°C
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'rgba(148,163,184,0.6)' }}>Air Quality</span>
                  <span className="mono font-medium" style={{ color: '#10B981' }}>
                    AQI {environmentsList.find((f: any) => f.factor_name === 'Air Quality Index')?.factor_value || '--'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'rgba(148,163,184,0.6)' }}>Altitude</span>
                  <span className="mono font-medium text-slate-200">
                     {environmentsList.find((f: any) => f.factor_name === 'Altitude')?.factor_value || '--'} m
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">No active region data found.</div>
            )}
            <div className="mt-3 px-2 py-1.5 rounded-lg text-xs" style={{ background: 'rgba(245,158,11,0.08)', color: '#F59E0B' }}>
              Environmental data connected
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
