import { buildBackendUrl, parseError } from './common';
import { getGeminiApiKey, getGeminiModel } from '../storage/localStorage';
import { mergeAnalyticsHeaders } from '../integrations/analyticsClientId';

export interface AiAnalysisResult {
  text: string;
}

export const runAiAnalysis = async (prompt: string): Promise<AiAnalysisResult> => {
  const url = buildBackendUrl('/api/ai/analyze');
  const customKey = getGeminiApiKey();
  const model = getGeminiModel();

  const headers = mergeAnalyticsHeaders({
    'Content-Type': 'application/json',
  }) as Record<string, string>;

  if (customKey) {
    headers['x-gemini-api-key'] = customKey;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt, model }),
  });

  if (!res.ok) {
    const errMsg = await parseError(res);
    throw new Error(errMsg);
  }

  return res.json();
};

export interface AiFoodAnalysisResult {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  explanation: string;
}

export const runAiFoodAnalysis = async (
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<AiFoodAnalysisResult> => {
  const url = buildBackendUrl('/api/ai/analyze-food');
  const customKey = getGeminiApiKey();
  const model = getGeminiModel();

  const headers = mergeAnalyticsHeaders({
    'Content-Type': 'application/json',
  }) as Record<string, string>;

  if (customKey) {
    headers['x-gemini-api-key'] = customKey;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ image: imageBase64, mimeType, model }),
  });

  if (!res.ok) {
    const errMsg = await parseError(res);
    throw new Error(errMsg);
  }

  return res.json();
};

import type { UserProfile, MacroTargets, FoodLogEntry } from '../storage/localStorage';
import { getJwtToken } from '../storage/localStorage';

// Google Token Validation
export interface GoogleAuthResponse {
  exists: boolean;
  email: string;
  name: string;
  token?: string;
  profile?: UserProfile;
}

export const validateGoogleToken = async (credential: string): Promise<GoogleAuthResponse> => {
  const url = buildBackendUrl('/api/auth/google');
  const headers = mergeAnalyticsHeaders({
    'Content-Type': 'application/json',
  }) as Record<string, string>;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ credential }),
  });

  if (!res.ok) {
    const errMsg = await parseError(res);
    throw new Error(errMsg);
  }

  return res.json();
};

// User Profile fetch
export const fetchUserProfile = async (): Promise<UserProfile> => {
  const url = buildBackendUrl('/api/user/profile');
  const headers = mergeAnalyticsHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getJwtToken()}`,
  }) as Record<string, string>;

  const res = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    const errMsg = await parseError(res);
    throw new Error(errMsg);
  }

  return res.json();
};

// User Profile Save (Upsert)
export const saveUserProfileDb = async (profile: UserProfile): Promise<UserProfile> => {
  const url = buildBackendUrl('/api/user/profile');
  const headers = mergeAnalyticsHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getJwtToken()}`,
  }) as Record<string, string>;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(profile),
  });

  if (!res.ok) {
    const errMsg = await parseError(res);
    throw new Error(errMsg);
  }

  return res.json();
};

// Email Login
export const emailLoginDb = async (email: string, password: string): Promise<{ profile: UserProfile, token: string }> => {
  const url = buildBackendUrl('/api/auth/email/login');
  const headers = mergeAnalyticsHeaders({
    'Content-Type': 'application/json',
  }) as Record<string, string>;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errMsg = await parseError(res);
    throw new Error(errMsg);
  }

  return res.json();
};

// User Macros override Save
export const saveMacroTargetsDb = async (email: string, targets: MacroTargets): Promise<MacroTargets> => {
  const url = buildBackendUrl('/api/user/macros');
  const headers = mergeAnalyticsHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getJwtToken()}`,
  }) as Record<string, string>;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ macroTargets: targets }),
  });

  if (!res.ok) {
    const errMsg = await parseError(res);
    throw new Error(errMsg);
  }

  return res.json();
};

// Daily Food Logs Fetch
export const fetchFoodLogsDb = async (email: string, dateStr: string): Promise<FoodLogEntry[]> => {
  const url = buildBackendUrl(`/api/nutrition/log?date=${dateStr}`);
  const headers = mergeAnalyticsHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getJwtToken()}`,
  }) as Record<string, string>;

  const res = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    const errMsg = await parseError(res);
    throw new Error(errMsg);
  }

  return res.json();
};

// Daily Food Log Save (Upsert)
export const saveFoodLogDb = async (email: string, entry: FoodLogEntry): Promise<FoodLogEntry> => {
  const url = buildBackendUrl('/api/nutrition/log');
  const headers = mergeAnalyticsHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getJwtToken()}`,
  }) as Record<string, string>;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(entry),
  });

  if (!res.ok) {
    const errMsg = await parseError(res);
    throw new Error(errMsg);
  }

  return res.json();
};

// Daily Food Log Delete
export const deleteFoodLogDb = async (email: string, id: string): Promise<{ success: boolean }> => {
  const url = buildBackendUrl(`/api/nutrition/log/${id}`);
  const headers = mergeAnalyticsHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getJwtToken()}`,
  }) as Record<string, string>;

  const res = await fetch(url, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok) {
    const errMsg = await parseError(res);
    throw new Error(errMsg);
  }

  return res.json();
};
