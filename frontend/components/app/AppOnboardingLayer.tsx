import React from 'react';
import type { BodyMapGender } from '../bodyMap/BodyMap';
import type { WeightUnit, UserProfile } from '../../utils/storage/localStorage';
import type { OnboardingFlow } from '../../app/onboarding/types';
import { AppOnboardingSteps } from './AppOnboardingSteps';

interface AppOnboardingLayerProps {
  onboarding: OnboardingFlow | null;
  dataSource: 'strong' | 'hevy' | 'lyfta' | 'other' | 'motra' | null;
  hasDashboardData: boolean;
  bodyMapGender: BodyMapGender;
  weightUnit: WeightUnit;
  isAnalyzing: boolean;
  csvImportError: string | null;
  hevyLoginError: string | null;
  lyfatLoginError: string | null;
  userProfile?: UserProfile | null;
  onLoginClick?: () => void;
  onLogout?: () => void;
  onAuthComplete?: (profile: UserProfile) => void;
  onSetOnboarding: (next: OnboardingFlow | null) => void;
  onSetBodyMapGender: (g: BodyMapGender) => void;
  onSetWeightUnit: (u: WeightUnit) => void;
  onSetCsvImportError: (msg: string | null) => void;
  onSetHevyLoginError: (msg: string | null) => void;
  onSetLyfatLoginError: (msg: string | null) => void;
  onClearCacheAndRestart: () => void;
  onForceRefreshAndRelogin?: () => void;
  onProcessFile: (
    file: File,
    platform: 'strong' | 'hevy' | 'lyfta' | 'other' | 'motra',
    unitOverride?: WeightUnit,
  ) => void;
  onHevyLogin: (emailOrUsername: string, password: string) => void;
  onHevyApiKeyLogin: (apiKey: string) => void;
  onHevySyncSaved: () => void;
  onLyfatLogin: (apiKey: string) => void;
  onLyfatSyncSaved: () => void;
}

export const AppOnboardingLayer: React.FC<AppOnboardingLayerProps> = ({
  onboarding,
  hasDashboardData,
  bodyMapGender,
  weightUnit,
  isAnalyzing,
  csvImportError,
  hevyLoginError,
  lyfatLoginError,
  userProfile,
  onLoginClick,
  onLogout,
  onAuthComplete,
  onSetOnboarding,
  onSetBodyMapGender,
  onSetWeightUnit,
  onSetCsvImportError,
  onSetHevyLoginError,
  onSetLyfatLoginError,
  onClearCacheAndRestart,
  onForceRefreshAndRelogin,
  onProcessFile,
  onHevyLogin,
  onHevyApiKeyLogin,
  onHevySyncSaved,
  onLyfatLogin,
  onLyfatSyncSaved,
}) => {
  if (!onboarding) return null;

  return (
    <AppOnboardingSteps
      onboarding={onboarding}
      dataSource={null}
      hasDashboardData={hasDashboardData}
      bodyMapGender={bodyMapGender}
      weightUnit={weightUnit}
      isAnalyzing={isAnalyzing}
      csvImportError={csvImportError}
      hevyLoginError={hevyLoginError}
      lyfatLoginError={lyfatLoginError}
      userProfile={userProfile}
      onLoginClick={onLoginClick}
      onLogout={onLogout}
      onAuthComplete={onAuthComplete}
      onSetOnboarding={onSetOnboarding}
      onSetBodyMapGender={onSetBodyMapGender}
      onSetWeightUnit={onSetWeightUnit}
      onSetCsvImportError={onSetCsvImportError}
      onSetHevyLoginError={onSetHevyLoginError}
      onSetLyfatLoginError={onSetLyfatLoginError}
      onClearCacheAndRestart={onClearCacheAndRestart}
      onForceRefreshAndRelogin={onForceRefreshAndRelogin}
      onProcessFile={onProcessFile}
      onHevyLogin={onHevyLogin}
      onHevyApiKeyLogin={onHevyApiKeyLogin}
      onHevySyncSaved={onHevySyncSaved}
      onLyfatLogin={onLyfatLogin}
      onLyfatSyncSaved={onLyfatSyncSaved}
    />
  );
};
