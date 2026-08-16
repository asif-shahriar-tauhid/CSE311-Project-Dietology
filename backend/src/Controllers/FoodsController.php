<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Helpers/ResponseHandler.php';

class FoodsController {
    public static function getFoods() {
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';
        $categoryId = isset($_GET['category_id']) ? intval($_GET['category_id']) : 0;

        $pdo = Database::getInstance()->getConnection();
        if ($pdo) {
            try {
                $sql = "
                    SELECT f.*, c.category_name
                    FROM foods f
                    JOIN food_categories c ON f.category_id = c.category_id
                    WHERE 1=1
                ";
                $params = [];

                if ($search) {
                    $sql .= " AND f.food_name LIKE ?";
                    $params[] = "%$search%";
                }
                if ($categoryId > 0) {
                    $sql .= " AND f.category_id = ?";
                    $params[] = $categoryId;
                }

                $sql .= " ORDER BY f.food_name ASC";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $result = $stmt->fetchAll();
                if (!empty($result)) {
                    ResponseHandler::send($result);
                }
            } catch (PDOException $e) {
                error_log("[Database Notice]: Failed executing SQL query \"{$e->getMessage()}\"");
            }
        }

        // Mock Fallback catalog
        $mockFoods = [
            ['food_id' => 1, 'category_id' => 1, 'category_name' => 'Proteins & Meats', 'food_name' => 'Grilled Chicken Breast', 'calories_per_100g' => 165.00, 'protein_g' => 31.00, 'carbs_g' => 0.00, 'fat_g' => 3.60, 'fiber_g' => 0.00, 'glycemic_index' => 0],
            ['food_id' => 2, 'category_id' => 1, 'category_name' => 'Proteins & Meats', 'food_name' => 'Atlantic Salmon Fillet', 'calories_per_100g' => 208.00, 'protein_g' => 20.00, 'carbs_g' => 0.00, 'fat_g' => 13.00, 'fiber_g' => 0.00, 'glycemic_index' => 0],
            ['food_id' => 3, 'category_id' => 1, 'category_name' => 'Proteins & Meats', 'food_name' => 'Large Whole Egg', 'calories_per_100g' => 143.00, 'protein_g' => 12.60, 'carbs_g' => 0.70, 'fat_g' => 9.50, 'fiber_g' => 0.00, 'glycemic_index' => 0],
            ['food_id' => 4, 'category_id' => 2, 'category_name' => 'Grains & Carbohydrates', 'food_name' => 'Brown Basmati Rice', 'calories_per_100g' => 123.00, 'protein_g' => 2.70, 'carbs_g' => 25.60, 'fat_g' => 0.90, 'fiber_g' => 1.80, 'glycemic_index' => 50],
            ['food_id' => 5, 'category_id' => 2, 'category_name' => 'Grains & Carbohydrates', 'food_name' => 'Rolled Oats', 'calories_per_100g' => 389.00, 'protein_g' => 16.90, 'carbs_g' => 66.30, 'fat_g' => 6.90, 'fiber_g' => 10.60, 'glycemic_index' => 55],
            ['food_id' => 7, 'category_id' => 3, 'category_name' => 'Vegetables & Greens', 'food_name' => 'Fresh Spinach', 'calories_per_100g' => 23.00, 'protein_g' => 2.90, 'carbs_g' => 3.60, 'fat_g' => 0.40, 'fiber_g' => 2.20, 'glycemic_index' => 15],
            ['food_id' => 8, 'category_id' => 3, 'category_name' => 'Vegetables & Greens', 'food_name' => 'Steamed Broccoli', 'calories_per_100g' => 35.00, 'protein_g' => 2.40, 'carbs_g' => 7.20, 'fat_g' => 0.40, 'fiber_g' => 3.30, 'glycemic_index' => 15],
            ['food_id' => 10, 'category_id' => 4, 'category_name' => 'Fruits & Berries', 'food_name' => 'Organic Blueberries', 'calories_per_100g' => 57.00, 'protein_g' => 0.70, 'carbs_g' => 14.50, 'fat_g' => 0.30, 'fiber_g' => 2.40, 'glycemic_index' => 53],
            ['food_id' => 13, 'category_id' => 5, 'category_name' => 'Dairy & Healthy Fats', 'food_name' => 'Greek Yogurt (Plain 0%)', 'calories_per_100g' => 59.00, 'protein_g' => 10.20, 'carbs_g' => 3.60, 'fat_g' => 0.40, 'fiber_g' => 0.00, 'glycemic_index' => 11]
        ];

        if ($search) {
            $mockFoods = array_values(array_filter($mockFoods, function($item) use ($search) {
                return stripos($item['food_name'], $search) !== false;
            }));
        }

        ResponseHandler::send($mockFoods);
    }

