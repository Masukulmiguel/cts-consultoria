'use client';

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import type { ReactNode } from 'react';
import { useIsMobile } from './use-is-mobile';

export type TiltCardProps = {
  children: ReactNode;
  className?: string;
  /** Rotação máxima em graus. O limite da marca é 2°. */
  max?: number;
};

/**
 * Cartão com inclinação 3D reactiva ao ponteiro, com mola.
 * Rotação máxima 2°. Desligado em toque, < 768px e reduced-motion.
 */
export function TiltCard({ children, className, max = 2 }: TiltCardProps) {
  const reduce = useReducedMotion();
  const isMobile = useIsMobile();
  const disabled = reduce || isMobile;

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const spring = { stiffness: 160, damping: 20, mass: 0.4 };
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring);
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), spring);

  return (
    <motion.div
      className={className}
      style={disabled ? undefined : { rotateX, rotateY, transformPerspective: 1000 }}
      onPointerMove={(event) => {
        if (disabled) return;
        const rect = event.currentTarget.getBoundingClientRect();
        px.set((event.clientX - rect.left) / rect.width);
        py.set((event.clientY - rect.top) / rect.height);
      }}
      onPointerLeave={() => {
        px.set(0.5);
        py.set(0.5);
      }}
    >
      {children}
    </motion.div>
  );
}
