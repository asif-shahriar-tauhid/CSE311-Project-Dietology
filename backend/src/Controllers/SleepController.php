<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Helpers/ResponseHandler.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';

class SleepController {
    public static function getLogs() {
        $user = AuthMiddleware::validateToken();
        $userId = $user['user_id'] ?? 1;

        $pdo = Database::getInstance()->getConnection();
        if ($pdo) {
            try {
                $stmt = $pdo->prepare("SELECT * FROM sleep_logs WHERE user_id = ? ORDER BY sleep_start DESC");
                $stmt->execute([$userId]);
                $logs = $stmt->fetchAll();

                foreach ($logs as &$log) {
                    $factorStmt = $pdo->prepare("SELECT * FROM sleep_factors WHERE sleep_log_id = ?");
                    $factorStmt->execute([$log['sleep_log_id']]);
                    $log['factors'] = $factorStmt->fetchAll();
                }

                ResponseHandler::send($logs);
            } catch (PDOException $e) {
                ResponseHandler::error($e->getMessage(), 500);
            }
        }

        ResponseHandler::send([
            [
                'sleep_log_id' => 1,
                'user_id' => $userId,
                'sleep_start' => date('Y-m-d 23:00:00', strtotime('-1 day')),
                'sleep_end' => date('Y-m-d 07:00:00'),
                'duration_minutes' => 480,
                'sleep_quality_score' => 8.5,
                'logged_date' => date('Y-m-d'),
                'factors' => [
                    ['sleep_factor_id' => 1, 'factor_name' => 'Caffeine Consumption', 'factor_value' => 'None after 4 PM'],
                    ['sleep_factor_id' => 2, 'factor_name' => 'Room Temperature', 'factor_value' => '22 C']
                ]
            ]
        ]);
    }

    public static function logSleep() {
        $user = AuthMiddleware::validateToken();
        $userId = $user['user_id'] ?? 1;

        $input = json_decode(file_get_contents('php://input'), true);

        $sleepStart = $input['sleep_start'] ?? date('Y-m-d H:i:s', strtotime('-8 hours'));
        $sleepEnd = $input['sleep_end'] ?? date('Y-m-d H:i:s');
        $quality = floatval($input['sleep_quality_score'] ?? 7.5);
        $loggedDate = $input['logged_date'] ?? date('Y-m-d');
        $factors = $input['factors'] ?? [];

        $durationMinutes = intval((strtotime($sleepEnd) - strtotime($sleepStart)) / 60);

        $pdo = Database::getInstance()->getConnection();
        if ($pdo) {
            try {
                $stmt = $pdo->prepare("
                    INSERT INTO sleep_logs (user_id, sleep_start, sleep_end, duration_minutes, sleep_quality_score, logged_date)
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([$userId, $sleepStart, $sleepEnd, $durationMinutes, $quality, $loggedDate]);
                $sleepLogId = $pdo->lastInsertId();

                if (!empty($factors) && is_array($factors)) {
                    $fStmt = $pdo->prepare("INSERT INTO sleep_factors (sleep_log_id, factor_name, factor_value) VALUES (?, ?, ?)");
                    foreach ($factors as $factor) {
                        if (!empty($factor['name'])) {
                            $fStmt->execute([$sleepLogId, $factor['name'], $factor['value'] ?? '']);
                        }
                    }
                }

                ResponseHandler::send(['sleep_log_id' => $sleepLogId, 'duration_minutes' => $durationMinutes], 201, "Sleep log saved!");
            } catch (PDOException $e) {
                ResponseHandler::error($e->getMessage(), 500);
            }
        }

        ResponseHandler::send(['sleep_log_id' => rand(10, 99), 'duration_minutes' => 480], 201, "Sleep log recorded (Dev Mode)");
    }
}
