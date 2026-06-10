export { Page };

import React from 'react';
import { InfoShell } from '../../components/info/InfoShell';
import { assetPath } from '../../constants';

function Page() {
  return (
    <InfoShell
      title="About FitVerse"
      subtitle="FitVerse turns your Hevy, Strong, Lyfta, Motra, or CSV workout history into actionable training intelligence — muscle heatmaps, plateau detection, PR tracking, set-by-set coaching feedback, and AI-ready exports. Analytics stay browser-first and private, with secure session handling for real users."
      activeNav={null}
    >
      <div className="space-y-10">
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Transparent and auditable</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            FitVerse is released under the <strong>AGPL-3.0</strong> license. The code is fully visible, auditable, and self-hostable. There are no hidden paywalls, no black-box telemetry, and no surprise data collection.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">What FitVerse does</h2>
          <ul className="list-disc list-inside space-y-1 text-slate-300 leading-relaxed">
            <li>Connects to Hevy, Strong, Lyfta, Motra, or CSV exports and combines them into one training dashboard.</li>
            <li>Builds interactive muscle heatmaps with per-exercise drill-down, volume zone scoring, and muscle balance analysis.</li>
            <li>Detects plateaus and assigns exercise status labels with specific next-session suggestions.</li>
            <li>Analyzes every set using 19 coaching signals and gives plain-English improvement guidance.</li>
            <li>Tracks PR momentum, all-time bests, 2-month bests, and premature PR warnings.</li>
            <li>Provides an AI Coach workspace and AI-ready exports for prompt-based analysis.</li>
            <li>Keeps workout analytics browser-first while using secure Google sign-in for session handling.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">What makes FitVerse different</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            Your workout app logs the session. FitVerse interprets it. Instead of raw charts, you get clear indicators like "Getting stronger", "Plateauing", and "Taking a dip", plus concise suggestions you can use immediately.
          </p>
          <p className="text-slate-300 leading-relaxed mb-4">
            FitVerse is built around useful answers, not just numbers. The dashboard, AI Coach, and export tools work together so you can understand your training, fix imbalances, and stay on track without guessing. Read the <a href={assetPath('how-it-works/')} className="text-emerald-300/80 hover:text-emerald-400 transition-colors duration-200">How it works</a> guide for the full workflow.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">What FitVerse does not do</h2>
          <ul className="list-disc list-inside space-y-1 text-slate-300 leading-relaxed">
            <li>It is not a workout program generator or coaching service.</li>
            <li>It is not medical advice or nutrition tracking.</li>
            <li>It does not store your training history on FitVerse servers.</li>
            <li>It does not charge subscription fees. Every feature is free.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Quick links</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-slate-300"><strong>How everything works</strong></div>
            <div><a href={assetPath('how-it-works/')} className="text-emerald-300/80 hover:text-emerald-400 transition-colors duration-200">/how-it-works/</a></div>
            <div className="text-slate-300"><strong>Privacy model</strong></div>
            <div><a href={assetPath('privacy/')} className="text-emerald-300/80 hover:text-emerald-400 transition-colors duration-200">/privacy/</a></div>
            <div className="text-slate-300"><strong>Metrics definitions</strong></div>
            <div><a href={assetPath('metrics/')} className="text-emerald-300/80 hover:text-emerald-400 transition-colors duration-200">/metrics/</a></div>
            <div className="text-slate-300"><strong>FAQ</strong></div>
            <div><a href={assetPath('faq/')} className="text-emerald-300/80 hover:text-emerald-400 transition-colors duration-200">/faq/</a></div>
          </div>
        </section>
      </div>
    </InfoShell>
  );
}
