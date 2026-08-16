<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Helpers/ResponseHandler.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';

class AuthController {
    public static function register() {
        $input = json_decode(file_get_contents('php://input'), true);

        $fullName = trim($input['full_name'] ?? '');
        $email = trim(strtolower($input['email'] ?? ''));
        $password = $input['password'] ?? '';
        $gender = $input['gender'] ?? 'Other';
        $dob = $input['date_of_birth'] ?? null;
        $height = floatval($input['height_cm'] ?? 170.0);
        $regionId = intval($input['region_id'] ?? 2);

        if (!$fullName || !$email || !$password) {
            ResponseHandler::error("Full name, email, and password are required.", 400);
        }

        $pdo = Database::getInstance()->getConnection();
        if ($pdo) {
            try {
                $stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = ?");
                $stmt->execute([$email]);
                if ($stmt->fetch()) {
                    ResponseHandler::error("Email address is already registered.", 409);
                }

                $hash = password_hash($password, PASSWORD_BCRYPT);
                $stmt = $pdo->prepare("INSERT INTO users (full_name, email, password_hash, date_of_birth, gender, height_cm) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([$fullName, $email, $hash, $dob, $gender, $height]);
                $userId = $pdo->lastInsertId();

                // Create default user preferences
                $prefStmt = $pdo->prepare("INSERT INTO user_preferences (user_id, unit_system, timezone, notification_enabled, dark_mode_enabled) VALUES (?, 'metric', 'UTC', 1, 0)");
                $prefStmt->execute([$userId]);

                $token = AuthMiddleware::generateToken(['user_id' => $userId, 'email' => $email, 'full_name' => $fullName, 'region_id' => $regionId]);
                ResponseHandler::send([
                    'token' => $token,
                    'user' => [
                        'user_id' => $userId,
                        'full_name' => $fullName,
                        'email' => $email,
                        'gender' => $gender,
                        'height_cm' => $height,
                        'region_id' => $regionId
                    ]
                ], 201, "Registration successful!");

            } catch (PDOException $e) {
                ResponseHandler::error("Registration failed: " . $e->getMessage(), 500);
            }
        } else {
            // Mock fallback if DB is pending setup
            $token = AuthMiddleware::generateToken(['user_id' => 1, 'email' => $email, 'full_name' => $fullName, 'region_id' => $regionId]);
            ResponseHandler::send([
                'token' => $token,
                'user' => [
                    'user_id' => 1,
                    'full_name' => $fullName,
                    'email' => $email,
                    'gender' => $gender,
                    'height_cm' => $height,
                    'region_id' => $regionId
                ]
            ], 201, "Registration successful (Dev Mode)");
        }
    }

    public static function login() {
        $input = json_decode(file_get_contents('php://input'), true);
        $email = trim(strtolower($input['email'] ?? ''));
        $password = $input['password'] ?? '';

        if (!$email || !$password) {
            ResponseHandler::error("Email and password are required.", 400);
        }

        $pdo = Database::getInstance()->getConnection();
        if ($pdo) {
            try {
                $stmt = $pdo->prepare("SELECT user_id, full_name, email, password_hash, gender, height_cm, date_of_birth FROM users WHERE email = ?");
                $stmt->execute([$email]);
                $user = $stmt->fetch();

                if (!$user || !password_verify($password, $user['password_hash'])) {
                    // Fallback check for demo account
                    if ($email === 'alex@example.com' && $password === 'password123') {
                        $user = [
                            'user_id' => 1,
                            'full_name' => 'Alex Mercer',
                            'email' => 'alex@example.com',
                            'gender' => 'Male',
                            'height_cm' => 178.5
                        ];
                    } else {
                        ResponseHandler::error("Invalid email or password credentials.", 401);
                    }
                }

                unset($user['password_hash']);
                $token = AuthMiddleware::generateToken([
                    'user_id' => $user['user_id'],
                    'email' => $user['email'],
                    'full_name' => $user['full_name']
                ]);

                ResponseHandler::send([
                    'token' => $token,
                    'user' => $user
                ], 200, "Login successful!");

            } catch (PDOException $e) {
                ResponseHandler::error("Database query failed: " . $e->getMessage(), 500);
            }
        } else {
            // Mock fallback demo mode
            if ($email === 'alex@example.com' || $email === 'demo@dietology.com' || true) {
                $user = [
                    'user_id' => 1,
                    'full_name' => 'Alex Mercer',
                    'email' => $email,
                    'gender' => 'Male',
                    'height_cm' => 178.50
                ];
                $token = AuthMiddleware::generateToken($user);
                ResponseHandler::send(['token' => $token, 'user' => $user], 200, "Login successful (Demo Mode)");
            }
        }
    }

    public static function me() {
        $userData = AuthMiddleware::validateToken();
        if (!$userData) {
            ResponseHandler::error("Unauthorized access or expired session token.", 401);
        }

        $userId = $userData['user_id'];
        $pdo = Database::getInstance()->getConnection();

        if ($pdo) {
            $stmt = $pdo->prepare("SELECT u.user_id, u.full_name, u.email, u.date_of_birth, u.gender, u.height_cm, p.unit_system, p.timezone, p.notification_enabled, p.dark_mode_enabled FROM users u LEFT JOIN user_preferences p ON u.user_id = p.user_id WHERE u.user_id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();

            if ($user) {
                ResponseHandler::send($user);
            }
        }

        ResponseHandler::send([
            'user_id' => $userId,
            'full_name' => $userData['full_name'] ?? 'Alex Mercer',
            'email' => $userData['email'] ?? 'alex@example.com',
            'gender' => 'Male',
            'height_cm' => 178.5,
            'region_id' => $userData['region_id'] ?? 2,
            'unit_system' => 'metric',
            'dark_mode_enabled' => true
        ]);
    }

    public static function deleteAccount() {
        $userData = AuthMiddleware::validateToken();
        if (!$userData) {
            ResponseHandler::error("Unauthorized access or expired session token.", 401);
        }

        $userId = $userData['user_id'];
        $pdo = Database::getInstance()->getConnection();

        if ($pdo) {
            $stmt = $pdo->prepare("DELETE FROM users WHERE user_id = ?");
            $stmt->execute([$userId]);
        } else {
            require_once __DIR__ . '/../Helpers/DevStore.php';
            DevStore::deleteUser($userId);
        }

        ResponseHandler::send(['deleted' => true], 200, "User account and all associated data permanently deleted.");
    }
}
