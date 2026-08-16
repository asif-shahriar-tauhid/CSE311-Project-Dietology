'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Leaf, Moon, Wind, ChevronRight, Check,
  Zap, BarChart2, Globe, Brain, ArrowRight, Search,
  TrendingUp, Droplets, Heart, Flame, Menu, X
} from 'lucide-react';
import { fadeInUp, fadeInDown, staggerContainer, staggerItem, cubicEase } from '@/lib/animations';

const FOODS_DB = [
  { name: 'Avocado', cal: 160, protein: 2, carbs: 9, fat: 15, gi: 10, season: 'Year-round', score: 9.2 },
  { name: 'Salmon (Atlantic)', cal: 208, protein: 20, carbs: 0, fat: 13, gi: 0, season: 'Sep–Mar', score: 8.7 },
  { name: 'Quinoa', cal: 120, protein: 4.4, carbs: 22, fat: 1.9, gi: 53, season: 'Year-round', score: 9.5 },
  { name: 'Sweet Potato', cal: 86, protein: 1.6, carbs: 20, fat: 0.1, gi: 63, season: 'Oct–Feb', score: 8.1 },
  { name: 'Blueberries', cal: 57, protein: 0.7, carbs: 14, fat: 0.3, gi: 53, season: 'Jun–Aug', score: 9.0 },
  { name: 'Greek Yogurt', cal: 59, protein: 10, carbs: 3.6, fat: 0.4, gi: 11, season: 'Year-round', score: 8.8 },
  { name: 'Almonds', cal: 579, protein: 21, carbs: 22, fat: 50, gi: 0, season: 'Year-round', score: 8.3 },
  { name: 'Spinach', cal: 23, protein: 2.9, carbs: 3.6, fat: 0.4, gi: 15, season: 'Mar–Jun', score: 9.7 },
  { name: 'Chicken Breast', cal: 165, protein: 31, carbs: 0, fat: 3.6, gi: 0, season: 'Year-round', score: 8.0 },
  { name: 'Oats', cal: 389, protein: 17, carbs: 66, fat: 7, gi: 55, season: 'Year-round', score: 8.6 },
];

