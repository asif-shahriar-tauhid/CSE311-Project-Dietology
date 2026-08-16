'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Thermometer, Droplets, Mountain, Globe, Leaf } from 'lucide-react';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { cubicEase, staggerContainer, staggerItem } from '@/lib/animations';

function MetricCard({ icon, label, value, unit, color, note }: {
  icon: React.ReactNode; label: string; value: string | number; unit: string; color: string; note?: string;
}) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2, ease: cubicEase } }}
      whileTap={{ scale: 0.98 }}
      className="glass rounded-2xl p-5 cursor-pointer"
      style={{ borderColor: 'rgba(148,163,184,0.08)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>{icon}</div>
        <span className="text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>{label}</span>
      </div>
      <div className="mono text-2xl font-bold" style={{ color }}>{value}</div>
      <div className="text-xs mono" style={{ color: 'rgba(148,163,184,0.4)' }}>{unit}</div>
      {note && <div className="mt-2 text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>{note}</div>}
    </motion.div>
  );
}

export default function Environment() {
  const { user } = useAuthStore();
  const [activeRegionId, setActiveRegionId] = useState<number | null>(user?.region_id || null);

  const { data: regionsData, isLoading: loadingRegions } = useQuery({ queryKey: ['regions'], queryFn: api.getRegions });
  const { data: environmentsData, isLoading: loadingEnvs } = useQuery({ queryKey: ['environments'], queryFn: api.getEnvironments });
  const { data: availabilityData, isLoading: loadingAvail } = useQuery({ queryKey: ['food_availability'], queryFn: api.getRegionalAvailability });

  const regions = Array.isArray(regionsData) ? regionsData : [];
  const environments = Array.isArray(environmentsData) ? environmentsData : [];
  const availability = Array.isArray(availabilityData) ? availabilityData : [];

  useEffect(() => {
    if (!activeRegionId) {
      if (user?.region_id && regions.some((r: any) => r.region_id === user.region_id)) {
        setActiveRegionId(user.region_id);
      } else if (regions.length > 0) {
        setActiveRegionId(regions[0].region_id);
      }
    }
  }, [user?.region_id, regions, activeRegionId]);

  const activeRegion = regions.find((r: any) => r.region_id === activeRegionId) || regions[0] || null;
  const activeRegionEnvs = environments.filter((e: any) => e.region_id === activeRegionId);
  const activeRegionFoods = availability.filter((a: any) => a.region_id === activeRegionId);

  const regionCoords: Record<number, { lat: number; lon: number; alt: number }> = {
    1: { lat: 40.7128, lon: -74.0060, alt: 15 },
    2: { lat: 23.8103, lon: 90.4125, alt: 12 },
    3: { lat: 52.5200, lon: 13.4050, alt: 340 },
  };

  const coords = regionCoords[activeRegionId || 2] || regionCoords[2];

  const { data: liveEnvData } = useQuery({
    queryKey: ['live_env', activeRegionId],
    queryFn: async () => {
      try {
        const [weatherRes, aqiRes] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m`).then(r => r.json()),
          fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coords.lat}&longitude=${coords.lon}&current=us_aqi`).then(r => r.json()),
        ]);
        return {
          temp: weatherRes?.current?.temperature_2m,
          humidity: weatherRes?.current?.relative_humidity_2m,
          aqi: aqiRes?.current?.us_aqi,
        };
      } catch (e) {
        return null;
      }
    },
    refetchInterval: 30000,
  });

  const tempStr = activeRegionEnvs.find((e: any) => e.factor_name?.toLowerCase().includes('temp'))?.factor_value;
  const temp = liveEnvData?.temp ?? (tempStr ? parseFloat(tempStr) : (activeRegionId === 1 ? 18.5 : activeRegionId === 3 ? 16.2 : 31.5));

  const humStr = activeRegionEnvs.find((e: any) => e.factor_name?.toLowerCase().includes('humid'))?.factor_value;
  const humidity = liveEnvData?.humidity ?? (humStr ? parseFloat(humStr) : (activeRegionId === 1 ? 62 : activeRegionId === 3 ? 56 : 82));

  const aqiStr = activeRegionEnvs.find((e: any) => e.factor_name?.toLowerCase().includes('air') || e.factor_name?.toLowerCase().includes('aqi'))?.factor_value;
  const aqi = liveEnvData?.aqi ?? (aqiStr ? parseFloat(aqiStr) : (activeRegionId === 1 ? 38 : activeRegionId === 3 ? 28 : 128));

  const altStr = activeRegionEnvs.find((e: any) => e.factor_name?.toLowerCase().includes('alt'))?.factor_value;
  const altitude = altStr ? parseFloat(altStr) : coords.alt;

  const aqiStatus = aqi < 50 ? { label: 'Good', color: '#10B981' } : aqi < 100 ? { label: 'Moderate', color: '#F59E0B' } : { label: 'Unhealthy', color: '#EF4444' };

  let tdee_adj = 0;
  if (temp < 15) tdee_adj += 150;
  else if (temp > 30) tdee_adj += 100;
  if (altitude > 2000) tdee_adj += 200;
  else if (altitude > 1000) tdee_adj += 50;

  if (loadingRegions || loadingEnvs || loadingAvail) {
    return <div className="p-8 text-center text-slate-400">Loading environmental data...</div>;
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: cubicEase }}
      >
        <h1 className="text-2xl font-bold text-white tracking-tight">Environmental & Regional Market</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(148,163,184,0.6)' }}>Environmental metabolic factors and regional seasonal food sourcing.</p>
      </motion.div>

      {/* Region selector */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass rounded-2xl p-5"
        style={{ borderColor: 'rgba(148,163,184,0.08)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Globe size={16} color="#10B981" />
          <span className="font-semibold text-sm text-white">Active Region</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {regions.map((r: any) => (
            <motion.button
              key={r.region_id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveRegionId(r.region_id)}
              className="px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer"
              style={{
                background: activeRegionId === r.region_id ? 'rgba(16,185,129,0.15)' : 'rgba(30,41,59,0.5)',
                border: `1px solid ${activeRegionId === r.region_id ? 'rgba(16,185,129,0.4)' : 'rgba(148,163,184,0.1)'}`,
                color: activeRegionId === r.region_id ? '#10B981' : 'rgba(148,163,184,0.65)',
              }}
            >
              {r.region_name}
            </motion.button>
          ))}
          {regions.length === 0 && (
            <div className="text-xs text-slate-400">No regions configured in the system.</div>
          )}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeRegion && (
          <motion.div
            key={activeRegion.region_id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: cubicEase }}
            className="space-y-6"
          >
            {/* Environment cards */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <MetricCard icon={<Thermometer size={15} color="#F59E0B" />} label="Temperature" value={`${temp}°C`} unit={activeRegion.climate_type || 'Unknown'} color="#F59E0B" />
              <MetricCard icon={<Droplets size={15} color="#14B8A6" />} label="Humidity" value={`${humidity}%`} unit="relative humidity" color="#14B8A6" />
              <MetricCard icon={<Wind size={15} color={aqiStatus.color} />} label="Air Quality Index" value={aqi} unit={`AQI — ${aqiStatus.label}`} color={aqiStatus.color} />
              <MetricCard icon={<Mountain size={15} color="#6366F1" />} label="Altitude" value={`${altitude}m`} unit="above sea level" color="#6366F1" />
            </motion.div>

            {/* TDEE adjustment */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="glass rounded-2xl p-5"
              style={{ borderColor: tdee_adj > 0 ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: tdee_adj > 0 ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)' }}
                >
                  <Wind size={18} color={tdee_adj > 0 ? '#F59E0B' : '#10B981'} />
                </div>
                <div>
                  <div className="font-semibold text-sm text-white">
                    Environmental TDEE Adjustment:{' '}
                    <span className="mono" style={{ color: tdee_adj > 0 ? '#F59E0B' : '#10B981' }}>
                      {tdee_adj > 0 ? '+' : ''}{tdee_adj} kcal/day
                    </span>
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(148,163,184,0.6)' }}>
                    {temp < 15
                      ? 'Cold climate thermogenesis increases caloric expenditure.'
                      : altitude > 2000
                      ? 'High altitude hypoxia elevates metabolic rate significantly.'
                      : temp > 30
                      ? 'Tropical heat stress and humidity increase sweat cooling energy cost.'
                      : 'Moderate climate with minimal metabolic adjustment.'}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Seasonal foods */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="glass rounded-2xl overflow-hidden"
              style={{ borderColor: 'rgba(148,163,184,0.08)' }}
            >
              <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(148,163,184,0.07)' }}>
                <Leaf size={15} color="#10B981" />
                <h2 className="font-semibold text-sm text-white">Seasonal Food Sourcing Guide</h2>
                <span className="ml-auto text-xs" style={{ color: 'rgba(148,163,184,0.45)' }}>{activeRegion.region_name}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
                      {['Food', 'Season', 'Availability Score', 'Avg Market Price'].map(h => (
                        <th key={h} className="px-6 py-3 text-left mono font-medium" style={{ color: 'rgba(148,163,184,0.45)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeRegionFoods.map((f: any, i: number) => (
                      <motion.tr
                        key={f.availability_id || i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        style={{ borderBottom: '1px solid rgba(148,163,184,0.04)' }}
                        className="hover:bg-emerald-500/5 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-slate-200">{f.food_name}</td>
                        <td className="px-6 py-4" style={{ color: 'rgba(148,163,184,0.55)' }}>{f.season || 'Year-round'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full max-w-24 overflow-hidden" style={{ background: 'rgba(148,163,184,0.1)' }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(parseFloat(f.availability_score) / 10) * 100}%` }}
                                transition={{ duration: 0.6, ease: cubicEase }}
                                className="h-full rounded-full bg-emerald-500"
                              />
                            </div>
                            <span className="mono" style={{ color: '#10B981' }}>{parseFloat(f.availability_score)}/10</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 mono" style={{ color: 'rgba(148,163,184,0.65)' }}>${parseFloat(f.avg_price).toFixed(2)}/kg</td>
                      </motion.tr>
                    ))}
                    {activeRegionFoods.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-400">No regional food data available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
