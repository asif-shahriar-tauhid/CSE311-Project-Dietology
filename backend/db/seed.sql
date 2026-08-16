-- Seed Data for Dietology System
USE `dietology_db`;

-- Seed Insulin Sensitivity Levels
INSERT INTO `insulin_sensitivity_levels` (`insulin_sensitivity_level_id`, `level_name`, `sensitivity_factor`, `description`) VALUES
(1, 'High Sensitivity', 1.20, 'Normal or high insulin response; ideal glucose metabolism.'),
(2, 'Normal Sensitivity', 1.00, 'Balanced carbohydrate tolerance.'),
(3, 'Mild Resistance', 0.85, 'Slightly reduced insulin sensitivity; moderate carb focus.'),
(4, 'High Resistance (Pre-diabetic)', 0.70, 'Low carb tolerance; requires strict glycemic management.');

-- Seed Goal Types
INSERT INTO `goal_types` (`goal_type_id`, `type_name`, `category`, `description`) VALUES
(1, 'Weight Loss & Fat Reduction', 'Weight Management', 'Reduce total body mass and fat percentage while preserving muscle.'),
(2, 'Muscle Hypertrophy & Bulk', 'Fitness & Strength', 'Increase lean muscle mass through progressive overload and high protein.'),
(3, 'Blood Glucose Regulation', 'Therapeutic Diet', 'Maintain steady glycemic response and prevent spikes.'),
(4, 'Endurance & Stamina', 'Athletic Performance', 'Optimize glycogen stores for cardiovascular performance.');

-- Seed Goal Nutrition Profiles
INSERT INTO `goal_nutrition_profiles` (`nutrition_profile_id`, `goal_type_id`, `daily_calorie_target`, `protein_pct`, `carbs_pct`, `fat_pct`) VALUES
(1, 1, 2000.00, 35.0, 35.0, 30.0),
(2, 2, 2800.00, 30.0, 50.0, 20.0),
(3, 3, 1800.00, 30.0, 25.0, 45.0),
(4, 4, 2500.00, 20.0, 60.0, 20.0);

-- Seed Food Categories
INSERT INTO `food_categories` (`category_id`, `category_name`, `description`) VALUES
(1, 'Proteins & Meats', 'Poultry, beef, fish, eggs, and lean meats'),
(2, 'Grains & Carbohydrates', 'Rice, oats, quinoa, bread, and pasta'),
(3, 'Vegetables & Greens', 'Leafy greens, cruciferous, and root vegetables'),
(4, 'Fruits & Berries', 'Fresh, organic fruits rich in vitamins and fiber'),
(5, 'Dairy & Healthy Fats', 'Milk, yogurt, cheeses, nuts, seeds, and oils');

-- Seed Foods
INSERT INTO `foods` (`food_id`, `category_id`, `food_name`, `calories_per_100g`, `protein_g`, `carbs_g`, `fat_g`, `fiber_g`, `glycemic_index`) VALUES
(1, 1, 'Grilled Chicken Breast', 165.00, 31.00, 0.00, 3.60, 0.00, 0),
(2, 1, 'Atlantic Salmon Fillet', 208.00, 20.00, 0.00, 13.00, 0.00, 0),
(3, 1, 'Large Whole Egg', 143.00, 12.60, 0.70, 9.50, 0.00, 0),
(4, 2, 'Brown Basmati Rice (Cooked)', 123.00, 2.70, 25.60, 0.90, 1.80, 50),
(5, 2, 'Rolled Oats', 389.00, 16.90, 66.30, 6.90, 10.60, 55),
(6, 2, 'Quinoa (Cooked)', 120.00, 4.40, 21.30, 1.90, 2.80, 53),
(7, 3, 'Fresh Spinach', 23.00, 2.90, 3.60, 0.40, 2.20, 15),
(8, 3, 'Steamed Broccoli', 35.00, 2.40, 7.20, 0.40, 3.30, 15),
(9, 3, 'Sweet Potato (Baked)', 90.00, 2.00, 20.70, 0.15, 3.30, 63),
(10, 4, 'Organic Blueberries', 57.00, 0.70, 14.50, 0.30, 2.40, 53),
(11, 4, 'Hass Avocado', 160.00, 2.00, 8.50, 14.70, 6.70, 15),
(12, 4, 'Fresh Banana', 89.00, 1.10, 22.80, 0.30, 2.60, 51),
(13, 5, 'Greek Yogurt (Plain 0%)', 59.00, 10.20, 3.60, 0.40, 0.00, 11),
(14, 5, 'Raw Almonds', 579.00, 21.20, 21.60, 49.90, 12.50, 0);

