'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

export default function HeroWidget() {
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);
  
  const bmr = Math.round(10 * weight + 6.25 * height - 5 * 30 + 5);
  const tdee = Math.round(bmr * 1.55);
  
  const protein = Math.round((tdee * 0.3) / 4);
  const carbs = Math.round((tdee * 0.4) / 4);
  const fat = Math.round((tdee * 0.3) / 9);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative w-full max-w-md mx-auto"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-30 animate-pulse"></div>
      <Card className="glass relative overflow-hidden border-slate-700/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 text-emerald-400" />
            Live Metabolic Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Weight (kg)</span>
                <span className="font-medium text-emerald-400">{weight} kg</span>
              </div>
              <Slider
                value={[weight]}
                onValueChange={(v: any) => setWeight(Array.isArray(v) ? v[0] : v)}
                min={40}
                max={150}
                step={1}
                className="[&_[role=slider]]:bg-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Height (cm)</span>
                <span className="font-medium text-teal-400">{height} cm</span>
              </div>
              <Slider
                value={[height]}
                onValueChange={(v: any) => setHeight(Array.isArray(v) ? v[0] : v)}
                min={140}
                max={220}
                step={1}
                className="[&_[role=slider]]:bg-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
            <div>
              <p className="text-xs text-slate-400 mb-1">Target Calories</p>
              <p className="text-2xl font-bold">{tdee} <span className="text-sm font-normal text-slate-500">kcal</span></p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                P: {protein}g
              </Badge>
              <Badge variant="outline" className="border-teal-500/30 text-teal-400 bg-teal-500/10">
                C: {carbs}g
              </Badge>
              <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10">
                F: {fat}g
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
