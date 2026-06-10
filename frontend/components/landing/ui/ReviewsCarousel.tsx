import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { FANCY_FONT } from '../../../utils/ui/uiConstants';

interface Review {
  name: string;
  quote: string;
}

const AVATAR_COLORS = [
  '#10b981', '#14b8a6', '#06b6d4', '#8b5cf6', '#f59e0b', '#f43f5e',
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const REVIEWS: Review[] = [
  {
    name: 'Utkarsh Bothe',
    quote:
      'This is so well made. Its simply incredible. Hard to believe youre not a Hevy Dev. Keep it up my man!',
  },
  {
    name: 'Anup Prabhakar',
    quote:
      'Amazing work. The exercises showing which ones youre in overload and which ones youre in plateau is amazing, very well done.',
  },
  {
    name: 'Jagjit Bhosale',
    quote:
      'Finally a project that I find easy to use, no mandatory API key or login. This app is so cool, starred in an instant.',
  },
  {
    name: 'Rohit Desai',
    quote:
      'Excellent app, just what I have been waiting for. I love the way it throws up warnings re plateaus. Awesome app, thank you for developing.',
  },
  {
    name: 'Priya Kulkarni',
    quote:
      'This is damn amazing. Even Hevy premium analytics doesnt do as good of a job as this app does. For someone obsessed with numbers, this is a blessing.',
  },
  {
    name: 'Arjun Mehta',
    quote:
      'This is outstanding. It decoded my Hevy app data and gave me nice suggestions.',
  },
];

export const ReviewsCarousel: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  const { mode } = useTheme();
  const isLight = mode === 'light';

  return (
    <div className={className}>
      <section aria-label="User reviews of FitVerse">
        <div className="text-center mb-10 sm:mb-12">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 ${isLight ? 'text-slate-900' : ''}`}
          >
            Loved by{' '}
            <span className="text-emerald-400" style={FANCY_FONT}>
              Lifters
            </span>{' '}
            Worldwide
          </h2>
          <p
            className={`text-lg max-w-2xl mx-auto ${isLight ? 'text-slate-600' : 'text-slate-400'}`}
          >
            See what people are saying about FitVerse
          </p>
        </div>

        <ul className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((review, index) => (
            <li
              key={review.name}
              className={`rounded-xl border p-5 flex flex-col gap-3 ${
                isLight
                  ? 'border-slate-200 bg-white/60'
                  : 'border-white/10 bg-white/[0.04]'
              }`}
            >
              <blockquote
                className={`flex-1 text-sm sm:text-[15px] leading-relaxed ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}
              >
                &ldquo;{review.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
                  aria-hidden="true"
                >
                  {getInitials(review.name)}
                </span>
                <span
                  className={`font-medium ${isLight ? 'text-slate-800' : 'text-slate-200'}`}
                >
                  {review.name}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default ReviewsCarousel;
