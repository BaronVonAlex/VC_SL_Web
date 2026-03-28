# Vega Conflict Player Lookup

A React-based web application for searching and displaying Vega Conflict player statistics, battle history, and leaderboards.

## Features

- **Player Search**: Look up players by their Player ID to view detailed statistics
- **Combat Statistics**: View comprehensive battle stats including:
  - Fleet vs Fleet battles
  - Base Attack performance
  - Base Defence performance
  - Win/Loss/Draw ratios and K/D ratios
- **Historical Data**: Track player winrate history over time with interactive charts
- **Leaderboard**: Browse top players with customizable filters:
  - Period selection (Monthly, Yearly, All Time)
  - Category filters (Combined, Base Attack, Base Defence, Fleet)
  - Minimum months played filter
- **Player Comparison**: Compare up to 4 players side-by-side
- **Favorites**: Save players for quick access (persisted in localStorage)
- **Username History**: Track player name changes over time
- **Responsive Design**: Fully responsive interface optimized for desktop, tablet, and mobile

## Tech Stack

- **Frontend**: React 19.2.0
- **Routing**: React Router DOM 7.9.3
- **HTTP Client**: Axios 1.12.2
- **Styling**: Custom CSS with gradient themes
- **Icons**: React Icons 5.5.0
- **Charts**: QuickChart API for historical data visualization
- **Build Tool**: Vite 6
- **Auth**: HMAC-SHA256 request signing for backend API calls

## Prerequisites

- Node.js (v18 or higher recommended)
- npm
- Access to the required API endpoints (configured via environment variables)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vc_sl_web
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
VITE_STATS_API_URL=<your-stats-api-url>
VITE_USER_GAME_API_URL=<your-user-game-api-url>
VITE_KIXEYE_AVATAR_API_URL=<your-avatar-api-url>
VITE_GAME_ID=<your-game-id>
VITE_BACKEND_API_URL=<your-backend-api-url>
VITE_HMAC_SECRET=<your-hmac-secret>
```

## Available Scripts

### `npm run dev`
Runs the app in development mode at [http://localhost:5173](http://localhost:5173)

### `npm run build`
Builds the app for production to the `dist` folder

### `npm run preview`
Serves the production build locally for testing

## Project Structure

```
src/
├── components/          # React components
│   ├── SearchPage.jsx   # Main search interface
│   ├── PlayerCard.jsx   # Player information display
│   ├── SearchBar.jsx    # Search input component
│   ├── CombatStats.jsx  # Battle statistics display
│   ├── Chart.jsx        # Historical data chart
│   ├── HistoricalData.jsx # Historical stats wrapper
│   ├── Leaderboard.jsx  # Leaderboard component
│   ├── PlayerComparison.jsx # Side-by-side player comparison
│   ├── Favorites.jsx    # Saved players page
│   └── FavoriteContext.jsx  # Favorites state (React Context)
├── services/            # API service layer
│   ├── api.js           # API calls and data fetching
│   └── HmacClient.js    # HMAC-SHA256 request signing
├── styles/              # Component-specific styles
│   ├── SearchBar.css
│   ├── Leaderboard.css
│   ├── PlayerComparison.css
│   └── Favorites.css
├── utils/               # Utility functions
│   ├── statsUtil.js     # Stats calculations
│   └── chartUtil.js     # Chart URL generation
├── App.jsx              # Main app component with routing
├── App.css              # Global styles
└── main.jsx             # Application entry point
```

## Environment Variables

All environment variables must be prefixed with `VITE_` to be available in the browser.

| Variable | Description |
|----------|-------------|
| `VITE_STATS_API_URL` | KIXEYE API endpoint for player statistics |
| `VITE_USER_GAME_API_URL` | KIXEYE API endpoint for user game data |
| `VITE_KIXEYE_AVATAR_API_URL` | KIXEYE API endpoint for player avatars |
| `VITE_GAME_ID` | Vega Conflict game identifier |
| `VITE_BACKEND_API_URL` | Backend API base URL |
| `VITE_HMAC_SECRET` | Secret key for HMAC-SHA256 request signing |

**Important**: Never commit the `.env` file to version control.

## Deployment

### Azure Static Web Apps

The project deploys automatically via GitHub Actions on every push to `main`:

- Workflow: `.github/workflows/azure-static-web-apps-purple-plant-051730d03.yml`
- Build output: `dist/`
- SPA routing handled by `public/staticwebapp.config.json`

Required GitHub secrets (mapped to `VITE_*` env vars at build time):

| Secret | Maps to |
|--------|---------|
| `REACT_APP_STATS_API_URL` | `VITE_STATS_API_URL` |
| `REACT_APP_USER_GAME_API_URL` | `VITE_USER_GAME_API_URL` |
| `REACT_APP_KIXEYE_AVATAR_API_URL` | `VITE_KIXEYE_AVATAR_API_URL` |
| `REACT_APP_GAME_ID` | `VITE_GAME_ID` |
| `REACT_APP_BACKEND_API_URL` | `VITE_BACKEND_API_URL` |
| `REACT_APP_HMAC_SECRET` | `VITE_HMAC_SECRET` |

### Manual Deployment

1. Build the production bundle:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting service of choice

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is private and proprietary.

## Acknowledgments

- Charts powered by [QuickChart](https://quickchart.io/)
- Icons from [React Icons](https://react-icons.github.io/react-icons/)
- Built with [Vite](https://vitejs.dev/)