-- Seed Body Regions
INSERT INTO `body_regions` (`body_region_id`, `body_region_name`, `description`) VALUES
(1, 'Upper Body', 'Chest, back, shoulders, arms'),
(2, 'Lower Body', 'Quadriceps, hamstrings, glutes, calves'),
(3, 'Core & Abdominals', 'Rectus abdominis, obliques, lower back');

-- Seed Muscle Groups
INSERT INTO `muscle_groups` (`muscle_group_id`, `body_region_id`, `muscle_group_name`) VALUES
(1, 1, 'Pectorals (Chest)'),
(2, 1, 'Latissimus Dorsi (Back)'),
(3, 1, 'Deltoids (Shoulders)'),
(4, 1, 'Biceps & Triceps'),
(5, 2, 'Quadriceps & Glutes'),
(6, 2, 'Hamstrings & Calves'),
(7, 3, 'Abdominals & Core');

-- Seed Exercises
INSERT INTO `exercises` (`exercise_id`, `muscle_group_id`, `exercise_name`, `equipment_needed`, `difficulty_level`, `calories_burned_per_min`) VALUES
(1, 1, 'Barbell Bench Press', 'Barbell, Bench', 'Intermediate', 8.50),
(2, 1, 'Push-Ups', 'Bodyweight', 'Beginner', 6.00),
(3, 2, 'Pull-Ups / Lat Pulldown', 'Pull-up Bar / Cable', 'Intermediate', 7.50),
(4, 3, 'Dumbbell Shoulder Press', 'Dumbbells', 'Intermediate', 7.00),
(5, 5, 'Barbell Squat', 'Barbell, Squat Rack', 'Advanced', 11.00),
(6, 5, 'Bodyweight Lunges', 'Bodyweight', 'Beginner', 6.50),
(7, 6, 'Romanian Deadlift', 'Barbell', 'Intermediate', 9.50),
(8, 7, 'Plank Hold', 'Bodyweight', 'Beginner', 4.00),
(9, 7, 'Hanging Knee Raises', 'Pull-up Bar', 'Intermediate', 5.50);

-- Seed Goal Workout Plans
INSERT INTO `goal_workout_plans` (`workout_plan_id`, `goal_type_id`, `exercise_id`, `sets`, `reps`, `frequency_per_week`) VALUES
(1, 1, 5, 4, 12, 3),
(2, 1, 2, 3, 15, 4),
(3, 2, 1, 4, 8, 3),
(4, 2, 3, 4, 10, 3),
(5, 2, 5, 5, 6, 2);

-- Seed Regions
INSERT INTO `regions` (`region_id`, `region_name`, `country`, `timezone`, `climate_type`) VALUES
(1, 'North America East', 'United States', 'America/New_York', 'Temperate'),
(2, 'South Asia (Dhaka/Bengal)', 'Bangladesh', 'Asia/Dhaka', 'Tropical Monsoon'),
(3, 'Western Europe', 'Germany', 'Europe/Berlin', 'Maritime');

-- Seed Environmental Factors
INSERT INTO `environmental_factors` (`factor_id`, `factor_name`, `factor_category`, `description`) VALUES
(1, 'Ambient Temperature', 'Weather', 'Outdoor temperature in Celsius'),
(2, 'Humidity Index', 'Weather', 'Relative humidity percentage'),
(3, 'Air Quality Index (AQI)', 'Environment', 'Air pollution index measuring PM2.5');

-- Seed Region Environments
INSERT INTO `region_environments` (`region_environment_id`, `region_id`, `factor_id`, `factor_value`, `recorded_date`) VALUES
(1, 2, 1, 32.50, '2026-08-01'),
(2, 2, 2, 78.00, '2026-08-01'),
(3, 2, 3, 115.00, '2026-08-01');

