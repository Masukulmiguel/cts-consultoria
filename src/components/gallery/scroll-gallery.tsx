'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Lightbox } from './lightbox';

export type ScrollGalleryImage = {
  src: string;
  alt: string;
  className?: string;
};

type ScrollGalleryProps = {
  images: ScrollGalleryImage[];
  children: ReactNode;
};

export function ScrollGallery({ images, children }: ScrollGalleryProps) {
  const reduce = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const distance = element.offsetHeight - window.innerHeight;
      if (distance <= 0) {
        setProgress(0);
        return;
      }
      const value = Math.min(1, Math.max(0, -rect.top / distance));
      setProgress(value);
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const count = images.length;
  const position = progress * (count - 1);
  const activeIndex = Math.min(count - 1, Math.round(position));

  const openLightbox = useCallback((index: number) => setLightboxIndex(index), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  return (
    <>
      <div ref={wrapperRef} className="lg:relative lg:h-[400vh]">
        <div className="lg:sticky lg:top-[var(--header-height)] lg:flex lg:min-h-[calc(100vh-var(--header-height))] lg:items-center lg:py-10">
          <div className="grid w-full gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>{children}</div>

            <div className="hidden lg:block">
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-border bg-surface-muted shadow-lg">
                {images.map((image, index) => {
                  const opacity = reduce
                    ? index === activeIndex
                      ? 1
                      : 0
                    : Math.min(1, Math.max(0, 1 - Math.abs(position - index)));
                  return (
                    <button
                      key={image.src}
                      type="button"
                      onClick={() => openLightbox(index)}
                      aria-label={`Ver foto: ${image.alt}`}
                      className="absolute inset-0 cursor-zoom-in"
                      style={{
                        opacity,
                        pointerEvents: index === activeIndex ? 'auto' : 'none',
                      }}
                      tabIndex={index === activeIndex ? 0 : -1}
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(max-width: 1024px) 50vw, 55vw"
                        className="object-cover"
                        priority={index === 0}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center gap-4">
                <p className="text-xs font-semibold tabular-nums tracking-[0.18em] text-ink-muted">
                  {String(activeIndex + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
                </p>
                <div className="flex flex-1 gap-1.5">
                  {images.map((image, index) => (
                    <span
                      key={image.src}
                      className="h-1 flex-1 overflow-hidden rounded-full bg-border"
                    >
                      <span
                        className="block h-full rounded-full bg-primary-600 transition-transform duration-300"
                        style={{
                          transform: `scaleX(${Math.min(1, Math.max(0, position - index + 1))})`,
                          transformOrigin: 'left',
                        }}
                      />
                    </span>
                  ))}
                </div>
                <span className="h-2 w-2 rounded-full bg-accent-500" aria-hidden="true" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:hidden">
              {images.map((image, index) => (
                <figure
                  key={image.src}
                  className={`group relative aspect-4/3 overflow-hidden rounded-lg border border-border ${image.className ?? ''}`}
                >
                  <button
                    type="button"
                    onClick={() => openLightbox(index)}
                    aria-label={`Ver foto: ${image.alt}`}
                    className="absolute inset-0 h-full w-full cursor-zoom-in"
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 1024px) 50vw, 30vw"
                      className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                    />
                  </button>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            images={images}
            index={lightboxIndex}
            onClose={closeLightbox}
            onIndexChange={setLightboxIndex}
          />
        )}
      </AnimatePresence>
    </>
  );
}
