<?php
/**
 * File-based Persistent Dev Store for Dietology PHP Backend when DB is offline
 */

class DevStore {
    private static $filePath = __DIR__ . '/../../db/dev_store.json';

    private static function init() {
        $dir = dirname(self::$filePath);
        if (!file_exists($dir)) {
            mkdir($dir, 0777, true);
        }

        if (!file_exists(self::$filePath)) {
            $defaultData = [
                'meals' => [
                    [
                        'meal_log_id' => 1,
                        'user_id' => 1,
                        'food_id' => 5,
                        'food_name' => 'Rolled Oats',
                        'meal_type' => 'Breakfast',
                        'quantity_g' => 80.00,
                        'calories' => 311.20,
                        'protein' => 13.52,
                        'carbs' => 53.04,
                        'fat' => 5.52,
                        'fiber' => 8.48,
                        'glycemic_index' => 55,
                        'logged_at' => date('Y-m-d H:i:s', strtotime('-2 hours'))
                    ],
                    [
                        'meal_log_id' => 2,
                        'user_id' => 1,
                        'food_id' => 13,
                        'food_name' => 'Greek Yogurt (Plain 0%)',
                        'meal_type' => 'Breakfast',
                        'quantity_g' => 150.00,
                        'calories' => 88.50,
                        'protein' => 15.30,
                        'carbs' => 5.40,
                        'fat' => 0.60,
                        'fiber' => 0.00,
                        'glycemic_index' => 11,
                        'logged_at' => date('Y-m-d H:i:s', strtotime('-1 hour'))
                    ]
                ],
                'workouts' => [],
                'biometrics' => [],
                'sleep' => []
            ];
            file_put_contents(self::$filePath, json_encode($defaultData, JSON_PRETTY_PRINT));
        }
    }

    public static function get(string $key): array {
        self::init();
        $content = file_get_contents(self::$filePath);
        $data = json_decode($content, true) ?: [];
        return $data[$key] ?? [];
    }

    public static function add(string $key, array $item): array {
        self::init();
        $content = file_get_contents(self::$filePath);
        $data = json_decode($content, true) ?: [];
        if (!isset($data[$key])) {
            $data[$key] = [];
        }
        array_unshift($data[$key], $item);
        file_put_contents(self::$filePath, json_encode($data, JSON_PRETTY_PRINT));
        return $item;
    }

    public static function delete(string $key, string $idField, $id): bool {
        self::init();
        $content = file_get_contents(self::$filePath);
        $data = json_decode($content, true) ?: [];
        if (!isset($data[$key])) return false;

        $data[$key] = array_values(array_filter($data[$key], function($item) use ($idField, $id) {
            return ($item[$idField] ?? null) != $id;
        }));

        file_put_contents(self::$filePath, json_encode($data, JSON_PRETTY_PRINT));
        return true;
    }

    public static function deleteUser($userId): bool {
        self::init();
        $content = file_get_contents(self::$filePath);
        $data = json_decode($content, true) ?: [];
        foreach (['meals', 'workouts', 'biometrics', 'sleep', 'users'] as $key) {
            if (isset($data[$key])) {
                $data[$key] = array_values(array_filter($data[$key], function($item) use ($userId) {
                    return ($item['user_id'] ?? null) != $userId;
                }));
            }
        }
        file_put_contents(self::$filePath, json_encode($data, JSON_PRETTY_PRINT));
        return true;
    }
}
