'use client';

import { motion, useReducedMotion } from 'motion/react';

export type TaglineRevealProps = {
  text: string;
  className?: string;
};

const STEP_S = 0.055;

/**
 * Secção de destaque tipográfico: cada palavra arranca a 28% de
 * opacidade e activa individualmente quando a secção entra no viewport.
 */
export function TaglineReveal({ text, className }: TaglineRevealProps) {
  const reduce = useReducedMotion();
  const words = text.split(/\s+/).filter(Boolean);
  const seen = new Map<string, number>();
  const keys = words.map((word) => {
    const count = seen.get(word) ?? 0;
    seen.set(word, count + 1);
    return `${word}-${count}`;
  });

  return (
    <p
      className={`font-display text-4xl leading-[1.14] font-semibold text-ink sm:text-5xl lg:text-6xl ${className ?? ''}`}
      style={{ maxWidth: 680, textWrap: 'balance' }}
    >
      {words.map((word, index) => (
        <span key={keys[index]}>
          <motion.span
            className="inline-block"
            initial={reduce ? false : { opacity: 0.28 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-12% 0px -18% 0px' }}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 0.55, delay: index * STEP_S, ease: [0.22, 1, 0.36, 1] }
            }
          >
            {word}
          </motion.span>
          {index < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </p>
  );
}
