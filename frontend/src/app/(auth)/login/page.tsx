'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Activity, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import { cubicEase, staggerContainer, staggerItem } from '@/lib/animations';

export default function Login() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login(email, password);
      setAuth(res.token, res.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || (err instanceof Error ? err.message : 'Login failed'));
    } finally {
      setLoading(false);
    }
  }

  async function demoLogin() {
    setLoading(true);
    try {
      const res = await api.login('alex@example.com', 'password123');
      setAuth(res.token, res.user);
      router.push('/dashboard');
    } catch (err) {
      const mockUser = {
        user_id: 1,
        full_name: 'Alex Mercer',
        email: 'alex@example.com',
        gender: 'Male',
        height_cm: 178.5,
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
    <div className="min-h-screen flex relative bg-background text-foreground">
      {/* Back to Home Floating Header */}
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

      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12 bg-gradient-to-br from-background via-card/40 to-background border-r border-border">
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
              'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(16,185,129,0.12) 0%, transparent 60%)',
          }}
        />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative max-w-sm text-center"
        >
          <motion.div variants={staggerItem}>
            <Link href="/" className="inline-block">
              <motion.div
                whileHover={{ rotate: 12, scale: 1.06 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl glow-emerald cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #10B981, #14B8A6)' }}
              >
                <Activity size={28} color="#fff" />
              </motion.div>
            </Link>
          </motion.div>

          <motion.h2
            variants={staggerItem}
            className="text-2xl font-bold mb-3 text-foreground tracking-tight"
          >
            Welcome back to <span className="gradient-text">Dietology</span>
          </motion.h2>

          <motion.p
            variants={staggerItem}
            className="text-sm leading-relaxed text-muted-foreground"
          >
            Your metabolic intelligence platform awaits. Track biometrics, optimize nutrition, and achieve precision health outcomes.
          </motion.p>

          <motion.div variants={staggerItem} className="grid grid-cols-2 gap-3 mt-8">
            {[
              { label: 'Meals logged today', value: '3', color: '#10B981' },
              { label: 'Blood glucose', value: '94 mg/dL', color: '#14B8A6' },
              { label: 'Sleep quality', value: '8.2/10', color: '#6366F1' },
              { label: 'Calories left', value: '612 kcal', color: '#F59E0B' },
            ].map((s) => (
              <div
                key={s.label}
                className="glass rounded-xl p-3 text-left border border-border"
              >
                <div className="mono text-lg font-bold" style={{ color: s.color }}>
                  {s.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 pt-20 lg:pt-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: cubicEase }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md"
                style={{ background: 'linear-gradient(135deg, #10B981, #14B8A6)' }}
              >
                <Activity size={16} color="#fff" />
              </div>
              <span className="font-bold text-lg text-foreground">Dietology</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold mb-1 text-foreground tracking-tight">
            Sign in
          </h1>
          <p className="text-sm mb-8 text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-emerald-400 hover:underline">
              Create one free
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all bg-card/60 border border-border text-foreground placeholder:text-muted-foreground/50 focus:border-emerald-500/60"
              />
            </div>

            <div>
              <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-10 rounded-xl text-sm outline-none transition-all bg-card/60 border border-border text-foreground placeholder:text-muted-foreground/50 focus:border-emerald-500/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all glow-emerald cursor-pointer disabled:opacity-60 text-white"
              style={{ background: 'linear-gradient(135deg, #10B981, #14B8A6)' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </motion.button>

            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={demoLogin}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer bg-card/60 border border-border text-foreground hover:bg-accent/60"
            >
              Explore Demo Dashboard
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
