import React from 'react';
import type { BodyMapGender } from '../bodyMap/BodyMap';
import type { WeightUnit } from '../../utils/storage/localStorage';
import type { OnboardingFlow } from '../../app/onboarding/types';
import { LandingPage } from '../landing/ui/LandingPage';
import {
  getPreferencesConfirmed,
  clearCSVData,
  savePreferencesConfirmed,
} from '../../utils/storage/localStorage';
import {
  getHevyAuthToken,
  getHevyRefreshToken,
} from '../../utils/storage/dataSourceStorage';
import {
  getHevyProApiKey,
  getLyftaApiKey,
} from '../../utils/storage/hevyCredentialsStorage';
import { OnboardingDemoStep } from './OnboardingDemoStep';
import { AddSourcePickerModal } from './AddSourcePickerModal';
import { UnifiedPlatformModal } from '../modals/platform/UnifiedPlatformModal';
import { AuthPage } from '../auth/AuthPage';
import type { UserProfile } from '../../utils/storage/localStorage';

type Platform = 'hevy' | 'strong' | 'lyfta' | 'other' | 'motra';

interface AppOnboardingStepsProps {
  onboarding: OnboardingFlow;
  dataSource: Platform | null;
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
    platform: Platform,
    unitOverride?: WeightUnit,
  ) => void;
  onHevyLogin: (emailOrUsername: string, password: string) => void;
  onHevyApiKeyLogin: (apiKey: string) => void;
  onHevySyncSaved: () => void;
  onLyfatLogin: (apiKey: string) => void;
  onLyfatSyncSaved: () => void;
}

export const AppOnboardingSteps: React.FC<AppOnboardingStepsProps> = ({
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
  const closeForUpdate =
    onboarding.intent === 'update'
      ? () => {
          clearCSVData();
          onSetOnboarding(null);
        }
      : undefined;

  const handleSelectPlatform = (source: Platform) => {
    onSetCsvImportError(null);
    onSetHevyLoginError(null);
    onSetLyfatLoginError(null);
    
    // If not logged in, force authentication first
    if (!userProfile) {
      onSetOnboarding({
        intent: onboarding.intent,
        step: 'auth',
        platform: source,
      });
      return;
    }

    onSetOnboarding({
      intent: onboarding.intent,
      step: 'unified_modal',
      platform: source,
    });
  };

  const handleSelectPlatformForCombine = (source: Platform) => {
    onSetCsvImportError(null);
    onSetHevyLoginError(null);
    onSetLyfatLoginError(null);
    onSetOnboarding({
      intent: onboarding.intent,
      step: 'unified_modal',
      platform: source,
    });
  };

  const [preferencesConfirmed, setPreferencesConfirmed] = React.useState(
    () => getPreferencesConfirmed(),
  );

  if (onboarding.step === 'platform') {
    return (
      <LandingPage
        userProfile={userProfile}
        onLoginClick={onLoginClick}
        onLogout={onLogout}
        onSelectPlatform={handleSelectPlatform}
        onTryDemo={() => {
          onSetCsvImportError(null);
          onSetHevyLoginError(null);
          onSetLyfatLoginError(null);
          onSetOnboarding({
            intent: 'initial',
            step: 'demo_prefs',
            platform: 'other',
          });
        }}
      />
    );
  }

  if (onboarding.step === 'auth') {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0a0a0c]">
        <AuthPage
          onAuthComplete={(profile) => {
            onAuthComplete?.(profile);
            // If the user had selected a platform, navigate to the connection modal
            if (onboarding.platform) {
              onSetOnboarding({
                intent: onboarding.intent,
                step: 'unified_modal',
                platform: onboarding.platform,
              });
            } else {
              // Otherwise, just go back to the landing page
              onSetOnboarding({
                intent: onboarding.intent,
                step: 'platform',
              });
            }
          }}
          onClose={() => {
            // Cancel and go back to landing page
            onSetOnboarding({
              intent: onboarding.intent,
              step: 'platform',
            });
          }}
        />
      </div>
    );
  }

  if (onboarding.step === 'add_source_platform') {
    return (
      <AddSourcePickerModal
        onSelectSource={handleSelectPlatformForCombine}
        onClose={() => onSetOnboarding(null)}
      />
    );
  }

  if (onboarding.step === 'demo_prefs') {
    return (
      <OnboardingDemoStep
        intent={onboarding.intent}
        bodyMapGender={bodyMapGender}
        weightUnit={weightUnit}
        isAnalyzing={isAnalyzing}
        onSetOnboarding={onSetOnboarding}
        onSetBodyMapGender={onSetBodyMapGender}
        onSetWeightUnit={onSetWeightUnit}
        onSetCsvImportError={onSetCsvImportError}
        onProcessFile={onProcessFile}
        onClose={closeForUpdate}
      />
    );
  }

  if (onboarding.step === 'unified_modal') {
    const platform = (onboarding.platform || 'other') as Platform;

    const hasSavedHevySession =
      Boolean(getHevyAuthToken() || getHevyProApiKey()) &&
      getPreferencesConfirmed();

    const hasSavedLyftaSession =
      Boolean(getLyftaApiKey()) && getPreferencesConfirmed();

    const hasSavedSession =
      platform === 'hevy'
        ? hasSavedHevySession
        : platform === 'lyfta'
          ? hasSavedLyftaSession
          : false;

    return (
      <UnifiedPlatformModal
        intent={onboarding.intent}
        platform={platform}
        onHevyLogin={onHevyLogin}
        onHevyApiKeyLogin={onHevyApiKeyLogin}
        hevyLoginError={hevyLoginError}
        onSetHevyLoginError={onSetHevyLoginError}
        onLyftaLogin={onLyfatLogin}
        lyftaLoginError={lyfatLoginError}
        onSetLyftaLoginError={onSetLyfatLoginError}
        onProcessFile={onProcessFile}
        csvImportError={csvImportError}
        onSetCsvImportError={onSetCsvImportError}
        preferencesConfirmed={preferencesConfirmed}
        bodyMapGender={bodyMapGender}
        weightUnit={weightUnit}
        onSetBodyMapGender={onSetBodyMapGender}
        onSetWeightUnit={onSetWeightUnit}
        onSetPreferencesConfirmed={setPreferencesConfirmed}
        hasSavedSession={hasSavedSession}
        onSyncSaved={
          platform === 'hevy'
            ? onHevySyncSaved
            : platform === 'lyfta'
              ? onLyfatSyncSaved
              : undefined
        }
        isAnalyzing={isAnalyzing}
        onClearCache={hasDashboardData ? onClearCacheAndRestart : undefined}
        onAddDataSource={
          onboarding.backStep === 'add_source_platform'
            ? undefined
            : () =>
                onSetOnboarding({
                  intent: 'update',
                  step: 'add_source_platform',
                })
        }
        onBack={() =>
          onSetOnboarding({
            intent: onboarding.intent,
            step: 'platform',
          })
        }
        onClose={closeForUpdate}
      />
    );
  }

  return null;
};
