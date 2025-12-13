import axios from 'axios';
import { calculateBattleStats } from '../utils/statsUtil';

const USER_GAME_API_URL = process.env.REACT_APP_USER_GAME_API_URL;
const STATS_API_URL = process.env.REACT_APP_STATS_API_URL;
const KIXEYE_AVATAR_API_URL = process.env.REACT_APP_KIXEYE_AVATAR_API_URL;
const GAME_ID = process.env.REACT_APP_GAME_ID;

const callBackendProxy = async (endpoint, method = 'GET', data = null, params = null) => {
  try {
    const config = {
      method,
      url: `/api/${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (params) {
      config.params = params;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error calling backend proxy ${endpoint}:`, error);
    throw error;
  }
};

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
    const getResponse = await callBackendProxy('getUser', 'GET', null, {
      userId: playerID
    });

    const existingHistory = getResponse.usernameHistory || [];

    if (!existingHistory.includes(currentUsername)) {
      await updateUsernameHistory(playerID, currentUsername);

      const updatedResponse = await callBackendProxy('getUser', 'GET', null, {
        userId: playerID
      });
      return updatedResponse;
    }

    return getResponse;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log(`User ${playerID} not found in database. Creating new user...`);
      try {
        const createResponse = await callBackendProxy('createUser', 'POST', {
          id: parseInt(playerID),
          usernameHistory: currentUsername
        });

        console.log(`Successfully created user ${playerID} with username: ${currentUsername}`);
        return createResponse;
      } catch (createError) {
        console.error('Error creating user:', createError);
        console.error('Create error response:', createError.response?.data);

        return {
          id: parseInt(playerID),
          usernameHistory: [currentUsername],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
    }

    console.error('Error fetching user:', error);
    console.error('Error response:', error.response?.data);

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
    const response = await callBackendProxy('updateUser', 'PUT', {
      usernameHistory: newUsername
    }, {
      userId: playerID
    });
    return response;
  } catch (error) {
    console.error('Error updating username history:', error);
    throw error;
  }
};

export const getWinrateForUser = async (userId, year) => {
  try {
    const response = await callBackendProxy('getWinrate', 'GET', null, {
      userId,
      year
    });
    return Array.isArray(response) ? response : [];
  } catch (error) {
    if (error.response && error.response.status === 404) {
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

    console.log('Sending winrate data to backend:', sanitizedData);

    const response = await callBackendProxy('updateWinrate', 'POST', sanitizedData);
    return response;
  } catch (error) {
    console.error('Error updating winrate stats:', error);
    console.error('Winrate error response:', error.response?.data);
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

    console.log('Fetching leaderboard with params:', params);

    const response = await callBackendProxy('getLeaderboard', 'GET', null, params);
    return response;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    if (error.response && error.response.status === 400) {
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
    console.error('Error details:', error.response?.data || error.message);
    throw new Error(`Failed to fetch player details: ${error.response?.data?.title || error.message}`);
  }
};