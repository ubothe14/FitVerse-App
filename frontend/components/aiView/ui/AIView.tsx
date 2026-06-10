import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Brain, Sparkles, Copy, Download, RefreshCw, Settings, Eye, EyeOff, Check, X, AlertTriangle } from 'lucide-react';
import type { DailySummary, ExerciseStats, WorkoutSet } from '../../../types';
import { useAiAnalyzeState } from '../../modals/aiAnalyze/useAiAnalyzeState';
import { AiAnalyzeTimeframePicker } from '../../modals/aiAnalyze/AiAnalyzeTimeframePicker';
import { AiAnalyzeModuleGrid } from '../../modals/aiAnalyze/AiAnalyzeModuleGrid';
import { Tooltip, useTooltip } from '../../ui/Tooltip';
import { MarkdownRenderer } from '../../common/MarkdownRenderer';
import { runAiAnalysis } from '../../../utils/api/aiBackend';
import {
  getGeminiApiKey,
  saveGeminiApiKey,
  getGeminiModel,
  saveGeminiModel,
  type GeminiModel,
} from '../../../utils/storage/localStorage';
import {
  buildPromptTemplate,
  ANALYSIS_MODULES,
} from '../../modals/aiAnalyze/aiAnalyzeConfig';
import {
  gatherLastNMonthsPackage,
  formatSetsAsText,
  getSetsForExportScope,
  formatSetsAsTextOnly,
} from '../../../utils/export/clipboardExport';
import { AINutritionTracker } from './AINutritionTracker';

const LOADING_MESSAGES = [
  'Analyzing workout volume...',
  'Scanning personal records...',
  'Checking structural balance...',
  'Evaluating recovery patterns...',
  'Generating action plan...',
];

interface AIViewProps {
  dailyData: DailySummary[];
  exerciseStats: ExerciseStats[];
  parsedData: WorkoutSet[];
  filteredData: WorkoutSet[];
  filtersSlot?: React.ReactNode;
  stickyHeader?: boolean;
  now: Date;
}

