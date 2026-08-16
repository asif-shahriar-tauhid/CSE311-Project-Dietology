<?php
/**
 * Standardized JSON API Response Handler
 */

class ResponseHandler {
    public static function send($data = null, int $statusCode = 200, string $message = 'Success', bool $success = true) {
        header("Content-Type: application/json; charset=UTF-8");
        http_response_code($statusCode);
        
        $response = [
            'success' => $success,
            'status' => $statusCode,
            'message' => $message,
            'data' => $data
        ];

        echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        exit();
    }

    public static function error(string $message = 'An error occurred', int $statusCode = 400, $data = null) {
        self::send($data, $statusCode, $message, false);
    }
}
