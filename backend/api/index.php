<?php
/**
 * Main API Switchboard Router for Dietology PHP Backend
 */

require_once __DIR__ . '/../config/cors.php';
handleCors();

require_once __DIR__ . '/../src/Controllers/AuthController.php';
require_once __DIR__ . '/../src/Controllers/BiometricsController.php';
require_once __DIR__ . '/../src/Controllers/GoalsController.php';
require_once __DIR__ . '/../src/Controllers/FoodsController.php';
require_once __DIR__ . '/../src/Controllers/MealsController.php';
require_once __DIR__ . '/../src/Controllers/WorkoutsController.php';
require_once __DIR__ . '/../src/Controllers/SleepController.php';
require_once __DIR__ . '/../src/Controllers/EnvironmentController.php';
require_once __DIR__ . '/../src/Helpers/ResponseHandler.php';

$requestUri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Parse URL path
$path = parse_url($requestUri, PHP_URL_PATH);
$path = preg_replace('/^\/api/', '', $path);
$path = rtrim($path, '/');
if (empty($path)) $path = '/';

// Route Dispatcher
switch (true) {
    // Auth Endpoints
    case ($path === '/auth/register' && $method === 'POST'):
        AuthController::register();
        break;

    case ($path === '/auth/login' && $method === 'POST'):
        AuthController::login();
        break;

    case ($path === '/auth/me' && $method === 'GET'):
        AuthController::me();
        break;

    case ($path === '/auth/delete' && ($method === 'DELETE' || $method === 'POST')):
        AuthController::deleteAccount();
        break;

    // Biometrics Endpoints
    case ($path === '/biometrics' && $method === 'GET'):
        BiometricsController::getBiometrics();
        break;

    case ($path === '/biometrics' && $method === 'POST'):
        BiometricsController::addBiometric();
        break;

    case ($path === '/biometrics/sensitivity-levels' && $method === 'GET'):
        BiometricsController::getSensitivityLevels();
        break;

    // Goals Endpoints
    case ($path === '/goals' && $method === 'GET'):
        GoalsController::getGoals();
        break;

    case ($path === '/goals' && $method === 'POST'):
        GoalsController::addGoal();
        break;

    case ($path === '/goals/progress' && $method === 'POST'):
        GoalsController::logProgress();
        break;

    case ($path === '/goals/types' && $method === 'GET'):
        GoalsController::getGoalTypes();
        break;

    // Foods & Catalog Endpoints
    case ($path === '/foods' && $method === 'GET'):
        FoodsController::getFoods();
        break;

    case ($path === '/foods' && $method === 'POST'):
        FoodsController::addFood();
        break;

    case ($path === '/foods/categories' && $method === 'GET'):
        FoodsController::getCategories();
        break;

    case ($path === '/foods/availability' && $method === 'GET'):
        FoodsController::getRegionalAvailability();
        break;

    // Meals Endpoints
    case ($path === '/meals' && $method === 'GET'):
        MealsController::getMeals();
        break;

    case ($path === '/meals' && $method === 'POST'):
        MealsController::logMeal();
        break;

    case (preg_match('/^\/meals\/(\d+)$/', $path, $matches) && $method === 'DELETE'):
        MealsController::deleteMeal(intval($matches[1]));
        break;

    // Workouts & Exercises
    case ($path === '/workouts' && $method === 'GET'):
        WorkoutsController::getLogs();
        break;

    case ($path === '/workouts' && $method === 'POST'):
        WorkoutsController::logExercise();
        break;

    case ($path === '/workouts/exercises' && $method === 'GET'):
        WorkoutsController::getExercises();
        break;

    // Sleep Endpoints
    case ($path === '/sleep' && $method === 'GET'):
        SleepController::getLogs();
        break;

    case ($path === '/sleep' && $method === 'POST'):
        SleepController::logSleep();
        break;

    // Environment & Regions
    case ($path === '/environment/regions' && $method === 'GET'):
        EnvironmentController::getRegions();
        break;

    case ($path === '/environment' && $method === 'GET'):
        EnvironmentController::getEnvironments();
        break;

    default:
        ResponseHandler::error("Endpoint dynamic route [{$method} {$path}] not found.", 404);
        break;
}
