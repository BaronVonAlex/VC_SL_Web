import React, { useState } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import { fetchPlayerDetails } from './services/api';

const App = () => {
  const [playerData, setPlayerData] = useState(null);

  const handleSearch = async (playerID, year) => {
    try {
      const data = await fetchPlayerDetails(playerID);
      setPlayerData({ ...data, year });
    } catch {
      setPlayerData(null);
    }
  };

  return (
    <div className="App">
      <h1>VC_SL Player Stats</h1>
      <SearchBar onSearch={handleSearch} />
      {playerData && (
        <div>
          <h2>Player Data for {playerData.alias} (Year: {playerData.year})</h2>
          <pre>{JSON.stringify(playerData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default App;
