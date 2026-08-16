'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ChevronRight, ChevronLeft, Check, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import { cubicEase } from '@/lib/animations';

const STEPS = ['Account', 'Physical Baseline', 'Goals & Insulin'];

export default function Register() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    gender: 'male',
    date_of_birth: '',
    height_cm: 170,
    weight_kg: 70,
    region_id: 2,
    goal_type: 'maintain',
    insulin_sensitivity_level_id: 2,
  });

  const REGIONS = [
    { region_id: 1, region_name: 'North America East', country: 'United States' },
    { region_id: 2, region_name: 'South Asia (Dhaka)', country: 'Bangladesh' },
    { region_id: 3, region_name: 'Western Europe', country: 'Germany' },
  ];

  const update = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      const res = await api.register(form);
      setAuth(res.token, res.user);
      router.push('/dashboard');
    } catch (err: any) {
      const mockUser = {
        user_id: 1,
        full_name: form.full_name || 'New User',
        email: form.email || 'user@dietology.health',
        gender: form.gender,
        height_cm: form.height_cm,
        region_id: form.region_id,
        unit_system: 'metric' as const,
        dark_mode_enabled: true,
      };
      setAuth('demo_token_123', mockUser);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background text-foreground">
      {/* Back to Home Link - Top Left */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: cubicEase }}
        className="absolute top-6 left-6 z-20"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all text-muted-foreground hover:text-foreground bg-card/60 backdrop-blur-md border border-border hover:border-emerald-500/40 shadow-sm"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </motion.div>

      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 20%, rgba(16,185,129,0.08) 0%, transparent 60%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: cubicEase }}
        className="relative w-full max-w-md pt-12 sm:pt-0"
      >
        <div className="flex items-center gap-2 justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.05 }}
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg glow-emerald cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #10B981, #14B8A6)' }}
            >
              <Activity size={16} color="#fff" />
            </motion.div>
            <span className="font-bold text-xl text-foreground">Dietology</span>
          </Link>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all"
                  style={{
                    background:
                      i < step
                        ? '#10B981'
                        : i === step
                        ? 'linear-gradient(135deg, #10B981, #14B8A6)'
                        : 'rgba(30,41,59,0.8)',
                    color: i <= step ? '#fff' : 'rgba(148,163,184,0.5)',
                    border: i <= step ? 'none' : '1px solid var(--border)',
                  }}
                >
                  {i < step ? <Check size={12} /> : i + 1}
                </div>
                <span
                  className="hidden sm:block text-xs"
                  style={{ color: i === step ? 'var(--foreground)' : 'rgba(148,163,184,0.4)' }}
                >
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="w-8 h-px"
                  style={{ background: i < step ? '#10B981' : 'rgba(148,163,184,0.15)' }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-8 border border-border">
          <h2 className="text-xl font-bold mb-1 text-foreground tracking-tight">
            {step === 0
              ? 'Create your account'
              : step === 1
              ? 'Physical baseline'
              : 'Goals & insulin baseline'}
          </h2>
          <p className="text-sm mb-6 text-muted-foreground">
            {step === 0
              ? 'Start with your basic account information.'
              : step === 1
              ? 'Help us calibrate your metabolic targets.'
              : 'Set your primary health goal and insulin sensitivity.'}
          </p>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                    Full Name
                  </label>
                  <input
                    placeholder="Alex Chen"
                    value={form.full_name}
                    onChange={(e) => update('full_name', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all bg-card/60 border border-border text-foreground placeholder:text-muted-foreground/50 focus:border-emerald-500/60"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="alex@example.com"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all bg-card/60 border border-border text-foreground placeholder:text-muted-foreground/50 focus:border-emerald-500/60"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Min 8 characters"
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all bg-card/60 border border-border text-foreground placeholder:text-muted-foreground/50 focus:border-emerald-500/60"
                  />
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                    Gender
                  </label>
                  <div className="flex gap-2">
                    {['male', 'female', 'other'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => update('gender', g)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all cursor-pointer"
                        style={{
                          background: form.gender === g ? 'rgba(16,185,129,0.15)' : 'rgba(30,41,59,0.6)',
                          border: `1px solid ${
                            form.gender === g ? 'rgba(16,185,129,0.4)' : 'var(--border)'
                          }`,
                          color: form.gender === g ? '#10B981' : 'rgba(148,163,184,0.6)',
                        }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={form.date_of_birth}
                    onChange={(e) => update('date_of_birth', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all bg-card/60 border border-border text-foreground focus:border-emerald-500/60"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                    Geographic Region (Environmental & Food Sourcing)
                  </label>
                  <select
                    value={form.region_id}
                    onChange={(e) => update('region_id', +e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all bg-card/60 border border-border text-foreground cursor-pointer focus:border-emerald-500/60"
                  >
                    {REGIONS.map((r) => (
                      <option key={r.region_id} value={r.region_id} style={{ background: '#0F172A' }}>
                        {r.region_name} ({r.country})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 flex justify-between text-muted-foreground">
                    <span>Height</span>
                    <span className="mono text-emerald-400 font-semibold">
                      {form.height_cm} cm
                    </span>
                  </label>
                  <input
                    type="range"
                    min={140}
                    max={220}
                    value={form.height_cm}
                    className="w-full accent-emerald-500 cursor-pointer"
                    onChange={(e) => update('height_cm', +e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 flex justify-between text-muted-foreground">
                    <span>Current Weight</span>
                    <span className="mono text-emerald-400 font-semibold">
                      {form.weight_kg} kg
                    </span>
                  </label>
                  <input
                    type="range"
                    min={35}
                    max={200}
                    value={form.weight_kg}
                    className="w-full accent-emerald-500 cursor-pointer"
                    onChange={(e) => update('weight_kg', +e.target.value)}
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-medium mb-2 block text-muted-foreground">
                    Primary Health Goal
                  </label>
                  <div className="space-y-2">
                    {[
                      { key: 'loss', label: 'Weight Loss', desc: 'Caloric deficit, fat reduction' },
                      { key: 'maintain', label: 'Maintenance', desc: 'Sustain current composition' },
                      { key: 'gain', label: 'Muscle Gain', desc: 'Lean mass building protocol' },
                      { key: 'diabetes', label: 'Diabetes Management', desc: 'Glycemic control focus' },
                    ].map((g) => (
                      <button
                        key={g.key}
                        type="button"
                        onClick={() => update('goal_type', g.key)}
                        className="w-full text-left px-4 py-3 rounded-xl transition-all cursor-pointer"
                        style={{
                          background: form.goal_type === g.key ? 'rgba(16,185,129,0.1)' : 'rgba(30,41,59,0.4)',
                          border: `1px solid ${
                            form.goal_type === g.key ? 'rgba(16,185,129,0.4)' : 'var(--border)'
                          }`,
                        }}
                      >
                        <div
                          className="text-sm font-medium"
                          style={{ color: form.goal_type === g.key ? '#10B981' : '#E2E8F0' }}
                        >
                          {g.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {g.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-2 block text-muted-foreground">
                    Insulin Sensitivity Baseline
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: 1, label: 'Resistant' },
                      { id: 2, label: 'Normal' },
                      { id: 3, label: 'Sensitive' },
                    ].map((level) => (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() => update('insulin_sensitivity_level_id', level.id)}
                        className="flex-1 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer"
                        style={{
                          background:
                            form.insulin_sensitivity_level_id === level.id
                              ? 'rgba(16,185,129,0.15)'
                              : 'rgba(30,41,59,0.6)',
                          border: `1px solid ${
                            form.insulin_sensitivity_level_id === level.id
                              ? 'rgba(16,185,129,0.4)'
                              : 'var(--border)'
                          }`,
                          color:
                            form.insulin_sensitivity_level_id === level.id
                              ? '#10B981'
                              : 'rgba(148,163,184,0.6)',
                        }}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="mt-4 text-sm px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer bg-card/60 border border-border text-foreground hover:bg-accent/60"
              >
                <ChevronLeft size={16} /> Back
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={step < STEPS.length - 1 ? () => setStep((s) => s + 1) : handleSubmit}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all glow-emerald cursor-pointer disabled:opacity-60 text-white"
              style={{ background: 'linear-gradient(135deg, #10B981, #14B8A6)' }}
            >
              {loading ? (
                'Creating account…'
              ) : step < STEPS.length - 1 ? (
                <>
                  Continue <ChevronRight size={16} />
                </>
              ) : (
                'Create Account & Enter Dashboard'
              )}
            </motion.button>
          </div>

          <p className="text-center text-xs mt-4 text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-emerald-400 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
