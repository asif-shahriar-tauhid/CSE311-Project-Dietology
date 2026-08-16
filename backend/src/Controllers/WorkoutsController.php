<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Helpers/ResponseHandler.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';

class WorkoutsController {
    public static function getLogs() {
        $user = AuthMiddleware::validateToken();
        $userId = $user['user_id'] ?? 1;

        $pdo = Database::getInstance()->getConnection();
        if ($pdo) {
            try {
                $stmt = $pdo->prepare("
                    SELECT el.*, e.exercise_name, e.equipment_needed, e.difficulty_level, e.calories_burned_per_min,
                           mg.muscle_group_name, br.body_region_name
                    FROM exercise_logs el
                    JOIN exercises e ON el.exercise_id = e.exercise_id
                    JOIN muscle_groups mg ON e.muscle_group_id = mg.muscle_group_id
                    JOIN body_regions br ON mg.body_region_id = br.body_region_id
                    WHERE el.user_id = ?
                    ORDER BY el.logged_at DESC
                ");
                $stmt->execute([$userId]);
                ResponseHandler::send($stmt->fetchAll());
            } catch (PDOException $e) {
                ResponseHandler::error($e->getMessage(), 500);
            }
        }

        ResponseHandler::send([
            [
                'exercise_log_id' => 1,
                'user_id' => $userId,
                'exercise_id' => 5,
                'exercise_name' => 'Barbell Squat',
                'muscle_group_name' => 'Quadriceps & Glutes',
                'body_region_name' => 'Lower Body',
                'sets_completed' => 4,
                'reps_completed' => 10,
                'weight_used_kg' => 80.00,
                'duration_minutes' => 30,
                'calories_burned' => 330.00,
                'logged_at' => date('Y-m-d H:i:s', strtotime('-1 day'))
            ],
            [
                'exercise_log_id' => 2,
                'user_id' => $userId,
                'exercise_id' => 1,
                'exercise_name' => 'Barbell Bench Press',
                'muscle_group_name' => 'Pectorals (Chest)',
                'body_region_name' => 'Upper Body',
                'sets_completed' => 4,
                'reps_completed' => 8,
                'weight_used_kg' => 70.00,
                'duration_minutes' => 25,
                'calories_burned' => 212.50,
                'logged_at' => date('Y-m-d H:i:s', strtotime('-1 day'))
            ]
        ]);
    }

    public static function logExercise() {
        $user = AuthMiddleware::validateToken();
        $userId = $user['user_id'] ?? 1;

        $input = json_decode(file_get_contents('php://input'), true);

        $exerciseId = intval($input['exercise_id'] ?? 0);
        $sets = intval($input['sets_completed'] ?? 1);
        $reps = intval($input['reps_completed'] ?? 10);
        $weight = floatval($input['weight_used_kg'] ?? 0);
        $duration = intval($input['duration_minutes'] ?? 20);

        if (!$exerciseId) {
            ResponseHandler::error("Exercise ID is required.", 400);
        }

        $pdo = Database::getInstance()->getConnection();
        if ($pdo) {
            try {
                // Calculate calories burned rate
                $exStmt = $pdo->prepare("SELECT calories_burned_per_min FROM exercises WHERE exercise_id = ?");
                $exStmt->execute([$exerciseId]);
                $ex = $exStmt->fetch();
                $rate = $ex ? floatval($ex['calories_burned_per_min']) : 7.0;

                $caloriesBurned = round($rate * $duration, 2);

                $stmt = $pdo->prepare("
                    INSERT INTO exercise_logs (user_id, exercise_id, sets_completed, reps_completed, weight_used_kg, duration_minutes, calories_burned, logged_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
                ");
                $stmt->execute([$userId, $exerciseId, $sets, $reps, $weight, $duration, $caloriesBurned]);
                ResponseHandler::send(['exercise_log_id' => $pdo->lastInsertId(), 'calories_burned' => $caloriesBurned], 201, "Workout log recorded!");
            } catch (PDOException $e) {
                ResponseHandler::error($e->getMessage(), 500);
            }
        }

        ResponseHandler::send(['exercise_log_id' => rand(10, 99), 'calories_burned' => 180.00], 201, "Workout log recorded (Dev Mode)");
    }

    public static function getExercises() {
        $pdo = Database::getInstance()->getConnection();
        if ($pdo) {
            try {
                $stmt = $pdo->query("
                    SELECT e.*, mg.muscle_group_name, br.body_region_name
                    FROM exercises e
                    JOIN muscle_groups mg ON e.muscle_group_id = mg.muscle_group_id
                    JOIN body_regions br ON mg.body_region_id = br.body_region_id
                    ORDER BY e.exercise_name ASC
                ");
                ResponseHandler::send($stmt->fetchAll());
            } catch (PDOException $e) {}
        }

        ResponseHandler::send([
            ['exercise_id' => 1, 'exercise_name' => 'Barbell Bench Press', 'muscle_group_name' => 'Pectorals (Chest)', 'body_region_name' => 'Upper Body', 'equipment_needed' => 'Barbell, Bench', 'difficulty_level' => 'Intermediate', 'calories_burned_per_min' => 8.50],
            ['exercise_id' => 2, 'exercise_name' => 'Push-Ups', 'muscle_group_name' => 'Pectorals (Chest)', 'body_region_name' => 'Upper Body', 'equipment_needed' => 'Bodyweight', 'difficulty_level' => 'Beginner', 'calories_burned_per_min' => 6.00],
            ['exercise_id' => 3, 'exercise_name' => 'Pull-Ups', 'muscle_group_name' => 'Latissimus Dorsi', 'body_region_name' => 'Upper Body', 'equipment_needed' => 'Pull-up Bar', 'difficulty_level' => 'Intermediate', 'calories_burned_per_min' => 7.50],
            ['exercise_id' => 5, 'exercise_name' => 'Barbell Squat', 'muscle_group_name' => 'Quadriceps & Glutes', 'body_region_name' => 'Lower Body', 'equipment_needed' => 'Barbell, Rack', 'difficulty_level' => 'Advanced', 'calories_burned_per_min' => 11.00],
            ['exercise_id' => 8, 'exercise_name' => 'Plank Hold', 'muscle_group_name' => 'Abdominals & Core', 'body_region_name' => 'Core & Abdominals', 'equipment_needed' => 'Bodyweight', 'difficulty_level' => 'Beginner', 'calories_burned_per_min' => 4.00]
        ]);
    }
}
