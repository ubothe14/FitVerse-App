import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Apple,
  Camera,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Upload,
  Loader2,
  X,
  Flame,
  Dumbbell,
  Check,
  Settings2,
  AlertTriangle
} from 'lucide-react';
import {
  getFoodLog,
  saveFoodLog,
  getMacroTargets,
  saveMacroTargets,
  getUserProfile,
  type FoodLogEntry,
  type MacroTargets
} from '../../../utils/storage/localStorage';
import {
  runAiFoodAnalysis,
  fetchFoodLogsDb,
  saveFoodLogDb,
  deleteFoodLogDb,
  saveMacroTargetsDb,
  fetchUserProfile
} from '../../../utils/api/aiBackend';

// Date utility to format to YYYY-MM-DD local time
const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const AINutritionTracker: React.FC = () => {
  const email = getUserProfile()?.email || '';

  // Date State
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const dateStr = formatDateKey(selectedDate);

  // Storage State
  const [foodLog, setFoodLog] = useState<FoodLogEntry[]>([]);
  const [targets, setTargets] = useState<MacroTargets>(() => ({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 70
  }));

  // UI State
  const [isEditingTargets, setIsEditingTargets] = useState(false);
  const [targetForm, setTargetForm] = useState<MacroTargets>({ ...targets });
  
  // Image Uploading / Analyzing State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressedBase64, setCompressedBase64] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Form State for Log
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState<number | ''>('');
  const [protein, setProtein] = useState<number | ''>('');
  const [carbs, setCarbs] = useState<number | ''>('');
  const [fat, setFat] = useState<number | ''>('');
  const [explanation, setExplanation] = useState('');

  // Load from local storage on mount/updates and sync with DB
  useEffect(() => {
    // 1. Instant load from local cache
    setFoodLog(getFoodLog() || []);
    const savedTargets = getMacroTargets();
    if (savedTargets) {
      setTargets(savedTargets);
      setTargetForm(savedTargets);
    }

    // 2. Fetch targets from MongoDB to sync
    if (email) {
      fetchUserProfile(email).then((profile) => {
        if (profile?.macroTargets) {
          setTargets(profile.macroTargets);
          setTargetForm(profile.macroTargets);
          saveMacroTargets(profile.macroTargets);
        }
      }).catch(err => console.error('Failed to sync profile targets:', err));
    }
  }, [email]);

  // Load food logs from MongoDB whenever selected date or user changes
  useEffect(() => {
    if (!email) return;

    const syncFoodLogs = async () => {
      try {
        const dbLogs = await fetchFoodLogsDb(email, dateStr);
        setFoodLog((prevLogs) => {
          // Keep other dates' entries, override current date with DB values
          const otherDatesLogs = prevLogs.filter((entry) => entry.dateStr !== dateStr);
          const updatedLogs = [...dbLogs, ...otherDatesLogs];
          saveFoodLog(updatedLogs);
          return updatedLogs;
        });
      } catch (err) {
        console.error('Failed to sync food logs from DB:', err);
      }
    };

    syncFoodLogs();
  }, [email, dateStr]);

  // Filter logged foods for currently selected date
  const dailyEntries = foodLog.filter((entry) => entry.dateStr === dateStr);

  // Calculate totals
  const totalCalories = dailyEntries.reduce((acc, curr) => acc + curr.calories, 0);
  const totalProtein = dailyEntries.reduce((acc, curr) => acc + curr.protein, 0);
  const totalCarbs = dailyEntries.reduce((acc, curr) => acc + curr.carbs, 0);
  const totalFat = dailyEntries.reduce((acc, curr) => acc + curr.fat, 0);

  // Date Navigation helpers
  const handlePrevDay = () => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 1);
      return d;
    });
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 1);
      return d;
    });
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Image Processing / Downscaling / Compression
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    setAnalysisError(null);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      const compressed = await compressImageFile(file);
      setCompressedBase64(compressed.base64);
    } catch (err) {
      console.error(err);
      setAnalysisError('Failed to process image. Please try another image.');
    } finally {
      setIsCompressing(false);
    }
  };

  const compressImageFile = (file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 300; // Limit image dimensions to 300px max for local storage friendly size
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);

          // Get compressed dataURL (JPEG, 0.75 quality)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
          resolve({
            base64: dataUrl,
            mimeType: 'image/jpeg'
          });
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  // Analyze Food Meal
  const handleAnalyze = async () => {
    if (!compressedBase64) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const result = await runAiFoodAnalysis(compressedBase64);
      setFoodName(result.foodName || 'Estimated Meal');
      setCalories(result.calories);
      setProtein(result.protein);
      setCarbs(result.carbs);
      setFat(result.fat);
      setExplanation(result.explanation || '');
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err?.message || 'AI analysis failed. Please verify your connection or Gemini key.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Clear current log editor
  const handleClear = () => {
    setPreviewUrl(null);
    setCompressedBase64(null);
    setFoodName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setExplanation('');
    setAnalysisError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Add Log Entry
  const handleLogMeal = async () => {
    if (!foodName.trim() || calories === '' || protein === '' || carbs === '' || fat === '') return;

    const newEntry: FoodLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      dateStr,
      foodName: foodName.trim(),
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fat: Number(fat),
      explanation: explanation.trim(),
      imageUrl: compressedBase64 || undefined
    };

    // Optimistic UI update
    const updatedLog = [newEntry, ...foodLog];
    setFoodLog(updatedLog);
    saveFoodLog(updatedLog);

    // Sync to DB in background
    if (email) {
      try {
        await saveFoodLogDb(email, newEntry);
      } catch (err) {
        console.error('Failed to save meal to DB:', err);
      }
    }

    handleClear();
  };

  // Delete Log Entry
  const handleDeleteMeal = async (id: string) => {
    // Optimistic UI update
    const updatedLog = foodLog.filter((entry) => entry.id !== id);
    setFoodLog(updatedLog);
    saveFoodLog(updatedLog);

    // Sync to DB in background
    if (email) {
      try {
        await deleteFoodLogDb(email, id);
      } catch (err) {
        console.error('Failed to delete meal from DB:', err);
      }
    }
  };

  // Target Settings Save
  const handleSaveTargets = async () => {
    setTargets(targetForm);
    saveMacroTargets(targetForm);
    setIsEditingTargets(false);

    // Sync to DB in background
    if (email) {
      try {
        await saveMacroTargetsDb(email, targetForm);
      } catch (err) {
        console.error('Failed to save macro targets to DB:', err);
      }
    }
  };

  // Formatting helpers
  const getPercent = (value: number, target: number) => {
    if (target <= 0) return 0;
    return Math.min(Math.round((value / target) * 100), 100);
  };

  return (
    <div className="w-full flex flex-col gap-6 fade-in">
      {/* Date Header Picker */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevDay}
            className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-white min-w-[120px] text-center">
            {selectedDate.toDateString() === new Date().toDateString()
              ? 'Today'
              : selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          <button
            type="button"
            onClick={handleNextDay}
            className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {selectedDate.toDateString() !== new Date().toDateString() && (
            <button
              type="button"
              onClick={handleToday}
              className="text-[11px] px-2.5 py-1 rounded-md border border-slate-700/50 bg-slate-900/10 text-slate-300 hover:border-slate-600 transition-all cursor-pointer font-medium"
            >
              Today
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsEditingTargets(!isEditingTargets)}
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-slate-700/50 bg-slate-900/10 text-slate-300 text-xs hover:border-slate-600 transition-all cursor-pointer font-medium"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Set Goals</span>
          </button>
        </div>
      </div>

      {/* Target Editor Panel */}
      {isEditingTargets && (
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 backdrop-blur-md space-y-4 fade-in">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Edit Daily Macro Goals</h4>
            <button type="button" onClick={() => setIsEditingTargets(false)} className="text-slate-400 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase block" htmlFor="goals-kcal">Calories (kcal)</label>
              <input
                id="goals-kcal"
                type="number"
                value={targetForm.calories}
                onChange={(e) => setTargetForm({ ...targetForm, calories: Math.max(0, Number(e.target.value)) })}
                className="w-full h-8 rounded-lg border border-slate-800 bg-slate-950 px-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase block" htmlFor="goals-protein">Protein (g)</label>
              <input
                id="goals-protein"
                type="number"
                value={targetForm.protein}
                onChange={(e) => setTargetForm({ ...targetForm, protein: Math.max(0, Number(e.target.value)) })}
                className="w-full h-8 rounded-lg border border-slate-800 bg-slate-950 px-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase block" htmlFor="goals-carbs">Carbs (g)</label>
              <input
                id="goals-carbs"
                type="number"
                value={targetForm.carbs}
                onChange={(e) => setTargetForm({ ...targetForm, carbs: Math.max(0, Number(e.target.value)) })}
                className="w-full h-8 rounded-lg border border-slate-800 bg-slate-950 px-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase block" htmlFor="goals-fat">Fat (g)</label>
              <input
                id="goals-fat"
                type="number"
                value={targetForm.fat}
                onChange={(e) => setTargetForm({ ...targetForm, fat: Math.max(0, Number(e.target.value)) })}
                className="w-full h-8 rounded-lg border border-slate-800 bg-slate-950 px-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
            <button
              type="button"
              onClick={() => setIsEditingTargets(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 text-xs hover:text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveTargets}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md cursor-pointer"
            >
              Save Goals
            </button>
          </div>
        </div>
      )}

      {/* Progress Dashboard Card */}
      <div className="bg-black/20 border border-slate-700/50 rounded-xl p-4 sm:p-5" style={{ backgroundColor: 'rgb(var(--panel-rgb) / 0.5)' }}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Daily Tracking Progress</h3>
        
        <div className="grid sm:grid-cols-4 gap-4">
          {/* Calories Target */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-yellow-500" />
                <span>Calories</span>
              </span>
              <span className="text-white font-semibold">{totalCalories} / {targets.calories} kcal</span>
            </div>
            <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                style={{ width: `${getPercent(totalCalories, targets.calories)}%` }}
              />
            </div>
          </div>

          {/* Protein Target */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
                <span>Protein</span>
              </span>
              <span className="text-white font-semibold">{totalProtein} / {targets.protein}g</span>
            </div>
            <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${getPercent(totalProtein, targets.protein)}%` }}
              />
            </div>
          </div>

          {/* Carbs Target */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Apple className="w-3.5 h-3.5 text-sky-400" />
                <span>Carbs</span>
              </span>
              <span className="text-white font-semibold">{totalCarbs} / {targets.carbs}g</span>
            </div>
            <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-400 rounded-full transition-all duration-500"
                style={{ width: `${getPercent(totalCarbs, targets.carbs)}%` }}
              />
            </div>
          </div>

          {/* Fat Target */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Apple className="w-3.5 h-3.5 text-rose-400" />
                <span>Fat</span>
              </span>
              <span className="text-white font-semibold">{totalFat} / {targets.fat}g</span>
            </div>
            <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-400 rounded-full transition-all duration-500"
                style={{ width: `${getPercent(totalFat, targets.fat)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Feature Layout */}
      <div className="grid lg:grid-cols-[340px_1fr] gap-6 items-start">
        {/* Left Side: Upload & Analysis */}
        <div className="bg-black/20 border border-slate-700/50 rounded-xl p-4 sm:p-5 space-y-4" style={{ backgroundColor: 'rgb(var(--panel-rgb) / 0.5)' }}>
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">Log New Meal</h3>
          </div>

          {/* Upload Dropzone */}
          {!previewUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-800 hover:border-purple-500/50 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-900/10 hover:bg-purple-950/5 transition-all text-center group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="p-3 rounded-full bg-slate-950/50 text-slate-500 group-hover:text-purple-400 transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-300">Choose meal image</p>
                <p className="text-[10px] text-slate-500 leading-tight">Drag and drop or click to browse</p>
              </div>
            </div>
          ) : (
            /* Image Preview & Analyze Actions */
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-800 bg-slate-950 flex items-center justify-center">
                <img src={previewUrl} alt="Meal preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isAnalyzing}
                  className="absolute right-2 top-2 p-1.5 rounded-full bg-slate-950/80 hover:bg-slate-900 text-slate-400 hover:text-white transition-all shadow-md cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {!foodName && (
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isCompressing || isAnalyzing || !compressedBase64}
                  className="w-full inline-flex items-center gap-2 justify-center whitespace-nowrap rounded-lg text-xs font-semibold focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60 h-9 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-500/25 transition-all cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Estimating Nutrition...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Estimate Macros with AI</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {analysisError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-950/50 text-rose-400 text-[11px] leading-relaxed flex gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{analysisError}</span>
            </div>
          )}

          {/* Form fields for review/manual log */}
          {(foodName || previewUrl) && (
            <div className="space-y-3 pt-3 border-t border-slate-800/60 fade-in">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Meal Details Review</h4>

              {/* Food Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase block" htmlFor="food-name">Meal Name</label>
                <input
                  id="food-name"
                  type="text"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="e.g., Chicken salad with quinoa"
                  disabled={isAnalyzing}
                  className="w-full h-8 rounded-lg border border-slate-800 bg-slate-950 px-2.5 text-xs text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50"
                />
              </div>

              {/* Macros Row */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase block" htmlFor="food-kcal">Calories (kcal)</label>
                  <input
                    id="food-kcal"
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value === '' ? '' : Number(e.target.value))}
                    disabled={isAnalyzing}
                    className="w-full h-8 rounded-lg border border-slate-800 bg-slate-950 px-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase block" htmlFor="food-protein">Protein (g)</label>
                  <input
                    id="food-protein"
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value === '' ? '' : Number(e.target.value))}
                    disabled={isAnalyzing}
                    className="w-full h-8 rounded-lg border border-slate-800 bg-slate-950 px-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase block" htmlFor="food-carbs">Carbs (g)</label>
                  <input
                    id="food-carbs"
                    type="number"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value === '' ? '' : Number(e.target.value))}
                    disabled={isAnalyzing}
                    className="w-full h-8 rounded-lg border border-slate-800 bg-slate-950 px-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase block" htmlFor="food-fat">Fat (g)</label>
                  <input
                    id="food-fat"
                    type="number"
                    value={fat}
                    onChange={(e) => setFat(e.target.value === '' ? '' : Number(e.target.value))}
                    disabled={isAnalyzing}
                    className="w-full h-8 rounded-lg border border-slate-800 bg-slate-950 px-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  />
                </div>
              </div>

              {/* Explanation / Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase block" htmlFor="food-notes">AI Notes / Comments</label>
                <textarea
                  id="food-notes"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  disabled={isAnalyzing}
                  rows={3}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none"
                />
              </div>

              {/* Log Buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isAnalyzing}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 text-xs hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogMeal}
                  disabled={isAnalyzing || !foodName.trim() || calories === ''}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Meal</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Log Feed / List */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Logged Food History</h3>

          {dailyEntries.length === 0 ? (
            /* Empty State */
            <div className="rounded-xl border border-dashed border-slate-800 bg-black/5 flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
              <div className="w-12 h-12 rounded-full bg-slate-950/60 flex items-center justify-center text-slate-600 mb-3">
                <Apple className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-300 mb-1">No meals logged for this day</h4>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Take a photo of your breakfast, lunch, or dinner, upload it on the left panel, and get automated nutrition estimates instantly!
              </p>
            </div>
          ) : (
            /* Feed List */
            <div className="space-y-3">
              {dailyEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-black/20 border border-slate-700/50 rounded-xl p-4 flex gap-4 relative group hover:border-slate-600/50 transition-all"
                  style={{ backgroundColor: 'rgb(var(--panel-rgb) / 0.5)' }}
                >
                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteMeal(entry.id)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg border border-slate-800/80 bg-slate-950/80 hover:bg-slate-900 text-slate-400 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all shadow-sm cursor-pointer"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Meal Thumbnail */}
                  {entry.imageUrl ? (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-950 border border-slate-800">
                      <img src={entry.imageUrl} alt={entry.foodName} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex-shrink-0 bg-slate-900 flex items-center justify-center border border-slate-800 text-slate-600">
                      <Apple className="w-7 h-7" />
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-sm font-semibold text-white truncate pr-8">{entry.foodName}</h4>

                    {/* Macro details */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold">
                      <span className="text-yellow-500 font-bold">{entry.calories} kcal</span>
                      <span className="text-slate-500">|</span>
                      <span className="text-emerald-400">P: {entry.protein}g</span>
                      <span className="text-slate-500">|</span>
                      <span className="text-sky-400">C: {entry.carbs}g</span>
                      <span className="text-slate-500">|</span>
                      <span className="text-rose-400">F: {entry.fat}g</span>
                    </div>

                    {/* Explanation */}
                    {entry.explanation && (
                      <p className="text-[11px] text-slate-400 leading-relaxed pt-1.5 border-t border-slate-800/30">
                        {entry.explanation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
