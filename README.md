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
- **Username History**: Track player name changes over time
- **Responsive Design**: Fully responsive interface optimized for desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: React 19.2.0
- **Routing**: React Router DOM 7.9.3
- **HTTP Client**: Axios 1.12.2
- **Styling**: Custom CSS with gradient themes
- **Icons**: React Icons 5.5.0
- **Charts**: QuickChart API for historical data visualization
- **Build Tool**: Create React App

## Prerequisites

- Node.js (v14 or higher recommended)
- npm or yarn package manager
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
REACT_APP_STATS_API_URL=<your-stats-api-url>
REACT_APP_USER_GAME_API_URL=<your-user-game-api-url>
REACT_APP_KIXEYE_AVATAR_API_URL=<your-avatar-api-url>
REACT_APP_GAME_ID=<your-game-id>
REACT_APP_BACKEND_API_URL=<your-backend-api-url>
REACT_APP_API_SECRET=<your-api-secret>
```

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm run build`
Builds the app for production to the `build` folder with optimized performance

### `npm test`
Launches the test runner in interactive watch mode

### `npm run eject`
**Note**: This is a one-way operation. Ejects from Create React App for full configuration control

## Project Structure

```
src/
├── components/          # React components
│   ├── SearchPage.jsx   # Main search interface
│   ├── PlayerCard.jsx   # Player information display
│   ├── SearchBar.jsx    # Search input component
│   ├── CombatStats.jsx  # Battle statistics display
│   ├── Chart.jsx        # Historical data chart
│   ├── Leaderboard.jsx  # Leaderboard component
│   └── HistoricalData.jsx # Historical stats wrapper
├── services/            # API service layer
│   └── api.js          # API calls and data fetching
├── styles/             # Component-specific styles
│   ├── SearchBar.css
│   └── Leaderboard.css
├── utils/              # Utility functions
│   ├── statsUtil.js    # Stats calculations
│   └── chartUtil.js    # Chart generation
├── App.js              # Main app component with routing
├── App.css             # Global styles
└── index.js            # Application entry point
```

## Key Features Explained

### Player Search
- Enter a Player ID to fetch comprehensive player statistics
- View real-time data including level, medals, and planet information
- Track player activity with "Last Seen" timestamps

### Combat Statistics
- **Fleet vs Fleet**: Space combat performance metrics
- **Base Attack**: Offensive base raid statistics
- **Base Defence**: Defensive performance against raids
- Each category shows wins, draws, losses, winrate percentage, and K/D ratio

### Historical Winrate Tracking
- Monthly winrate data stored and displayed over time
- Interactive line charts showing trends across three battle categories
- Year selector to view historical performance from 2013 onwards
- Automatic data updates when searching in the current year

### Leaderboard System
- Filter by time period: Monthly, Yearly, or All Time
- Category-specific rankings for different battle types
- Minimum months played filter to ensure data quality
- Click any player to navigate to their detailed stats

## Environment Variables

The application requires several environment variables to connect to backend services:

| Variable | Description |
|----------|-------------|
| `REACT_APP_STATS_API_URL` | API endpoint for player statistics |
| `REACT_APP_USER_GAME_API_URL` | API endpoint for user game data |
| `REACT_APP_KIXEYE_AVATAR_API_URL` | API endpoint for player avatars |
| `REACT_APP_GAME_ID` | Game identifier for API calls |
| `REACT_APP_BACKEND_API_URL` | Backend API base URL |
| `REACT_APP_API_SECRET` | API authentication secret |

**Important**: Never commit the `.env` file to version control. Use `.env.example` as a template.

## Deployment

### Azure Static Web Apps

The project includes a GitHub Actions workflow for automatic deployment to Azure Static Web Apps:

- Workflow file: `.github/workflows/azure-static-web-apps-purple-plant-051730d03.yml`
- Triggers on push to main branch and pull requests
- Automatically builds and deploys the application
- Requires `AZURE_STATIC_WEB_APPS_API_TOKEN` secret configured in GitHub

### Manual Deployment

1. Build the production bundle:
```bash
npm run build
```

2. Deploy the `build` folder to your hosting service of choice

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

## License

This project is private and proprietary.

## Acknowledgments

- Built with [Create React App](https://create-react-app.dev/)
- Charts powered by [QuickChart](https://quickchart.io/)
- Icons from [React Icons](https://react-icons.github.io/react-icons/)

## Support

For issues, questions, or feature requests, please open an issue in the repository.

---

**Note**: This application requires valid API credentials and backend services to function properly. Ensure all environment variables are correctly configured before running the application.