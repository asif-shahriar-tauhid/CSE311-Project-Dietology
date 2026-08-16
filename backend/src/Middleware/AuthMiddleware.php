<?php
/**
 * JWT Authentication & Validation Middleware
 */

class AuthMiddleware {
    private static $secret_key = 'dietology_secret_jwt_key_2026';

    public static function generateToken(array $payload, int $expiryHours = 72): string {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload['exp'] = time() + ($expiryHours * 3600);
        $payload['iat'] = time();
        $payload_encoded = self::base64UrlEncode(json_encode($payload));
        $header_encoded = self::base64UrlEncode($header);

        $signature = hash_hmac('sha256', "$header_encoded.$payload_encoded", self::$secret_key, true);
        $signature_encoded = self::base64UrlEncode($signature);

        return "$header_encoded.$payload_encoded.$signature_encoded";
    }

    public static function validateToken(): ?array {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';

        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return null;
        }

        $jwt = $matches[1];
        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) !== 3) {
            return null;
        }

        $header = self::base64UrlDecode($tokenParts[0]);
        $payload = self::base64UrlDecode($tokenParts[1]);
        $signature_provided = $tokenParts[2];

        $expected_signature = self::base64UrlEncode(
            hash_hmac('sha256', "{$tokenParts[0]}.{$tokenParts[1]}", self::$secret_key, true)
        );

        if (!hash_equals($expected_signature, $signature_provided)) {
            return null;
        }

        $payloadData = json_decode($payload, true);
        if (isset($payloadData['exp']) && $payloadData['exp'] < time()) {
            return null;
        }

        return $payloadData;
    }

    private static function base64UrlEncode(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
