'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

export type LightboxImage = {
  src: string;
  alt: string;
};

export type LightboxProps = {
  images: LightboxImage[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

export function Lightbox({ images, index, onClose, onIndexChange }: LightboxProps) {
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const image = images[index];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') onIndexChange((index + 1) % images.length);
      if (event.key === 'ArrowLeft') onIndexChange((index - 1 + images.length) % images.length);
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
  }, [index, images.length, onClose, onIndexChange]);

  if (!image) return null;

  return (
    <motion.dialog
      open
      aria-modal="true"
      aria-label={image.alt}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] m-0 flex h-full w-full max-w-none flex-col border-0 bg-[rgb(11_27_47/0.94)] p-4 text-inherit sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex items-center justify-between gap-4 text-white">
        <p className="text-xs font-semibold tracking-[0.18em] text-white/70">
          {index + 1} / {images.length}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Fechar visualização"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 transition-colors hover:bg-white/10"
        >
          <X size={20} />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center py-4">
        <button
          type="button"
          onClick={() => onIndexChange((index - 1 + images.length) % images.length)}
          aria-label="Foto anterior"
          className="absolute left-0 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-ink/60 text-white transition-colors hover:bg-white/10 sm:left-2"
        >
          <ChevronLeft size={22} />
        </button>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={image.src}
            initial={reduce ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="relative h-full w-full max-w-5xl"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 90vw"
              className="object-contain"
              priority
            />
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={() => onIndexChange((index + 1) % images.length)}
          aria-label="Foto seguinte"
          className="absolute right-0 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-ink/60 text-white transition-colors hover:bg-white/10 sm:right-2"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      <p className="mx-auto max-w-3xl text-center text-sm leading-relaxed text-white/80">
        {image.alt}
      </p>
    </motion.dialog>
  );
}
