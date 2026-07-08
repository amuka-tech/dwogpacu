# DWOG PACU CUP 2026 🏆

DWOG PACU CUP 2026 is a real-time football tournament management platform built to provide instant score updates, match events, live standings, and an interactive admin dashboard for score entry. 

It is designed to give players, fans, and administrators a seamless, immersive, and premium live experience straight from their devices.

## ✨ Features

- **Live Match Tracking**: Real-time scores and live minute updates (1H, HT, 2H).
- **Match Events Engine**: Track Goals, Own Goals, Penalties, Yellow, and Red Cards with timestamps and player names.
- **Starting Lineups**: Full support for team formations (e.g., 4-3-3) and starting XI listings.
- **Dynamic Standings**: League tables update automatically based on match results and head-to-head parameters.
- **Premium User Interface**: Dark mode by default, glassmorphism UI, fluid animations, and responsive mobile-first design.
- **Admin Score Entry Panel**: A password-protected backend view allowing technical committee members to easily update scores, events, and match statuses.
- **Supabase Integration**: Powered by Supabase for reliable real-time database synchronization and persistent storage.

## 🛠️ Tech Stack

- **Framework:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing:** [React Router v7](https://reactrouter.com/)
- **Backend & Database:** [Supabase](https://supabase.com/)
- **Styling:** Custom Vanilla CSS with modern custom properties, glassmorphism, and responsive grid/flexbox layouts.
- **Icons:** [Lucide React](https://lucide.dev/)
- **Notifications:** [React Hot Toast](https://react-hot-toast.com/)

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18+) and npm installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/amuka-tech/dwogpacu.git
   cd dwogpacu
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173` to view the app.

## 📂 Project Structure

```text
dwogpacu/
├── public/                 # Static assets (Favicons, manifest, etc.)
├── src/
│   ├── assets/             # Images and design assets
│   ├── components/         # Reusable UI components (Header, MatchCards, etc.)
│   ├── context/            # Global React Context (Tournament Context, Supabase sync)
│   ├── data/               # Static fallback data (Teams, Squads, Fixtures)
│   ├── pages/              # Main view routes (Home, Groups, Knockouts, Admin)
│   ├── utils/              # Helper functions (Standings calculations, etc.)
│   ├── App.jsx             # Main Router configuration
│   └── index.css           # Global design tokens and root styles
├── supabase/               # Supabase edge functions and migration files
├── vite.config.js          # Vite build configuration
└── package.json            # Project dependencies and scripts
```

## 🔒 Admin Panel Access

The `/admin` route requires a technical committee password. Once authenticated, admins can:
- Mark upcoming matches as **LIVE**.
- Update live minutes and scores in real-time.
- Attach specific events (Goals, Cards) to matches.
- Enter and save starting formations and lineups.
- Reset matches if mistakes are made during entry.

## 🤝 Contributing

This project is built and maintained by the **DWOG PACU Technical Committee**. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

All rights reserved. DWOG PACU CUP 2026.
