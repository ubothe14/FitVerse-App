import { Schema, model, Document } from 'mongoose';

export interface IFoodLog extends Document {
  id: string; // Client-side generated unique string ID
  userEmail: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  explanation?: string;
  imageUrl?: string;
  dateStr: string; // YYYY-MM-DD
  createdAt: Date;
}

const FoodLogSchema = new Schema<IFoodLog>({
  id: { type: String, required: true, index: true },
  userEmail: { type: String, required: true, index: true, lowercase: true, trim: true },
  foodName: { type: String, required: true, trim: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fat: { type: Number, required: true },
  explanation: { type: String, trim: true },
  imageUrl: { type: String }, // Base64 string thumbnail (compressed to ~10-20KB on client)
  dateStr: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

export const FoodLog = model<IFoodLog>('FoodLog', FoodLogSchema);
