'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, X, Moon, Star, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cubicEase, staggerContainer, staggerItem } from '@/lib/animations';

const FACTORS = ['Caffeine', 'Screen Time', 'Late Meal', 'Cold Room', 'Stress', 'Exercise', 'Alcohol', 'Early Wake'];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 text-xs" style={{ borderColor: 'rgba(148,163,184,0.15)' }}>
      <div className="font-semibold mb-1.5 text-white">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: 'rgba(148,163,184,0.7)' }}>{p.name}:</span>
          <span className="mono font-medium text-slate-200">{p.value}{p.name.includes('uration') ? 'h' : '/10'}</span>
        </div>
      ))}
    </div>
  );
};

function SleepContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [sleepStart, setSleepStart] = useState('22:30');
  const [sleepEnd, setSleepEnd] = useState('06:15');
  const [quality, setQuality] = useState(8);

  useEffect(() => {
    if (searchParams.get('log') === 'true') {
      setShowModal(true);
    }
  }, [searchParams]);

  const { data: sleepLogsData, isLoading } = useQuery({ queryKey: ['sleep'], queryFn: api.getSleepLogs });

  const addSleepMutation = useMutation({
    mutationFn: api.addSleepLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sleep'] });
      setShowModal(false);
      setSelectedFactors([]);
      setSleepStart('22:30');
      setSleepEnd('06:15');
      setQuality(8);
    }
  });

  const toggleFactor = (f: string) =>
    setSelectedFactors(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const rawLogs = Array.isArray(sleepLogsData) ? sleepLogsData : [];
  const logs = rawLogs.map((log: any) => {
    const durationHours = log.duration_minutes ? +(parseInt(log.duration_minutes) / 60).toFixed(1) : 0;
    const qScore = log.sleep_quality_score ? parseFloat(log.sleep_quality_score) : 0;

    let factorsList: string[] = [];
    if (Array.isArray(log.factors)) {
       factorsList = log.factors.map((f: any) => typeof f === 'string' ? f : f.factor_name);
    }

    return {
      date: new Date(log.sleep_start || log.logged_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      duration: durationHours,
      quality: qScore,
      deep: +(durationHours * 0.25).toFixed(1),
      rem: +(durationHours * 0.28).toFixed(1),
      factors: factorsList,
    };
  });

  const avg = {
    duration: logs.length ? +(logs.reduce((a: number, b: any) => a + b.duration, 0) / logs.length).toFixed(1) : 0,
    quality: logs.length ? +(logs.reduce((a: number, b: any) => a + b.quality, 0) / logs.length).toFixed(1) : 0,
  };

  const latest = logs.length > 0 ? logs[logs.length - 1] : { duration: 0, quality: 0, deep: 0, rem: 0, factors: [] };
  const qualityColor = quality >= 8 ? '#10B981' : quality >= 6 ? '#F59E0B' : '#EF4444';

  const handleLogSleep = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const [startH, startM] = sleepStart.split(':');
    const [endH, endM] = sleepEnd.split(':');

    yesterday.setHours(parseInt(startH), parseInt(startM), 0);
    today.setHours(parseInt(endH), parseInt(endM), 0);

    if (parseInt(startH) < 12) {
       yesterday.setDate(yesterday.getDate() + 1);
    }

    addSleepMutation.mutate({
      sleep_start: yesterday.toISOString().slice(0, 19).replace('T', ' '),
      sleep_end: today.toISOString().slice(0, 19).replace('T', ' '),
      quality_score: quality,
      factors: selectedFactors,
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Loading sleep data...</div>;
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Sleep & Recovery Lab</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(148,163,184,0.6)' }}>Sleep duration, quality, and metabolic recovery correlation.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all glow-emerald cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #10B981, #14B8A6)', color: '#fff' }}
        >
          <Plus size={15} /> Log Sleep
        </motion.button>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Last Night', value: latest.duration > 0 ? `${latest.duration}h` : '--', unit: 'total duration', color: '#6366F1', icon: <Clock size={15} color="#6366F1" /> },
          { label: 'Quality Score', value: latest.quality > 0 ? `${latest.quality}` : '--', unit: '/10 · Score', color: '#10B981', icon: <Star size={15} color="#10B981" /> },
          { label: 'Deep Sleep', value: latest.deep > 0 ? `${latest.deep}h` : '--', unit: 'restorative sleep', color: '#8B5CF6', icon: <Moon size={15} color="#8B5CF6" /> },
          { label: 'Weekly Avg', value: avg.duration > 0 ? `${avg.duration}h` : '--', unit: `${avg.quality > 0 ? avg.quality : '--'}/10 avg`, color: '#14B8A6', icon: <Moon size={15} color="#14B8A6" /> },
        ].map(s => (
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
            <div className="text-xs" style={{ color: 'rgba(148,163,184,0.4)' }}>{s.unit}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="glass rounded-2xl p-6"
        style={{ borderColor: 'rgba(148,163,184,0.08)' }}
      >
        <h2 className="font-semibold text-sm mb-5 text-white">Sleep Duration & Quality Trend</h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={logs} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
            <defs>
              <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="qualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="rgba(148,163,184,0.06)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(148,163,184,0.5)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'rgba(148,163,184,0.5)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="duration" stroke="#6366F1" strokeWidth={2} fill="url(#sleepGrad)" name="Duration" />
            <Area type="monotone" dataKey="quality" stroke="#10B981" strokeWidth={2} fill="url(#qualGrad)" name="Quality" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Sleep log table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="glass rounded-2xl overflow-hidden"
        style={{ borderColor: 'rgba(148,163,184,0.08)' }}
      >
        <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(148,163,184,0.07)' }}>
          <h2 className="font-semibold text-sm text-white">Sleep Log History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
                {['Date', 'Duration', 'Quality', 'Deep Sleep', 'REM', 'Factors'].map(h => (
                  <th key={h} className="px-6 py-3 text-left mono font-medium" style={{ color: 'rgba(148,163,184,0.45)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...logs].reverse().map((log: any, i: number) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  style={{ borderBottom: '1px solid rgba(148,163,184,0.04)' }}
                  className="hover:bg-indigo-500/5 transition-colors"
                >
                  <td className="px-6 py-3 font-medium text-slate-200">{log.date}</td>
                  <td className="px-6 py-3 mono" style={{ color: '#6366F1' }}>{log.duration}h</td>
                  <td className="px-6 py-3 mono" style={{ color: log.quality >= 8 ? '#10B981' : log.quality >= 6 ? '#F59E0B' : '#EF4444' }}>{log.quality}/10</td>
                  <td className="px-6 py-3 mono" style={{ color: '#8B5CF6' }}>{log.deep}h</td>
                  <td className="px-6 py-3 mono" style={{ color: '#14B8A6' }}>{log.rem}h</td>
                  <td className="px-6 py-3">
                    <div className="flex flex-wrap gap-1">
                      {log.factors.map((f: string) => (
                        <span key={f} className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>{f}</span>
                      ))}
                      {log.factors.length === 0 && <span style={{ color: 'rgba(148,163,184,0.35)' }}>No factors</span>}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">No sleep logs recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

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
              style={{ borderColor: 'rgba(99,102,241,0.3)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-white">Log Sleep</h2>
                <button onClick={() => setShowModal(false)} className="cursor-pointer hover:text-white transition-colors" style={{ color: 'rgba(148,163,184,0.5)' }}>
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(148,163,184,0.7)' }}>Sleep Start</label>
                    <input
                      type="time"
                      value={sleepStart}
                      onChange={e => setSleepStart(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: 'rgba(11,15,23,0.5)', border: '1px solid rgba(148,163,184,0.12)', color: '#E2E8F0' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(148,163,184,0.7)' }}>Wake Time</label>
                    <input
                      type="time"
                      value={sleepEnd}
                      onChange={e => setSleepEnd(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: 'rgba(11,15,23,0.5)', border: '1px solid rgba(148,163,184,0.12)', color: '#E2E8F0' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-2 flex justify-between" style={{ color: 'rgba(148,163,184,0.7)' }}>
                    <span>Sleep Quality</span>
                    <span className="mono font-bold" style={{ color: qualityColor }}>{quality}/10</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={quality}
                    onChange={e => setQuality(+e.target.value)}
                    className="w-full cursor-pointer"
                    style={{ accentColor: qualityColor }}
                  />
                  <div className="flex justify-between text-xs mt-1" style={{ color: 'rgba(148,163,184,0.4)' }}>
                    <span>Poor</span><span>Excellent</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-2 block" style={{ color: 'rgba(148,163,184,0.7)' }}>Contributing Factors</label>
                  <div className="flex flex-wrap gap-2">
                    {FACTORS.map(f => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => toggleFactor(f)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer"
                        style={{
                          background: selectedFactors.includes(f) ? 'rgba(245,158,11,0.15)' : 'rgba(30,41,59,0.4)',
                          border: `1px solid ${selectedFactors.includes(f) ? 'rgba(245,158,11,0.4)' : 'rgba(148,163,184,0.08)'}`,
                          color: selectedFactors.includes(f) ? '#F59E0B' : 'rgba(148,163,184,0.6)',
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
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
                  onClick={handleLogSleep}
                  disabled={addSleepMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: '#fff' }}
                >
                  {addSleepMutation.isPending ? 'Logging…' : 'Log Sleep'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Sleep() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading sleep tracker...</div>}>
      <SleepContent />
    </Suspense>
  );
}
