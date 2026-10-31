'use client';

import { heroSlides } from '@/content/hero';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

const AUTOPLAY_MS = 7000;

export function HeroSlider({ locale }: { locale: 'pt' | 'en' }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const total = heroSlides.length;

  const goTo = useCallback(
    (next: number) => {
      setIndex((next + total) % total);
    },
    [total],
  );

  useEffect(() => {
    if (reduce || paused) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % total);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, reduce, total]);

  const slide = heroSlides[index];

  return (
    <section
      aria-roledescription="carousel"
      aria-label={locale === 'pt' ? 'Destaques' : 'Highlights'}
      className="relative isolate overflow-hidden bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') goTo(index + 1);
        if (event.key === 'ArrowLeft') goTo(index - 1);
      }}
    >
      <div className="relative h-[560px] w-full sm:h-[640px] lg:h-[calc(100vh-116px)] lg:min-h-[620px]">
        {heroSlides.map((item, itemIndex) => {
          const active = itemIndex === index;
          return (
            <motion.div
              key={item.id}
              initial={false}
              animate={{ opacity: active ? 1 : 0 }}
              transition={{ duration: reduce ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
              aria-hidden={!active}
            >
              <motion.div
                animate={reduce ? {} : { scale: active ? [1, 1.08] : 1 }}
                transition={
                  reduce
                    ? undefined
                    : {
                        duration: AUTOPLAY_MS / 1000,
                        ease: 'linear',
                        repeat: active ? Number.POSITIVE_INFINITY : 0,
                      }
                }
                className="absolute inset-0"
              >
                <Image
                  src={item.image}
                  alt=""
                  fill
                  priority={itemIndex === 0}
                  sizes="100vw"
                  className="object-cover"
                />
              </motion.div>
            </motion.div>
          );
        })}

        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/90 to-ink/60 lg:bg-gradient-to-r lg:from-ink lg:via-ink/85 lg:to-ink/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />

        <div className="relative flex h-full items-center">
          <div className="shell on-dark">
            {heroSlides.map((item, itemIndex) => (
              <motion.div
                key={item.id}
                initial={false}
                animate={{
                  opacity: itemIndex === index ? 1 : 0,
                  y: itemIndex === index ? 0 : 18,
                }}
                transition={{ duration: reduce ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={`max-w-2xl ${itemIndex === index ? '' : 'pointer-events-none absolute inset-x-5 sm:inset-x-8 lg:inset-x-10'}`}
                aria-hidden={itemIndex !== index}
              >
                <p className="eyebrow text-accent-300">{item.kicker[locale]}</p>
                {itemIndex === 0 ? (
                  <h1 className="mt-4 bg-gradient-to-r from-white to-white/65 bg-clip-text font-display text-3xl leading-[1.1] font-bold text-transparent sm:mt-5 sm:text-5xl lg:text-6xl">
                    {item.title[locale]}
                  </h1>
                ) : (
                  <h2 className="mt-4 bg-gradient-to-r from-white to-white/65 bg-clip-text font-display text-3xl leading-[1.1] font-bold text-transparent sm:mt-5 sm:text-5xl lg:text-6xl">
                    {item.title[locale]}
                  </h2>
                )}
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:mt-6 sm:text-lg">
                  {item.text[locale]}
                </p>
                <div className="mt-6 flex flex-wrap gap-3 sm:mt-9">
                  <Link
                    href={item.cta.href[locale]}
                    className="btn-accent"
                    tabIndex={itemIndex === index ? 0 : -1}
                  >
                    {item.cta.label[locale]}
                    <ArrowRight size={17} />
                  </Link>
                  <Link
                    href={item.secondary.href[locale]}
                    className="btn-ghost-dark"
                    tabIndex={itemIndex === index ? 0 : -1}
                  >
                    {item.secondary.label[locale]}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0">
          <div className="shell flex items-end justify-between gap-6 pb-8">
            <div className="flex items-center gap-3">
              {heroSlides.map((item, itemIndex) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goTo(itemIndex)}
                  aria-label={`${itemIndex + 1} / ${total}`}
                  aria-current={itemIndex === index}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    itemIndex === index ? 'w-10 bg-accent-500' : 'w-5 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                aria-label={locale === 'pt' ? 'Slide anterior' : 'Previous slide'}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                aria-label={locale === 'pt' ? 'Slide seguinte' : 'Next slide'}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
