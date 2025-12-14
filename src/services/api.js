import axios from 'axios';
import HmacClient from './HmacClient';
import { calculateBattleStats } from '../utils/statsUtil';

const USER_GAME_API_URL = process.env.REACT_APP_USER_GAME_API_URL;
const STATS_API_URL = process.env.REACT_APP_STATS_API_URL;
const KIXEYE_AVATAR_API_URL = process.env.REACT_APP_KIXEYE_AVATAR_API_URL;
const GAME_ID = process.env.REACT_APP_GAME_ID;
const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;
const HMAC_SECRET = process.env.REACT_APP_HMAC_SECRET;

if (!HMAC_SECRET) {
  console.error('[ERROR] REACT_APP_HMAC_SECRET is not set! Set this environment variable.');
}

if (!BACKEND_API_URL) {
  console.error('[ERROR] REACT_APP_BACKEND_API_URL is not set! Set this environment variable.');
}

const hmacClient = new HmacClient(HMAC_SECRET || '', BACKEND_API_URL || '');

console.log('[API Client Initialized]', {
  BACKEND_API_URL,
  HMAC_SECRET: HMAC_SECRET ? '***hidden***' : 'NOT SET',
});

export const fetchUserId = async (playerID) => {
  const userGameApiUrl = `${USER_GAME_API_URL}${playerID}&limit=100`;
  try {
    const response = await axios.get(userGameApiUrl);
    return response.data[0].userId;
  } catch (error) {
    console.error('Error fetching userId:', error);
    throw error;
  }
};

