import React from 'react';
import {
  Activity,
  ArrowLeft,
  Brain,
  Calendar,
  Dumbbell,
  History,
  LayoutDashboard,
  LogOut,
  Pencil,
  RefreshCw,
  Settings,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';
import { assetPath } from '../../constants';
import { Tab } from '../../app/navigation';
import { ThemeToggleButton } from '../theme/ThemeToggleButton';
import type { OnboardingFlow } from '../../app/onboarding/types';
import { clearCSVData } from '../../utils/storage/localStorage';
import { SEMI_FANCY_FONT } from '../../utils/ui/uiConstants';

const DEMO_MODE_KEY = 'hevy_analytics_demo_mode';

const isDemoMode = (): boolean => localStorage.getItem(DEMO_MODE_KEY) === '1';

interface AppHeaderProps {
  onSetOnboarding: (next: OnboardingFlow | null) => void;
  activeTab: Tab;
  onSelectTab: (tab: Tab) => void;
  onOpenUpdateFlow: () => void;
  onOpenPreferences: () => void;
  onLogout: () => void;
  calendarOpen: boolean;
  onToggleCalendarOpen: () => void;
  hasActiveCalendarFilter: boolean;
  onClearCalendarFilter: () => void;
}

const tabs = [
  { tab: Tab.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { tab: Tab.EXERCISES, label: 'Exercises', icon: Dumbbell },
  { tab: Tab.MUSCLE_ANALYSIS, label: 'Muscle', icon: Activity },
  { tab: Tab.HISTORY, label: 'History', icon: History },
  { tab: Tab.FLEX, label: 'Flex', icon: Trophy },
  { tab: Tab.AI, label: 'AI Coach', icon: Brain },
];

export const AppHeader: React.FC<AppHeaderProps> = ({
  onSetOnboarding,
  activeTab,
  onSelectTab,
  onOpenUpdateFlow,
  onOpenPreferences,
  onLogout,
  calendarOpen,
  onToggleCalendarOpen,
  hasActiveCalendarFilter,
  onClearCalendarFilter,
}) => {
  const handleExitDemo = () => {
    localStorage.removeItem(DEMO_MODE_KEY);
    clearCSVData();
    onSetOnboarding({ intent: 'update', step: 'platform' });
  };

  const actionButton =
    'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-200 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300/50 hover:bg-white/[0.1] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60';

  return (
    <header className="relative z-20 flex-shrink-0 px-2 pt-2 sm:px-3 sm:pt-3">
      <div className="rounded-[1.15rem] border border-white/10 bg-black/30 p-2 shadow-2xl shadow-black/20 backdrop-blur-2xl">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-emerald-300/20 bg-emerald-400/10 shadow-lg shadow-emerald-950/20">
                <img src={assetPath('/UI/logo.png')} alt="FitVerse Logo" className="h-7 w-7" decoding="async" />
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border border-black bg-emerald-300 shadow-[0_0_20px_rgba(110,231,183,0.9)]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-lg font-bold tracking-tight text-white sm:text-xl" style={SEMI_FANCY_FONT}>
                    FitVerse
                  </span>
                  <span className="hidden items-center gap-1 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2 py-0.5 text-[0.68rem] font-semibold text-emerald-200 sm:inline-flex">
                    <Sparkles className="h-3 w-3" />
                    Live analytics
                  </span>
                </div>
                <p className="truncate text-xs font-medium text-slate-400">
                  Training signal, progress, and recovery in one workspace
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 md:hidden">
              <ThemeToggleButton compact />
              <button type="button" onClick={onOpenPreferences} className={actionButton} title="User Preferences" aria-label="User Preferences">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between xl:justify-end">
            <nav className="grid grid-cols-7 gap-1 rounded-xl border border-white/10 bg-white/[0.045] p-1 sm:grid-cols-6 lg:min-w-[40rem]">
              {tabs.map(({ tab, label, icon: Icon }) => {
                const selected = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => onSelectTab(tab)}
                    className={`group relative flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition duration-200 sm:gap-2 sm:px-3 ${
                      selected
                        ? 'bg-white text-slate-950 shadow-lg shadow-black/20'
                        : 'text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${selected ? 'text-emerald-600' : 'text-current'}`} />
                    <span className="hidden sm:inline">{label}</span>
                    <span className="text-[0.64rem] sm:hidden">{label}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={onToggleCalendarOpen}
                className={`relative flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition duration-200 sm:hidden ${
                  hasActiveCalendarFilter
                    ? 'bg-amber-300 text-slate-950 shadow-lg shadow-amber-950/20'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
                title="Calendar"
                aria-label="Calendar"
              >
                {calendarOpen || hasActiveCalendarFilter ? <Pencil className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                <span className="text-[0.64rem]">Dates</span>
                {hasActiveCalendarFilter && !calendarOpen ? (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearCalendarFilter();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        onClearCalendarFilter();
                      }
                    }}
                    className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-slate-950 text-white"
                    aria-label="Clear calendar filter"
                    title="Clear"
                  >
                    <X className="h-3 w-3" />
                  </span>
                ) : null}
              </button>
            </nav>

            <div className="hidden items-center gap-2 md:flex">
              {isDemoMode() ? (
                <button
                  type="button"
                  onClick={handleExitDemo}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-3 text-xs font-semibold text-emerald-200 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-300/15 hover:text-emerald-100"
                  title="Exit Demo"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
              ) : null}
              <ThemeToggleButton />
              <button type="button" onClick={onOpenPreferences} className={actionButton} title="User Preferences" aria-label="User Preferences">
                <Settings className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onOpenUpdateFlow}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-300/25 bg-emerald-300/12 px-3 text-xs font-semibold text-emerald-100 shadow-lg shadow-emerald-950/20 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200/50 hover:bg-emerald-300/18 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Update Data</span>
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/12 px-3 text-xs font-semibold text-rose-200 shadow-lg shadow-rose-950/20 transition duration-200 hover:-translate-y-0.5 hover:border-rose-400/50 hover:bg-rose-500/18 cursor-pointer"
                title="Logout & Clear Cache"
              >
                <LogOut className="h-4 w-4 text-rose-400" />
                <span>Logout</span>
              </button>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              {isDemoMode() ? (
                <button
                  type="button"
                  onClick={handleExitDemo}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-2.5 text-xs font-semibold text-emerald-200 cursor-pointer"
                  title="Exit Demo"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>
              ) : null}
              <button
                type="button"
                onClick={onOpenUpdateFlow}
                className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-300/25 bg-emerald-300/12 px-3 text-xs font-semibold text-emerald-100 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Update Data</span>
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/12 px-3 text-xs font-semibold text-rose-200 cursor-pointer"
                title="Logout & Clear Cache"
              >
                <LogOut className="h-4.5 w-4.5 text-rose-400" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
