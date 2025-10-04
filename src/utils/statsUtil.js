/**
 * Calculate total battles and winrate percentage.
 * @param {number} wins - The number of wins.
 * @param {number} draws - The number of draws.
 * @param {number} losses - The number of losses.
 * @returns {Object} - An object with total battles and winrate percentage.
 */
export function calculateBattleStats(wins, draws, losses) {
  const validWins = Number(wins) || 0;
  const validDraws = Number(draws) || 0;
  const validLosses = Number(losses) || 0;

  const totalBattles = validWins + validDraws + validLosses;
  
  const winratePercent = totalBattles > 0 ? (validWins / totalBattles) * 100 : 0;

  let kdRatio;
  if (validLosses > 0) {
    kdRatio = (validWins / validLosses).toFixed(2);
  } else if (validWins > 0) {
    kdRatio = validWins.toFixed(2);
  } else {
    kdRatio = "0.00";
  }

  return {
    totalBattles,
    winratePercent: winratePercent.toFixed(2),
    kdRatio
  };
}