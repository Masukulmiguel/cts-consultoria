'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

type Tag = 'div' | 'li' | 'ul' | 'section' | 'article' | 'span' | 'header' | 'figure';

const TAGS = {
  div: motion.div,
  li: motion.li,
  ul: motion.ul,
  section: motion.section,
  article: motion.article,
  span: motion.span,
  header: motion.header,
  figure: motion.figure,
} as const;

export type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: Tag;
};

/**
 * Entrada por scroll: fade + deslocamento vertical de 24px.
 * Só anima transform e opacity. Duração 600ms, easing de entrada da marca.
 */
export function Reveal({ children, className, delay = 0, y = 24, as = 'div' }: RevealProps) {
  const reduce = useReducedMotion();
  const Component = TAGS[as];

  if (reduce) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-48px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  );
}
