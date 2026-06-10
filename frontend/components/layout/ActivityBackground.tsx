import React from 'react';
import { Activity, Dumbbell, HeartPulse, Zap } from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';

interface ActivityBackgroundProps {
  variant?: 'landing' | 'app';
}

export const ActivityBackground: React.FC<ActivityBackgroundProps> = ({ variant = 'app' }) => {
  const { mode } = useTheme();
  const isLight = mode === 'light';

  return (
    <div
      className={`activity-bg activity-bg--${variant} ${isLight ? 'activity-bg--light' : 'activity-bg--dark'}`}
      aria-hidden="true"
    >
      <div className="activity-bg__mesh" />
      <div className="activity-bg__grid" />
      <div className="activity-bg__pulse activity-bg__pulse--one" />
      <div className="activity-bg__pulse activity-bg__pulse--two" />
      <div className="activity-bg__pulse activity-bg__pulse--three" />
      <div className="activity-bg__overlay" />

      <div className="activity-bg__ticker activity-bg__ticker--one">
        <Activity className="h-4 w-4" />
        <span>volume trend</span>
        <span>+12%</span>
      </div>
      <div className="activity-bg__ticker activity-bg__ticker--two">
        <Dumbbell className="h-4 w-4" />
        <span>upper push</span>
        <span>ready</span>
      </div>
      <div className="activity-bg__ticker activity-bg__ticker--three">
        <HeartPulse className="h-4 w-4" />
        <span>recovery</span>
        <span>steady</span>
      </div>
      <div className="activity-bg__ticker activity-bg__ticker--four">
        <Zap className="h-4 w-4" />
        <span>PR signal</span>
        <span>hot</span>
      </div>

      <svg className="activity-bg__wave" viewBox="0 0 1200 260" preserveAspectRatio="none">
        <path d="M0 170 C110 70 220 245 340 130 C470 8 575 228 700 116 C820 8 940 180 1200 72" />
        <path d="M0 205 C130 115 230 250 365 165 C510 72 620 215 760 126 C900 37 1010 184 1200 132" />
      </svg>
    </div>
  );
};