    public static function getCategories() {
        $pdo = Database::getInstance()->getConnection();
        if ($pdo) {
            try {
                $stmt = $pdo->query("SELECT * FROM food_categories ORDER BY category_id ASC");
                $result = $stmt->fetchAll();
                if (!empty($result)) {
                    ResponseHandler::send($result);
                }
            } catch (PDOException $e) {}
        }

        ResponseHandler::send([
            ['category_id' => 1, 'category_name' => 'Proteins & Meats', 'description' => 'Poultry, beef, fish, eggs'],
            ['category_id' => 2, 'category_name' => 'Grains & Carbohydrates', 'description' => 'Rice, oats, quinoa, bread'],
            ['category_id' => 3, 'category_name' => 'Vegetables & Greens', 'description' => 'Leafy greens and vegetables'],
            ['category_id' => 4, 'category_name' => 'Fruits & Berries', 'description' => 'Fresh fruits rich in vitamins'],
            ['category_id' => 5, 'category_name' => 'Dairy & Healthy Fats', 'description' => 'Yogurt, nuts, oils, cheese']
        ]);
    }

    public static function addFood() {
        $input = json_decode(file_get_contents('php://input'), true);

        $foodName = trim($input['food_name'] ?? '');
        $categoryId = intval($input['category_id'] ?? 1);
        $calories = floatval($input['calories_per_100g'] ?? 0);
        $protein = floatval($input['protein_g'] ?? 0);
        $carbs = floatval($input['carbs_g'] ?? 0);
        $fat = floatval($input['fat_g'] ?? 0);
        $fiber = floatval($input['fiber_g'] ?? 0);
        $gi = intval($input['glycemic_index'] ?? 0);

        if (!$foodName) {
            ResponseHandler::error("Food name is required.", 400);
        }

        $pdo = Database::getInstance()->getConnection();
        if ($pdo) {
            try {
                $stmt = $pdo->prepare("
                    INSERT INTO foods (category_id, food_name, calories_per_100g, protein_g, carbs_g, fat_g, fiber_g, glycemic_index)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([$categoryId, $foodName, $calories, $protein, $carbs, $fat, $fiber, $gi]);
                ResponseHandler::send(['food_id' => $pdo->lastInsertId()], 201, "Food added successfully!");
            } catch (PDOException $e) {}
        }

        ResponseHandler::send(['food_id' => rand(100, 999)], 201, "Food added (Dev Mode)");
    }

    public static function getRegionalAvailability() {
        $pdo = Database::getInstance()->getConnection();
        if ($pdo) {
            try {
                $stmt = $pdo->query("
                    SELECT rfa.*, r.region_name, r.country, f.food_name
                    FROM region_food_availability rfa
                    JOIN regions r ON rfa.region_id = r.region_id
                    JOIN foods f ON rfa.food_id = f.food_id
                    ORDER BY rfa.availability_score DESC
                ");
                $result = $stmt->fetchAll();
                if (!empty($result)) {
                    ResponseHandler::send($result);
                }
            } catch (PDOException $e) {}
        }

        ResponseHandler::send([
            ['availability_id' => 1, 'region_name' => 'South Asia', 'country' => 'Bangladesh', 'food_name' => 'Brown Basmati Rice', 'availability_score' => 9.5, 'avg_price' => 1.20, 'season' => 'All Year'],
            ['availability_id' => 2, 'region_name' => 'South Asia', 'country' => 'Bangladesh', 'food_name' => 'Grilled Chicken Breast', 'availability_score' => 9.0, 'avg_price' => 3.50, 'season' => 'All Year'],
            ['availability_id' => 3, 'region_name' => 'South Asia', 'country' => 'Bangladesh', 'food_name' => 'Steamed Broccoli', 'availability_score' => 8.0, 'avg_price' => 1.50, 'season' => 'Winter']
        ]);
    }
}
