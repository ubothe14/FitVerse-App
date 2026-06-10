import { createStorageManager, createCompressedStorageManager } from './createStorageManager';

// CSV Data Storage (compressed)
const CSV_STORAGE_KEY = 'hevy_analytics_csv_data';
const csvStorage = createCompressedStorageManager(CSV_STORAGE_KEY);

export const saveCSVData = csvStorage.set;
export const getCSVData = csvStorage.get;
export const hasCSVData = csvStorage.has;
export const clearCSVData = csvStorage.clear;

// Exercise Trend Mode
export type ExerciseTrendMode = 'stable' | 'reactive';

const trendModeStorage = createStorageManager<ExerciseTrendMode>({
  key: 'hevy_analytics_exercise_trend_mode',
  defaultValue: 'reactive',
  migrator: (stored) => {
    // Migration:
    // - Old version stored 'default' for the stable algorithm.
    // - New version uses 'stable' and makes 'reactive' the default for new users.
    if (stored === 'reactive') return 'reactive';
    if (stored === 'stable') return 'stable';
    if (stored === 'default') return 'stable';
    return null;
  },
});

export const saveExerciseTrendMode = trendModeStorage.set;
export const getExerciseTrendMode = trendModeStorage.get;
export const clearExerciseTrendMode = trendModeStorage.clear;

// Weight Unit Preference
export type WeightUnit = 'kg' | 'lbs';

const weightUnitStorage = createStorageManager<WeightUnit>({
  key: 'hevy_analytics_weight_unit',
  defaultValue: 'kg',
  validator: (v) => (v === 'kg' || v === 'lbs') ? v : null,
});

export const saveWeightUnit = weightUnitStorage.set;
export const getWeightUnit = weightUnitStorage.get;
export const clearWeightUnit = weightUnitStorage.clear;

// Body Map Gender
export type StoredBodyMapGender = 'male' | 'female';

const bodyMapGenderStorage = createStorageManager<StoredBodyMapGender>({
  key: 'hevy_analytics_body_map_gender',
  defaultValue: 'male',
  validator: (v) => (v === 'male' || v === 'female') ? v : null,
});

export const saveBodyMapGender = bodyMapGenderStorage.set;
export const getBodyMapGender = bodyMapGenderStorage.get;
export const clearBodyMapGender = bodyMapGenderStorage.clear;

// Preferences Confirmed
const preferencesConfirmedStorage = createStorageManager<boolean>({
  key: 'hevy_analytics_preferences_confirmed',
  defaultValue: false,
  serializer: (v) => v ? 'true' : 'false',
  deserializer: (v) => v === 'true',
  validator: (v) => v !== null ? v === 'true' : null,
});

export const savePreferencesConfirmed = preferencesConfirmedStorage.set;
export const getPreferencesConfirmed = preferencesConfirmedStorage.get;
export const clearPreferencesConfirmed = preferencesConfirmedStorage.clear;

// Theme Mode
export type ThemeMode = 'light' | 'medium-dark' | 'midnight-dark' | 'pure-black';

const themeModeStorage = createStorageManager<ThemeMode>({
  key: 'hevy_analytics_theme_mode',
  defaultValue: 'pure-black',
  migrator: (stored) => {
    // Back-compat: legacy 'svg' (texture) theme is treated as 'pure-black'.
    const validModes: ThemeMode[] = ['light', 'medium-dark', 'midnight-dark', 'pure-black'];
    if (validModes.includes(stored as ThemeMode)) return stored as ThemeMode;
    if (stored === 'svg') return 'pure-black';
    return null;
  },
});

export const saveThemeMode = themeModeStorage.set;
export const getThemeMode = themeModeStorage.get;
export const clearThemeMode = themeModeStorage.clear;

// Date Mode
// 'effective' = use the latest workout date as "now" (for CSV imports, testing scenarios)
// 'actual' = use the real current date as "now" (default, expected behavior)
export type DateMode = 'effective' | 'actual';

const dateModeStorage = createStorageManager<DateMode>({
  key: 'hevy_analytics_date_mode',
  defaultValue: 'actual',
  validator: (v) => (v === 'effective' || v === 'actual') ? v : null,
});

export const saveDateMode = dateModeStorage.set;
export const getDateMode = dateModeStorage.get;
export const clearDateMode = dateModeStorage.clear;

// Secondary Set Multiplier
const secondarySetMultiplierStorage = createStorageManager<number>({
  key: 'hevy_analytics_secondary_set_multiplier',
  defaultValue: 0.5,
  serializer: (v) => String(v),
  validator: (v) => {
    if (v === null) return null;
    const parsed = Number(v);
    if (!Number.isFinite(parsed)) return null;
    if (parsed < 0 || parsed > 1) return null;
    return parsed;
  },
});

export const saveSecondarySetMultiplier = secondarySetMultiplierStorage.set;
export const getSecondarySetMultiplier = secondarySetMultiplierStorage.get;
export const clearSecondarySetMultiplier = secondarySetMultiplierStorage.clear;

// Font Choice
export type FontChoice = 'original' | 'loraItalic' | 'nunito';

const fontChoiceStorage = createStorageManager<FontChoice>({
  key: 'hevy_analytics_font_choice',
  defaultValue: 'nunito',
  validator: (v) => (v === 'original' || v === 'loraItalic' || v === 'nunito') ? v : null,
});

