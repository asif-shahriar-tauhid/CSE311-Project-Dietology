'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, X, Dumbbell, Flame, Clock, Zap } from 'lucide-react';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cubicEase, staggerContainer, staggerItem } from '@/lib/animations';

const MUSCLE_GROUPS = [
  { name: 'Chest', sessions: 0, color: '#10B981' },
  { name: 'Back', sessions: 0, color: '#6366F1' },
  { name: 'Legs', sessions: 0, color: '#14B8A6' },
  { name: 'Shoulders', sessions: 0, color: '#F59E0B' },
  { name: 'Arms', sessions: 0, color: '#8B5CF6' },
  { name: 'Cardio', sessions: 0, color: '#EF4444' },
];

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner: '#10B981', Intermediate: '#F59E0B', Advanced: '#EF4444',
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs" style={{ borderColor: 'rgba(148,163,184,0.15)' }}>
      <div style={{ color: 'rgba(148,163,184,0.7)' }}>{label}</div>
      <div className="mono font-bold" style={{ color: '#10B981' }}>{payload[0].value} kcal</div>
    </div>
  );
};

function FitnessContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [selExercise, setSelExercise] = useState<any>(null);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(0);
  const [duration, setDuration] = useState(30);

  useEffect(() => {
    if (searchParams.get('log') === 'true') {
      setShowModal(true);
    }
  }, [searchParams]);

  const { data: exercisesData, isLoading: loadingExercises } = useQuery({ queryKey: ['exercises'], queryFn: api.getExercises });
  const { data: workoutsData, isLoading: loadingWorkouts } = useQuery({ queryKey: ['workouts'], queryFn: api.getWorkouts });

  const addWorkoutMutation = useMutation({
    mutationFn: api.addWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      setShowModal(false);
      setSelExercise(null);
      setSets(3);
      setReps(10);
      setWeight(0);
      setDuration(30);
    }
  });

  const exercises = Array.isArray(exercisesData) ? exercisesData : [];
  const logs = Array.isArray(workoutsData) ? workoutsData : [];

  const estCal = selExercise ? Math.round(parseFloat(selExercise.calories_burned_per_min || 0) * duration) : 0;

  const handleLogWorkout = () => {
    if (!selExercise) return;
    addWorkoutMutation.mutate({
      exercise_id: selExercise.exercise_id,
      sets_completed: sets,
      reps_completed: reps,
      weight_used_kg: weight,
      duration_minutes: duration,
      calories_burned: estCal,
    });
  };

  const last7Days = logs.filter((l: any) => {
    const diffTime = Math.abs(new Date().getTime() - new Date(l.logged_at).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 7;
  });

  const totalCals = last7Days.reduce((acc: number, curr: any) => acc + parseFloat(curr.calories_burned || 0), 0);
  const avgDuration = last7Days.length > 0 ? Math.round(last7Days.reduce((acc: number, curr: any) => acc + parseInt(curr.duration_minutes || 0), 0) / last7Days.length) : 0;
  const totalVolume = last7Days.reduce((acc: number, curr: any) => acc + (parseInt(curr.sets_completed || 0) * parseInt(curr.reps_completed || 0) * parseFloat(curr.weight_used_kg || 0)), 0);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const WEEKLY_BURN = weekDays.map(day => {
    const dayLogs = last7Days.filter((l: any) => new Date(l.logged_at).toLocaleDateString('en-US', { weekday: 'short' }) === day);
    const cal = dayLogs.reduce((acc: number, curr: any) => acc + parseFloat(curr.calories_burned || 0), 0);
    return { day, cal };
  });

  if (loadingExercises || loadingWorkouts) {
     return <div className="p-8 text-center text-slate-400">Loading fitness tracking...</div>;
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Fitness & Workouts</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(148,163,184,0.6)' }}>Goal-aligned training tracking and exercise analytics.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all glow-emerald cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #10B981, #14B8A6)', color: '#fff' }}
        >
          <Plus size={15} /> Log Workout
        </motion.button>
      </motion.div>

      {/* Weekly overview */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Weekly Workouts', value: `${last7Days.length}`, unit: 'sessions', color: '#10B981', icon: <Dumbbell size={15} color="#10B981" /> },
          { label: 'Calories Burned', value: `${Math.round(totalCals)}`, unit: 'kcal total logged', color: '#EF4444', icon: <Flame size={15} color="#EF4444" /> },
          { label: 'Avg Duration', value: `${avgDuration}`, unit: 'min per session', color: '#6366F1', icon: <Clock size={15} color="#6366F1" /> },
          { label: 'Training Volume', value: `${totalVolume.toLocaleString()}`, unit: 'kg total lifted', color: '#F59E0B', icon: <Zap size={15} color="#F59E0B" /> },
        ].map((s) => (
          <motion.div
            key={s.label}
            variants={staggerItem}
            whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2, ease: cubicEase } }}
            whileTap={{ scale: 0.98 }}
            className="glass rounded-2xl p-5 cursor-pointer"
            style={{ borderColor: 'rgba(148,163,184,0.08)' }}
          >
            <div className="flex items-center gap-2 mb-2">{s.icon}<span className="text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>{s.label}</span></div>
            <div className="mono text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mono" style={{ color: 'rgba(148,163,184,0.4)' }}>{s.unit}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly burn chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass rounded-2xl p-6 lg:col-span-2"
          style={{ borderColor: 'rgba(148,163,184,0.08)' }}
        >
          <h2 className="font-semibold text-sm mb-5 text-white">Weekly Calorie Burn</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={WEEKLY_BURN} margin={{ top: 4, right: 4, bottom: 4, left: -20 }} barSize={28}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(148,163,184,0.06)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'rgba(148,163,184,0.5)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(148,163,184,0.5)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="cal" fill="#10B981" radius={[6, 6, 0, 0]} fillOpacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Muscle group breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="glass rounded-2xl p-6"
          style={{ borderColor: 'rgba(148,163,184,0.08)' }}
        >
          <h2 className="font-semibold text-sm mb-4 text-white">Muscle Group Focus</h2>
          <div className="space-y-3">
            {MUSCLE_GROUPS.map((g) => (
              <div key={g.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-200">{g.name}</span>
                  <span className="mono text-xs" style={{ color: g.color }}>{g.sessions}x</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(148,163,184,0.1)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(g.sessions / 3) * 100}%` }}
                    transition={{ duration: 0.6, ease: cubicEase }}
                    className="h-full rounded-full"
                    style={{ background: g.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Exercise catalog + recent logs */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="glass rounded-2xl overflow-hidden"
          style={{ borderColor: 'rgba(148,163,184,0.08)' }}
        >
          <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(148,163,184,0.07)' }}>
            <h2 className="font-semibold text-sm text-white">Exercise Catalog</h2>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(148,163,184,0.04)' }}>
            {exercises.map((ex: any, i: number) => (
              <motion.div
                key={ex.exercise_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                className="flex items-center gap-4 px-6 py-3 hover:bg-emerald-500/5 transition-colors cursor-pointer"
                onClick={() => { setSelExercise(ex); setShowModal(true); }}
              >
                <div>
                  <div className="text-sm font-medium mb-0.5 text-white">{ex.exercise_name}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>{ex.muscle_group_name || 'General'}</span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded font-mono"
                      style={{ background: `${DIFFICULTY_COLOR[ex.difficulty_level] || '#64748B'}18`, color: DIFFICULTY_COLOR[ex.difficulty_level] || '#64748B' }}
                    >
                      {ex.difficulty_level || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <div className="mono text-xs font-medium" style={{ color: '#EF4444' }}>{parseFloat(ex.calories_burned_per_min)} kcal/min</div>
                </div>
              </motion.div>
            ))}
            {exercises.length === 0 && (
              <div className="px-6 py-8 text-center text-slate-400 text-sm">No exercises found in the catalog.</div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="glass rounded-2xl overflow-hidden"
          style={{ borderColor: 'rgba(148,163,184,0.08)' }}
        >
          <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(148,163,184,0.07)' }}>
            <h2 className="font-semibold text-sm text-white">Recent Workout Logs</h2>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
                {['Date', 'Exercise', 'Sets×Reps', 'Weight', 'Cal'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left mono font-medium" style={{ color: 'rgba(148,163,184,0.45)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 10).map((log: any, i: number) => (
                <motion.tr
                  key={log.exercise_log_id || i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  style={{ borderBottom: '1px solid rgba(148,163,184,0.04)' }}
                  className="hover:bg-emerald-500/5 transition-colors"
                >
                  <td className="px-4 py-3" style={{ color: 'rgba(148,163,184,0.6)' }}>
                    {new Date(log.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-200">{log.exercise_name}</td>
                  <td className="px-4 py-3 mono text-slate-300">{log.sets_completed}×{log.reps_completed}</td>
                  <td className="px-4 py-3 mono" style={{ color: '#6366F1' }}>{parseFloat(log.weight_used_kg) > 0 ? `${parseFloat(log.weight_used_kg)}kg` : 'BW'}</td>
                  <td className="px-4 py-3 mono" style={{ color: '#EF4444' }}>{Math.round(parseFloat(log.calories_burned))}</td>
                </motion.tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">No workout logs recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>
      </div>

      {/* Modal */}
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
                <h2 className="font-semibold text-white">Log Workout</h2>
                <button onClick={() => setShowModal(false)} className="cursor-pointer hover:text-white transition-colors" style={{ color: 'rgba(148,163,184,0.5)' }}>
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(148,163,184,0.7)' }}>Exercise</label>
                  <select
                    value={selExercise?.exercise_id ?? ''}
                    onChange={(e) => setSelExercise(exercises.find((x: any) => x.exercise_id === +e.target.value) ?? null)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
                    style={{ background: 'rgba(11,15,23,0.5)', border: '1px solid rgba(148,163,184,0.12)', color: '#E2E8F0' }}
                  >
                    <option value="" style={{ background: '#0F172A' }}>— Select exercise —</option>
                    {exercises.map((x: any) => (
                      <option key={x.exercise_id} value={x.exercise_id} style={{ background: '#0F172A' }}>
                        {x.exercise_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Sets', val: sets, set: setSets, min: 1, max: 10 },
                    { label: 'Reps', val: reps, set: setReps, min: 1, max: 30 },
                    { label: 'Weight (kg)', val: weight, set: setWeight, min: 0, max: 300 },
                    { label: 'Duration (min)', val: duration, set: setDuration, min: 5, max: 180 },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="text-xs font-medium mb-1.5 flex justify-between" style={{ color: 'rgba(148,163,184,0.7)' }}>
                        <span>{f.label}</span>
                        <span className="mono" style={{ color: '#10B981' }}>{f.val}</span>
                      </label>
                      <input
                        type="range"
                        min={f.min}
                        max={f.max}
                        value={f.val}
                        onChange={(e) => f.set(+e.target.value)}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
                {selExercise && (
                  <div className="p-3 rounded-xl flex items-center justify-between" style={{ background: 'rgba(11,15,23,0.4)' }}>
                    <div className="flex items-center gap-2">
                      <Flame size={14} color="#EF4444" />
                      <span className="text-xs text-slate-300">Estimated calories burned</span>
                    </div>
                    <span className="mono font-bold" style={{ color: '#EF4444' }}>{estCal} kcal</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
                  style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(148,163,184,0.12)', color: '#E2E8F0' }}
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleLogWorkout}
                  disabled={addWorkoutMutation.isPending || !selExercise}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #10B981, #14B8A6)', color: '#fff' }}
                >
                  {addWorkoutMutation.isPending ? 'Logging…' : 'Log Workout'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Fitness() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading fitness tracking...</div>}>
      <FitnessContent />
    </Suspense>
  );
}
