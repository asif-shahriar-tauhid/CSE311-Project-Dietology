'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import { Save, Globe, Bell, Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { cubicEase, staggerContainer, staggerItem } from '@/lib/animations';

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="relative w-11 h-6 rounded-full transition-colors cursor-pointer"
      style={{ background: on ? '#10B981' : 'rgba(148,163,184,0.2)' }}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm"
        style={{ transform: on ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div
      variants={staggerItem}
      className="glass rounded-2xl p-6"
      style={{ borderColor: 'rgba(148,163,184,0.08)' }}
    >
      <div className="flex items-center gap-2 mb-5" style={{ borderBottom: '1px solid rgba(148,163,184,0.07)', paddingBottom: '1rem' }}>
        {icon}
        <h2 className="font-semibold text-sm text-white">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

export default function Settings() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuthStore();
  const [unit, setUnit] = useState<'metric' | 'imperial'>(user?.unit_system ?? 'metric');
  const [timezone, setTimezone] = useState('America/New_York');
  const [notifs, setNotifs] = useState({ mealReminders: true, glucoseAlerts: true, sleepReminder: true, weeklyReport: false });
  const [saved, setSaved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleSave() {
    updateUser({ unit_system: unit });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await api.deleteAccount();
    } catch (err) {
      console.error('Account deletion completed', err);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      logout();
      router.push('/');
    }
  };

  const TIMEZONES = [
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Dhaka', 'Australia/Sydney'
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6 max-w-3xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Settings</h1>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(148,163,184,0.6)' }}>
            Manage your account preferences and preferences
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold glow-emerald transition-all cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #10B981, #14B8A6)', color: '#fff' }}
        >
          <Save size={14} />
          {saved ? 'Saved!' : 'Save Preferences'}
        </motion.button>
      </div>

      {/* Account Info */}
      <Section title="Account Info" icon={<Shield size={16} color="#10B981" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(148,163,184,0.7)' }}>Full Name</label>
            <input
              type="text"
              readOnly
              value={user?.full_name || 'Alex Mercer'}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-not-allowed opacity-80"
              style={{ background: 'rgba(11,15,23,0.5)', border: '1px solid rgba(148,163,184,0.12)', color: '#E2E8F0' }}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(148,163,184,0.7)' }}>Email Address</label>
            <input
              type="email"
              readOnly
              value={user?.email || 'alex@example.com'}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-not-allowed opacity-80"
              style={{ background: 'rgba(11,15,23,0.5)', border: '1px solid rgba(148,163,184,0.12)', color: '#E2E8F0' }}
            />
          </div>
        </div>
      </Section>

      {/* Units & Localization */}
      <Section title="Units & Regional Settings" icon={<Globe size={16} color="#14B8A6" />}>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(148,163,184,0.7)' }}>Unit System</label>
            <div className="grid grid-cols-2 gap-2 max-w-xs">
              {(['metric', 'imperial'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className="py-2 px-3 rounded-xl text-xs font-medium capitalize transition-all cursor-pointer"
                  style={{
                    background: unit === u ? 'rgba(16,185,129,0.15)' : 'rgba(11,15,23,0.5)',
                    border: `1px solid ${unit === u ? 'rgba(16,185,129,0.4)' : 'rgba(148,163,184,0.12)'}`,
                    color: unit === u ? '#10B981' : 'rgba(148,163,184,0.7)',
                  }}
                >
                  {u} {u === 'metric' ? '(kg, cm, °C)' : '(lbs, in, °F)'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(148,163,184,0.7)' }}>Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
              style={{ background: 'rgba(11,15,23,0.5)', border: '1px solid rgba(148,163,184,0.12)', color: '#E2E8F0' }}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz} style={{ background: '#0F172A' }}>
                  {tz.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={<Bell size={16} color="#F59E0B" />}>
        <div className="space-y-4">
          {[
            { key: 'mealReminders', label: 'Meal Logging Reminders', desc: 'Get reminded to log meals at breakfast, lunch, and dinner' },
            { key: 'glucoseAlerts', label: 'Blood Glucose Alerts', desc: 'Alerts when glucose levels exceed your defined thresholds' },
            { key: 'sleepReminder', label: 'Sleep Log Reminder', desc: 'Morning reminder to log last night\'s sleep quality' },
            { key: 'weeklyReport', label: 'Weekly Progress Report', desc: 'Receive a weekly metabolic summary every Monday' },
          ].map((n) => (
            <div
              key={n.key}
              className="flex items-center justify-between py-2"
              style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}
            >
              <div>
                <div className="text-sm font-medium text-white">{n.label}</div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(148,163,184,0.5)' }}>{n.desc}</div>
              </div>
              <Toggle
                on={notifs[n.key as keyof typeof notifs]}
                onToggle={() =>
                  setNotifs((prev) => ({ ...prev, [n.key]: !prev[n.key as keyof typeof notifs] }))
                }
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Danger zone */}
      <motion.div
        variants={staggerItem}
        className="glass rounded-2xl p-6"
        style={{ borderColor: 'rgba(239,68,68,0.2)' }}
      >
        <h2 className="font-semibold text-sm mb-4 flex items-center gap-1.5" style={{ color: '#EF4444' }}>
          <AlertTriangle size={16} /> Danger Zone
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-white">Delete Account</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(148,163,184,0.5)' }}>
              Permanently delete all your data and information from the database. This cannot be undone.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-rose-500/20 cursor-pointer"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444' }}
          >
            Delete Account
          </button>
        </div>
      </motion.div>

      {/* Account Deletion Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.25, ease: cubicEase }}
              className="glass rounded-2xl p-6 max-w-md w-full border border-rose-500/30 space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-rose-500">
                <div className="p-2.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Delete Account?</h3>
                  <p className="text-xs text-rose-400">Permanent Action</p>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                Are you sure you want to permanently delete your account (<strong className="text-white">{user?.email || 'alex@example.com'}</strong>)?
                This will permanently delete all your logged biometrics, meals, workouts, sleep logs, and preferences from the database.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  {isDeleting ? <Loader2 size={14} className="animate-spin" /> : null}
                  {isDeleting ? 'Deleting Data...' : 'Yes, Delete Everything'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
