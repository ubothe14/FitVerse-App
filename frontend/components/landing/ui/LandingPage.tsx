import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import type { DataSourceChoice } from '../../../utils/storage/dataSourceStorage';
import { useTheme } from '../../theme/ThemeProvider';
import { Navigation } from '../../layout/Navigation';
import { ActivityBackground } from '../../layout/ActivityBackground';
import PlatformDock from './PlatformDock';
import { ReviewsCarousel } from './ReviewsCarousel';
import { Flame, CalendarDays, Trophy, BarChart3, Activity, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { FANCY_FONT } from '../../../utils/ui/uiConstants';
import { assetPath } from '../../../constants';

import type { UserProfile } from '../../../utils/storage/localStorage';

interface LandingPageProps {
  userProfile?: UserProfile | null;
  onLoginClick?: () => void;
  onLogout?: () => void;
  onSelectPlatform: (source: DataSourceChoice) => void;
  onTryDemo?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ userProfile, onLoginClick, onLogout, onSelectPlatform, onTryDemo }) => {
  const { mode } = useTheme();
  const isLight = mode === 'light';

  React.useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.showBg = 'true';
    return () => { delete root.dataset.showBg; };
  }, []);

  const [showScrollTop, setShowScrollTop] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Handle scroll to top visibility
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Check both scrollTop (standard) and if there's any other scroll behavior
      const scrollY = container.scrollTop;
      setShowScrollTop(scrollY > 300);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle platform deep link from URL query param
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const platform = params.get('platform');
    if (!platform) return;
    const validPlatforms: DataSourceChoice[] = ['hevy', 'strong', 'lyfta', 'other', 'motra'];
    if (!(validPlatforms as string[]).includes(platform)) return;

    onSelectPlatform(platform as DataSourceChoice);

    params.delete('platform');
    const nextSearch = params.toString();
    const newUrl = window.location.pathname + (nextSearch ? `?${nextSearch}` : '');
    window.history.replaceState(null, '', newUrl);
  }, []);

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Platform dock items
  const platformDockItems = [
    {
      name: 'Hevy',
      image: assetPath('/images/brands/hevy_small.webp'),
      onClick: () => onSelectPlatform('hevy'),
      badge: 'Recommended'
    },
    {
      name: 'Strong',
      image: assetPath('/images/brands/Strong_small.webp'),
      onClick: () => onSelectPlatform('strong'),
      badge: 'CSV'
    },
    {
      name: 'Lyfta',
      image: assetPath('/images/brands/lyfta_small.webp'),
      onClick: () => onSelectPlatform('lyfta'),
      badge: 'API'
    },
    {
      name: 'Motra',
      image: assetPath('/images/brands/motra.webp'),
      onClick: () => onSelectPlatform('motra'),
      badge: 'CSV',
      className: 'hidden sm:inline-flex',
    },
    {
      name: 'Other',
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 15 15' fill='none'><rect x='2' y='5' width='12' height='8' fill='%232ea44f'/><path fill-rule='evenodd' clip-rule='evenodd' d='M1 1.5C1 0.671573 1.67157 0 2.5 0H10.7071L14 3.29289V13.5C14 14.3284 13.3284 15 12.5 15H2.5C1.67157 15 1 14.3284 1 13.5V1.5ZM3 5H4.2V7H3V5ZM3.4 5.4H3.8V6.6H3.4V5.4ZM5 5H6.2V5.4H5.8V7H5.4V5.4H5V5ZM7 5H7.4V5.8H8V5H8.4V7H8V6.2H7.4V7H7V5ZM9.2 5H10.4V5.4H9.6V5.8H10.2V6.2H9.6V6.6H10.4V7H9.2V5ZM11 5H12V6H11.5L12.1 7H11.6L11.1 6.1V7H10.7V5H11ZM11.1 5.4V5.7H11.5V5.4H11.1ZM2.5 11H3.5V12H2.5V11ZM4.5 9H6.5V10H5.2V11H6.5V12H4.5V9ZM7.5 9H9.5V10H8.2V10.3H9.5V12H7.5V11H8.8V10.7H7.5V9ZM10.5 9H11.3L11.8 11L12.3 9H13.1L12.2 12H11.4L10.5 9Z' fill='%23000000'/></svg>",
      badge: 'CSV',
      onClick: () => onSelectPlatform('other'),
    },
  ];

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`activity-shell overflow-y-auto overflow-x-hidden font-sans ${isLight ? 'text-slate-900' : 'text-slate-200'}`}
    >
      <ActivityBackground variant="landing" />
      {/* Navigation */}
      <div className="relative z-10 max-w-6xl mx-auto w-full pt-2">
        <Navigation
          variant="landing"
          className="px-4 sm:px-6 lg:px-8"
          userProfile={userProfile}
          onLoginClick={onLoginClick}
          onLogout={onLogout}
        />
      </div>

      {/* ========== HERO SECTION ========== */}
      <section className="relative z-10 px-4 pb-32 pt-8 sm:px-6 sm:pb-40 lg:px-8">
        <div className="mx-auto grid min-h-[calc(100vh-7rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="max-w-3xl">
            <div className={`mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-lg backdrop-blur-xl ${isLight ? 'border-slate-900/10 bg-white/55 text-slate-700 shadow-slate-300/20' : 'border-white/10 bg-white/[0.06] text-slate-300 shadow-black/20'}`}>
              <Sparkles className="h-4 w-4 text-emerald-400" />
              Live training intelligence for real workout logs
            </div>

            <h1 className="max-w-4xl text-4xl font-black leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl" style={FANCY_FONT}>
              <span className={isLight ? 'text-slate-950' : 'text-white'}>Turn every workout into a </span>
              <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-rose-300 bg-clip-text text-transparent">
                living progress map.
              </span>
            </h1>

            <p className={`mt-6 max-w-2xl text-base leading-8 sm:text-lg ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              FitVerse connects Hevy, Strong, Lyfta, Motra, or CSV exports and turns your history into muscle heatmaps, plateau signals, PR momentum, and AI-ready coaching context. Everything feels instant, visual, and private.
            </p>

            <div className="mt-7 grid max-w-2xl grid-cols-3 gap-2 sm:gap-3">
              {[
                ['19', 'set signals'],
                ['7d', 'volume windows'],
                ['0', 'server storage'],
              ].map(([value, label]) => (
                <div key={label} className={`rounded-xl border p-3 backdrop-blur-xl ${isLight ? 'border-slate-900/10 bg-white/45' : 'border-white/10 bg-white/[0.045]'}`}>
                  <div className={`text-xl font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>{value}</div>
                  <div className={`text-[0.7rem] font-semibold uppercase ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>{label}</div>
                </div>
              ))}
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-[auto] sm:items-center">
              {onTryDemo ? (
                <button
                  onClick={onTryDemo}
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-300 px-5 text-sm font-bold text-slate-950 shadow-xl shadow-emerald-950/20 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-200"
                >
                  <Activity className="h-4 w-4 transition group-hover:scale-110" />
                  Try sample dashboard
                </button>
              ) : null}
            </div>
          </div>

          <div className="relative min-h-[31rem]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className={`relative overflow-hidden rounded-[1.5rem] border p-4 shadow-2xl backdrop-blur-2xl ${isLight ? 'border-slate-900/10 bg-white/62 shadow-slate-400/20' : 'border-white/10 bg-black/34 shadow-black/30'}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className={`text-xs font-bold uppercase ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Today&apos;s signal</p>
                  <h2 className={`text-lg font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>Training command center</h2>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-300 text-slate-950">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: 'PR momentum', value: '+6.8%', icon: Trophy, color: 'text-yellow-300' },
                  { label: 'Weekly volume', value: '142 sets', icon: BarChart3, color: 'text-emerald-300' },
                  { label: 'Recovery zone', value: 'Balanced', icon: ShieldCheck, color: 'text-sky-300' },
                  { label: 'Plateau risk', value: '2 lifts', icon: Flame, color: 'text-rose-300' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <motion.div
                    key={label}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className={`rounded-xl border p-4 transition ${isLight ? 'border-slate-900/10 bg-white/55' : 'border-white/10 bg-white/[0.05]'}`}
                  >
                    <Icon className={`mb-4 h-5 w-5 ${color}`} />
                    <div className={`text-xl font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>{value}</div>
                    <div className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{label}</div>
                  </motion.div>
                ))}
              </div>

              <div className={`mt-3 rounded-xl border p-4 ${isLight ? 'border-slate-900/10 bg-slate-950 text-white' : 'border-white/10 bg-white/[0.055]'}`}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-400">muscle heat</span>
                  <span className="rounded-full bg-emerald-300/15 px-2 py-1 text-xs font-bold text-emerald-300">live</span>
                </div>
                <div className="flex h-28 items-end gap-2">
                  {[48, 76, 58, 92, 70, 44, 86, 62, 78, 54, 88, 66].map((height, index) => (
                    <motion.div
                      key={`${height}-${index}`}
                      initial={{ height: 8 }}
                      animate={{ height }}
                      transition={{ duration: 0.8, delay: index * 0.04, repeat: Infinity, repeatType: 'mirror', repeatDelay: 2.4 }}
                      className="flex-1 rounded-t-md bg-gradient-to-t from-emerald-500 via-teal-300 to-rose-300"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

          {/* ========== REVIEWS SECTION ========== */}
          <section id="reviews" className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="max-w-6xl mx-auto">
              <ReviewsCarousel />
            </div>
          </section>

          {/* ========== WHY FITVERSE SECTION ========== */}
          <section id="why-fitverse" className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight mb-4 ${isLight ? 'text-slate-900' : 'text-slate-200'}`} style={FANCY_FONT}>
                  What your workout app doesn&apos;t tell you
                </h2>
                <p className={`max-w-2xl mx-auto text-lg ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Hevy, Strong, and Lyfta are great at logging. But their built-in charts leave you guessing. FitVerse gives you the answers you actually want.
                </p>
              </div>

              {/* Muscle heatmaps, image: 1.avif */}
              <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
                <div className="lg:order-2 rounded-2xl overflow-hidden aspect-[1/1]">
                  <img src={assetPath('/images/misc/weeklyset.avif')} alt="FitVerse interactive muscle heatmap with exercise drill-down" loading="lazy" className={`w-full h-full object-contain ${isLight ? 'invert' : ''}`} />
                </div>
                <div className="lg:order-1">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-4">
                    <Flame className="w-5 h-5 text-orange-400" />
                  </div>
                  <h3 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'} mb-3`}>Interactive muscle heatmaps</h3>
                  <p className={`${isLight ? 'text-slate-600' : 'text-slate-400'} leading-relaxed mb-3`}>
                    Click any muscle to see exactly which exercises built it, with primary and secondary sets weighted separately. Rolling 7-day windows match your body&apos;s real recovery patterns.
                  </p>
                  <p className="text-slate-500 text-sm">
                    Hypertrophy score &middot; Volume zones &middot; Radar chart &middot; Per-muscle drill-down
                  </p>
                </div>
              </div>

              {/* Plateau detection, image: 2.avif */}
              <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
                <div className="lg:order-1 rounded-2xl overflow-hidden aspect-[4/3]">
                  <img src={assetPath('/images/misc/plateau.avif')} alt="FitVerse exercise status: Getting stronger, Plateauing, Taking a dip" loading="lazy" className={`w-full h-full object-contain ${isLight ? 'invert' : ''}`} />
                </div>
                <div className="lg:order-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-4">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                  </div>
                  <h3 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'} mb-3`}>Plateau detection that actually helps</h3>
                  <p className={`${isLight ? 'text-slate-600' : 'text-slate-400'} leading-relaxed mb-3`}>
                    Every exercise gets a clear status, Getting stronger, Plateauing, or Taking a dip, with confidence levels. When you&apos;re stuck, FitVerse suggests exactly what to change: add 1 rep, bump 2.5 kg, or deload.
                  </p>
                  <p className="text-slate-500 text-sm">
                    Static vs general plateaus &middot; Per-exercise trend analysis &middot; Evidence badges
                  </p>
                </div>
              </div>

              {/* Set-by-set, image: 5.avif */}
              <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
                <div className="lg:order-2 rounded-2xl overflow-hidden aspect-[4/3]">
                  <img src={assetPath('/images/misc/setbyset.avif')} alt="FitVerse set-by-set coaching feedback on each set" loading="lazy" className={`w-full h-full object-contain ${isLight ? 'invert' : ''}`} />
                </div>
                <div className="lg:order-1">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-4">
                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'} mb-3`}>Set-by-set coaching feedback</h3>
                  <p className={`${isLight ? 'text-slate-600' : 'text-slate-400'} leading-relaxed mb-3`}>
                    Open any past workout. FitVerse analyzes every set across 19 scenarios, normal fatigue, premature weight jumps, effective back-off sets, with plain-English badges and improvement suggestions.
                  </p>
                  <p className="text-slate-500 text-sm">
                    19 feedback scenarios &middot; Weight-up/down suggestions &middot; Drop set &amp; AMRAP detection
                  </p>
                </div>
              </div>

              {/* AI export, image: AI.avif */}
              <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
                <div className="lg:order-2 rounded-2xl overflow-hidden aspect-[1/1]">
                  <img src={assetPath('/images/misc/AI.avif')} alt="FitVerse AI analysis prompt generator" loading="lazy" className={`w-full h-full object-contain ${isLight ? 'invert' : ''}`} />
                </div>
                <div className="lg:order-1">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-4">
                    <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 0-4 4v1H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3V6a4 4 0 0 0-4-4z"/><path d="M12 11v4"/><path d="M8 11v4"/><path d="M16 11v4"/></svg>
                  </div>
                  <h3 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'} mb-3`}>AI-ready analysis export</h3>
                  <p className={`${isLight ? 'text-slate-600' : 'text-slate-400'} leading-relaxed mb-3`}>
                    Export your structured training data in one click. Choose from 8 built-in analysis modules, junk volume audit, structural balance, joint health, or write your own prompt. Paste into any AI.
                  </p>
                  <p className="text-slate-500 text-sm">
                    8 analysis modules &middot; Custom prompts &middot; Timeframe selection &middot; Runs in your browser
                  </p>
                </div>
              </div>

              {/* Hypertrophy scatter, image: hypertrophy.avif */}
              <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
                <div className="lg:order-1 rounded-2xl overflow-hidden aspect-[1/1]">
                  <img src={assetPath('/images/misc/hypertrophy.avif')} alt="FitVerse hypertrophy scatter plot showing volume vs progressive overload by muscle" loading="lazy" className={`w-full h-full object-contain ${isLight ? 'invert' : ''}`} />
                </div>
                <div className="lg:order-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-4">
                    <Activity className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'} mb-3`}>Volume vs progressive overload</h3>
                  <p className={`${isLight ? 'text-slate-600' : 'text-slate-400'} leading-relaxed mb-3`}>
                    Are you doing enough volume, or just going through the motions? The hypertrophy scatter plot maps every muscle across four quadrants, efficiency zone, optimal growth, neglected, and volume focus, so you see exactly which muscles need more stimulus and which need progressive overload.
                  </p>
                  <p className="text-slate-500 text-sm">
                    Per-muscle scatter plot &middot; 4-zone quadrant analysis &middot; Actionable recommendations
                  </p>
                </div>
              </div>

              {/* Calendar filtering, image: calender.avif */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="lg:order-2 rounded-2xl overflow-hidden aspect-[1/1]">
                  <img src={assetPath('/images/misc/calender.avif')} alt="FitVerse calendar filtering with date range selection and filtered dashboard" loading="lazy" className={`w-full h-full object-contain ${isLight ? 'invert' : ''}`} />
                </div>
                <div className="lg:order-1">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-4">
                    <CalendarDays className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'} mb-3`}>Calendar filtering that rebuilds everything</h3>
                  <p className={`${isLight ? 'text-slate-600' : 'text-slate-400'} leading-relaxed mb-3`}>
                    Pick any date range, last month, all of 2025, a single week. Every chart, metric, and insight recalculates for just that window. Compare training blocks in seconds.
                  </p>
                  <p className="text-slate-500 text-sm">
                    Day / week / month / year selection &middot; Multi-range picker &middot; Instant recalculation
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ========== PLATFORM DOCK ========== */}
          <PlatformDock items={platformDockItems} />

      {/* ========== FOOTER ========== */}
      <footer className={`relative z-10 border-t mt-16 px-4 sm:px-6 lg:px-8 py-10 ${isLight ? 'border-black/10' : 'border-white/10'}`}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 text-sm">
          <div>
            <h3 className={`font-semibold mb-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>Product</h3>
            <ul className="space-y-2">
              <li><a href={assetPath('about/')} className={`${isLight ? 'text-slate-600 hover:text-emerald-600' : 'text-slate-400 hover:text-emerald-400'} transition-colors duration-200`}>About</a></li>
              <li><a href={assetPath('how-it-works/')} className={`${isLight ? 'text-slate-600 hover:text-emerald-600' : 'text-slate-400 hover:text-emerald-400'} transition-colors duration-200`}>How it works</a></li>
              <li><a href={assetPath('features/')} className={`${isLight ? 'text-slate-600 hover:text-emerald-600' : 'text-slate-400 hover:text-emerald-400'} transition-colors duration-200`}>Features</a></li>
              <li><a href={assetPath('faq/')} className={`${isLight ? 'text-slate-600 hover:text-emerald-600' : 'text-slate-400 hover:text-emerald-400'} transition-colors duration-200`}>FAQ</a></li>
            </ul>
          </div>
          <div>
            <h3 className={`font-semibold mb-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>Resources</h3>
            <ul className="space-y-2">
              <li><a href={assetPath('supported-apps/')} className={`${isLight ? 'text-slate-600 hover:text-emerald-600' : 'text-slate-400 hover:text-emerald-400'} transition-colors duration-200`}>Supported apps</a></li>
              <li><a href={assetPath('metrics/')} className={`${isLight ? 'text-slate-600 hover:text-emerald-600' : 'text-slate-400 hover:text-emerald-400'} transition-colors duration-200`}>Metrics glossary</a></li>
              <li><a href={assetPath('ai/')} className={`${isLight ? 'text-slate-600 hover:text-emerald-600' : 'text-slate-400 hover:text-emerald-400'} transition-colors duration-200`}>AI reference</a></li>
            </ul>
          </div>
          <div>
            <h3 className={`font-semibold mb-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>Compare</h3>
            <ul className="space-y-2">
              <li><a href={assetPath('hevy-vs-lyfta/')} className={`${isLight ? 'text-slate-600 hover:text-emerald-600' : 'text-slate-400 hover:text-emerald-400'} transition-colors duration-200`}>Hevy vs Lyfta vs Strong</a></li>
            </ul>
          </div>
          <div>
            <h3 className={`font-semibold mb-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>Company</h3>
            <ul className="space-y-2">
              <li><a href={assetPath('privacy/')} className={`${isLight ? 'text-slate-600 hover:text-emerald-600' : 'text-slate-400 hover:text-emerald-400'} transition-colors duration-200`}>Privacy</a></li>
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <h3 className={`font-semibold mb-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>FitVerse</h3>
            <p className="text-slate-500 leading-relaxed text-xs">
              Free workout analytics. No account needed. Runs locally in your browser.
            </p>
          </div>
        </div>
        <div className={`max-w-6xl mx-auto mt-8 pt-6 border-t text-center text-xs ${isLight ? 'border-black/5 text-slate-500' : 'border-white/5 text-slate-600'}`}>
          &copy; {new Date().getFullYear()} FitVerse. Licensed under AGPL-3.0.
        </div>
      </footer>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className={`fixed bottom-6 right-6 z-[101] p-3 rounded-full border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-colors shadow-lg backdrop-blur-sm ${isLight ? 'bg-white/80' : 'bg-slate-900/80'}`}
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Feature tag component
interface FeatureTagProps {
  icon: React.ReactNode;
  text: string;
}

const FeatureTag: React.FC<FeatureTagProps> = ({ icon, text }) => (
  <span className="inline-flex items-center gap-1.5 text-sm">
    {icon}
    <span>{text}</span>
  </span>
);

export default LandingPage;