export const AIView: React.FC<AIViewProps> = ({
  dailyData,
  exerciseStats,
  parsedData,
  filteredData,
  filtersSlot,
  stickyHeader = false,
  now,
}) => {
  const { tooltip, showTooltip, hideTooltip } = useTooltip();
  const [report, setReport] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'audit' | 'nutrition'>('audit');
  
  // Custom states for local overrides
  const [apiKey, setApiKey] = useState(() => getGeminiApiKey());
  const [model, setModel] = useState<GeminiModel>(() => getGeminiModel() || 'gemini-2.5-flash');
  const [showKey, setShowKey] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Cycling status messages
  const messageIdxRef = useRef(0);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);

  // Connect to existing state managers for picking modules & timeframes
  const {
    months,
    setMonths,
    selectedIds,
    toggleModule,
    visibleModules,
  } = useAiAnalyzeState({
    isOpen: true,
    fullData: parsedData,
    dailyData,
    exerciseStats,
    effectiveNow: now,
  });

  const selectedModules = useMemo(() => {
    const set = new Set(selectedIds);
    return ANALYSIS_MODULES.filter((m) => set.has(m.id));
  }, [selectedIds]);

  useEffect(() => {
    if (!isLoading) return;

    messageIdxRef.current = 0;
    setLoadingMsg(LOADING_MESSAGES[0]);

    const timer = setInterval(() => {
      messageIdxRef.current = (messageIdxRef.current + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[messageIdxRef.current]);
    }, 2000);

    return () => clearInterval(timer);
  }, [isLoading]);

  const runEmbeddedAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setReport('');

    try {
      // Build the prompt text programmatically (does not write to clipboard)
      const rawOnly = selectedModules.length === 0;
      let promptText = '';

      if (rawOnly) {
        const scopedSets = getSetsForExportScope(parsedData, months, now);
        promptText = formatSetsAsTextOnly(scopedSets);
      } else {
        const promptTemplate = buildPromptTemplate({ months, selectedModules });
        const pkg = gatherLastNMonthsPackage(parsedData, dailyData, exerciseStats, months, new Date(), now);
        const scope =
          months === 'all'
            ? 'all'
            : months === 'last_session'
              ? 'last session'
              : `${pkg.meta.months}m`;
        const meta = { generatedAt: pkg.meta.generatedAt, scope, countSets: pkg.meta.countSets };
        promptText = formatSetsAsText(pkg.rawSets, meta, parsedData, promptTemplate);
      }

      if (!promptText.trim()) {
        throw new Error('No workout data found in the selected timeframe.');
      }

      // Call API backend proxy
      const result = await runAiAnalysis(promptText);
      setReport(result.text);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Analysis failed. Please verify your connection or try again.');
    } finally {
      setIsLoading(false);
    }
  }, [dailyData, exerciseStats, now, parsedData, months, selectedModules]);

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

  const handleSaveSettings = () => {
    saveGeminiApiKey(apiKey);
    saveGeminiModel(model);
    setShowSettings(false);
  };

  const handleCancelSettings = () => {
    setApiKey(getGeminiApiKey());
    setModel(getGeminiModel() || 'gemini-2.5-flash');
    setShowSettings(false);
  };

  return (
    <div className="flex flex-col gap-4 w-full text-slate-200 pb-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/15 text-purple-300">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI Coach Workspace</h2>
            <p className="text-xs text-slate-500">Intelligent training audits and food macro tracking using Google Gemini</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-700/50 bg-slate-900/20 text-slate-300 text-xs hover:border-slate-600 hover:bg-slate-900/40 transition-all cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>AI Config</span>
          </button>
        </div>
      </div>

      {/* Sub tabs navigator */}
      <div className="flex border-b border-slate-800/80 gap-2 mb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('audit')}
          className={`px-4 py-2 border-b-2 text-sm font-semibold transition-all cursor-pointer ${
            activeSubTab === 'audit'
              ? 'border-purple-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Workout Auditor
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('nutrition')}
          className={`px-4 py-2 border-b-2 text-sm font-semibold transition-all cursor-pointer ${
            activeSubTab === 'nutrition'
              ? 'border-purple-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          AI Nutrition Coach
        </button>
      </div>

      {/* Settings Drawer / View */}
      {showSettings && (
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 backdrop-blur-md space-y-4 fade-in">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
            <h3 className="text-sm font-semibold text-white">Gemini API Settings</h3>
            <button type="button" onClick={handleCancelSettings} className="text-slate-400 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400" htmlFor="ai-view-api-key">
                Custom API Key (Optional)
              </label>
              <div className="relative">
                <input
                  id="ai-view-api-key"
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Defaults to server configured key"
                  className="w-full h-9 rounded-lg border border-slate-800 bg-slate-950 px-3 pr-9 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400" htmlFor="ai-view-model">
                Gemini Model
              </label>
              <select
                id="ai-view-model"
                value={model}
                onChange={(e) => setModel(e.target.value as GeminiModel)}
                className="w-full h-9 rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 transition-colors"
              >
                <option value="gemini-2.5-flash">gemini-2.5-flash (Fast / Free tier recommended)</option>
                <option value="gemini-2.5-pro">gemini-2.5-pro (Highest intelligence / Rate-limited)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleCancelSettings}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 text-xs hover:text-slate-200 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveSettings}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {activeSubTab === 'audit' ? (
        <div className="grid lg:grid-cols-[320px_1fr] gap-4 items-start">
        {/* Left Side Settings/Config */}
        <div className="bg-black/20 border border-slate-700/50 rounded-xl p-4 sm:p-5 space-y-4" style={{ backgroundColor: 'rgb(var(--panel-rgb) / 0.5)' }}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">Setup Analysis</h3>
          </div>

          <AiAnalyzeTimeframePicker months={months} setMonths={setMonths} />

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Include Modules</label>
            <AiAnalyzeModuleGrid
              visibleModules={visibleModules}
              selectedIds={selectedIds}
              onToggleModule={toggleModule}
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
            />
          </div>

          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            <button
              type="button"
              onClick={runEmbeddedAnalysis}
              disabled={isLoading || parsedData.length === 0}
              className="w-full inline-flex items-center gap-2 justify-center whitespace-nowrap rounded-lg text-sm font-semibold focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60 h-10 px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25 transition-all duration-200 cursor-pointer"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Brain className="w-4 h-4" />
              )}
              <span>{isLoading ? 'Running Analysis...' : 'Run AI Analysis'}</span>
            </button>
          </div>
        </div>

        {/* Right Side Results Viewport */}
        <div className="min-h-[400px] flex flex-col">
          {isLoading ? (
            /* Loading State */
            <div className="flex-1 rounded-xl border border-slate-800 bg-black/10 flex flex-col items-center justify-center p-8 min-h-[450px]">
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center animate-pulse">
                    <Brain className="w-8 h-8 text-purple-300 animate-bounce" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-purple-500/10 animate-ping" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-slate-300 font-semibold animate-pulse">{loadingMsg}</p>
                  <p className="text-xs text-slate-500">Cross-referencing exercise data and computing trends</p>
                </div>
              </div>
            </div>
          ) : error ? (
            /* Error State */
            <div className="flex-1 rounded-xl border border-rose-950/50 bg-rose-950/10 flex flex-col items-center justify-center p-8 text-center min-h-[450px]">
              <AlertTriangle className="w-10 h-10 text-rose-500 mb-4 animate-bounce" />
              <h3 className="text-base font-bold text-slate-200 mb-2">Analysis Failed</h3>
              <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">{error}</p>
              <button
                type="button"
                onClick={runEmbeddedAnalysis}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Audit</span>
              </button>
            </div>
          ) : report ? (
            /* Report State */
            <div className="flex-1 rounded-xl border border-slate-700/50 bg-slate-900/10 backdrop-blur-md flex flex-col min-h-[450px]">
              {/* Report Header toolbar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-semibold text-slate-300">Report Ready</span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-all cursor-pointer"
                    title={copySuccess ? 'Copied!' : 'Copy to clipboard'}
                  >
                    {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-all cursor-pointer"
                    title="Download Report"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={runEmbeddedAnalysis}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/60 text-slate-400 hover:text-purple-400 hover:bg-slate-900/60 transition-all cursor-pointer"
                    title="Re-run Audit"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Report Body */}
              <div className="flex-1 p-4 overflow-y-auto max-h-[550px] leading-relaxed">
                <MarkdownRenderer content={report} />
              </div>
            </div>
          ) : (
            /* Welcome / Initial State */
            <div className="flex-1 rounded-xl border border-dashed border-slate-800 bg-black/5 flex flex-col items-center justify-center p-8 text-center min-h-[450px]">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
                <Brain className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-200 mb-2">No Active Report</h3>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-6">
                Choose a timeframe and pick which analysis modules you would like to run on the left panel. Your coach will evaluate volume progression, redundancies, imbalances, and joint stress factors.
              </p>
              <button
                type="button"
                onClick={runEmbeddedAnalysis}
                disabled={parsedData.length === 0}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Begin Training Audit</span>
              </button>
            </div>
          )}
        </div>
      </div>
      ) : (
        <AINutritionTracker />
      )}

      {tooltip && <Tooltip data={tooltip} />}
    </div>
  );
};