export const saveFontChoice = fontChoiceStorage.set;
export const getFontChoice = fontChoiceStorage.get;
export const clearFontChoice = fontChoiceStorage.clear;

// Show Transparency
const showTransparencyStorage = createStorageManager<boolean>({
  key: 'hevy_analytics_show_background_image',
  defaultValue: true,
  serializer: (v) => v ? 'true' : 'false',
  deserializer: (v) => v === 'true',
  validator: (v) => v !== null ? v === 'true' : null,
});

export const saveShowTransparency = showTransparencyStorage.set;
export const getShowTransparency = showTransparencyStorage.get;
export const clearShowTransparency = showTransparencyStorage.clear;

// Dark background choice
const darkBgChoiceStorage = createStorageManager<string>({
  key: 'hevy_analytics_dark_bg_choice',
  defaultValue: 'dark-bg5',
  validator: (v) => v !== null ? ['dark-bg1', 'dark-bg5'].includes(v) ? v : null : null,
});

export const saveDarkBgChoice = darkBgChoiceStorage.set;
export const getDarkBgChoice = darkBgChoiceStorage.get;

// Light background choice
const lightBgChoiceStorage = createStorageManager<string>({
  key: 'hevy_analytics_light_bg_choice',
  defaultValue: 'light-bg1',
  validator: (v) => v !== null ? ['light-bg1'].includes(v) ? v : null : null,
});

export const saveLightBgChoice = lightBgChoiceStorage.set;
export const getLightBgChoice = lightBgChoiceStorage.get;

// Gemini API Key (user-provided override)
const geminiApiKeyStorage = createStorageManager<string>({
  key: 'fitverse_gemini_api_key',
  defaultValue: '',
  validator: (v) => (typeof v === 'string' ? v : null),
});

export const saveGeminiApiKey = geminiApiKeyStorage.set;
export const getGeminiApiKey = geminiApiKeyStorage.get;
export const clearGeminiApiKey = geminiApiKeyStorage.clear;

// Gemini Model Selection
export type GeminiModel = 'gemini-2.5-flash' | 'gemini-2.5-pro';

const geminiModelStorage = createStorageManager<GeminiModel>({
  key: 'fitverse_gemini_model',
  defaultValue: 'gemini-2.5-flash',
  validator: (v) => (v === 'gemini-2.5-flash' || v === 'gemini-2.5-pro') ? v : null,
});

export const saveGeminiModel = geminiModelStorage.set;
export const getGeminiModel = geminiModelStorage.get;
export const clearGeminiModel = geminiModelStorage.clear;

// AI Food Log & Macro Tracking
export interface FoodLogEntry {
  id: string;
  dateStr: string; // YYYY-MM-DD
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  explanation?: string;
  imageUrl?: string; // Compressed base64 thumbnail
}

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const foodLogStorage = createStorageManager<FoodLogEntry[]>({
  key: 'fitverse_food_log_v1',
  defaultValue: [],
  validator: (v) => (Array.isArray(v) ? v : null),
});

export const saveFoodLog = foodLogStorage.set;
export const getFoodLog = foodLogStorage.get;

const macroTargetsStorage = createStorageManager<MacroTargets>({
  key: 'fitverse_macro_targets_v1',
  defaultValue: { calories: 2000, protein: 150, carbs: 200, fat: 70 },
  validator: (v) =>
    v &&
    typeof v === 'object' &&
    typeof (v as any).calories === 'number' &&
    typeof (v as any).protein === 'number' &&
    typeof (v as any).carbs === 'number' &&
    typeof (v as any).fat === 'number'
      ? (v as MacroTargets)
      : null,
});

export const saveMacroTargets = macroTargetsStorage.set;
export const getMacroTargets = macroTargetsStorage.get;

// JWT Token Storage
const jwtTokenStorage = createStorageManager<string>({
  key: 'fitverse_jwt_token',
  defaultValue: '',
  validator: (v) => (typeof v === 'string' ? v : null),
});

export const saveJwtToken = jwtTokenStorage.set;
export const getJwtToken = jwtTokenStorage.get;
export const clearJwtToken = jwtTokenStorage.clear;

// User Authentication & Profile
export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  age: number;
  weight: number;
  height: number;
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  authProvider: 'google' | 'email';
  macroTargets?: MacroTargets;
}

const userProfileStorage = createStorageManager<UserProfile | null>({
  key: 'fitverse_user_profile_v1',
  defaultValue: null,
  validator: (v) => {
    if (!v || typeof v !== 'object') return null;
    const p = v as any;
    return typeof p.name === 'string' && typeof p.email === 'string'
      ? (p as UserProfile)
      : null;
  },
});

export const saveUserProfile = userProfileStorage.set;
export const getUserProfile = userProfileStorage.get;
export const clearUserProfile = () => {
  userProfileStorage.clear();
  clearJwtToken();
};

// Time Filter Mode - for UI aggregation hints
export type TimeFilterMode = 'all' | 'weekly' | 'monthly' | 'yearly';

export const getSmartFilterMode = (spanDays: number): TimeFilterMode => {
  if (spanDays < 35) return 'all';
  if (spanDays < 150) return 'weekly';
  return 'monthly';
};
