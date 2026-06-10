export { Page };

import React from 'react';
import { InfoShell } from '../../components/info/InfoShell';
import { assetPath } from '../../constants';

function Page() {
  return (
    <InfoShell
      title="FAQ"
      subtitle="Quick answers. For detailed explanations of every feature, see the How it works guide."
      activeNav={null}
    >
      <div className="space-y-10">
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">What is FitVerse?</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            FitVerse is a browser-first workout analytics dashboard that turns Hevy, Strong, Lyfta, Motra, or CSV workout logs into muscle heatmaps, plateau detection, PR tracking, set-by-set coaching feedback, and AI-ready export data. It uses secure Google sign-in for sessions and keeps your training analytics private. Learn more on the <a href={assetPath('about/')} className="text-emerald-300/80 hover:text-emerald-400 transition-colors duration-200">About</a> page.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Does FitVerse store my workout data?</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            No full workout history is stored on FitVerse servers. Your workout data is stored locally in your browser and processed there. The only server-side state is secure session handling for your account and occasional API proxying during Hevy or Lyfta sync. For full details, read the <a href={assetPath('privacy/')} className="text-emerald-300/80 hover:text-emerald-400 transition-colors duration-200">Privacy</a> page.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Which workout apps are supported?</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            FitVerse supports <strong>Hevy</strong> (API sync), <strong>Lyfta</strong> (API sync), and <strong>Strong</strong> (CSV import). It also works with generic workout CSV exports and Motra. You can combine multiple sources into one unified dashboard. See <a href={assetPath('supported-apps/')} className="text-emerald-300/80 hover:text-emerald-400 transition-colors duration-200">Supported apps</a> for step-by-step guides.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">How does plateau detection work?</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            FitVerse analyzes your recent workout history for each exercise and checks whether your performance (volume load, estimated 1RM, and rep quality) has stalled or declined over a configurable window. When a plateau is detected, it provides a status label (Getting stronger, Plateauing, or Taking a dip) along with specific, actionable suggestions &mdash; like changing rep ranges, adding accessory work, or adjusting frequency. Read the <a href={assetPath('how-it-works/')} className="text-emerald-300/80 hover:text-emerald-400 transition-colors duration-200">How it works</a> guide for the full methodology.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Can I export my data for AI analysis?</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            Yes. FitVerse includes a one-click AI-ready export that formats your training data with built-in analysis modules including junk volume audit, structural balance, joint health, program adherence, and more. You can paste the export into any LLM for personalized training insights. See the <a href={assetPath('ai/')} className="text-emerald-300/80 hover:text-emerald-400 transition-colors duration-200">AI reference</a> page for details.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">What kinds of PRs does FitVerse track?</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            FitVerse tracks three distinct types of personal records: <strong>all-time bests</strong> (your strongest performance ever for an exercise), <strong>2-month bests</strong> (your best in the last two months, useful for monitoring recent progress), and <strong>premature PRs</strong> (when you hit a PR but your volume and rep quality suggest you pushed too far). It also flags PR droughts when you haven&rsquo;t set a new record in a while.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">What is set-by-set feedback?</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            After every workout, FitVerse analyzes each set across 19 predefined scenarios &mdash; including RIR errors, volume mismatch, intensity drops, rep quality issues, and more. Each set gets a badge, a plain-English explanation, and a concrete improvement suggestion. This gives you coaching-style feedback without needing a coach.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Why do some charts look wrong?</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            FitVerse charts reflect the active date filter and the workout data you have imported. If a date range is selected, metrics are computed only for that window, which can make a chart look different than your full history. Clear filters, choose “All time,” and verify your exercise mapping for the most consistent view. See the <a href={assetPath('how-it-works/')} className="text-emerald-300/80 hover:text-emerald-400 transition-colors duration-200">How it works</a> guide for calendar filtering details.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Why do I need Google sign-in?</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            Google sign-in is used to keep your FitVerse session secure and persistent across browser refreshes. It does not mean FitVerse stores your workout history on a server — it only helps manage your account session and preferences safely.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Is FitVerse a coaching app?</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            No. FitVerse is an analytics tool, not a coaching service or workout program generator. It gives you data-driven insights, status labels, and suggestions &mdash; but it does not write programs, provide medical advice, or replace a qualified coach. Think of it as a second pair of eyes on your training data.
          </p>
        </section>

        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 mt-6">
          <p className="text-slate-300 text-sm">
            Didn&rsquo;t find your answer? Check the <a href={assetPath('how-it-works/')} className="text-emerald-300/80 hover:text-emerald-400 transition-colors duration-200">How it works</a> guide for deep dives into every feature.
          </p>
        </div>
      </div>
    </InfoShell>
  );
}
