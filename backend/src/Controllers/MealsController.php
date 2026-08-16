<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Helpers/ResponseHandler.php';
require_once __DIR__ . '/../Helpers/DevStore.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';

class MealsController {
    public static function getMeals() {
        $user = AuthMiddleware::validateToken();
        $userId = $user['user_id'] ?? 1;

        $pdo = Database::getInstance()->getConnection();
        if ($pdo) {
            try {
                $stmt = $pdo->prepare("
                    SELECT m.meal_log_id, m.user_id, m.meal_type, m.quantity_g, m.logged_at,
                           f.food_id, f.food_name, f.calories_per_100g, f.protein_g, f.carbs_g, f.fat_g, f.fiber_g, f.glycemic_index
                    FROM user_meal_logs m
                    JOIN foods f ON m.food_id = f.food_id
                    WHERE m.user_id = ?
                    ORDER BY m.logged_at DESC
                ");
                $stmt->execute([$userId]);
                $logs = $stmt->fetchAll();

                if (!empty($logs)) {
                    foreach ($logs as &$log) {
                        $multiplier = floatval($log['quantity_g']) / 100.0;
                        $log['calories'] = round(floatval($log['calories_per_100g']) * $multiplier, 2);
                        $log['protein'] = round(floatval($log['protein_g']) * $multiplier, 2);
                        $log['carbs'] = round(floatval($log['carbs_g']) * $multiplier, 2);
                        $log['fat'] = round(floatval($log['fat_g']) * $multiplier, 2);
                        $log['fiber'] = round(floatval($log['fiber_g']) * $multiplier, 2);
                    }
                    ResponseHandler::send($logs);
                }
            } catch (PDOException $e) {
                error_log("[Database Notice]: Failed executing SQL query \"{$e->getMessage()}\"");
            }
        }

        $storeMeals = DevStore::get('meals');
        ResponseHandler::send($storeMeals);
    }

    public static function logMeal() {
        $user = AuthMiddleware::validateToken();
        $userId = $user['user_id'] ?? 1;

        $input = json_decode(file_get_contents('php://input'), true);

        $foodId = intval($input['food_id'] ?? 0);
        $mealType = trim($input['meal_type'] ?? 'Lunch');
        $quantity = floatval($input['quantity_g'] ?? 100.0);

        if (!$foodId || $quantity <= 0) {
            ResponseHandler::error("Valid food ID and positive quantity are required.", 400);
        }

        $pdo = Database::getInstance()->getConnection();
        if ($pdo) {
            try {
                $stmt = $pdo->prepare("
                    INSERT INTO user_meal_logs (user_id, food_id, meal_type, quantity_g, logged_at)
                    VALUES (?, ?, ?, ?, NOW())
                ");
                $stmt->execute([$userId, $foodId, $mealType, $quantity]);
                ResponseHandler::send(['meal_log_id' => $pdo->lastInsertId()], 201, "Meal logged successfully!");
            } catch (PDOException $e) {}
        }

        // Mock foods dictionary for DevStore fallback
        $foodsDict = [
            1 => ['name' => 'Grilled Chicken Breast', 'cal' => 165, 'p' => 31, 'c' => 0, 'f' => 3.6, 'fib' => 0, 'gi' => 0],
            2 => ['name' => 'Atlantic Salmon Fillet', 'cal' => 208, 'p' => 20, 'c' => 0, 'f' => 13, 'fib' => 0, 'gi' => 0],
            3 => ['name' => 'Large Whole Egg', 'cal' => 143, 'p' => 12.6, 'c' => 0.7, 'f' => 9.5, 'fib' => 0, 'gi' => 0],
            4 => ['name' => 'Brown Basmati Rice', 'cal' => 123, 'p' => 2.7, 'c' => 25.6, 'f' => 0.9, 'fib' => 1.8, 'gi' => 50],
            5 => ['name' => 'Rolled Oats', 'cal' => 389, 'p' => 16.9, 'c' => 66.3, 'f' => 6.9, 'fib' => 10.6, 'gi' => 55],
            7 => ['name' => 'Fresh Spinach', 'cal' => 23, 'p' => 2.9, 'c' => 3.6, 'f' => 0.4, 'fib' => 2.2, 'gi' => 15],
            8 => ['name' => 'Steamed Broccoli', 'cal' => 35, 'p' => 2.4, 'c' => 7.2, 'f' => 0.4, 'fib' => 3.3, 'gi' => 15],
            10 => ['name' => 'Organic Blueberries', 'cal' => 57, 'p' => 0.7, 'c' => 14.5, 'f' => 0.3, 'fib' => 2.4, 'gi' => 53],
            13 => ['name' => 'Greek Yogurt (Plain 0%)', 'cal' => 59, 'p' => 10.2, 'c' => 3.6, 'f' => 0.4, 'fib' => 0, 'gi' => 11],
        ];

        $foodInfo = $foodsDict[$foodId] ?? ['name' => 'Custom Food', 'cal' => 150, 'p' => 10, 'c' => 20, 'f' => 5, 'fib' => 2, 'gi' => 30];
        $multiplier = $quantity / 100.0;

        $newMeal = [
            'meal_log_id' => time(),
            'user_id' => $userId,
            'food_id' => $foodId,
            'food_name' => $foodInfo['name'],
            'meal_type' => $mealType,
            'quantity_g' => $quantity,
            'calories' => round($foodInfo['cal'] * $multiplier, 2),
            'protein' => round($foodInfo['p'] * $multiplier, 2),
            'carbs' => round($foodInfo['c'] * $multiplier, 2),
            'fat' => round($foodInfo['f'] * $multiplier, 2),
            'fiber' => round($foodInfo['fib'] * $multiplier, 2),
            'glycemic_index' => $foodInfo['gi'],
            'logged_at' => date('Y-m-d H:i:s')
        ];

        DevStore::add('meals', $newMeal);
        ResponseHandler::send(['meal_log_id' => $newMeal['meal_log_id']], 201, "Meal logged successfully!");
    }

    public static function deleteMeal(int $id) {
        $user = AuthMiddleware::validateToken();
        $userId = $user['user_id'] ?? 1;

        $pdo = Database::getInstance()->getConnection();
        if ($pdo) {
            try {
                $stmt = $pdo->prepare("DELETE FROM user_meal_logs WHERE meal_log_id = ? AND user_id = ?");
                $stmt->execute([$id, $userId]);
                ResponseHandler::send(null, 200, "Meal log deleted.");
            } catch (PDOException $e) {}
        }

        DevStore::delete('meals', 'meal_log_id', $id);
        ResponseHandler::send(null, 200, "Meal deleted.");
    }
}
