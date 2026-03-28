import type { BattleStats } from '../types';

export function calculateBattleStats(wins: number, draws: number, losses: number): BattleStats {
  const validWins = Number(wins) || 0;
  const validDraws = Number(draws) || 0;
  const validLosses = Number(losses) || 0;

  const totalBattles = validWins + validDraws + validLosses;
  const winratePercent = totalBattles > 0 ? (validWins / totalBattles) * 100 : 0;

  let kdRatio: string;
  if (validLosses > 0) {
    kdRatio = (validWins / validLosses).toFixed(2);
  } else if (validWins > 0) {
    kdRatio = validWins.toFixed(2);
  } else {
    kdRatio = '0.00';
  }

  return {
    totalBattles,
    winratePercent: winratePercent.toFixed(2),
    kdRatio,
  };
}
