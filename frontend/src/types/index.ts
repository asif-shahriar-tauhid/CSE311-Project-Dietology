export interface User {
  user_id: number;
  full_name: string;
  email: string;
  gender: string;
  height_cm: number;
  date_of_birth?: string;
  region_id?: number;
  region_name?: string;
  unit_system?: 'metric' | 'imperial';
  dark_mode_enabled?: boolean;
}

export interface BiometricLog {
  biometrics_log_id: number;
  user_id: number;
  weight_kg: number;
  body_fat_pct?: number;
  blood_glucose_mg_dl?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  resting_heart_rate?: number;
  recorded_at: string;
}

export interface Food {
  food_id: number;
  category_id: number;
  food_name: string;
  calories_per_100g: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  glycemic_index: number;
  category_name?: string;
  availability_score?: number;
  avg_price?: number;
}

export interface MealLog {
  meal_log_id: number;
  user_id: number;
  food_id: number;
  food_name: string;
  meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  quantity_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  logged_at: string;
}

export interface WorkoutLog {
  exercise_log_id: number;
  user_id: number;
  exercise_id: number;
  exercise_name: string;
  sets_completed: number;
  reps_completed: number;
  weight_used_kg: number;
  duration_minutes: number;
  calories_burned: number;
  logged_at: string;
}

export interface SleepLog {
  sleep_log_id: number;
  user_id: number;
  sleep_start: string;
  sleep_end: string;
  duration_minutes: number;
  sleep_quality_score: number;
  logged_date: string;
}
