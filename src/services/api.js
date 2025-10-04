import axios from 'axios';
import { calculateBattleStats } from '../utils/statsUtil';

const USER_GAME_API_URL = process.env.REACT_APP_USER_GAME_API_URL;
const STATS_API_URL = process.env.REACT_APP_STATS_API_URL;
const KIXEYE_AVATAR_API_URL = process.env.REACT_APP_KIXEYE_AVATAR_API_URL;
const GAME_ID = process.env.REACT_APP_GAME_ID;

const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;
const API_SECRET = process.env.REACT_APP_API_SECRET;

const getHeaders = () => ({
  'X-API-Key': API_SECRET,
  'Content-Type': 'application/json'
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
    const getResponse = await axios.get(
      `${BACKEND_API_URL}/api/Users/GetUser/${playerID}`,
      { headers: getHeaders() }
    );
    
    const existingHistory = getResponse.data.usernameHistory || [];
    
    if (!existingHistory.includes(currentUsername)) {
      await updateUsernameHistory(playerID, currentUsername);
      
      const updatedResponse = await axios.get(
        `${BACKEND_API_URL}/api/Users/GetUser/${playerID}`,
        { headers: getHeaders() }
      );
      return updatedResponse.data;
    }
    
    return getResponse.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      try {
        const createResponse = await axios.post(
          `${BACKEND_API_URL}/api/Users/CreateUser`,
          {
            id: playerID,
            usernameHistory: currentUsername
          },
          { headers: getHeaders() }
        );
        return createResponse.data;
      } catch (createError) {
        console.error('Error creating user:', createError);
        throw createError;
      }
    }
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const updateUsernameHistory = async (playerID, newUsername) => {
  try {
    const response = await axios.put(
      `${BACKEND_API_URL}/api/Users/UpdateUser/${playerID}`,
      {
        usernameHistory: newUsername
      },
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating username history:', error);
    throw error;
  }
};

export const getWinrateForUser = async (userId, year) => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/api/Winrate/GetWinrateForUser`,
      {
        params: { userId, year },
        headers: getHeaders()
      }
    );
    return Array.isArray(response.data) ? response.data : [];
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
      userId,
      month,
      year,
      baseAttackWinrate: winrateData.baseAttackWinrate ?? 0,
      baseDefenceWinrate: winrateData.baseDefenceWinrate ?? 0,
      fleetWinrate: winrateData.fleetWinrate ?? 0
    };

    console.log('Sending winrate data to backend:', sanitizedData);

    const response = await axios.post(
      `${BACKEND_API_URL}/api/Winrate/UpdateWinrate`,
      sanitizedData,
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating winrate stats:', error);
    throw error;
  }
};

export const fetchPlayerDetails = async (playerID, year) => {
  try {
    const userId = await fetchUserId(playerID);
    const playerData = await fetchPlayerStats(userId);
    const avatarUrl = await fetchUserAvatar(userId);

    console.log(`Fetched player data for ID ${playerID}, current username: ${playerData.alias}`);

    const userRecord = await createOrGetUser(playerID, playerData.alias);
    
    console.log('Username history after update:', userRecord.usernameHistory);

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

    return {
      userId,
      playerData: {
        ...playerData,
        baseAttackStats,
        baseDefenceStats,
        fleetStats,
      },
      avatarUrl,
      historicalStats,
      usernameHistory: userRecord.usernameHistory || []
    };
  } catch (error) {
    console.error('Error fetching player details:', error);
    throw error;
  }
};
