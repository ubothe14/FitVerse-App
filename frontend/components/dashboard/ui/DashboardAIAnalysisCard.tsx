import React, { useState, useCallback } from 'react';
import { Brain, Sparkles } from 'lucide-react';
import type { DailySummary, ExerciseStats, WorkoutSet } from '../../../types';
import { Tooltip, useTooltip } from '../../ui/Tooltip';
import { AiAnalyzeFooter } from '../../modals/aiAnalyze/AiAnalyzeFooter';
import { AiAnalyzeModuleGrid } from '../../modals/aiAnalyze/AiAnalyzeModuleGrid';
import { AiAnalyzeTimeframePicker } from '../../modals/aiAnalyze/AiAnalyzeTimeframePicker';
import { useAiAnalyzeState } from '../../modals/aiAnalyze/useAiAnalyzeState';
import { AIReportModal } from '../../modals/aiAnalyze/AIReportModal';

interface DashboardAIAnalysisCardProps {
  fullData: WorkoutSet[];
  dailyData: DailySummary[];
  exerciseStats: ExerciseStats[];
  effectiveNow: Date;
}

export const DashboardAIAnalysisCard: React.FC<DashboardAIAnalysisCardProps> = ({
  fullData,
  dailyData,
  exerciseStats,
  effectiveNow,
}) => {
  const { tooltip, showTooltip, hideTooltip } = useTooltip();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  const {
    months,
    setMonths,
    selectedIds,
    toggleModule,
    visibleModules,
    isReady,
    isGenerating,
    reCopyCopied,
    handleGenerate,
    handleReCopy,
    handleOpenGemini,
  } = useAiAnalyzeState({
    isOpen: true,
    fullData,
    dailyData,
    exerciseStats,
    effectiveNow,
  });

  const handleRunAI = useCallback(async () => {
    // First generate and copy the prompt to clipboard (reuse existing logic)
    await handleGenerate();
    try {
      const text = await navigator.clipboard.readText();
      setAiPrompt(text);
      setReportModalOpen(true);
    } catch (e) {
      console.error('Failed to read clipboard for AI analysis', e);
    }
  }, [handleGenerate]);

  return (
    <div className="bg-black/20 border border-slate-700/50 rounded-xl p-4 sm:p-5 space-y-4" style={{ backgroundColor: 'rgb(var(--panel-rgb) / 0.5)' }}>
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-300">
          <Brain className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">AI Analysis</h3>
          <p className="text-[11px] text-slate-500">Generate analysis prompts directly from your dashboard</p>
        </div>
      </div>

      <AiAnalyzeTimeframePicker months={months} setMonths={setMonths} />

      <div className="space-y-2">
        <AiAnalyzeModuleGrid
          visibleModules={visibleModules}
          selectedIds={selectedIds}
          onToggleModule={toggleModule}
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
        />
      </div>

      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={handleRunAI}
          disabled={isGenerating || selectedIds.length === 0}
          className="inline-flex items-center gap-2 justify-center whitespace-nowrap rounded-lg text-sm font-semibold focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60 h-10 px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25 transition-all duration-200"
        >
          <Sparkles className="w-4 h-4" />
          <span>Run AI Analysis</span>
        </button>
      </div>

      <AiAnalyzeFooter
        isReady={isReady}
        isGenerating={isGenerating}
        reCopyCopied={reCopyCopied}
        rawOnly={selectedIds.length === 0}
        onGenerate={handleGenerate}
        onOpenGemini={handleOpenGemini}
        onReCopy={handleReCopy}
      />

      {tooltip && <Tooltip data={tooltip} />}

      <AIReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        prompt={aiPrompt}
      />
    </div>
  );
};
