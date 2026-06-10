import React from 'react';
import { Info, Sparkles, Menu, LogOut, LogIn, UserCircle2 } from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';
import { assetPath } from '../../constants';
import { SEMI_FANCY_FONT } from '../../utils/ui/uiConstants';
import type { UserProfile } from '../../utils/storage/localStorage';

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

type NavigationProps = {
  activeNav?: 'how-it-works' | 'features' | null;
  variant?: 'landing' | 'info';
  className?: string;
  userProfile?: UserProfile | null;
  onNavClick?: (nav: 'how-it-works' | 'features') => void;
  onLogoClick?: () => void;
  onLoginClick?: () => void;
  onLogout?: () => void;
};

export const Navigation: React.FC<NavigationProps> = ({
  activeNav = null,
  variant = 'landing',
  className = '',
  userProfile,
  onNavClick,
  onLogoClick,
  onLoginClick,
  onLogout,
}) => {
  const { mode } = useTheme();
  const isLight = mode === 'light';
  return (
    <header className={`h-20 sm:h-24 flex items-center justify-between ${className}`}>
      {/* Logo on the left */}
      {onLogoClick ? (
        <button
          onClick={onLogoClick}
          className={`flex items-center gap-2 sm:gap-3 rounded-xl px-1.5 sm:px-2 py-1 transition-colors cursor-pointer ${isLight ? 'hover:bg-black/5' : 'hover:bg-white/5'}`}
        >
          <img src={assetPath('/UI/logo.png')} alt="FitVerse Logo" className="w-6 h-6 sm:w-8 sm:h-8" />
          <span className={`font-semibold text-sm sm:text-xl ${isLight ? 'text-slate-900' : 'text-white'}`} style={SEMI_FANCY_FONT}>FitVerse</span>
        </button>
      ) : (
        <a href={assetPath('/')} className={`flex items-center gap-2 sm:gap-3 rounded-xl px-1.5 sm:px-2 py-1 transition-colors ${isLight ? 'hover:bg-black/5' : 'hover:bg-white/5'}`}>
          <img src={assetPath('/UI/logo.png')} alt="FitVerse Logo" className="w-6 h-6 sm:w-8 sm:h-8" />
          <span className={`font-semibold text-sm sm:text-xl ${isLight ? 'text-slate-900' : 'text-white'}`} style={SEMI_FANCY_FONT}>FitVerse</span>
        </a>
      )}

      {/* Navigation links on the right - Desktop */}
      <div className="hidden sm:flex items-center gap-5">
        {onNavClick ? (
          <button
            onClick={() => onNavClick('how-it-works')}
            className={`inline-flex items-center gap-1.5 transition-colors duration-200 text-sm font-medium cursor-pointer ${activeNav === 'how-it-works'
                ? 'text-emerald-300'
                : `${isLight ? 'text-slate-600 hover:text-emerald-600' : 'text-slate-300 hover:text-emerald-300'}`
              }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>How it works</span>
          </button>
        ) : (
          <a
            href={assetPath('how-it-works/')}
            className={`inline-flex items-center gap-1.5 transition-colors duration-200 text-sm font-medium ${variant === 'info' && activeNav === 'how-it-works'
                ? 'text-emerald-300'
                : `${isLight ? 'text-slate-600 hover:text-emerald-600' : 'text-slate-300 hover:text-emerald-300'}`
              }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>How it works</span>
          </a>
        )}
        {onNavClick ? (
          <button
            onClick={() => onNavClick('features')}
            className={`inline-flex items-center gap-1.5 transition-colors duration-200 text-sm font-medium cursor-pointer ${activeNav === 'features'
                ? 'text-emerald-300'
                : `${isLight ? 'text-slate-600 hover:text-emerald-600' : 'text-slate-300 hover:text-emerald-300'}`
              }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Features</span>
          </button>
        ) : (
          <a
            href={assetPath('features/')}
            className={`inline-flex items-center gap-1.5 transition-colors duration-200 text-sm font-medium ${variant === 'info' && activeNav === 'features'
                ? 'text-emerald-300'
                : `${isLight ? 'text-slate-600 hover:text-emerald-600' : 'text-slate-300 hover:text-emerald-300'}`
              }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Features</span>
          </a>
        )}

        {/* User Auth Controls */}
        {userProfile ? (
          <div className="flex items-center gap-2 border-l pl-4 ml-2 border-white/10">
            <span className={`text-sm font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              {userProfile.name}
            </span>
            <button
              onClick={onLogout}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border border-rose-500/25 bg-rose-500/10 text-xs font-semibold text-rose-200 shadow-sm transition duration-200 hover:bg-rose-500/20 hover:border-rose-400/50 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Logout</span>
            </button>
          </div>
        ) : onLoginClick ? (
          <div className="border-l pl-4 ml-2 border-white/10">
            <button
              onClick={onLoginClick}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition duration-200 hover:from-emerald-400 hover:to-teal-400 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In</span>
            </button>
          </div>
        ) : null}
      </div>

      {/* Mobile Navigation - all buttons on the right */}
      <div className="sm:hidden flex items-center gap-2">
        {onNavClick ? (
          <button
            onClick={() => onNavClick('how-it-works')}
            className={`inline-flex items-center gap-1 text-xs px-1.5 py-1 transition-colors cursor-pointer ${activeNav === 'how-it-works'
              ? 'text-emerald-200'
              : `${isLight ? 'text-slate-600 hover:text-emerald-600' : 'text-slate-300 hover:text-emerald-200'}`
              }`}
          >
            <Info className="w-2.5 h-2.5" />
            <span>How it works</span>
          </button>
        ) : (
          <a
            href={assetPath('how-it-works/')}
            className={`inline-flex items-center gap-1 text-xs px-1.5 py-1 transition-colors ${variant === 'info' && activeNav === 'how-it-works'
              ? 'text-emerald-200'
              : `${isLight ? 'text-slate-600 hover:text-emerald-600' : 'text-slate-300 hover:text-emerald-200'}`
              }`}
          >
            <Info className="w-2.5 h-2.5" />
            <span>How it works</span>
          </a>
        )}
        {onNavClick ? (
          <button
            onClick={() => onNavClick('features')}
            className={`inline-flex items-center gap-1 text-xs px-1.5 py-1 transition-colors cursor-pointer ${activeNav === 'features'
              ? 'text-emerald-200'
              : `${isLight ? 'text-slate-600 hover:text-emerald-600' : 'text-slate-300 hover:text-emerald-200'}`
              }`}
          >
            <Sparkles className="w-2.5 h-2.5" />
            <span>Features</span>
          </button>
        ) : (
          <a
            href={assetPath('features/')}
            className={`inline-flex items-center gap-1 text-xs px-1.5 py-1 transition-colors ${variant === 'info' && activeNav === 'features'
              ? 'text-emerald-200'
              : `${isLight ? 'text-slate-600 hover:text-emerald-600' : 'text-slate-300 hover:text-emerald-200'}`
              }`}
          >
            <Sparkles className="w-2.5 h-2.5" />
            <span>Features</span>
          </a>
        )}

        {/* Mobile User Auth Controls */}
        {userProfile ? (
          <div className="flex items-center border-l pl-2 ml-1 border-white/10">
            <button
              onClick={onLogout}
              className="inline-flex items-center justify-center gap-1 h-7 px-2.5 rounded-md border border-rose-500/25 bg-rose-500/10 text-[10px] font-semibold text-rose-200 shadow-sm transition duration-200 cursor-pointer"
            >
              <LogOut className="w-3 h-3 text-rose-400" />
            </button>
          </div>
        ) : onLoginClick ? (
          <div className="border-l pl-2 ml-1 border-white/10">
            <button
              onClick={onLoginClick}
              className="inline-flex items-center justify-center gap-1 h-7 px-3 rounded-md bg-gradient-to-r from-emerald-500 to-teal-500 text-[10px] font-semibold text-white shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <span>Log In</span>
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
};
