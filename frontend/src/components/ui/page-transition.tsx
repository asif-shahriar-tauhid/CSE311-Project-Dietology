'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cubicEase, staggerContainer, staggerItem } from '@/lib/animations';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.995 }}
      transition={{ duration: 0.35, ease: cubicEase }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedCard({
  children,
  className = '',
  style = {},
  hoverable = true,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hoverable?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={hoverable ? { y: -4, scale: 1.015, transition: { duration: 0.2, ease: cubicEase } } : undefined}
      whileTap={hoverable ? { scale: 0.985 } : undefined}
      onClick={onClick}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className = '',
  delay = 0.05,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
