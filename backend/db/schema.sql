-- Dietology Database Schema Definition
-- Creates all 22 relational tables with foreign keys, indexes, and cascades.

CREATE DATABASE IF NOT EXISTS `dietology_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `dietology_db`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `date_of_birth` DATE DEFAULT NULL,
  `gender` VARCHAR(20) DEFAULT NULL,
  `height_cm` DECIMAL(5,2) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Insulin Sensitivity Levels
CREATE TABLE IF NOT EXISTS `insulin_sensitivity_levels` (
  `insulin_sensitivity_level_id` INT AUTO_INCREMENT PRIMARY KEY,
  `level_name` VARCHAR(50) NOT NULL,
  `sensitivity_factor` DECIMAL(5,2) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. User Biometrics Log
CREATE TABLE IF NOT EXISTS `user_biometrics_log` (
  `biometrics_log_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `insulin_sensitivity_level_id` INT DEFAULT NULL,
  `weight_kg` DECIMAL(5,2) DEFAULT NULL,
  `body_fat_pct` DECIMAL(4,2) DEFAULT NULL,
  `blood_glucose_mg_dl` DECIMAL(5,2) DEFAULT NULL,
  `blood_pressure_systolic` INT DEFAULT NULL,
  `blood_pressure_diastolic` INT DEFAULT NULL,
  `resting_heart_rate` INT DEFAULT NULL,
  `recorded_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_biometrics_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_biometrics_insulin_level` FOREIGN KEY (`insulin_sensitivity_level_id`) REFERENCES `insulin_sensitivity_levels` (`insulin_sensitivity_level_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. User Preferences
CREATE TABLE IF NOT EXISTS `user_preferences` (
  `preference_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `unit_system` VARCHAR(20) DEFAULT 'metric',
  `timezone` VARCHAR(50) DEFAULT 'UTC',
  `notification_enabled` BOOLEAN DEFAULT TRUE,
  `dark_mode_enabled` BOOLEAN DEFAULT FALSE,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_preferences_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Regions
CREATE TABLE IF NOT EXISTS `regions` (
  `region_id` INT AUTO_INCREMENT PRIMARY KEY,
  `region_name` VARCHAR(100) NOT NULL,
  `country` VARCHAR(100) NOT NULL,
  `timezone` VARCHAR(50) DEFAULT NULL,
  `climate_type` VARCHAR(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Environmental Factors
CREATE TABLE IF NOT EXISTS `environmental_factors` (
  `factor_id` INT AUTO_INCREMENT PRIMARY KEY,
  `factor_name` VARCHAR(100) NOT NULL,
  `factor_category` VARCHAR(50) DEFAULT NULL,
  `description` VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Region Environments
CREATE TABLE IF NOT EXISTS `region_environments` (
  `region_environment_id` INT AUTO_INCREMENT PRIMARY KEY,
  `region_id` INT NOT NULL,
  `factor_id` INT NOT NULL,
  `factor_value` DECIMAL(10,2) DEFAULT NULL,
  `recorded_date` DATE DEFAULT NULL,
  CONSTRAINT `fk_regenv_region` FOREIGN KEY (`region_id`) REFERENCES `regions` (`region_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_regenv_factor` FOREIGN KEY (`factor_id`) REFERENCES `environmental_factors` (`factor_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Goal Types
CREATE TABLE IF NOT EXISTS `goal_types` (
  `goal_type_id` INT AUTO_INCREMENT PRIMARY KEY,
  `type_name` VARCHAR(100) NOT NULL,
  `category` VARCHAR(50) DEFAULT NULL,
  `description` VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. User Goals
CREATE TABLE IF NOT EXISTS `user_goals` (
  `goal_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `goal_type_id` INT NOT NULL,
  `target_value` DECIMAL(10,2) DEFAULT NULL,
  `current_value` DECIMAL(10,2) DEFAULT NULL,
  `start_date` DATE NOT NULL,
  `target_date` DATE DEFAULT NULL,
  `status` VARCHAR(20) DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_usergoals_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_usergoals_goaltype` FOREIGN KEY (`goal_type_id`) REFERENCES `goal_types` (`goal_type_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Goal Progress Logs
CREATE TABLE IF NOT EXISTS `goal_progress_logs` (
  `progress_log_id` INT AUTO_INCREMENT PRIMARY KEY,
  `goal_id` INT NOT NULL,
  `log_date` DATE NOT NULL,
  `progress_value` DECIMAL(10,2) DEFAULT NULL,
  `notes` VARCHAR(255) DEFAULT NULL,
  CONSTRAINT `fk_progresslog_goal` FOREIGN KEY (`goal_id`) REFERENCES `user_goals` (`goal_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Food Categories
CREATE TABLE IF NOT EXISTS `food_categories` (
  `category_id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Foods
CREATE TABLE IF NOT EXISTS `foods` (
  `food_id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL,
  `food_name` VARCHAR(150) NOT NULL,
  `calories_per_100g` DECIMAL(6,2) DEFAULT NULL,
  `protein_g` DECIMAL(6,2) DEFAULT NULL,
  `carbs_g` DECIMAL(6,2) DEFAULT NULL,
  `fat_g` DECIMAL(6,2) DEFAULT NULL,
  `fiber_g` DECIMAL(6,2) DEFAULT NULL,
  `glycemic_index` INT DEFAULT NULL,
  CONSTRAINT `fk_foods_category` FOREIGN KEY (`category_id`) REFERENCES `food_categories` (`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. Goal Nutrition Profiles
CREATE TABLE IF NOT EXISTS `goal_nutrition_profiles` (
  `nutrition_profile_id` INT AUTO_INCREMENT PRIMARY KEY,
  `goal_type_id` INT NOT NULL,
  `daily_calorie_target` DECIMAL(7,2) DEFAULT NULL,
  `protein_pct` DECIMAL(4,1) DEFAULT NULL,
  `carbs_pct` DECIMAL(4,1) DEFAULT NULL,
  `fat_pct` DECIMAL(4,1) DEFAULT NULL,
  CONSTRAINT `fk_nutritionprofile_goaltype` FOREIGN KEY (`goal_type_id`) REFERENCES `goal_types` (`goal_type_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. Region Food Availability
CREATE TABLE IF NOT EXISTS `region_food_availability` (
  `availability_id` INT AUTO_INCREMENT PRIMARY KEY,
  `region_id` INT NOT NULL,
  `food_id` INT NOT NULL,
  `availability_score` DECIMAL(3,1) DEFAULT NULL,
  `avg_price` DECIMAL(8,2) DEFAULT NULL,
  `season` VARCHAR(30) DEFAULT NULL,
  CONSTRAINT `fk_foodavail_region` FOREIGN KEY (`region_id`) REFERENCES `regions` (`region_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_foodavail_food` FOREIGN KEY (`food_id`) REFERENCES `foods` (`food_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 15. User Meal Logs
CREATE TABLE IF NOT EXISTS `user_meal_logs` (
  `meal_log_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `food_id` INT NOT NULL,
  `meal_type` VARCHAR(30) DEFAULT NULL,
  `quantity_g` DECIMAL(6,2) DEFAULT NULL,
  `logged_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_meallog_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_meallog_food` FOREIGN KEY (`food_id`) REFERENCES `foods` (`food_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 16. Body Regions
CREATE TABLE IF NOT EXISTS `body_regions` (
  `body_region_id` INT AUTO_INCREMENT PRIMARY KEY,
  `body_region_name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 17. Muscle Groups
CREATE TABLE IF NOT EXISTS `muscle_groups` (
  `muscle_group_id` INT AUTO_INCREMENT PRIMARY KEY,
  `body_region_id` INT NOT NULL,
  `muscle_group_name` VARCHAR(100) NOT NULL,
  CONSTRAINT `fk_musclegroup_bodyregion` FOREIGN KEY (`body_region_id`) REFERENCES `body_regions` (`body_region_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 18. Exercises
CREATE TABLE IF NOT EXISTS `exercises` (
  `exercise_id` INT AUTO_INCREMENT PRIMARY KEY,
  `muscle_group_id` INT NOT NULL,
  `exercise_name` VARCHAR(150) NOT NULL,
  `equipment_needed` VARCHAR(150) DEFAULT NULL,
  `difficulty_level` VARCHAR(20) DEFAULT NULL,
  `calories_burned_per_min` DECIMAL(5,2) DEFAULT NULL,
  CONSTRAINT `fk_exercise_musclegroup` FOREIGN KEY (`muscle_group_id`) REFERENCES `muscle_groups` (`muscle_group_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 19. Goal Workout Plans
CREATE TABLE IF NOT EXISTS `goal_workout_plans` (
  `workout_plan_id` INT AUTO_INCREMENT PRIMARY KEY,
  `goal_type_id` INT NOT NULL,
  `exercise_id` INT NOT NULL,
  `sets` INT DEFAULT NULL,
  `reps` INT DEFAULT NULL,
  `frequency_per_week` INT DEFAULT NULL,
  CONSTRAINT `fk_workoutplan_goaltype` FOREIGN KEY (`goal_type_id`) REFERENCES `goal_types` (`goal_type_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_workoutplan_exercise` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`exercise_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 20. Exercise Logs
CREATE TABLE IF NOT EXISTS `exercise_logs` (
  `exercise_log_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `exercise_id` INT NOT NULL,
  `sets_completed` INT DEFAULT NULL,
  `reps_completed` INT DEFAULT NULL,
  `weight_used_kg` DECIMAL(6,2) DEFAULT NULL,
  `duration_minutes` INT DEFAULT NULL,
  `calories_burned` DECIMAL(6,2) DEFAULT NULL,
  `logged_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_exerciselog_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_exerciselog_exercise` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`exercise_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 21. Sleep Logs
CREATE TABLE IF NOT EXISTS `sleep_logs` (
  `sleep_log_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `sleep_start` DATETIME NOT NULL,
  `sleep_end` DATETIME NOT NULL,
  `duration_minutes` INT DEFAULT NULL,
  `sleep_quality_score` DECIMAL(4,1) DEFAULT NULL,
  `logged_date` DATE DEFAULT NULL,
  CONSTRAINT `fk_sleeplog_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 22. Sleep Factors
CREATE TABLE IF NOT EXISTS `sleep_factors` (
  `sleep_factor_id` INT AUTO_INCREMENT PRIMARY KEY,
  `sleep_log_id` INT NOT NULL,
  `factor_name` VARCHAR(100) NOT NULL,
  `factor_value` VARCHAR(100) DEFAULT NULL,
  CONSTRAINT `fk_sleepfactor_sleeplog` FOREIGN KEY (`sleep_log_id`) REFERENCES `sleep_logs` (`sleep_log_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
