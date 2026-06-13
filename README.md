# 🏋️‍♂️ FitVerse

[![GitHub stars](https://img.shields.io/github/stars/ubothe14/FitVerse-App?style=flat-square&color=c084fc)](https://github.com/ubothe14/FitVerse-App)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg?style=flat-square)](https://www.gnu.org/licenses/agpl-3.0)
[![React Version](https://img.shields.io/badge/React-19.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/AI-Google_Gemini-ea4335?style=flat-square&logo=google-gemini)](https://deepmind.google/technologies/gemini/)

FitVerse is a premium, privacy-first, full-stack fitness analytics platform designed to turn raw workout logs into actionable training insights. It integrates deep statistical analysis of your training history (from **Hevy**, **Strong**, or **Lyfta**) with an AI-powered nutrition assistant and real-time coaching feedback.

Unlike generic workout trackers that only show basic lines and numbers, FitVerse runs local algorithms to flag training plateaus, calculate volume-based recovery maps, and audit every set you log across 19 different fatigue scenarios.

---

## 🚀 Key Features

### 📊 Training & Volume Analytics
*   **Interactive Muscle Heatmaps:** Dynamic body visualizer displaying training volume distribution over rolling 7-day windows matching real muscular recovery patterns.
*   **Intelligent Plateau Detection:** Automatically classifies your progress for every exercise (e.g., *Getting Stronger*, *Plateauing*, or *Taking a Dip*) and generates custom micro-progressions (e.g., adding 1 rep, bumping weight, or scheduling a deload).
*   **Three-Tier Personal Records:** Tracks all-time **Gold PRs**, recent 2-month **Silver PRs**, and alerts you to **PR Droughts** where your lifts have stalled.
*   **Consistency Heatmap:** A GitHub-style yearly grid displaying training frequency, streaks, and consistency scores.

### 🧠 Set-by-Set Coaching Audits
*   An advanced coaching engine that audits every single set of your past workouts.
*   Assigns visual badges and corrective feedback across **19 training scenarios** (e.g., *Normal Fatigue*, *Too Aggressive*, *Good Reset*, *Junk Volume*).

### 🥗 Gemini AI Nutrition Assistant
*   **Instant Macro Breakdown:** Take or upload a photo of your meal to receive instant, AI-computed calorie and macronutrient (protein, carbs, fat) breakdowns.
*   **AI Training Exports:** Export your structured workout history in one click to paste into any LLM for custom programming audits.

### 🔒 Privacy-First & Full-Stack Sync
*   **Google OAuth & JWT:** Secure authentication with Google Identity Services and email/password credentials.
*   **MongoDB Atlas:** Cloud-synced user profiles, personalized macro targets, and nutrition logs.
*   **No Lock-in:** Import raw CSV exports or sync directly with the Hevy API.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Vike (Vite SSR/SPA Framework), Tailwind CSS v4, Recharts, GSAP, HSL dynamic theme engine. |
| **Backend** | Node.js, Express, Puppeteer (for Hevy crawler API integration). |
| **Database** | MongoDB Atlas, Mongoose ODM. |
| **AI Layer** | Google Gemini API (Server-side image and text analytics). |

---

## 📦 Project Directory Structure

```text
FitVerse/
├── backend/            # Express.js server & scraper engine
│   ├── src/
│   │   ├── models/     # Mongoose Schemas (User, FoodLogs, etc.)
│   │   ├── routes/     # Auth, AI (Gemini), & Nutrition API routes
│   │   └── index.ts    # Node server entry point
│   └── .env            # Backend configuration (DB secret keys, Gemini API)
├── frontend/           # React 19 Single Page Application
│   ├── components/     # UI Components (Dashboard, Heatmaps, Auth, AI)
│   ├── utils/          # CSV parsers, local algorithms, API helpers
│   └── index.html      # Vite HTML template
├── .env                # Frontend environment configuration (Backend URL, Google Client ID)
├── package.json        # Main project runner script configuration
└── vite.config.ts      # Vite & Vike builder setup
```

---

## ⚙️ Getting Started & Installation

### Prerequisites
*   **Node.js** v22+
*   **npm** v10+
*   **MongoDB Atlas** account (or local MongoDB database)

### 1. Clone & Install Dependencies
Clone the repository and install all node modules for both the frontend wrapper and backend:
```bash
git clone https://github.com/ubothe14/FitVerse-App.git
cd FitVerse-App
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the **root** folder:
```ini
VITE_BACKEND_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=<your-google-oauth-client-id>.apps.googleusercontent.com
VITE_GEMINI_API_KEY=<your-gemini-api-key>
```

Create a `.env` file in the **`backend/`** folder:
```ini
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/fitverse
JWT_SECRET=<your-custom-jwt-secret>
CORS_ORIGINS=http://localhost:3000,https://your-production-domain.com

# Google OAuth Credentials
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# Gemini AI API Key
GEMINI_API_KEY=<your-gemini-api-key>

# Puppeteer Cache Path (Optional)
PUPPETEER_CACHE_DIR=backend/.puppeteer-cache
```

### 3. Run the Development Server
Launch both the frontend and backend servers concurrently using the main package script:
```bash
npm run dev
```
*   **Frontend:** [http://localhost:3000](http://localhost:3000)
*   **Backend:** [http://localhost:5000](http://localhost:5000)

---

## 💡 Troubleshooting & Tips

### 🔑 Google Sign-in Popups
*   **Origin Whitelisting:** Remember to add both `http://localhost:3000` and your production domain (e.g., `https://fit-verse-app.vercel.app`) to your **Authorized JavaScript Origins** under Credentials in the Google Cloud Console.
*   **Ad-blockers:** Ad-blocking extensions (like *uBlock Origin* or *AdBlock*) and **Brave Shields** often block Google GSI popups by default. Temporarily pause your blocker for the application's domain if you see the console error `[GSI_LOGGER]: Failed to open popup window...`.

### 📂 Nested Git Repositories
This project is configured with a nested Git structure. The actual website code lives inside the inner `FitVerse/` directory. To push updates to GitHub, make sure you navigate to the subfolder first:
```bash
cd FitVerse
git push origin main
```

---

## 📄 License
This project is licensed under the **AGPL-3.0 License** - see the LICENSE file for details.

Developed with 💪 by **[ubothe14](https://github.com/ubothe14)**.
