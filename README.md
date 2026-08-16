<div align="center">

<img src="https://img.shields.io/badge/Dietology-Metabolic%20Intelligence%20Platform-10B981?style=for-the-badge&labelColor=0B0F17" alt="Dietology" />

<br/>
<br/>

**A precision health & nutrition tracking platform built for CSE311.**  
Dietology integrates biometrics, meal logging, fitness tracking, sleep analysis, and environmental insights into a unified, data-driven dashboard — designed to surface actionable metabolic intelligence.

<br/>

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat-square&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![PHP](https://img.shields.io/badge/PHP_8-777BB4?style=flat-square&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL_8-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema--22-tables)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
- [Running the Application](#-running-the-application)
- [Environment Variables](#-environment-variables)
- [Frontend Architecture](#-frontend-architecture)

---

## 🧬 Overview

Dietology is a full-stack health optimization web application that models the complex interplay between nutrition, fitness, sleep, environment, and metabolic health. Users register with biometric baselines and health goals, then track every aspect of their health through a sleek, animated dashboard.

The platform is built as a **monorepo** with a strictly separated frontend and backend, connected over a RESTful HTTP API.

---

## ✨ Features

### 🏠 Landing Page
- Animated hero section with gradient text and staggered entrance effects
- Interactive food nutrition explorer with live macro breakdowns
- Goal-based pricing tiers (Weight Loss · Maintenance · Muscle Gain · Diabetes)
- Animated statistics counter and feature highlights
- Smooth Framer Motion scroll-triggered reveals

### 🔐 Authentication
- Multi-step registration wizard (Account → Physical Baseline → Goals & Insulin)
- JWT-based session management stored in Zustand global state
- Demo dashboard access (no account required)
- Back-to-home navigation from login and register pages

### 📊 Dashboard — Overview
- Today's calorie & macro progress rings
- Blood glucose, heart rate, and water intake gauges
- Recent meal log and weekly calorie trend chart (Recharts)
- Active goal progress bars

### 🩺 Biometrics Hub
- Log weight, body fat %, blood glucose, blood pressure, and resting heart rate
- Trend charts with color-coded anomaly detection
- Insulin sensitivity tracking across 3 levels (Resistant · Normal · Sensitive)
- Historical biometrics log table with status badges

### 🥗 Nutrition & Meals
- Food catalog browser with search and category filter
- Regional food availability scoring by geographic zone
- Log meals by type (Breakfast / Lunch / Dinner / Snack) with gram quantities
- Live calorie and macro totals from logged meals
- Goal-matched nutrition profile display (calorie target, protein/carbs/fat split)

### 💪 Fitness Lab
- Browse exercises by muscle group and body region
- Log exercise sets, reps, weight, and duration
- Recommended workout plans derived from active health goals
- Calories burned tracking per session

### 😴 Sleep Lab
- Log sleep sessions with start/end times and quality score
- Sleep factor tagging (caffeine, stress, screen time, etc.)
- Weekly sleep duration trend and quality score chart
- Sleep stage analysis breakdown

### 🌍 Environment & Regions
- View environmental factors for your registered geographic region
- Air quality, humidity, UV index, and pollution data
- Regional food sourcing availability heatmap

### ⚙️ Settings
- Profile edit (name, date of birth, height)
- Unit system toggle (metric / imperial)
- Notification and dark mode preferences
- Danger zone — account deletion

---

## 🛠 Tech Stack

### Frontend
| Layer | Technology | Purpose |
|---|---|---|
| Framework | **Next.js 16** (App Router) | File-based routing, SSR/SSG, layouts |
| Language | **TypeScript 5** | Type-safe React components |
| Styling | **Tailwind CSS v4** + custom CSS | Design system, glassmorphism utilities |
| Animation | **Framer Motion 13** | Page transitions, stagger reveals, hover effects |
| State | **Zustand 5** | Global auth & user session store |
| Data Fetching | **Axios** + **TanStack Query** | API calls, caching, background refetch |
| Charts | **Recharts 3** | Trend charts, progress rings, bar charts |
| Forms | **React Hook Form** + **Zod** | Validated form management |
| Icons | **Lucide React** | Consistent icon set |
| Toasts | **Sonner** | Non-blocking toast notifications |

### Backend
| Layer | Technology | Purpose |
|---|---|---|
| Runtime | **PHP 8** (built-in dev server) | API request handling |
| Architecture | **MVC — Controllers + Helpers** | Clean separation of concerns |
| Database | **MySQL 8** via **PDO** | Relational data storage |
| Auth | **JWT** (HMAC-SHA256) | Stateless session tokens |
| API Style | **RESTful JSON API** | Standard HTTP verbs + JSON responses |
| CORS | Custom CORS middleware | Cross-origin support for the frontend |

---

## 📁 Project Structure

```
Dietology-Project/
├── backend/                        # PHP REST API
│   ├── api/
│   │   ├── index.php               # Main route dispatcher (switch-based)
│   │   └── router.php              # Entry point for PHP built-in server
│   ├── config/
│   │   ├── database.php            # PDO singleton database connection
│   │   └── cors.php                # CORS headers middleware
│   ├── src/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php           # Register, login, me, delete
│   │   │   ├── BiometricsController.php     # Biometrics CRUD + sensitivity levels
│   │   │   ├── GoalsController.php          # Goals, progress logging, goal types
│   │   │   ├── FoodsController.php          # Foods catalog, categories, regional availability
│   │   │   ├── MealsController.php          # Meal logging and deletion
│   │   │   ├── WorkoutsController.php       # Exercise logs and exercise catalog
│   │   │   ├── SleepController.php          # Sleep session logs
│   │   │   └── EnvironmentController.php    # Regions and environmental factors
│   │   ├── Helpers/
│   │   │   └── ResponseHandler.php          # Standardized JSON response builder
│   │   └── Middleware/                      # Auth token validation middleware
│   └── db/
│       ├── schema.sql              # Full 22-table DDL
│       ├── seed.sql                # Sample data for all tables
│       └── dev_store.json          # Dev auth token store
│
└── frontend/                       # Next.js 16 App
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx                     # Landing page
    │   │   ├── layout.tsx                   # Root layout (fonts, providers)
    │   │   ├── globals.css                  # Tailwind + design system tokens
    │   │   ├── (auth)/
    │   │   │   ├── login/page.tsx           # Login page
    │   │   │   └── register/page.tsx        # Multi-step registration
    │   │   └── dashboard/
    │   │       ├── layout.tsx               # Dashboard shell (sidebar, nav)
    │   │       ├── page.tsx                 # Overview dashboard
    │   │       ├── biometrics/page.tsx      # Biometrics hub
    │   │       ├── nutrition/page.tsx       # Nutrition & meal logger
    │   │       ├── fitness/page.tsx         # Fitness & exercise tracker
    │   │       ├── sleep/page.tsx           # Sleep lab
    │   │       ├── environment/page.tsx     # Environmental factors
    │   │       └── settings/page.tsx        # User preferences
    │   ├── components/
    │   │   ├── ui/
    │   │   │   └── page-transition.tsx      # PageTransition, AnimatedCard, StaggerContainer
    │   │   └── landing/                     # Landing page section components
    │   ├── lib/
    │   │   ├── api.ts                       # Axios API client + all endpoint functions
    │   │   ├── animations.ts                # Framer Motion variants & easing presets
    │   │   └── utils.ts                     # Tailwind merge utility (cn)
    │   ├── store/
    │   │   └── useAuthStore.ts             # Zustand auth store (token + user)
    │   ├── hooks/                           # Custom React hooks
    │   ├── providers/                       # React context providers
    │   └── types/                           # TypeScript type definitions
    ├── package.json
    ├── next.config.ts
    └── tsconfig.json
```

---

## 🗄 Database Schema — 22 Tables

The Dietology database uses a fully normalized relational schema with cascading foreign keys:

| # | Table | Description |
|---|---|---|
| 1 | `users` | Core user profiles (name, email, password hash, DOB, height) |
| 2 | `insulin_sensitivity_levels` | Reference: Resistant / Normal / Sensitive |
| 3 | `user_biometrics_log` | Weight, body fat %, blood glucose, BP, heart rate logs |
| 4 | `user_preferences` | Unit system, timezone, notifications, dark mode |
| 5 | `regions` | Geographic regions with climate type and timezone |
| 6 | `environmental_factors` | Named environmental factor catalog |
| 7 | `region_environments` | Quantified environmental factor values per region |
| 8 | `goal_types` | Goal categories (loss / maintain / gain / diabetes) |
| 9 | `user_goals` | Active user goals with target and current values |
| 10 | `goal_progress_logs` | Date-stamped progress entries per goal |
| 11 | `food_categories` | Food category taxonomy |
| 12 | `foods` | Food items with full macro profile + glycemic index |
| 13 | `goal_nutrition_profiles` | Recommended calorie and macro split per goal type |
| 14 | `region_food_availability` | Food availability and avg price per region |
| 15 | `user_meal_logs` | Logged meals with food, meal type, and grams |
| 16 | `body_regions` | Anatomical body region reference |
| 17 | `muscle_groups` | Muscle groups within body regions |
| 18 | `exercises` | Exercise catalog with difficulty and calorie burn rate |
| 19 | `goal_workout_plans` | Recommended exercise plans per goal type |
| 20 | `exercise_logs` | User exercise sessions with sets, reps, weight, calories |
| 21 | `sleep_logs` | Sleep sessions with start/end time and quality score |
| 22 | `sleep_factors` | Named contributing factors per sleep session |

---

## 📡 API Reference

All endpoints are served from `http://localhost:8000/api`.  
Protected routes require an `Authorization: Bearer <token>` header.

### 🔐 Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | ❌ | Create a new user account |
| `POST` | `/auth/login` | ❌ | Login and receive JWT token |
| `GET` | `/auth/me` | ✅ | Get current authenticated user |
| `DELETE` | `/auth/delete` | ✅ | Delete user account and all data |

### 🩺 Biometrics
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/biometrics` | ✅ | Get all biometric log entries |
| `POST` | `/biometrics` | ✅ | Log a new biometric reading |
| `GET` | `/biometrics/sensitivity-levels` | ❌ | Get insulin sensitivity level options |

### 🎯 Goals
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/goals` | ✅ | Get user's active goals |
| `POST` | `/goals` | ✅ | Create a new health goal |
| `POST` | `/goals/progress` | ✅ | Log progress toward a goal |
| `GET` | `/goals/types` | ❌ | Get available goal type options |

### 🥗 Foods & Nutrition
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/foods` | ✅ | Browse food catalog (filterable) |
| `POST` | `/foods` | ✅ | Add a new food item |
| `GET` | `/foods/categories` | ❌ | Get food category list |
| `GET` | `/foods/availability` | ✅ | Get regional food availability for user |

### 🍽 Meals
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/meals` | ✅ | Get today's meal log |
| `POST` | `/meals` | ✅ | Log a meal entry |
| `DELETE` | `/meals/{id}` | ✅ | Remove a meal log entry |

### 💪 Workouts
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/workouts` | ✅ | Get exercise session logs |
| `POST` | `/workouts` | ✅ | Log an exercise session |
| `GET` | `/workouts/exercises` | ✅ | Browse exercise catalog |

### 😴 Sleep
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/sleep` | ✅ | Get sleep session history |
| `POST` | `/sleep` | ✅ | Log a sleep session |

### 🌍 Environment
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/environment` | ✅ | Get environmental factors for user's region |
| `GET` | `/environment/regions` | ❌ | List all available regions |

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Notes |
|---|---|---|
| **Node.js** | ≥ 18.x | Required for the Next.js frontend |
| **npm** | ≥ 9.x | Bundled with Node.js |
| **PHP** | ≥ 8.0 | With PDO + PDO_MySQL extensions |
| **MySQL** | ≥ 8.0 | Database server |

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Dietology-Project
```

### 2. Set Up the Database

Start your MySQL server, then run the schema and seed files:

```sql
-- In your MySQL client:
source backend/db/schema.sql;
source backend/db/seed.sql;
```

Or from the command line:

```bash
mysql -u root -p < backend/db/schema.sql
mysql -u root -p dietology_db < backend/db/seed.sql
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

## ▶ Running the Application

### Backend — PHP Dev Server

```bash
# From the project root:
php -S localhost:8000 -t api api/router.php

# Or from the backend directory:
cd backend
php -S localhost:8000 -t api api/router.php
```

The API will be available at **`http://localhost:8000/api`**.

### Frontend — Next.js Dev Server

```bash
cd frontend
npm run dev
```

The app will be available at **`http://localhost:3000`**.

### Production Build (Frontend)

```bash
cd frontend
npm run build
npm run start
```

---

## 🔧 Environment Variables

The backend reads database credentials from environment variables with sensible defaults for local development:

| Variable | Default | Description |
|---|---|---|
| `DB_HOST` | `127.0.0.1` | MySQL host address |
| `DB_NAME` | `dietology_db` | Database name |
| `DB_USER` | `root` | MySQL username |
| `DB_PASS` | *(empty)* | MySQL password |
| `DB_PORT` | `3306` | MySQL port |

Set them before starting the PHP server:

```bash
# Windows PowerShell
$env:DB_USER="root"; $env:DB_PASS="your_password"; php -S localhost:8000 -t api api/router.php

# Linux / macOS
DB_USER=root DB_PASS=your_password php -S localhost:8000 -t api api/router.php
```

---

## 🏗 Frontend Architecture

### Design System

The design system is defined in `src/app/globals.css` using **CSS custom properties** and **Tailwind v4 `@theme`** tokens:

- `--background`, `--foreground` — Dark navy/slate base palette
- `--card`, `--border` — Glassmorphic card surfaces
- `--primary` — Emerald green (`#10B981`) brand accent
- `.glass` — Backdrop-blur glassmorphism card utility
- `.gradient-text` — Emerald-to-teal gradient text effect
- `.glow-emerald` — Ambient emerald glow shadow
- `.mono` — Geist Mono for data values and metrics

### Animation System

All Framer Motion animations are centralized in `src/lib/animations.ts`:

```ts
// Shared cubic-bezier easing for buttery-smooth motion
export const cubicEase = [0.22, 1, 0.36, 1];

// Available motion variants:
// fadeInUp, fadeInDown, staggerContainer, staggerItem, scaleUp
```

### State Management

Zustand powers the global auth store (`src/store/useAuthStore.ts`):

```ts
// Persistent store holding:
{ token: string | null, user: User | null }

// Actions:
setAuth(token, user)   // Login / register
clearAuth()            // Logout
```

### Route Structure

```
/                          → Landing page
/login                     → Login form
/register                  → Multi-step registration
/dashboard                 → Overview (protected)
/dashboard/biometrics      → Biometrics hub (protected)
/dashboard/nutrition       → Meal logger (protected)
/dashboard/fitness         → Exercise tracker (protected)
/dashboard/sleep           → Sleep lab (protected)
/dashboard/environment     → Regional environment (protected)
/dashboard/settings        → User settings (protected)
```

---

<div align="center">

Built with ❤️ as a CSE311 project — **Dietology** © 2026

</div>
