<?php
/**
 * Database Singleton Connection for Dietology PHP API
 */

class Database {
    private static $instance = null;
    private $conn;

    private $host = '127.0.0.1';
    private $db_name = 'dietology_db';
    private $username = 'root';
    private $password = '';
    private $port = 3306;

    private function __construct() {
        // Read environment variables if available
        $this->host = getenv('DB_HOST') ?: $this->host;
        $this->db_name = getenv('DB_NAME') ?: $this->db_name;
        $this->username = getenv('DB_USER') ?: $this->username;
        $this->password = getenv('DB_PASS') !== false ? getenv('DB_PASS') : $this->password;
        $this->port = getenv('DB_PORT') ?: $this->port;

        try {
            $dsn = "mysql:host={$this->host};port={$this->port};charset=utf8mb4";
            $this->conn = new PDO($dsn, $this->username, $this->password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);

            // Ensure Database exists and switch to it
            $this->conn->exec("CREATE DATABASE IF NOT EXISTS `{$this->db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
            $this->conn->exec("USE `{$this->db_name}`;");

        } catch (PDOException $e) {
            // Log error silently for API responses
            error_log("Database connection failed: " . $e->getMessage());
            $this->conn = null;
        }
    }

    public static function getInstance() {
        if (self::$instance == null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->conn;
    }
}
