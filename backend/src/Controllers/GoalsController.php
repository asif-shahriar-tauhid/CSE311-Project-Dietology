<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Helpers/ResponseHandler.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';

class GoalsController {
    public static function getGoals() {
        $user = AuthMiddleware::validateToken();
        $userId = $user['user_id'] ?? 1;

        $pdo = Database::getInstance()->getConnection();
        if ($pdo) {
            try {
                $stmt = $pdo->prepare("
                    SELECT ug.*, gt.type_name, gt.category, gt.description as goal_description,
                           np.daily_calorie_target, np.protein_pct, np.carbs_pct, np.fat_pct
                    FROM user_goals ug
                    JOIN goal_types gt ON ug.goal_type_id = gt.goal_type_id
                    LEFT JOIN goal_nutrition_profiles np ON gt.goal_type_id = np.goal_type_id
                    WHERE ug.user_id = ?
                    ORDER BY ug.created_at DESC
                ");
                $stmt->execute([$userId]);
                $goals = $stmt->fetchAll();

                // Fetch progress logs for each goal
                foreach ($goals as &$goal) {
                    $logStmt = $pdo->prepare("SELECT * FROM goal_progress_logs WHERE goal_id = ? ORDER BY log_date ASC");
                    $logStmt->execute([$goal['goal_id']]);
                    $goal['progress_logs'] = $logStmt->fetchAll();
                }

                ResponseHandler::send($goals);
            } catch (PDOException $e) {
                ResponseHandler::error($e->getMessage(), 500);
            }
        }

        ResponseHandler::send([
            [
                'goal_id' => 1,
                'user_id' => $userId,
                'goal_type_id' => 1,
                'type_name' => 'Weight Loss & Fat Reduction',
                'category' => 'Weight Management',
                'target_value' => 72.00,
                'current_value' => 75.80,
                'start_date' => '2026-07-01',
                'target_date' => '2026-10-01',
                'status' => 'active',
                'daily_calorie_target' => 2000.00,
                'protein_pct' => 35.0,
                'carbs_pct' => 35.0,
                'fat_pct' => 30.0,
                'progress_logs' => [
                    ['progress_log_id' => 1, 'goal_id' => 1, 'log_date' => '2026-07-01', 'progress_value' => 77.20, 'notes' => 'Starting point'],
                    ['progress_log_id' => 2, 'goal_id' => 1, 'log_date' => '2026-07-15', 'progress_value' => 76.50, 'notes' => 'Steady progress'],
                    ['progress_log_id' => 3, 'goal_id' => 1, 'log_date' => '2026-08-01', 'progress_value' => 75.80, 'notes' => 'On track']
                ]
            ]
        ]);
    }

    public static function addGoal() {
        $user = AuthMiddleware::validateToken();
        $userId = $user['user_id'] ?? 1;

        $input = json_decode(file_get_contents('php://input'), true);

        $goalTypeId = intval($input['goal_type_id'] ?? 1);
        $targetVal = floatval($input['target_value'] ?? 70.0);
        $currentVal = floatval($input['current_value'] ?? 75.0);
        $startDate = $input['start_date'] ?? date('Y-m-d');
        $targetDate = $input['target_date'] ?? date('Y-m-d', strtotime('+90 days'));

        $pdo = Database::getInstance()->getConnection();
        if ($pdo) {
            try {
                $stmt = $pdo->prepare("
                    INSERT INTO user_goals (user_id, goal_type_id, target_value, current_value, start_date, target_date, status)
                    VALUES (?, ?, ?, ?, ?, ?, 'active')
                ");
                $stmt->execute([$userId, $goalTypeId, $targetVal, $currentVal, $startDate, $targetDate]);
                $goalId = $pdo->lastInsertId();

                // Add initial progress log
                $logStmt = $pdo->prepare("INSERT INTO goal_progress_logs (goal_id, log_date, progress_value, notes) VALUES (?, ?, ?, 'Goal initialized')");
                $logStmt->execute([$goalId, $startDate, $currentVal]);

                ResponseHandler::send(['goal_id' => $goalId], 201, "Goal created successfully!");
            } catch (PDOException $e) {
                ResponseHandler::error($e->getMessage(), 500);
            }
        }

        ResponseHandler::send(['goal_id' => rand(10, 99)], 201, "Goal created (Dev Mode)");
    }

    public static function logProgress() {
        $input = json_decode(file_get_contents('php://input'), true);

        $goalId = intval($input['goal_id'] ?? 0);
        $progressValue = floatval($input['progress_value'] ?? 0);
        $notes = trim($input['notes'] ?? '');
        $logDate = $input['log_date'] ?? date('Y-m-d');

        if (!$goalId) {
            ResponseHandler::error("Goal ID is required.", 400);
        }

        $pdo = Database::getInstance()->getConnection();
        if ($pdo) {
            try {
                $stmt = $pdo->prepare("INSERT INTO goal_progress_logs (goal_id, log_date, progress_value, notes) VALUES (?, ?, ?, ?)");
                $stmt->execute([$goalId, $logDate, $progressValue, $notes]);

                // Update current value on target user goal
                $updateStmt = $pdo->prepare("UPDATE user_goals SET current_value = ? WHERE goal_id = ?");
                $updateStmt->execute([$progressValue, $goalId]);

                ResponseHandler::send(['progress_log_id' => $pdo->lastInsertId()], 201, "Progress logged successfully!");
            } catch (PDOException $e) {
                ResponseHandler::error($e->getMessage(), 500);
            }
        }

        ResponseHandler::send(['progress_log_id' => rand(10, 99)], 201, "Progress logged (Dev Mode)");
    }

    public static function getGoalTypes() {
        $pdo = Database::getInstance()->getConnection();
        if ($pdo) {
            try {
                $stmt = $pdo->query("
                    SELECT gt.*, np.daily_calorie_target, np.protein_pct, np.carbs_pct, np.fat_pct
                    FROM goal_types gt
                    LEFT JOIN goal_nutrition_profiles np ON gt.goal_type_id = np.goal_type_id
                ");
                ResponseHandler::send($stmt->fetchAll());
            } catch (PDOException $e) {}
        }

        ResponseHandler::send([
            ['goal_type_id' => 1, 'type_name' => 'Weight Loss & Fat Reduction', 'category' => 'Weight Management', 'daily_calorie_target' => 2000.00, 'protein_pct' => 35, 'carbs_pct' => 35, 'fat_pct' => 30],
            ['goal_type_id' => 2, 'type_name' => 'Muscle Hypertrophy & Bulk', 'category' => 'Fitness & Strength', 'daily_calorie_target' => 2800.00, 'protein_pct' => 30, 'carbs_pct' => 50, 'fat_pct' => 20],
            ['goal_type_id' => 3, 'type_name' => 'Blood Glucose Regulation', 'category' => 'Therapeutic Diet', 'daily_calorie_target' => 1800.00, 'protein_pct' => 30, 'carbs_pct' => 25, 'fat_pct' => 45],
            ['goal_type_id' => 4, 'type_name' => 'Endurance & Stamina', 'category' => 'Athletic Performance', 'daily_calorie_target' => 2500.00, 'protein_pct' => 20, 'carbs_pct' => 60, 'fat_pct' => 20]
        ]);
    }
}
