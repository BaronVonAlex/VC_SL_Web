import { createContext, useContext, useState, useEffect } from 'react';
import type { Favorite } from '../types';

interface FavoritesContextValue {
  favorites: Favorite[];
  addFavorite: (playerId: number, playerName: string) => void;
  removeFavorite: (playerId: number) => void;
  isFavorite: (playerId: number) => boolean;
  toggleFavorite: (playerId: number, playerName: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export const useFavorites = (): FavoritesContextValue => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
};

const STORAGE_KEY = 'favoritePlayerIds';

const loadFromStorage = (): Favorite[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Favorite[]) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (favorites: Favorite[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // localStorage unavailable (private browsing quota, etc.)
  }
};

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<Favorite[]>(loadFromStorage);

  useEffect(() => {
    saveToStorage(favorites);
  }, [favorites]);

  const addFavorite = (playerId: number, playerName: string) => {
    setFavorites(prev => [...prev, { id: playerId, name: playerName, addedAt: Date.now() }]);
  };

  const removeFavorite = (playerId: number) => {
    setFavorites(prev => prev.filter(f => f.id !== playerId));
  };

  const isFavorite = (playerId: number) => favorites.some(f => f.id === playerId);

  const toggleFavorite = (playerId: number, playerName: string) => {
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