-- Seed Region Food Availability
INSERT INTO `region_food_availability` (`availability_id`, `region_id`, `food_id`, `availability_score`, `avg_price`, `season`) VALUES
(1, 2, 4, 9.5, 1.20, 'All Year'),
(2, 2, 1, 9.0, 3.50, 'All Year'),
(3, 2, 8, 8.0, 1.50, 'Winter'),
(4, 2, 10, 4.5, 8.00, 'Imported');

-- Seed Default Demo User (Password: "password123")
-- Hash generated via bcrypt password_hash('password123', PASSWORD_BCRYPT)
INSERT INTO `users` (`user_id`, `full_name`, `email`, `password_hash`, `date_of_birth`, `gender`, `height_cm`, `created_at`) VALUES
(1, 'Alex Mercer', 'alex@example.com', '$2y$10$4y9pB./vjB/tN6n9qT0Eee6k34F9gC7c6L/S55C70gZk30g57dMmu', '1995-06-15', 'Male', 178.50, CURRENT_TIMESTAMP);

-- Seed User Preferences
INSERT INTO `user_preferences` (`preference_id`, `user_id`, `unit_system`, `timezone`, `notification_enabled`, `dark_mode_enabled`) VALUES
(1, 1, 'metric', 'Asia/Dhaka', TRUE, TRUE);

-- Seed User Biometrics Log
INSERT INTO `user_biometrics_log` (`biometrics_log_id`, `user_id`, `insulin_sensitivity_level_id`, `weight_kg`, `body_fat_pct`, `blood_glucose_mg_dl`, `blood_pressure_systolic`, `blood_pressure_diastolic`, `resting_heart_rate`, `recorded_at`) VALUES
(1, 1, 2, 76.50, 16.50, 95.00, 120, 80, 64, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(2, 1, 2, 75.80, 16.20, 92.00, 118, 78, 62, CURRENT_TIMESTAMP);

-- Seed User Goals
INSERT INTO `user_goals` (`goal_id`, `user_id`, `goal_type_id`, `target_value`, `current_value`, `start_date`, `target_date`, `status`, `created_at`) VALUES
(1, 1, 1, 72.00, 75.80, '2026-07-01', '2026-10-01', 'active', CURRENT_TIMESTAMP);

-- Seed Goal Progress Logs
INSERT INTO `goal_progress_logs` (`progress_log_id`, `goal_id`, `log_date`, `progress_value`, `notes`) VALUES
(1, 1, '2026-07-01', 77.20, 'Initial starting weight.'),
(2, 1, '2026-07-15', 76.50, 'Consistent workout and meal adherence.'),
(3, 1, '2026-08-01', 75.80, 'On track to hit 72kg by October.');

-- Seed User Meal Logs
INSERT INTO `user_meal_logs` (`meal_log_id`, `user_id`, `food_id`, `meal_type`, `quantity_g`, `logged_at`) VALUES
(1, 1, 5, 'Breakfast', 80.00, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(2, 1, 13, 'Breakfast', 150.00, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(3, 1, 1, 'Lunch', 200.00, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(4, 1, 4, 'Lunch', 150.00, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(5, 1, 8, 'Lunch', 100.00, DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- Seed Exercise Logs
INSERT INTO `exercise_logs` (`exercise_log_id`, `user_id`, `exercise_id`, `sets_completed`, `reps_completed`, `weight_used_kg`, `duration_minutes`, `calories_burned`, `logged_at`) VALUES
(1, 1, 5, 4, 10, 80.00, 30, 330.00, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 1, 1, 4, 8, 70.00, 25, 212.50, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Seed Sleep Logs
INSERT INTO `sleep_logs` (`sleep_log_id`, `user_id`, `sleep_start`, `sleep_end`, `duration_minutes`, `sleep_quality_score`, `logged_date`) VALUES
(1, 1, '2026-08-05 23:00:00', '2026-08-06 07:00:00', 480, 8.5, '2026-08-06');

-- Seed Sleep Factors
INSERT INTO `sleep_factors` (`sleep_factor_id`, `sleep_log_id`, `factor_name`, `factor_value`) VALUES
(1, 1, 'Caffeine Consumption', 'None after 4 PM'),
(2, 1, 'Room Temperature', '22 C');
