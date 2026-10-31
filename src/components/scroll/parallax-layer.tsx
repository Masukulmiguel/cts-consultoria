'use client';

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { type ReactNode, useRef } from 'react';
import { useIsMobile } from './use-is-mobile';

export type ParallaxLayerProps = {
  children: ReactNode;
  className?: string;
  /** 0.2 a 1 — escala a deslocação. O deslocamento real nunca excede 6% da altura. */
  speed?: number;
  /** Rotação 3D em graus, máximo 2. */
  tilt?: number;
};

/**
 * Camada com parallax ligado ao scroll (useScroll + transform).
 * Máximo de 3 camadas por secção, deslocação ≤ 6% da altura, desligado
 * em < 768px e quando prefers-reduced-motion está activo.
 */
export function ParallaxLayer({ children, className, speed = 0.6, tilt = 0 }: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const isMobile = useIsMobile();
  const disabled = reduce || isMobile;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const rawY = useTransform(scrollYProgress, [0, 1], [48 * speed, -48 * speed]);
  const rawRotateX = useTransform(scrollYProgress, [0, 1], [tilt, -tilt]);
  const y = useSpring(rawY, { stiffness: 120, damping: 28, mass: 0.4 });
  const rotateX = useSpring(rawRotateX, { stiffness: 120, damping: 28, mass: 0.4 });

  return (
    <div ref={ref} className={className} style={{ perspective: '1200px' }}>
      <motion.div
        style={disabled ? undefined : { y, rotateX, transformStyle: 'preserve-3d' }}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
