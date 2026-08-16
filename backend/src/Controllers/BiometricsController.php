<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Helpers/ResponseHandler.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';

class BiometricsController {
    public static function getBiometrics() {
        $user = AuthMiddleware::validateToken();
        $userId = $user['user_id'] ?? 1;

        $pdo = Database::getInstance()->getConnection();
        if ($pdo) {
            try {
                $stmt = $pdo->prepare("
                    SELECT b.*, i.level_name as insulin_sensitivity_name, i.sensitivity_factor
                    FROM user_biometrics_log b
                    LEFT JOIN insulin_sensitivity_levels i ON b.insulin_sensitivity_level_id = i.insulin_sensitivity_level_id
                    WHERE b.user_id = ?
                    ORDER BY b.recorded_at DESC
                ");
                $stmt->execute([$userId]);
                $logs = $stmt->fetchAll();
                ResponseHandler::send($logs);
            } catch (PDOException $e) {
                ResponseHandler::error($e->getMessage(), 500);
            }
        }

        // Mock Fallback
        ResponseHandler::send([
            [
                'biometrics_log_id' => 1,
                'user_id' => $userId,
                'insulin_sensitivity_level_id' => 2,
                'insulin_sensitivity_name' => 'Normal Sensitivity',
                'sensitivity_factor' => 1.00,
                'weight_kg' => 75.80,
                'body_fat_pct' => 16.20,
                'blood_glucose_mg_dl' => 92.00,
                'blood_pressure_systolic' => 118,
                'blood_pressure_diastolic' => 78,
                'resting_heart_rate' => 62,
                'recorded_at' => date('Y-m-d H:i:s')
            ],
            [
                'biometrics_log_id' => 2,
                'user_id' => $userId,
                'insulin_sensitivity_level_id' => 2,
                'insulin_sensitivity_name' => 'Normal Sensitivity',
                'sensitivity_factor' => 1.00,
                'weight_kg' => 76.50,
                'body_fat_pct' => 16.50,
                'blood_glucose_mg_dl' => 95.00,
                'blood_pressure_systolic' => 120,
                'blood_pressure_diastolic' => 80,
                'resting_heart_rate' => 64,
                'recorded_at' => date('Y-m-d H:i:s', strtotime('-7 days'))
            ]
        ]);
    }

    public static function addBiometric() {
        $user = AuthMiddleware::validateToken();
        $userId = $user['user_id'] ?? 1;

        $input = json_decode(file_get_contents('php://input'), true);

        $insulinId = !empty($input['insulin_sensitivity_level_id']) ? intval($input['insulin_sensitivity_level_id']) : null;
        $weight = floatval($input['weight_kg'] ?? 70.0);
        $bodyFat = !empty($input['body_fat_pct']) ? floatval($input['body_fat_pct']) : null;
        $glucose = !empty($input['blood_glucose_mg_dl']) ? floatval($input['blood_glucose_mg_dl']) : null;
        $bpSys = !empty($input['blood_pressure_systolic']) ? intval($input['blood_pressure_systolic']) : null;
        $bpDia = !empty($input['blood_pressure_diastolic']) ? intval($input['blood_pressure_diastolic']) : null;
        $hr = !empty($input['resting_heart_rate']) ? intval($input['resting_heart_rate']) : null;

        $pdo = Database::getInstance()->getConnection();
        if ($pdo) {
            try {
                $stmt = $pdo->prepare("
                    INSERT INTO user_biometrics_log 
                    (user_id, insulin_sensitivity_level_id, weight_kg, body_fat_pct, blood_glucose_mg_dl, blood_pressure_systolic, blood_pressure_diastolic, resting_heart_rate, recorded_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
                ");
                $stmt->execute([$userId, $insulinId, $weight, $bodyFat, $glucose, $bpSys, $bpDia, $hr]);
                $logId = $pdo->lastInsertId();

                ResponseHandler::send(['biometrics_log_id' => $logId], 201, "Biometrics record saved successfully!");
            } catch (PDOException $e) {
                ResponseHandler::error($e->getMessage(), 500);
            }
        }

        ResponseHandler::send(['biometrics_log_id' => rand(10, 99)], 201, "Biometrics log added (Dev Mode)");
    }

    public static function getSensitivityLevels() {
        $pdo = Database::getInstance()->getConnection();
        if ($pdo) {
            try {
                $stmt = $pdo->query("SELECT * FROM insulin_sensitivity_levels ORDER BY insulin_sensitivity_level_id ASC");
                ResponseHandler::send($stmt->fetchAll());
            } catch (PDOException $e) {}
        }

        ResponseHandler::send([
            ['insulin_sensitivity_level_id' => 1, 'level_name' => 'High Sensitivity', 'sensitivity_factor' => 1.20, 'description' => 'Normal or high insulin response.'],
            ['insulin_sensitivity_level_id' => 2, 'level_name' => 'Normal Sensitivity', 'sensitivity_factor' => 1.00, 'description' => 'Balanced carb tolerance.'],
            ['insulin_sensitivity_level_id' => 3, 'level_name' => 'Mild Resistance', 'sensitivity_factor' => 0.85, 'description' => 'Slightly reduced sensitivity.'],
            ['insulin_sensitivity_level_id' => 4, 'level_name' => 'High Resistance', 'sensitivity_factor' => 0.70, 'description' => 'Requires strict glycemic management.']
        ]);
    }
}
