import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Phone, Activity, Sparkles, ChevronRight, Info, Loader2, X } from 'lucide-react';
import { saveUserProfile, saveMacroTargets, saveJwtToken, type UserProfile, type MacroTargets } from '../../utils/storage/localStorage';
import { SEMI_FANCY_FONT } from '../../utils/ui/uiConstants';
import { validateGoogleToken, saveUserProfileDb, fetchUserProfile, emailLoginDb } from '../../utils/api/aiBackend';

interface AuthPageProps {
  onAuthComplete: (profile: UserProfile) => void;
  onClose?: () => void;
}

type AuthStep = 'login' | 'profile';

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthComplete, onClose }) => {
  // Auth view states
  const [step, setStep] = useState<AuthStep>('login');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authProvider, setAuthProvider] = useState<'email' | 'google'>('email');

  // Authentication Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Profile / Characteristics Fields
  const [age, setAge] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [height, setHeight] = useState<number | ''>(''); // in cm
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active'>('lightly_active');

  // Personalized Targets (Derived or manually overridden)
  const [calories, setCalories] = useState<number>(2000);
  const [protein, setProtein] = useState<number>(150);
  const [carbs, setCarbs] = useState<number>(200);
  const [fat, setFat] = useState<number>(70);
  const [isManualOverride, setIsManualOverride] = useState(false);

  // BMR & TDEE derived calculations
  useEffect(() => {
    if (isManualOverride) return;
    if (age === '' || weight === '' || height === '') return;

    // Convert weight to kg if necessary
    const wKg = weightUnit === 'lbs' ? Number(weight) / 2.20462 : Number(weight);
    const hCm = Number(height);
    const aY = Number(age);

    // BMR using Mifflin-St Jeor Equation
    let bmr = 0;
    if (gender === 'male') {
      bmr = 10 * wKg + 6.25 * hCm - 5 * aY + 5;
    } else if (gender === 'female') {
      bmr = 10 * wKg + 6.25 * hCm - 5 * aY - 161;
    } else {
      bmr = 10 * wKg + 6.25 * hCm - 5 * aY - 78; // average
    }

    // TDEE Activity Factors
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
    };

    const calculatedTdee = Math.round(bmr * activityMultipliers[activityLevel]);
    
    // Personalized macro suggestions
    // Protein: 2.0g per kg of weight
    const suggestedProtein = Math.round(wKg * 2.0);
    // Fat: 25% of total calories
    const suggestedFat = Math.round((calculatedTdee * 0.25) / 9);
    // Carbs: remainder of calories
    const suggestedCarbs = Math.round((calculatedTdee - (suggestedProtein * 4 + suggestedFat * 9)) / 4);

    setCalories(calculatedTdee);
    setProtein(suggestedProtein);
    setFat(suggestedFat);
    setCarbs(suggestedCarbs);
  }, [age, weight, weightUnit, height, gender, activityLevel, isManualOverride]);

  // Handle Google Token Response from GIS SDK
  const handleCredentialResponse = async (response: any) => {
    const token = response.credential;
    setLoading(true);
    try {
      const res = await validateGoogleToken(token);
      if (res.exists && res.profile && res.token) {
        saveJwtToken(res.token);
        saveUserProfile(res.profile);
        if (res.profile.macroTargets) {
          saveMacroTargets(res.profile.macroTargets);
        }
        onAuthComplete(res.profile);
      } else {
        setName(res.name || '');
        setEmail(res.email || '');
        setAuthProvider('google');
        setStep('profile');
      }
    } catch (err: any) {
      console.error('Google token verification failed:', err);
      alert(err.message || 'Google Sign-In verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render Google GSI button
  useEffect(() => {
    if (step !== 'login') return;

    const initGoogleButton = () => {
      const gsi = (window as any).google?.accounts?.id;
      if (!gsi) return false;

      const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || '';

      gsi.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      const buttonDiv = document.getElementById('google-signin-button');
      if (buttonDiv) {
        gsi.renderButton(buttonDiv, {
          theme: 'filled_black',
          size: 'large',
          width: buttonDiv.clientWidth || 320,
        });
      }
      return true;
    };

    if (!initGoogleButton()) {
      let attempts = 0;
      const timer = setInterval(() => {
        attempts++;
        if (initGoogleButton() || attempts > 15) {
          clearInterval(timer);
        }
      }, 200);
      return () => clearInterval(timer);
    }
  }, [step]);

  // Handle Email Login/Register
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    try {
      if (isRegister) {
        setAuthProvider('email');
        setStep('profile');
      } else {
        // Authenticate with email and password
        const { profile, token } = await emailLoginDb(email, password);
        saveJwtToken(token);
        saveUserProfile(profile);
        if (profile.macroTargets) {
          saveMacroTargets(profile.macroTargets);
        }
        onAuthComplete(profile);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const gsi = (window as any).google?.accounts?.id;
    if (!gsi) {
      alert('Google sign-in is still loading. Please wait a moment and try again.');
      return;
    }
    gsi.prompt();
  };

  // Complete profile registration and set target macros in DB
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!age || !weight || !height) return;

    setLoading(true);
    try {
      const profile: UserProfile = {
        name: name || email.split('@')[0] || 'FitVerse User',
        email,
        phone: phone || undefined,
        age: Number(age),
        weight: weightUnit === 'lbs' ? Number(weight) / 2.20462 : Number(weight),
        height: Number(height),
        gender,
        activityLevel,
        authProvider,
      } as any;

      const macroTargets: MacroTargets = {
        calories,
        protein,
        carbs,
        fat,
      };

      // Embed macro targets inside profile payload for single-call backend upsert
      (profile as any).macroTargets = macroTargets;
      if (password) {
        (profile as any).password = password;
      }

      // Persist user and default targets in MongoDB Atlas
      const { profile: savedProfile, token } = await saveUserProfileDb(profile) as unknown as { profile: UserProfile, token: string };

      if (token) {
        saveJwtToken(token);
      }
      
      saveUserProfile(savedProfile);
      saveMacroTargets(macroTargets);
      onAuthComplete(savedProfile);
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      alert(err.message || 'Failed to save profile. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] text-slate-200 px-4 py-8 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg bg-slate-950/40 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6 relative z-10">
        
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer p-1.5 rounded-lg hover:bg-white/5"
            title="Back to Home"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-2 rounded-xl bg-purple-500/15 border border-purple-500/20 text-purple-400 mb-1">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white" style={SEMI_FANCY_FONT}>
            {step === 'login' ? 'Welcome to FitVerse' : 'Personalize Your Plan'}
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            {step === 'login'
              ? 'Connect your profile to customize analytics, track nutrition, and monitor workout signals.'
              : 'Provide your details to dynamically calculate and personalize your daily calories and macro splits.'}
          </p>
        </div>

        {/* LOADING OVERLAY */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            <p className="text-xs text-purple-300 font-medium animate-pulse">Authenticating secure session...</p>
          </div>
        )}

        {!loading && step === 'login' && (
          <div className="space-y-5">
            {/* Google Sign In Button */}
            <div className="flex flex-col gap-2 w-full items-center justify-center">
              <div id="google-signin-button" className="w-full flex justify-center min-h-[44px]"></div>
              
              {/* Fallback mock button if window.google is not loaded yet */}
              {!(typeof window !== 'undefined' && (window as any).google?.accounts?.id) && (
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-white/10 bg-white/[0.04] text-slate-200 font-semibold hover:bg-white/[0.08] hover:text-white transition duration-200 cursor-pointer shadow-lg shadow-black/30"
                >
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-slate-600 my-2">
              <hr className="w-[42%] border-slate-900" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">or</span>
              <hr className="w-[42%] border-slate-900" />
            </div>

            {/* Email form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {isRegister && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block" htmlFor="auth-name">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="auth-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter name"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-white/5 bg-slate-950/60 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block" htmlFor="auth-email">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="auth-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-white/5 bg-slate-950/60 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  />
                </div>
              </div>

              {isRegister && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block" htmlFor="auth-phone">Phone Number (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="auth-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-white/5 bg-slate-950/60 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block" htmlFor="auth-pass">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="auth-pass"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-white/5 bg-slate-950/60 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center gap-2 justify-center whitespace-nowrap rounded-xl text-sm font-semibold focus-visible:outline-none disabled:pointer-events-none h-11 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25 transition duration-200 cursor-pointer"
              >
                <span>{isRegister ? 'Next: Profile Details' : 'Sign In to FitVerse'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setAuthProvider('email');
                }}
                className="text-xs text-slate-400 hover:text-white underline transition"
              >
                {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </div>
        )}

        {!loading && step === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            {/* Characteristics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block" htmlFor="prof-age">Age</label>
                <input
                  id="prof-age"
                  type="number"
                  required
                  min={1}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Years"
                  className="w-full h-10 px-3 rounded-lg border border-white/5 bg-slate-950/60 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block" htmlFor="prof-gender">Gender</label>
                <select
                  id="prof-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-lg border border-white/5 bg-slate-950/60 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block" htmlFor="prof-weight">Weight</label>
                  <div className="flex gap-1.5 text-[9px] font-bold bg-white/5 p-0.5 rounded-md">
                    <button
                      type="button"
                      onClick={() => setWeightUnit('kg')}
                      className={`px-1.5 py-0.5 rounded ${weightUnit === 'kg' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                    >
                      KG
                    </button>
                    <button
                      type="button"
                      onClick={() => setWeightUnit('lbs')}
                      className={`px-1.5 py-0.5 rounded ${weightUnit === 'lbs' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                    >
                      LBS
                    </button>
                  </div>
                </div>
                <input
                  id="prof-weight"
                  type="number"
                  required
                  min={10}
                  max={500}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder={weightUnit.toUpperCase()}
                  className="w-full h-10 px-3 rounded-lg border border-white/5 bg-slate-950/60 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block" htmlFor="prof-height">Height (cm)</label>
                <input
                  id="prof-height"
                  type="number"
                  required
                  min={50}
                  max={250}
                  value={height}
                  onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="cm"
                  className="w-full h-10 px-3 rounded-lg border border-white/5 bg-slate-950/60 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block" htmlFor="prof-activity">Activity Level</label>
              <select
                id="prof-activity"
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as any)}
                className="w-full h-10 px-3 rounded-lg border border-white/5 bg-slate-950/60 text-sm focus:outline-none"
              >
                <option value="sedentary">Sedentary (Little to no exercise)</option>
                <option value="lightly_active">Lightly Active (Light exercise 1-3 days/week)</option>
                <option value="moderately_active">Moderately Active (Moderate exercise 3-5 days/week)</option>
                <option value="very_active">Very Active (Heavy exercise 6-7 days/week)</option>
              </select>
            </div>

            {/* Calculations Card */}
            {age && weight && height && (
              <div className="p-4 rounded-xl border border-emerald-500/25 bg-emerald-950/10 space-y-3">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Calculated Daily Nutrition Recommendations</span>
                </div>
                
                {/* Calories, protein, carbs, fat splits preview */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-slate-950/60 p-2 rounded-lg">
                    <span className="text-[9px] font-bold uppercase tracking-wider block text-slate-500">Calories</span>
                    <span className="text-sm font-bold text-white">{calories} kcal</span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-lg">
                    <span className="text-[9px] font-bold uppercase tracking-wider block text-slate-500">Protein</span>
                    <span className="text-sm font-bold text-white">{protein}g</span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-lg">
                    <span className="text-[9px] font-bold uppercase tracking-wider block text-slate-500">Carbs</span>
                    <span className="text-sm font-bold text-white">{carbs}g</span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-lg">
                    <span className="text-[9px] font-bold uppercase tracking-wider block text-slate-500">Fat</span>
                    <span className="text-sm font-bold text-white">{fat}g</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    id="override-checkbox"
                    type="checkbox"
                    checked={isManualOverride}
                    onChange={(e) => setIsManualOverride(e.target.checked)}
                    className="w-3.5 h-3.5 accent-purple-500 rounded border-slate-700 bg-slate-900 cursor-pointer"
                  />
                  <label htmlFor="override-checkbox" className="text-[10px] text-slate-400 cursor-pointer select-none">
                    Manually adjust nutrition targets
                  </label>
                </div>
              </div>
            )}

            {/* Manual target editor overrides */}
            {isManualOverride && (
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3 fade-in">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Manual Macro Overrides</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 block" htmlFor="override-kcal">Kcal</label>
                    <input
                      id="override-kcal"
                      type="number"
                      value={calories}
                      onChange={(e) => setCalories(Math.max(0, Number(e.target.value)))}
                      className="w-full h-8 px-2 rounded bg-slate-900 text-xs border border-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 block" htmlFor="override-protein">Protein (g)</label>
                    <input
                      id="override-protein"
                      type="number"
                      value={protein}
                      onChange={(e) => setProtein(Math.max(0, Number(e.target.value)))}
                      className="w-full h-8 px-2 rounded bg-slate-900 text-xs border border-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 block" htmlFor="override-carbs">Carbs (g)</label>
                    <input
                      id="override-carbs"
                      type="number"
                      value={carbs}
                      onChange={(e) => setCarbs(Math.max(0, Number(e.target.value)))}
                      className="w-full h-8 px-2 rounded bg-slate-900 text-xs border border-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 block" htmlFor="override-fat">Fat (g)</label>
                    <input
                      id="override-fat"
                      type="number"
                      value={fat}
                      onChange={(e) => setFat(Math.max(0, Number(e.target.value)))}
                      className="w-full h-8 px-2 rounded bg-slate-900 text-xs border border-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Form actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep('login');
                  setAuthProvider('email');
                }}
                className="flex-1 h-11 px-4 rounded-xl border border-white/10 text-xs font-semibold hover:text-white hover:bg-white/5 cursor-pointer"
              >
                Back to Sign In
              </button>
              <button
                type="submit"
                disabled={!age || !weight || !height}
                className="flex-[2] inline-flex items-center gap-2 justify-center whitespace-nowrap rounded-xl text-sm font-semibold focus-visible:outline-none disabled:opacity-40 disabled:pointer-events-none h-11 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/25 transition duration-200 cursor-pointer"
              >
                <span>Complete Profile & Setup</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
