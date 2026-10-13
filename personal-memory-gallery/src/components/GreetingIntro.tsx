import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, X } from 'lucide-react';

interface GreetingIntroProps {
  isOpen: boolean;
  onComplete: () => void;
}

interface GreetingItem {
  id: number;
  text: string;
  dir: 'ltr' | 'rtl';
  fontClass: string;
  subtext?: string;
}

const GREETINGS: GreetingItem[] = [
  {
    id: 1,
    text: 'Welcome',
    dir: 'ltr',
    fontClass: 'font-serif-display tracking-tight font-light',
  },
  {
    id: 2,
    text: 'السلام علیکم',
    dir: 'rtl',
    fontClass: 'font-arabic font-normal leading-relaxed',
  },
  {
    id: 3,
    text: 'پخير راغلے',
    dir: 'rtl',
    fontClass: 'font-pashto font-normal leading-relaxed',
  },
];

export const GreetingIntro: React.FC<GreetingIntroProps> = ({ isOpen, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isCurtainLifting, setIsCurtainLifting] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    // Check user preference for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    setCurrentIndex(0);
    setIsCurtainLifting(false);

    if (prefersReducedMotion) {
      // If reduced motion is requested, finish quickly without rapid transitions
      const timer = setTimeout(() => {
        onComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }

    // Timing sequence for 3 greetings:
    // Greeting 1 (0 -> 1): at 1400ms
    // Greeting 2 (1 -> 2): at 2800ms
    // Greeting 3 finishes & curtain lifts: at 4300ms
    // Complete callback: at 5100ms
    const t1 = setTimeout(() => setCurrentIndex(1), 1400);
    const t2 = setTimeout(() => setCurrentIndex(2), 2800);
    const t3 = setTimeout(() => setIsCurtainLifting(true), 4250);
    const t4 = setTimeout(() => onComplete(), 5150);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isOpen, onComplete, prefersReducedMotion]);

  if (!isOpen) return null;

  const currentGreeting = GREETINGS[currentIndex];

  return (
    <AnimatePresence>
      <motion.div
        key="greeting-curtain"
        initial={{ y: 0 }}
        animate={{ y: isCurtainLifting ? '-100%' : 0 }}
        exit={{ y: '-100%' }}
        transition={{
          duration: 0.9,
          ease: [0.76, 0, 0.24, 1], // Smooth cinematic curtain glide curve
        }}
        className="fixed inset-0 z-50 flex flex-col justify-between items-center bg-stone-950 text-stone-100 overflow-hidden select-none"
      >
        {/* Subtle Ambient Background Grain & Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.06),transparent_65%)] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-transparent to-stone-950 pointer-events-none" />

        {/* Top Bar: Skip Intro Button */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-500 text-xs tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="font-mono text-[11px] text-stone-400">Personal Memory Sanctuary</span>
          </div>

          <button
            onClick={onComplete}
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900/80 hover:bg-stone-800 border border-stone-800 text-xs text-stone-300 hover:text-amber-300 transition-all shadow-lg active:scale-95"
            title="Skip directly to gallery"
          >
            <span>Skip Intro</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Center Stage: Cinematic Slide-up with Motion Blur */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 w-full text-center">
          <div className="h-40 flex items-center justify-center overflow-hidden w-full max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentGreeting.id}
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { y: 45, opacity: 0, filter: 'blur(10px)' }
                }
                animate={
                  prefersReducedMotion
                    ? { opacity: 1 }
                    : { y: 0, opacity: 1, filter: 'blur(0px)' }
                }
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { y: -45, opacity: 0, filter: 'blur(10px)' }
                }
                transition={{
                  duration: prefersReducedMotion ? 0.3 : 0.65,
                  ease: [0.22, 1, 0.36, 1], // Smooth decelerating ease
                }}
                dir={currentGreeting.dir}
                className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-stone-100 drop-shadow-2xl ${currentGreeting.fontClass}`}
                style={{
                  textRendering: 'optimizeLegibility',
                }}
              >
                <span className="inline-block bg-gradient-to-b from-stone-100 via-stone-200 to-amber-200/90 bg-clip-text text-transparent">
                  {currentGreeting.text}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Stepper indicator dots */}
          <div className="mt-8 flex items-center gap-2">
            {GREETINGS.map((g, idx) => (
              <div
                key={g.id}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  idx === currentIndex
                    ? 'w-8 bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                    : idx < currentIndex
                    ? 'w-2 bg-stone-600'
                    : 'w-2 bg-stone-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Bar: Animated Continuous Progress Line */}
        <div className="relative z-10 w-full">
          <div className="w-full h-1 bg-stone-900 overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: isCurtainLifting ? '100%' : `${((currentIndex + 1) / 3) * 100}%` }}
              transition={{
                duration: 1.35,
                ease: 'easeInOut',
              }}
              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
