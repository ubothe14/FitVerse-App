import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Brain, X, Copy, Download, Settings, RefreshCw, Eye, EyeOff, Check } from 'lucide-react';

import { MarkdownRenderer } from '../../common/MarkdownRenderer';
import { runAiAnalysis } from '../../../utils/api/aiBackend';
import {
  getGeminiApiKey,
  saveGeminiApiKey,
  getGeminiModel,
  saveGeminiModel,
  type GeminiModel,
} from '../../../utils/storage/localStorage';

/* ─── Status messages that cycle during loading ────────────── */

const LOADING_MESSAGES = [
  'Analyzing workout volume...',
  'Scanning personal records...',
  'Checking structural balance...',
  'Evaluating recovery patterns...',
  'Generating action plan...',
];

/* ─── Types ───────────────────────────────────────────────── */

type ModalState = 'loading' | 'error' | 'done' | 'settings';

interface AIReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
}

/* ─── Component ───────────────────────────────────────────── */

export const AIReportModal: React.FC<AIReportModalProps> = ({ isOpen, onClose, prompt }) => {
  const [state, setState] = useState<ModalState>('loading');
  const [report, setReport] = useState('');
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Settings fields
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState<GeminiModel>('gemini-2.5-flash');
  const [showKey, setShowKey] = useState(false);
  const [prevState, setPrevState] = useState<ModalState>('loading');

  const messageIdxRef = useRef(0);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);

  /* ── Cycle loading messages ───────────────────────────────── */

  useEffect(() => {
    if (state !== 'loading') return;

    messageIdxRef.current = 0;
    setLoadingMsg(LOADING_MESSAGES[0]);

    const timer = setInterval(() => {
      messageIdxRef.current = (messageIdxRef.current + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[messageIdxRef.current]);
    }, 2000);

    return () => clearInterval(timer);
  }, [state]);

  /* ── Run analysis ─────────────────────────────────────────── */

  const runAnalysis = useCallback(async () => {
    if (!prompt) return;
    setState('loading');
    setError('');
    setReport('');

    try {
      const result = await runAiAnalysis(prompt);
      setReport(result.text);
      setState('done');
    } catch (err: any) {
      setError(err?.message || 'Analysis failed. Please try again.');
      setState('error');
    }
  }, [prompt]);

  /* ── Auto-run on open ─────────────────────────────────────── */

  useEffect(() => {
    if (isOpen && prompt) {
      runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, prompt]);

  /* ── Actions ──────────────────────────────────────────────── */

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      console.error('Failed to copy report');
    }
  }, [report]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitverse-ai-report-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [report]);

  const openSettings = useCallback(() => {
    setPrevState(state);
    setApiKey(getGeminiApiKey());
    setModel(getGeminiModel());
    setShowKey(false);
    setState('settings');
  }, [state]);

  const cancelSettings = useCallback(() => {
    setState(prevState === 'settings' ? 'done' : prevState);
  }, [prevState]);

  const saveSettings = useCallback(() => {
    saveGeminiApiKey(apiKey);
    saveGeminiModel(model);
    setState(prevState === 'settings' ? 'done' : prevState);
  }, [apiKey, model, prevState]);

  /* ── Don't render when closed ─────────────────────────────── */

  if (!isOpen) return null;

  /* ── Loading state ────────────────────────────────────────── */

  if (state === 'loading') {
    return (
      <div className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-sm flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center animate-pulse">
              <Brain className="w-8 h-8 text-purple-300" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-purple-500/10 animate-ping" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-slate-400 animate-pulse">{loadingMsg}</p>
            <p className="text-xs text-slate-600">This may take a moment</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Settings view ────────────────────────────────────────── */

  if (state === 'settings') {
    return (
      <div className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-sm overflow-y-auto overscroll-contain">
        <div className="min-h-full w-full px-3 sm:px-4 py-4 sm:py-6 flex items-center justify-center">
          <div className="w-full max-w-md mx-auto">
            <div className="bg-slate-950 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-md shadow-lg">
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-purple-300" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-200">AI Settings</h2>
                </div>
                <button
                  type="button"
                  onClick={cancelSettings}
                  className="w-8 h-8 rounded-lg bg-slate-900/20 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all"
                  aria-label="Close settings"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-5 space-y-5">
                {/* API Key */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300" htmlFor="ai-api-key">
                    Gemini API Key
                  </label>
                  <p className="text-xs text-slate-500">
                    Optional. Override the default server key with your own.
                  </p>
                  <div className="relative">
                    <input
                      id="ai-api-key"
                      type={showKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your API key..."
                      className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2.5 pr-10 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      aria-label={showKey ? 'Hide API key' : 'Show API key'}
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Model */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300" htmlFor="ai-model">
                    Model
                  </label>
                  <select
                    id="ai-model"
                    value={model}
                    onChange={(e) => setModel(e.target.value as GeminiModel)}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25 transition-all appearance-none cursor-pointer"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 px-4 sm:px-5 pb-4 sm:pb-5">
                <button
                  type="button"
                  onClick={cancelSettings}
                  className="inline-flex items-center gap-2 justify-center whitespace-nowrap rounded-lg text-sm font-semibold focus-visible:outline-none h-10 px-4 py-2 bg-transparent border border-slate-700/50 text-slate-300 hover:border-slate-600 hover:text-white transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveSettings}
                  className="inline-flex items-center gap-2 justify-center whitespace-nowrap rounded-lg text-sm font-semibold focus-visible:outline-none h-10 px-4 py-2 bg-purple-600 text-white hover:bg-purple-500 transition-all duration-200"
                >
                  <Check className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Error state ──────────────────────────────────────────── */

  if (state === 'error') {
    return (
      <div className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-sm flex items-center justify-center">
        <div className="w-full max-w-md mx-4">
          <div className="bg-slate-950 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-md shadow-lg p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                <Brain className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Analysis Failed</h3>
                <p className="text-sm text-red-400/80 mt-1">{error}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={runAnalysis}
                className="inline-flex items-center gap-2 justify-center whitespace-nowrap rounded-lg text-sm font-semibold focus-visible:outline-none h-10 px-4 py-2 bg-transparent border border-emerald-500/40 text-slate-200 hover:border-emerald-400 hover:text-emerald-200 hover:bg-emerald-500/10 transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                type="button"
                onClick={openSettings}
                className="inline-flex items-center gap-2 justify-center whitespace-nowrap rounded-lg text-sm font-semibold focus-visible:outline-none h-10 px-4 py-2 bg-transparent border border-slate-700/50 text-slate-300 hover:border-slate-600 hover:text-white transition-all duration-200"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 justify-center whitespace-nowrap rounded-lg text-sm font-semibold focus-visible:outline-none h-10 px-4 py-2 bg-transparent border border-slate-700/50 text-slate-300 hover:border-slate-600 hover:text-white transition-all duration-200 ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Report (done) state ──────────────────────────────────── */

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-sm overflow-y-auto overscroll-contain">
      <div className="min-h-full w-full px-3 sm:px-4 py-4 sm:py-6 flex items-start justify-center">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-slate-950 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-md shadow-lg flex flex-col" style={{ maxHeight: '90vh' }}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800/50 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-purple-300" />
                </div>
                <h2 className="text-base font-semibold text-white">AI Analysis Report</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-slate-900/20 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable report body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <MarkdownRenderer content={report} />
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-t border-slate-800/50 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 justify-center whitespace-nowrap rounded-lg text-xs font-semibold focus-visible:outline-none h-8 px-3 py-1.5 bg-transparent border border-slate-700/50 text-slate-300 hover:border-slate-600 hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copySuccess ? 'Copied' : 'Copy Report'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 justify-center whitespace-nowrap rounded-lg text-xs font-semibold focus-visible:outline-none h-8 px-3 py-1.5 bg-transparent border border-slate-700/50 text-slate-300 hover:border-slate-600 hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>

              <button
                type="button"
                onClick={openSettings}
                className="inline-flex items-center gap-1.5 justify-center whitespace-nowrap rounded-lg text-xs font-semibold focus-visible:outline-none h-8 px-3 py-1.5 bg-transparent border border-slate-700/50 text-slate-300 hover:border-slate-600 hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>

              <button
                type="button"
                onClick={runAnalysis}
                className="inline-flex items-center gap-1.5 justify-center whitespace-nowrap rounded-lg text-xs font-semibold focus-visible:outline-none h-8 px-3 py-1.5 bg-transparent border border-purple-500/40 text-slate-200 hover:border-purple-400 hover:text-purple-200 hover:bg-purple-500/10 transition-all duration-200 ml-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-run</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
