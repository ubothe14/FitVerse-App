import { Schema, model, Document } from 'mongoose';

export interface IMacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface IUser extends Document {
  email: string;
  name: string;
  phone?: string;
  age: number;
  weight: number; // in kg
  height: number; // in cm
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  authProvider: 'google' | 'email';
  password?: string;
  macroTargets: IMacroTargets;
  createdAt: Date;
}

const MacroTargetsSchema = new Schema<IMacroTargets>({
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fat: { type: Number, required: true },
}, { _id: false });

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  name: { type: String, required: true },
  phone: { type: String, sparse: true, trim: true },
  age: { type: Number, required: true },
  weight: { type: Number, required: true },
  height: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  activityLevel: {
    type: String,
    enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active'],
    required: true,
  },
  authProvider: { type: String, enum: ['google', 'email'], required: true },
  password: { type: String, select: false },
  macroTargets: { type: MacroTargetsSchema, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const User = model<IUser>('User', UserSchema);
