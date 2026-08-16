'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Plus, X, Activity, Heart, Droplets } from 'lucide-react';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cubicEase, staggerContainer, staggerItem } from '@/lib/animations';

const RANGES = ['7D', '30D', '90D'] as const;

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 text-xs" style={{ borderColor: 'rgba(148,163,184,0.15)' }}>
      <div className="font-semibold mb-2">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: 'rgba(148,163,184,0.7)' }}>{p.name}:</span>
          <span className="mono font-medium">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

function InputField({ label, value, onChange, unit, type = 'number' }: {
  label: string; value: string; onChange: (v: string) => void; unit: string; type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium mb-1.5 flex justify-between">
        <span style={{ color: 'rgba(148,163,184,0.7)' }}>{label}</span>
        <span className="mono" style={{ color: 'rgba(148,163,184,0.4)' }}>{unit}</span>
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="—"
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{ background: 'rgba(11,15,23,0.5)', border: '1px solid rgba(148,163,184,0.12)', color: '#E2E8F0' }}
        onFocus={e => (e.target.style.borderColor = 'rgba(16,185,129,0.5)')}
        onBlur={e => (e.target.style.borderColor = 'rgba(148,163,184,0.12)')}
      />
    </div>
  );
}

function BiometricsContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [range, setRange] = useState<typeof RANGES[number]>('30D');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ weight: '', fat: '', glucose: '', systolic: '', diastolic: '', hr: '' });
  const upd = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (searchParams.get('log') === 'true') {
      setShowModal(true);
    }
  }, [searchParams]);

  const { data: biometricsRaw, isLoading } = useQuery({ queryKey: ['biometrics'], queryFn: api.getBiometrics });
  const { data: sensitivityLevelsRaw } = useQuery({ queryKey: ['sensitivity-levels'], queryFn: api.getSensitivityLevels });

  const addMutation = useMutation({
    mutationFn: api.addBiometric,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biometrics'] });
      setShowModal(false);
      setForm({ weight: '', fat: '', glucose: '', systolic: '', diastolic: '', hr: '' });
    },
  });

  const history = (Array.isArray(biometricsRaw) ? biometricsRaw : []).map((b: any) => ({
    date: new Date(b.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: parseFloat(b.weight_kg),
    glucose: parseFloat(b.blood_glucose_mg_dl),
    bp_s: parseInt(b.blood_pressure_systolic, 10),
    bp_d: parseInt(b.blood_pressure_diastolic, 10),
    hr: parseInt(b.resting_heart_rate, 10),
    fat: parseFloat(b.body_fat_pct),
  }));

  const latest = history.length > 0 ? history[history.length - 1] : {
    weight: 0, glucose: 0, bp_s: 0, bp_d: 0, hr: 0, fat: 0
  };

  const glucoseStatus = latest.glucose === 0 ? { label: 'No Data', color: '#94A3B8' } : latest.glucose < 100 ? { label: 'Normal', color: '#10B981' } : latest.glucose < 126 ? { label: 'Pre-diabetic Range', color: '#F59E0B' } : { label: 'Elevated', color: '#EF4444' };

  const sensitivityLevels = (Array.isArray(sensitivityLevelsRaw) ? sensitivityLevelsRaw : []).map((l: any) => ({
    id: l.insulin_sensitivity_level_id,
    label: l.level_name,
    desc: l.description,
    color: l.level_name.includes('Resistant') ? '#EF4444' : l.level_name.includes('High') ? '#14B8A6' : '#10B981'
  }));

  const handleSave = () => {
    addMutation.mutate({
      weight_kg: form.weight || latest.weight,
      body_fat_pct: form.fat || latest.fat,
      blood_glucose_mg_dl: form.glucose || latest.glucose,
      blood_pressure_systolic: form.systolic || latest.bp_s,
      blood_pressure_diastolic: form.diastolic || latest.bp_d,
      resting_heart_rate: form.hr || latest.hr,
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Loading biometrics...</div>;
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Biometrics Hub</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(148,163,184,0.6)' }}>Clinical tracking of metabolic health markers over time.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all glow-emerald cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #10B981, #14B8A6)', color: '#fff' }}
        >
          <Plus size={15} /> Add Biometrics
        </motion.button>
      </motion.div>

      {/* Latest stat cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Weight', value: latest.weight > 0 ? `${latest.weight}` : '--', unit: 'kg', color: '#10B981', icon: <Activity size={15} color="#10B981" /> },
          { label: 'Blood Glucose', value: latest.glucose > 0 ? `${latest.glucose}` : '--', unit: 'mg/dL', color: glucoseStatus.color, icon: <Droplets size={15} color={glucoseStatus.color} /> },
          { label: 'Blood Pressure', value: latest.bp_s > 0 ? `${latest.bp_s}/${latest.bp_d}` : '--', unit: 'mmHg', color: '#6366F1', icon: <Heart size={15} color="#6366F1" /> },
          { label: 'Heart Rate', value: latest.hr > 0 ? `${latest.hr}` : '--', unit: 'bpm', color: '#EF4444', icon: <Heart size={15} color="#EF4444" /> },
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
            <div className="text-xs mono" style={{ color: 'rgba(148,163,184,0.4)' }}>{s.unit}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: cubicEase }}
        className="glass rounded-2xl p-6"
        style={{ borderColor: 'rgba(148,163,184,0.08)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-white">Trend Analysis</h2>
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'rgba(11,15,23,0.5)' }}>
            {RANGES.map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className="px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer"
                style={{ background: range === r ? '#10B981' : 'transparent', color: range === r ? '#fff' : 'rgba(148,163,184,0.6)' }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={history} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="rgba(148,163,184,0.06)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(148,163,184,0.5)' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 10, fill: 'rgba(148,163,184,0.5)' }} axisLine={false} tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: 'rgba(148,163,184,0.5)' }} axisLine={false} tickLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10, color: 'rgba(148,163,184,0.6)' }} />
            <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#10B981" strokeWidth={2} dot={false} name="Weight (kg)" />
            <Line yAxisId="right" type="monotone" dataKey="glucose" stroke="#14B8A6" strokeWidth={2} dot={false} name="Glucose (mg/dL)" strokeDasharray="4 2" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* History table + Insulin sensitivity */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: cubicEase }}
          className="glass rounded-2xl overflow-hidden lg:col-span-2"
          style={{ borderColor: 'rgba(148,163,184,0.08)' }}
        >
          <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(148,163,184,0.07)' }}>
            <h2 className="font-semibold text-sm text-white">Log History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
                  {['Date', 'Weight (kg)', 'Glucose (mg/dL)', 'BP (mmHg)', 'HR (bpm)', 'Body Fat %'].map(h => (
                    <th key={h} className="px-4 py-3 text-left mono font-medium" style={{ color: 'rgba(148,163,184,0.45)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...history].reverse().map((row: any, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    style={{ borderBottom: '1px solid rgba(148,163,184,0.04)' }}
                    className="hover:bg-emerald-500/5 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-slate-200">{row.date}</td>
                    <td className="px-4 py-3 mono" style={{ color: '#10B981' }}>{row.weight}</td>
                    <td className="px-4 py-3 mono" style={{ color: row.glucose >= 126 ? '#EF4444' : row.glucose >= 100 ? '#F59E0B' : '#10B981' }}>{row.glucose}</td>
                    <td className="px-4 py-3 mono text-slate-300">{row.bp_s}/{row.bp_d}</td>
                    <td className="px-4 py-3 mono text-slate-300">{row.hr}</td>
                    <td className="px-4 py-3 mono" style={{ color: '#14B8A6' }}>{row.fat}%</td>
                  </motion.tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No biometric data recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: cubicEase }}
          className="glass rounded-2xl p-6"
          style={{ borderColor: 'rgba(148,163,184,0.08)' }}
        >
          <h2 className="font-semibold text-sm mb-4 text-white">Insulin Sensitivity</h2>
          <div className="space-y-3">
            {sensitivityLevels.map((l: any) => (
              <motion.div
                key={l.id}
                whileHover={{ scale: 1.01 }}
                className="p-3 rounded-xl transition-all"
                style={{ background: l.id === 2 ? `${l.color}10` : 'rgba(11,15,23,0.4)', border: `1px solid ${l.id === 2 ? `${l.color}30` : 'rgba(148,163,184,0.06)'}` }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                  <span className="text-xs font-semibold" style={{ color: l.id === 2 ? l.color : '#E2E8F0' }}>
                    {l.label} {l.id === 2 && '← Current'}
                  </span>
                </div>
                <div className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>{l.desc}</div>
              </motion.div>
            ))}
            {sensitivityLevels.length === 0 && (
              <div className="text-xs text-slate-400">Loading sensitivity levels...</div>
            )}
          </div>
          <div className="mt-4 p-3 rounded-xl text-xs" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>
            <div className="font-medium mb-1" style={{ color: '#10B981' }}>Recommendation</div>
            <div style={{ color: 'rgba(148,163,184,0.65)' }}>Based on latest logs, monitor fasting glucose levels.</div>
          </div>
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
                <h2 className="font-semibold text-white">Log Biometrics</h2>
                <button onClick={() => setShowModal(false)} className="cursor-pointer hover:text-white transition-colors" style={{ color: 'rgba(148,163,184,0.5)' }}>
                  <X size={18} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Weight" value={form.weight} onChange={upd('weight')} unit="kg" />
                <InputField label="Body Fat" value={form.fat} onChange={upd('fat')} unit="%" />
                <InputField label="Blood Glucose" value={form.glucose} onChange={upd('glucose')} unit="mg/dL" />
                <InputField label="Heart Rate" value={form.hr} onChange={upd('hr')} unit="bpm" />
                <InputField label="Systolic BP" value={form.systolic} onChange={upd('systolic')} unit="mmHg" />
                <InputField label="Diastolic BP" value={form.diastolic} onChange={upd('diastolic')} unit="mmHg" />
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
                  style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(148,163,184,0.12)', color: '#E2E8F0' }}
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={addMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #10B981, #14B8A6)', color: '#fff' }}
                >
                  {addMutation.isPending ? 'Saving…' : 'Save Entry'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Biometrics() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading biometrics...</div>}>
      <BiometricsContent />
    </Suspense>
  );
}