function GiBar({ value }: { value: number }) {
  const color = value < 35 ? '#10B981' : value < 55 ? '#F59E0B' : '#EF4444';
  const label = value === 0 ? 'N/A' : value < 35 ? 'Low' : value < 55 ? 'Medium' : 'High';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(148,163,184,0.15)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((value / 100) * 100, 100)}%` }}
          transition={{ duration: 0.8, ease: cubicEase }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <span className="mono text-xs" style={{ color, minWidth: 40 }}>{label}{value > 0 ? ` ${value}` : ''}</span>
    </div>
  );
}

function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs" style={{ color: 'rgba(148,163,184,0.8)' }}>{label}</span>
        <span className="mono text-xs font-medium" style={{ color }}>{value}g</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(148,163,184,0.1)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((value / max) * 100, 100)}%` }}
          transition={{ duration: 0.8, ease: cubicEase }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

function BMRWidget() {
  const [weight, setWeight] = useState(72);
  const [height, setHeight] = useState(175);
  const [goal, setGoal] = useState<'loss' | 'maintain' | 'gain'>('maintain');

  const bmr = Math.round(88.36 + 13.4 * weight + 4.8 * height - 5 * 30);
  const tdee = Math.round(bmr * 1.55);
  const target = goal === 'loss' ? tdee - 500 : goal === 'gain' ? tdee + 300 : tdee;
  const protein = Math.round(weight * 2.0);
  const fat = Math.round((target * 0.28) / 9);
  const carbs = Math.round((target - protein * 4 - fat * 9) / 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 25, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: cubicEase, delay: 0.2 }}
      className="glass rounded-2xl p-6 w-full max-w-sm"
      style={{ borderColor: 'rgba(16,185,129,0.25)', boxShadow: '0 20px 40px -15px rgba(16,185,129,0.12)' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.2)' }}>
          <Zap size={12} color="#10B981" />
        </div>
        <span className="text-sm font-semibold" style={{ color: '#10B981' }}>Live Metabolic Calculator</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs mb-1 block" style={{ color: 'rgba(148,163,184,0.6)' }}>Weight (kg)</label>
          <input
            type="range" min={40} max={150} value={weight}
            onChange={e => setWeight(+e.target.value)}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <span className="mono text-sm font-medium" style={{ color: '#10B981' }}>{weight} kg</span>
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: 'rgba(148,163,184,0.6)' }}>Height (cm)</label>
          <input
            type="range" min={140} max={220} value={height}
            onChange={e => setHeight(+e.target.value)}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <span className="mono text-sm font-medium" style={{ color: '#10B981' }}>{height} cm</span>
        </div>
      </div>

      <div className="flex gap-1 mb-4 p-1 rounded-lg" style={{ background: 'rgba(11,15,23,0.5)' }}>
        {(['loss', 'maintain', 'gain'] as const).map(g => (
          <motion.button
            key={g}
            onClick={() => setGoal(g)}
            whileTap={{ scale: 0.95 }}
            className="flex-1 py-1 rounded-md text-xs font-medium transition-colors capitalize cursor-pointer"
            style={{
              background: goal === g ? '#10B981' : 'transparent',
              color: goal === g ? '#fff' : 'rgba(148,163,184,0.7)'
            }}
          >
            {g === 'loss' ? 'Cut' : g === 'gain' ? 'Bulk' : 'Maintain'}
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 p-3 rounded-xl" style={{ background: 'rgba(11,15,23,0.4)' }}>
        <div className="text-center">
          <motion.div
            key={target}
            initial={{ scale: 0.9, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mono text-2xl font-bold"
            style={{ color: '#10B981' }}
          >
            {target}
          </motion.div>
          <div className="text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>Daily Target kcal</div>
        </div>
        <div className="text-center">
          <motion.div
            key={bmr}
            initial={{ scale: 0.9, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mono text-2xl font-bold"
            style={{ color: '#14B8A6' }}
          >
            {bmr}
          </motion.div>
          <div className="text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>BMR kcal</div>
        </div>
      </div>

      <div className="space-y-2">
        <MacroBar label="Protein" value={protein} max={300} color="#10B981" />
        <MacroBar label="Carbs" value={carbs} max={400} color="#6366F1" />
        <MacroBar label="Fat" value={fat} max={150} color="#F59E0B" />
      </div>
    </motion.div>
  );
}

function FoodExplorer() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(FOODS_DB[0]);
  const results = FOODS_DB.filter(f => f.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: cubicEase }}
      className="glass rounded-2xl p-6"
      style={{ borderColor: 'rgba(16,185,129,0.15)' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Search size={16} color="#10B981" />
        <span className="font-semibold text-sm">Glycemic & Macro Explorer</span>
      </div>

      <div className="relative mb-4">
        <input
          type="text" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search foods…"
          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:border-emerald-500/50"
          style={{ background: 'rgba(11,15,23,0.5)', border: '1px solid rgba(148,163,184,0.12)', color: '#E2E8F0' }}
        />
        <AnimatePresence>
          {query && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-10 shadow-2xl"
              style={{ background: '#1E293B', border: '1px solid rgba(148,163,184,0.12)' }}
            >
              {results.slice(0, 5).map(f => (
                <button key={f.name} onClick={() => { setSelected(f); setQuery(''); }}
                  className="w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer hover:bg-emerald-500/10"
                  style={{ color: '#CBD5E1' }}>
                  {f.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.name}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: cubicEase }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold">{selected.name}</span>
              <span className="mono text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
                {selected.cal} kcal/100g
              </span>
            </div>
            <div className="mb-3">
              <div className="text-xs mb-1" style={{ color: 'rgba(148,163,184,0.6)' }}>Glycemic Index</div>
              <GiBar value={selected.gi} />
            </div>
            <div className="space-y-2 mb-3">
              <MacroBar label="Protein" value={selected.protein} max={40} color="#10B981" />
              <MacroBar label="Carbs" value={selected.carbs} max={80} color="#6366F1" />
              <MacroBar label="Fat" value={selected.fat} max={60} color="#F59E0B" />
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'rgba(11,15,23,0.4)' }}>
              <span className="text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>Regional Season</span>
              <div className="flex items-center gap-1.5">
                <Leaf size={12} color="#10B981" />
                <span className="mono text-xs" style={{ color: '#10B981' }}>{selected.season}</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg mt-1" style={{ background: 'rgba(11,15,23,0.4)' }}>
              <span className="text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>Availability Score</span>
              <span className="mono text-xs font-medium" style={{ color: '#14B8A6' }}>{selected.score}/10</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const features = [
    {
      icon: <Activity size={20} color="#10B981" />,
      title: 'Biometric & Blood Glucose Intelligence',
      desc: 'Real-time monitoring of blood sugar dynamics, insulin sensitivity trends, and body composition changes with clinical precision.',
      accent: '#10B981',
    },
    {
      icon: <Leaf size={20} color="#14B8A6" />,
      title: 'Regional & Seasonal Sourcing',
      desc: 'Local food availability scores and cost indexing calibrated to your geographic region and climate season.',
      accent: '#14B8A6',
    },
    {
      icon: <Moon size={20} color="#6366F1" />,
      title: 'Sleep & Recovery Sync',
      desc: 'Correlation engine linking sleep duration and quality with morning metabolic readiness and macro utilization efficiency.',
      accent: '#6366F1',
    },
    {
      icon: <Wind size={20} color="#F59E0B" />,
      title: 'Environmental Metabolic Factors',
      desc: 'Temperature, altitude, and air quality data that adjusts daily caloric expenditure and nutrient partitioning targets.',
      accent: '#F59E0B',
    },
  ];

  const plans = [
    {
      name: 'Personal Health',
      price: 'Free',
      desc: 'Essential tracking for health-conscious individuals.',
      features: ['Meal & calorie logging', 'Basic biometrics', 'Food catalog access', '7-day history'],
      accent: '#64748B',
      popular: false,
    },
    {
      name: 'Pro Clinical Tracker',
      price: '$19',
      desc: 'Advanced clinical metrics for serious health optimization.',
      features: ['Everything in Free', 'Blood glucose tracking', 'Insulin sensitivity analysis', 'Regional food market data', 'Sleep & recovery lab', '90-day trend analysis', 'Export reports'],
      accent: '#10B981',
      popular: true,
    },
    {
      name: 'Performance & Metabolic',
      price: '$39',
      desc: 'Elite-level metabolic intelligence for peak performance.',
      features: ['Everything in Pro', 'Environmental metabolic sync', 'AI-driven meal recommendations', 'Custom goal programming', 'Unlimited history', 'API access', 'Priority support'],
      accent: '#6366F1',
      popular: false,
    },
  ];

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Nav */}
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: cubicEase }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all border-b border-border ${
          scrolled ? 'bg-background/90 backdrop-blur-lg shadow-lg' : 'bg-background/80 backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.05 }}
              className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #10B981, #14B8A6)' }}
            >
              <Activity size={16} color="#fff" />
            </motion.div>
            <span className="font-bold text-lg tracking-tight">Dietology</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Science', 'Regional Pricing', 'Pricing'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`}
                className="text-sm transition-colors text-muted-foreground hover:text-emerald-400">
                {l}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/login')}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer text-muted-foreground hover:text-foreground"
            >
              Sign In
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(16,185,129,0.4)' }}
              whileTap={{ scale: 0.96 }}
              onClick={() => router.push('/register')}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all glow-emerald cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #10B981, #14B8A6)', color: '#fff' }}
            >
              Get Started
            </motion.button>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 cursor-pointer">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden px-6 pb-4 space-y-2 overflow-hidden"
              style={{ background: 'rgba(11,15,23,0.95)' }}
            >
              {['Features', 'Science', 'Pricing'].map(l => (
                <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMenuOpen(false)}
                  className="block py-2 text-sm" style={{ color: 'rgba(148,163,184,0.8)' }}>{l}</a>
              ))}
              <button onClick={() => router.push('/login')} className="block w-full text-left py-2 text-sm cursor-pointer" style={{ color: 'rgba(148,163,184,0.8)' }}>Sign In</button>
              <button onClick={() => router.push('/register')}
                className="w-full py-2 rounded-lg text-sm font-semibold cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #10B981, #14B8A6)', color: '#fff' }}>
                Get Started
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 60%)' }} />

        <div className="max-w-7xl mx-auto px-6 pt-24 pb-16 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div
                variants={staggerItem}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-medium"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}
              >
                <span className="w-1.5 h-1.5 rounded-full pulse-glow" style={{ background: '#10B981' }} />
                Precision Clinical Nutrition Platform
              </motion.div>

              <motion.h1
                variants={staggerItem}
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
                style={{ letterSpacing: '-0.02em' }}
              >
                Precision Nutrition &{' '}
                <span className="gradient-text">Metabolism</span>{' '}
                Driven by Science
              </motion.h1>

              <motion.p
                variants={staggerItem}
                className="text-lg mb-8 leading-relaxed"
                style={{ color: 'rgba(148,163,184,0.8)' }}
              >
                Track biometrics, blood glucose, regional seasonal foods, sleep quality, and environmental metabolic factors in one intelligent platform built for clinical-grade health optimization.
              </motion.p>

              <motion.div variants={staggerItem} className="flex flex-wrap gap-3 mb-10">
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => router.push('/register')}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all glow-emerald cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #10B981, #14B8A6)', color: '#fff' }}
                >
                  Start Free Trial <ArrowRight size={16} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03, borderColor: 'rgba(16,185,129,0.4)', y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer"
                  style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(148,163,184,0.15)', color: '#E2E8F0' }}
                >
                  Explore Live Demo <ChevronRight size={16} />
                </motion.button>
              </motion.div>

              <motion.div variants={staggerItem} className="flex items-center gap-6">
                {[
                  { value: '22+', label: 'Data tables synced' },
                  { value: '98%', label: 'Clinical accuracy' },
                  { value: '50+', label: 'Regional markets' },
                ].map(stat => (
                  <div key={stat.label}>
                    <div className="mono text-xl font-bold" style={{ color: '#10B981' }}>{stat.value}</div>
                    <div className="text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <div className="flex justify-center lg:justify-end">
              <BMRWidget />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 relative">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(99,102,241,0.04) 0%, transparent 70%)' }} />
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: cubicEase }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-medium"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#6366F1' }}>
              <Brain size={12} /> Platform Intelligence
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ letterSpacing: '-0.02em' }}>
              Four Dimensions of{' '}
              <span className="gradient-text">Metabolic Intelligence</span>
            </h2>
            <p className="text-base max-w-2xl mx-auto" style={{ color: 'rgba(148,163,184,0.7)' }}>
              Dietology synthesizes clinical biometrics, regional food data, environmental conditions, and recovery science into one unified metabolic profile.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={staggerItem}
                whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2, ease: cubicEase } }}
                className="glass rounded-2xl p-6 cursor-pointer"
                style={{ borderColor: 'rgba(148,163,184,0.08)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${f.accent}15` }}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-sm mb-2 leading-snug">{f.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(148,163,184,0.65)' }}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Food Explorer Section */}
      <section id="science" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: cubicEase }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-medium"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}>
                <Leaf size={12} /> Live Food Database
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ letterSpacing: '-0.02em' }}>
                Glycemic & Macro Explorer
              </h2>
              <p className="text-base mb-6 leading-relaxed" style={{ color: 'rgba(148,163,184,0.75)' }}>
                Search our regional food catalog to instantly view Glycemic Index, macro composition, and seasonal availability scores — publicly available, no sign-up required.
              </p>
              <div className="space-y-3">
                {[
                  { icon: <TrendingUp size={14} color="#10B981" />, text: 'Glycemic Index with clinical thresholds' },
                  { icon: <Droplets size={14} color="#6366F1" />, text: 'Precise macro breakdown per 100g' },
                  { icon: <Leaf size={14} color="#14B8A6" />, text: 'Regional seasonality & availability scoring' },
                  { icon: <Globe size={14} color="#F59E0B" />, text: 'Average market price across 50+ regions' },
                ].map((item, idx) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(30,41,59,0.8)' }}>
                      {item.icon}
                    </div>
                    <span className="text-sm" style={{ color: 'rgba(148,163,184,0.8)' }}>{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <FoodExplorer />
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="py-12" style={{ background: 'rgba(16,185,129,0.04)', borderTop: '1px solid rgba(16,185,129,0.1)', borderBottom: '1px solid rgba(16,185,129,0.1)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { icon: <Heart size={20} color="#EF4444" />, val: '2.4M+', label: 'Biometric logs processed' },
              { icon: <BarChart2 size={20} color="#10B981" />, val: '18,000+', label: 'Foods in catalog' },
              { icon: <Moon size={20} color="#6366F1" />, val: '94%', label: 'Sleep-recovery correlation accuracy' },
              { icon: <Flame size={20} color="#F59E0B" />, val: '±3%', label: 'TDEE prediction margin' },
            ].map(s => (
              <motion.div key={s.label} variants={staggerItem} className="flex flex-col items-center text-center gap-2">
                {s.icon}
                <div className="mono text-2xl font-bold" style={{ color: '#E2E8F0' }}>{s.val}</div>
                <div className="text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: cubicEase }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ letterSpacing: '-0.02em' }}>
              Choose Your <span className="gradient-text">Health Protocol</span>
            </h2>
            <p className="text-base" style={{ color: 'rgba(148,163,184,0.7)' }}>
              Start free. Scale as your health intelligence grows.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {plans.map(plan => (
              <motion.div
                key={plan.name}
                variants={staggerItem}
                whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2, ease: cubicEase } }}
                className="glass rounded-2xl p-6 relative flex flex-col cursor-pointer"
                style={{ borderColor: plan.popular ? `${plan.accent}40` : 'rgba(148,163,184,0.08)', boxShadow: plan.popular ? `0 0 40px ${plan.accent}15` : 'none' }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold"
                    style={{ background: 'linear-gradient(135deg, #10B981, #14B8A6)', color: '#fff' }}>
                    Most Popular
                  </div>
                )}
                <div className="mb-4">
                  <div className="text-xs font-medium mb-1" style={{ color: plan.accent }}>{plan.name}</div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="mono text-4xl font-bold">{plan.price}</span>
                    {plan.price !== 'Free' && <span className="text-sm" style={{ color: 'rgba(148,163,184,0.6)' }}>/mo</span>}
                  </div>
                  <p className="text-xs" style={{ color: 'rgba(148,163,184,0.65)' }}>{plan.desc}</p>
                </div>

                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs" style={{ color: 'rgba(148,163,184,0.8)' }}>
                      <Check size={12} className="mt-0.5 flex-shrink-0" style={{ color: plan.accent }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/register')}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                  style={{
                    background: plan.popular ? `linear-gradient(135deg, ${plan.accent}, #14B8A6)` : 'rgba(30,41,59,0.8)',
                    color: plan.popular ? '#fff' : '#E2E8F0',
                    border: plan.popular ? 'none' : '1px solid rgba(148,163,184,0.15)'
                  }}
                >
                  {plan.price === 'Free' ? 'Get Started Free' : 'Start Free Trial'}
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(16,185,129,0.06) 0%, transparent 70%)' }} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: cubicEase }}
          className="max-w-3xl mx-auto px-6 text-center relative"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ letterSpacing: '-0.02em' }}>
            Your Metabolism. <span className="gradient-text">Fully Understood.</span>
          </h2>
          <p className="text-base mb-8" style={{ color: 'rgba(148,163,184,0.75)' }}>
            Join thousands of individuals and clinicians using Dietology to achieve precision metabolic health outcomes.
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 35px rgba(16,185,129,0.5)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/register')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-all glow-emerald cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #10B981, #14B8A6)', color: '#fff' }}
          >
            Begin Your Protocol <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(148,163,184,0.08)' }} className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10B981, #14B8A6)' }}>
                  <Activity size={14} color="#fff" />
                </div>
                <span className="font-bold text-white">Dietology</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(148,163,184,0.55)' }}>
                Precision clinical nutrition and metabolic health intelligence platform.
              </p>
            </div>
            {[
              { title: 'Platform', links: ['Overview', 'Biometrics', 'Nutrition', 'Fitness', 'Sleep Lab'] },
              { title: 'Science', links: ['Glycemic Research', 'Metabolic Factors', 'Regional Data', 'API Docs'] },
              { title: 'Company', links: ['About', 'Privacy Policy', 'Terms of Service', 'Contact'] },
            ].map(col => (
              <div key={col.title}>
                <div className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'rgba(148,163,184,0.5)' }}>{col.title}</div>
                <ul className="space-y-2">
                  {col.links.map(l => (
                    <li key={l}>
                      <a href="#" className="text-xs transition-colors" style={{ color: 'rgba(148,163,184,0.55)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#E2E8F0')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(148,163,184,0.55)')}>
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4"
            style={{ borderTop: '1px solid rgba(148,163,184,0.08)' }}>
            <span className="text-xs" style={{ color: 'rgba(148,163,184,0.4)' }}>© 2026 Dietology. All rights reserved.</span>
            <span className="text-xs" style={{ color: 'rgba(148,163,184,0.35)' }}>
              Not a substitute for professional medical advice. Always consult a qualified healthcare provider.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
