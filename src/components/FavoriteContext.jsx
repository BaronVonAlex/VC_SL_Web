import { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('favoritePlayerIds');
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse favorites:', e);
      }
    }
  }, []);

  const addFavorite = (playerId, playerName) => {
    const newFavorites = [...favorites, { id: playerId, name: playerName, addedAt: Date.now() }];
    setFavorites(newFavorites);
    localStorage.setItem('favoritePlayerIds', JSON.stringify(newFavorites));
  };

  const removeFavorite = (playerId) => {
    const newFavorites = favorites.filter(f => f.id !== playerId);
    setFavorites(newFavorites);
    localStorage.setItem('favoritePlayerIds', JSON.stringify(newFavorites));
  };

  const isFavorite = (playerId) => {
    return favorites.some(f => f.id === playerId);
  };

  const toggleFavorite = (playerId, playerName) => {
    if (isFavorite(playerId)) {
      removeFavorite(playerId);
    } else {
      addFavorite(playerId, playerName);
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};