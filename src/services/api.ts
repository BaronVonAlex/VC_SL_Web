import axios from 'axios';
import HmacClient from './HmacClient';
import { calculateBattleStats } from '../utils/statsUtil';
import type { PlayerData, PlayerDetails, WinrateEntry, LeaderboardEntry, LeaderboardFilters } from '../types';

const USER_GAME_API_URL = import.meta.env.VITE_USER_GAME_API_URL as string;
const STATS_API_URL = import.meta.env.VITE_STATS_API_URL as string;
const KIXEYE_AVATAR_API_URL = import.meta.env.VITE_KIXEYE_AVATAR_API_URL as string;
const GAME_ID = import.meta.env.VITE_GAME_ID as string;
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL as string;
const HMAC_SECRET = import.meta.env.VITE_HMAC_SECRET as string;

if (import.meta.env.DEV) {
  if (!HMAC_SECRET) console.error('[API] VITE_HMAC_SECRET is not set.');
  if (!BACKEND_API_URL) console.error('[API] VITE_BACKEND_API_URL is not set.');
}

const hmacClient = new HmacClient(HMAC_SECRET ?? '', BACKEND_API_URL ?? '');

interface UserRecord {
  id: number;
  usernameHistory: string | string[];
  createdAt: string;
  updatedAt: string;
}

interface AvatarEntry {
  id: string;
  url: string;
}

export const fetchUserId = async (playerID: string): Promise<number> => {
  const url = `${USER_GAME_API_URL}${playerID}&limit=100`;
  try {
    const response = await axios.get<Array<{ userId: number }>>(url);
    return response.data[0].userId;
  } catch (error) {
    console.error('Error fetching userId:', error);
    throw error;
  }
};

export const fetchPlayerStats = async (userId: number): Promise<PlayerData> => {
  const url = `${STATS_API_URL}${userId}/games/${GAME_ID}`;
  try {
    const response = await axios.get<PlayerData>(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching player stats:', error);
    throw error;
  }
};

export const fetchUserAvatar = async (userId: number): Promise<string | undefined> => {
  const url = `${KIXEYE_AVATAR_API_URL}${userId}/avatars`;
  try {
    const response = await axios.get<AvatarEntry[]>(url);
    return response.data.find((avatar) => avatar.id === 'large')?.url;
  } catch (error) {
    console.error('Error fetching player avatar:', error);
    throw error;
  }
};

export const createOrGetUser = async (playerID: string, currentUsername: string): Promise<UserRecord> => {
  const fallback: UserRecord = {
    id: parseInt(playerID),
    usernameHistory: [currentUsername],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const record = await hmacClient.get<UserRecord>(`/api/Users/GetUser/${playerID}`);
    const history = Array.isArray(record.usernameHistory) ? record.usernameHistory : [];

    if (!history.includes(currentUsername)) {
      await updateUsernameHistory(playerID, currentUsername);
      return await hmacClient.get<UserRecord>(`/api/Users/GetUser/${playerID}`);
    }

    return record;
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('404')) {
      try {
        return await hmacClient.post<UserRecord>(`/api/Users/CreateUser`, {
          id: parseInt(playerID),
          usernameHistory: currentUsername,
        });
      } catch (createError) {
        console.error('Error creating user:', createError);
        return fallback;
      }
    }
    console.error('Error fetching user:', error);
    return fallback;
  }
};

export const updateUsernameHistory = async (playerID: string, newUsername: string): Promise<unknown> => {
  try {
    return await hmacClient.put(`/api/Users/UpdateUser/${playerID}`, { usernameHistory: newUsername });
  } catch (error) {
    console.error('Error updating username history:', error);
    throw error;
  }
};

export const getWinrateForUser = async (userId: string | number, year: number, signal?: AbortSignal): Promise<WinrateEntry[]> => {
  try {
    const response = await hmacClient.get<WinrateEntry[]>(
      `/api/Winrate/GetWinrateForUser?userId=${userId}&year=${year}`,
      signal
    );
    return Array.isArray(response) ? response : [];
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('404')) return [];
    console.error('Error fetching winrate data:', error);
    return [];
  }
};

export const updateWinrateStats = async (
  userId: string | number,
  month: number,
  year: number,
  winrateData: { baseAttackWinrate: number; baseDefenceWinrate: number; fleetWinrate: number }
): Promise<unknown> => {
  try {
    return await hmacClient.post(`/api/Winrate/UpdateWinrate`, {
      userId: parseInt(String(userId)),
      month,
      year,
      baseAttackWinrate: winrateData.baseAttackWinrate ?? 0,
      baseDefenceWinrate: winrateData.baseDefenceWinrate ?? 0,
      fleetWinrate: winrateData.fleetWinrate ?? 0,
    });
  } catch (error) {
    console.error('Error updating winrate stats:', error);
    return null;
  }
};

export const fetchLeaderboard = async (filters: LeaderboardFilters, signal?: AbortSignal): Promise<LeaderboardEntry[]> => {
  try {
    const params: Record<string, string | number> = {
      period: filters.period,
      category: filters.category,
      limit: filters.limit,
      minimumMonths: filters.minimumMonths,
    };

    if (filters.period === 0) {
      params.month = filters.month;
      params.year = filters.year;
    } else if (filters.period === 1) {
      params.year = filters.year;
    }

    const queryString = new URLSearchParams(
      Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
    ).toString();

    return await hmacClient.get<LeaderboardEntry[]>(`/api/Leaderboard?${queryString}`, signal);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    console.error('Error fetching leaderboard:', error);
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('400')) throw new Error('Invalid filter parameters');
    throw error;
  }
};

export const fetchPlayerDetails = async (playerID: string, year?: number, signal?: AbortSignal): Promise<PlayerDetails> => {
  try {
    const userId = await fetchUserId(playerID);
    const playerData = await fetchPlayerStats(userId);
    const avatarUrl = await fetchUserAvatar(userId);
    const userRecord = await createOrGetUser(playerID, playerData.alias);

    const baseAttackStats = calculateBattleStats(
      playerData.baseAttackWin ?? 0,
      playerData.baseAttackDraw ?? 0,
      playerData.baseAttackLoss ?? 0
    );
    const baseDefenceStats = calculateBattleStats(
      playerData.baseDefenceWin ?? 0,
      playerData.baseDefenceDraw ?? 0,
      playerData.baseDefenceLoss ?? 0
    );
    const fleetStats = calculateBattleStats(
      playerData.fleetWin ?? 0,
      playerData.fleetDraw ?? 0,
      playerData.fleetLoss ?? 0
    );

    const currentWinrates = {
      baseAttackWinrate: parseFloat(baseAttackStats.winratePercent) || 0,
      baseDefenceWinrate: parseFloat(baseDefenceStats.winratePercent) || 0,
      fleetWinrate: parseFloat(fleetStats.winratePercent) || 0,
    };

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const searchYear = year ?? currentYear;

    if (searchYear === currentYear) {
      await updateWinrateStats(playerID, currentMonth, currentYear, currentWinrates);
    }

    const historicalStats = await getWinrateForUser(playerID, searchYear, signal);

    const history = userRecord.usernameHistory;

    return {
      userId,
      playerData: { ...playerData, baseAttackStats, baseDefenceStats, fleetStats },
      avatarUrl,
      historicalStats,
      usernameHistory: Array.isArray(history) ? history : [history],
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    console.error('Error in fetchPlayerDetails:', error);
    throw new Error(`Failed to fetch player details: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
