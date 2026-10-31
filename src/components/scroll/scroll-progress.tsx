'use client';

import { motion, useScroll, useSpring } from 'motion/react';

export function ScrollProgress({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 30, mass: 0.3 });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className={`fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-accent-500 ${className ?? ''}`}
    />
  );
}
