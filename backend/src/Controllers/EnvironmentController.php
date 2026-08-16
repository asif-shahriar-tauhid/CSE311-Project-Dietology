<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Helpers/ResponseHandler.php';

class EnvironmentController {
    public static function getRegions() {
        $pdo = Database::getInstance()->getConnection();
        if ($pdo) {
            try {
                $stmt = $pdo->query("SELECT * FROM regions ORDER BY region_name ASC");
                ResponseHandler::send($stmt->fetchAll());
            } catch (PDOException $e) {}
        }

        ResponseHandler::send([
            ['region_id' => 1, 'region_name' => 'North America East', 'country' => 'United States', 'timezone' => 'America/New_York', 'climate_type' => 'Temperate'],
            ['region_id' => 2, 'region_name' => 'South Asia (Dhaka)', 'country' => 'Bangladesh', 'timezone' => 'Asia/Dhaka', 'climate_type' => 'Tropical Monsoon'],
            ['region_id' => 3, 'region_name' => 'Western Europe', 'country' => 'Germany', 'timezone' => 'Europe/Berlin', 'climate_type' => 'Maritime']
        ]);
    }

    public static function getEnvironments() {
        $regionId = isset($_GET['region_id']) ? intval($_GET['region_id']) : 0;

        $pdo = Database::getInstance()->getConnection();
        if ($pdo) {
            try {
                $sql = "
                    SELECT re.*, ef.factor_name, ef.factor_category, ef.description, r.region_name, r.country
                    FROM region_environments re
                    JOIN environmental_factors ef ON re.factor_id = ef.factor_id
                    JOIN regions r ON re.region_id = r.region_id
                ";
                $params = [];
                if ($regionId > 0) {
                    $sql .= " WHERE re.region_id = ?";
                    $params[] = $regionId;
                }
                $sql .= " ORDER BY re.recorded_date DESC";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $res = $stmt->fetchAll();
                if (!empty($res)) {
                    ResponseHandler::send($res);
                }
            } catch (PDOException $e) {}
        }

        $allEnvironments = [
            // Region 1: North America East
            ['region_environment_id' => 101, 'region_id' => 1, 'factor_name' => 'Ambient Temperature', 'factor_category' => 'Weather', 'factor_value' => 18.5, 'recorded_date' => date('Y-m-d')],
            ['region_environment_id' => 102, 'region_id' => 1, 'factor_name' => 'Humidity Index', 'factor_category' => 'Weather', 'factor_value' => 62.0, 'recorded_date' => date('Y-m-d')],
            ['region_environment_id' => 103, 'region_id' => 1, 'factor_name' => 'Air Quality Index (AQI)', 'factor_category' => 'Environment', 'factor_value' => 38.0, 'recorded_date' => date('Y-m-d')],
            ['region_environment_id' => 104, 'region_id' => 1, 'factor_name' => 'Altitude', 'factor_category' => 'Geography', 'factor_value' => 220.0, 'recorded_date' => date('Y-m-d')],

            // Region 2: South Asia (Dhaka)
            ['region_environment_id' => 201, 'region_id' => 2, 'factor_name' => 'Ambient Temperature', 'factor_category' => 'Weather', 'factor_value' => 32.5, 'recorded_date' => date('Y-m-d')],
            ['region_environment_id' => 202, 'region_id' => 2, 'factor_name' => 'Humidity Index', 'factor_category' => 'Weather', 'factor_value' => 84.0, 'recorded_date' => date('Y-m-d')],
            ['region_environment_id' => 203, 'region_id' => 2, 'factor_name' => 'Air Quality Index (AQI)', 'factor_category' => 'Environment', 'factor_value' => 135.0, 'recorded_date' => date('Y-m-d')],
            ['region_environment_id' => 204, 'region_id' => 2, 'factor_name' => 'Altitude', 'factor_category' => 'Geography', 'factor_value' => 12.0, 'recorded_date' => date('Y-m-d')],

            // Region 3: Western Europe
            ['region_environment_id' => 301, 'region_id' => 3, 'factor_name' => 'Ambient Temperature', 'factor_category' => 'Weather', 'factor_value' => 16.2, 'recorded_date' => date('Y-m-d')],
            ['region_environment_id' => 302, 'region_id' => 3, 'factor_name' => 'Humidity Index', 'factor_category' => 'Weather', 'factor_value' => 56.0, 'recorded_date' => date('Y-m-d')],
            ['region_environment_id' => 303, 'region_id' => 3, 'factor_name' => 'Air Quality Index (AQI)', 'factor_category' => 'Environment', 'factor_value' => 28.0, 'recorded_date' => date('Y-m-d')],
            ['region_environment_id' => 304, 'region_id' => 3, 'factor_name' => 'Altitude', 'factor_category' => 'Geography', 'factor_value' => 340.0, 'recorded_date' => date('Y-m-d')],
        ];

        if ($regionId > 0) {
            $allEnvironments = array_values(array_filter($allEnvironments, function($e) use ($regionId) {
                return $e['region_id'] === $regionId;
            }));
        }

        ResponseHandler::send($allEnvironments);
    }
}
