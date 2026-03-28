// ── API / Domain types ──────────────────────────────────────────────────────

export interface BattleStats {
  totalBattles: number;
  winratePercent: string;
  kdRatio: string;
}

export interface PlayerData {
  playerId: number;
  alias: string;
  level: number;
  medals: number;
  planet: string;
  since: string;
  seen: string;
  avatarUrl?: string;
  // Raw battle counts from KIXEYE API
  fleetWin: number;
  fleetDraw: number;
  fleetLoss: number;
  baseAttackWin: number;
  baseAttackDraw: number;
  baseAttackLoss: number;
  baseDefenceWin: number;
  baseDefenceDraw: number;
  baseDefenceLoss: number;
  // Computed stats added by fetchPlayerDetails
  baseAttackStats: BattleStats;
  baseDefenceStats: BattleStats;
  fleetStats: BattleStats;
}

export interface WinrateEntry {
  month: number;
  year: number;
  userId: number;
  fleetWinrate: number;
  baseAttackWinrate: number;
  baseDefenceWinrate: number;
}

export interface PlayerDetails {
  userId: number;
  playerData: PlayerData;
  avatarUrl: string | undefined;
  historicalStats: WinrateEntry[];
  usernameHistory: string[];
}

export interface LeaderboardEntry {
  userId: number;
  username: string;
  rank: number;
  winrate: number;
  monthsPlayed: number;
}

export interface LeaderboardFilters {
  period: number;
  category: number;
  month: number;
  year: number;
  limit: number;
  minimumMonths: number;
}

export interface Favorite {
  id: number;
  name: string;
  addedAt: number;
}