export const fetchPlayerStats = async (userId) => {
  const statsApiUrl = `${STATS_API_URL}${userId}/games/${GAME_ID}`;
  try {
    const response = await axios.get(statsApiUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching player stats:', error);
    throw error;
  }
};

export const fetchUserAvatar = async (userId) => {
  const userAvatarApiUrl = `${KIXEYE_AVATAR_API_URL}${userId}/avatars`;
  try {
    const response = await axios.get(userAvatarApiUrl);
    const avatarData = response.data;
    return avatarData.find((avatar) => avatar.id === 'large')?.url;
  } catch (error) {
    console.error('Error fetching player avatar:', error);
    throw error;
  }
};

export const createOrGetUser = async (playerID, currentUsername) => {
  try {
    const getResponse = await hmacClient.get(`/api/Users/GetUser/${playerID}`);

    const existingHistory = getResponse.usernameHistory || [];

    if (!existingHistory.includes(currentUsername)) {
      await updateUsernameHistory(playerID, currentUsername);
      const updatedResponse = await hmacClient.get(`/api/Users/GetUser/${playerID}`);
      return updatedResponse;
    }

    return getResponse;
  } catch (error) {
    if (error.message && error.message.includes('404')) {
      console.log(`User ${playerID} not found in database. Creating new user...`);
      try {
        const createResponse = await hmacClient.post(`/api/Users/CreateUser`, {
          id: parseInt(playerID),
          usernameHistory: currentUsername
        });

        console.log(`Successfully created user ${playerID}`);
        return createResponse;
      } catch (createError) {
        console.error('Error creating user:', createError);
        return {
          id: parseInt(playerID),
          usernameHistory: [currentUsername],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
    }

    console.error('Error fetching user:', error);
    return {
      id: parseInt(playerID),
      usernameHistory: [currentUsername],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
};

export const updateUsernameHistory = async (playerID, newUsername) => {
  try {
    return await hmacClient.put(`/api/Users/UpdateUser/${playerID}`, {
      usernameHistory: newUsername
    });
  } catch (error) {
    console.error('Error updating username history:', error);
    throw error;
  }
};

export const getWinrateForUser = async (userId, year) => {
  try {
    const response = await hmacClient.get(
      `/api/Winrate/GetWinrateForUser?userId=${userId}&year=${year}`
    );
    return Array.isArray(response) ? response : [];
  } catch (error) {
    if (error.message && error.message.includes('404')) {
      console.log(`No winrate data found for user ${userId}, year ${year}`);
      return [];
    }
    console.error('Error fetching winrate data:', error);
    return [];
  }
};

export const updateWinrateStats = async (userId, month, year, winrateData) => {
  try {
    const sanitizedData = {
      userId: parseInt(userId),
      month,
      year,
      baseAttackWinrate: winrateData.baseAttackWinrate ?? 0,
      baseDefenceWinrate: winrateData.baseDefenceWinrate ?? 0,
      fleetWinrate: winrateData.fleetWinrate ?? 0
    };

    console.log('[updateWinrateStats]', sanitizedData);

    return await hmacClient.post(`/api/Winrate/UpdateWinrate`, sanitizedData);
  } catch (error) {
    console.error('Error updating winrate stats:', error);
    return null;
  }
};

export const fetchLeaderboard = async (filters) => {
  try {
    const params = {
      period: filters.period,
      category: filters.category,
      limit: filters.limit,
      minimumMonths: filters.minimumMonths
    };

    if (filters.period === 0) {
      params.month = filters.month;
      params.year = filters.year;
    } else if (filters.period === 1) {
      params.year = filters.year;
    }

    console.log('[fetchLeaderboard]', params);

    const queryString = new URLSearchParams(params).toString();
    return await hmacClient.get(`/api/Leaderboard?${queryString}`);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    if (error.message && error.message.includes('400')) {
      throw new Error('Invalid filter parameters');
    }
    throw error;
  }
};

export const fetchPlayerDetails = async (playerID, year) => {
  try {
    console.log(`Starting fetch for player ID: ${playerID}`);

    const userId = await fetchUserId(playerID);
    console.log(`Found userId: ${userId}`);

    const playerData = await fetchPlayerStats(userId);
    console.log(`Fetched player stats for ${playerData.alias}`);

    const avatarUrl = await fetchUserAvatar(userId);
    console.log(`Fetched avatar URL`);

    console.log(`Creating/getting user in database with username: ${playerData.alias}`);
    const userRecord = await createOrGetUser(playerID, playerData.alias);
    console.log('User record:', userRecord);

    const baseAttackStats = calculateBattleStats(
      playerData.baseAttackWin || 0,
      playerData.baseAttackDraw || 0,
      playerData.baseAttackLoss || 0
    );
    const baseDefenceStats = calculateBattleStats(
      playerData.baseDefenceWin || 0,
      playerData.baseDefenceDraw || 0,
      playerData.baseDefenceLoss || 0
    );
    const fleetStats = calculateBattleStats(
      playerData.fleetWin || 0,
      playerData.fleetDraw || 0,
      playerData.fleetLoss || 0
    );

    const currentWinrates = {
      baseAttackWinrate: parseFloat(baseAttackStats.winratePercent) || 0,
      baseDefenceWinrate: parseFloat(baseDefenceStats.winratePercent) || 0,
      fleetWinrate: parseFloat(fleetStats.winratePercent) || 0
    };

    console.log('Calculated winrates:', currentWinrates);

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const searchYear = year || currentYear;

    if (searchYear === currentYear) {
      console.log(`Updating winrate stats for ${playerID} - ${currentMonth}/${currentYear}`);
      await updateWinrateStats(
        playerID,
        currentMonth,
        currentYear,
        currentWinrates
      );
    } else {
      console.log(`Viewing historical year ${searchYear}, not updating stats`);
    }

    const historicalStats = await getWinrateForUser(playerID, searchYear);
    console.log(`Fetched ${historicalStats.length} historical data points`);

    return {
      userId,
      playerData: {
        ...playerData,
        baseAttackStats,
        baseDefenceStats,
        fleetStats
      },
      avatarUrl,
      historicalStats,
      usernameHistory: userRecord.usernameHistory || []
    };
  } catch (error) {
    console.error('Error in fetchPlayerDetails:', error);
    throw new Error(`Failed to fetch player details: ${error.message}`);
  }
};