import { useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { FaTimes, FaSearch, FaExchangeAlt } from 'react-icons/fa';
import { fetchPlayerDetails } from '../services/api';
import { calculateBattleStats } from '../utils/statsUtil';
import type { PlayerData } from '../types';
import '../styles/PlayerComparison.css';

type SlotPlayer = PlayerData & { avatarUrl?: string };

type StatKey =
  | 'level' | 'medals' | 'planet' | 'totalBattles'
  | 'fleetWinrate' | 'fleetKD' | 'fleetBattles'
  | 'baseAttackWinrate' | 'baseAttackKD' | 'baseAttackBattles'
  | 'baseDefenceWinrate' | 'baseDefenceKD' | 'baseDefenceBattles';

const SLOTS = [0, 1, 2, 3] as const;

const getStatValue = (player: SlotPlayer | null | undefined, stat: StatKey): string => {
  if (!player) return '-';

  switch (stat) {
    case 'level': return String(player.level ?? '-');
    case 'medals': return player.medals?.toLocaleString() ?? '-';
    case 'planet': return player.planet ?? '-';
    case 'totalBattles': {
      const total =
        (player.fleetWin ?? 0) + (player.fleetDraw ?? 0) + (player.fleetLoss ?? 0) +
        (player.baseAttackWin ?? 0) + (player.baseAttackDraw ?? 0) + (player.baseAttackLoss ?? 0) +
        (player.baseDefenceWin ?? 0) + (player.baseDefenceDraw ?? 0) + (player.baseDefenceLoss ?? 0);
      return total.toLocaleString();
    }
    case 'fleetWinrate':
      return `${calculateBattleStats(player.fleetWin ?? 0, player.fleetDraw ?? 0, player.fleetLoss ?? 0).winratePercent}%`;
    case 'fleetKD':
      return calculateBattleStats(player.fleetWin ?? 0, player.fleetDraw ?? 0, player.fleetLoss ?? 0).kdRatio;
    case 'fleetBattles':
      return ((player.fleetWin ?? 0) + (player.fleetDraw ?? 0) + (player.fleetLoss ?? 0)).toLocaleString();
    case 'baseAttackWinrate':
      return `${calculateBattleStats(player.baseAttackWin ?? 0, player.baseAttackDraw ?? 0, player.baseAttackLoss ?? 0).winratePercent}%`;
    case 'baseAttackKD':
      return calculateBattleStats(player.baseAttackWin ?? 0, player.baseAttackDraw ?? 0, player.baseAttackLoss ?? 0).kdRatio;
    case 'baseAttackBattles':
      return ((player.baseAttackWin ?? 0) + (player.baseAttackDraw ?? 0) + (player.baseAttackLoss ?? 0)).toLocaleString();
    case 'baseDefenceWinrate':
      return `${calculateBattleStats(player.baseDefenceWin ?? 0, player.baseDefenceDraw ?? 0, player.baseDefenceLoss ?? 0).winratePercent}%`;
    case 'baseDefenceKD':
      return calculateBattleStats(player.baseDefenceWin ?? 0, player.baseDefenceDraw ?? 0, player.baseDefenceLoss ?? 0).kdRatio;
    case 'baseDefenceBattles':
      return ((player.baseDefenceWin ?? 0) + (player.baseDefenceDraw ?? 0) + (player.baseDefenceLoss ?? 0)).toLocaleString();
    default:
      return '-';
  }
};

const getNumericValue = (player: SlotPlayer | null | undefined, stat: StatKey): number => {
  const raw = getStatValue(player, stat);
  return parseFloat(raw.replace('%', '').replace(/,/g, '')) || 0;
};

const statCategories: { title: string; stats: { key: StatKey; label: string }[] }[] = [
  {
    title: 'General Stats',
    stats: [
      { key: 'level', label: 'Level' },
      { key: 'medals', label: 'Medals' },
      { key: 'planet', label: 'Planet' },
      { key: 'totalBattles', label: 'Total Battles' },
    ],
  },
  {
    title: 'Fleet vs Fleet',
    stats: [
      { key: 'fleetWinrate', label: 'Winrate' },
      { key: 'fleetKD', label: 'K/D Ratio' },
      { key: 'fleetBattles', label: 'Total Battles' },
    ],
  },
  {
    title: 'Base Attack',
    stats: [
      { key: 'baseAttackWinrate', label: 'Winrate' },
      { key: 'baseAttackKD', label: 'K/D Ratio' },
      { key: 'baseAttackBattles', label: 'Total Battles' },
    ],
  },
  {
    title: 'Base Defence',
    stats: [
      { key: 'baseDefenceWinrate', label: 'Winrate' },
      { key: 'baseDefenceKD', label: 'K/D Ratio' },
      { key: 'baseDefenceBattles', label: 'Total Battles' },
    ],
  },
];

const PlayerComparison = () => {
  const [playerIds, setPlayerIds] = useState<string[]>(['', '', '', '']);
  const [submittedIds, setSubmittedIds] = useState<(string | null)[]>([null, null, null, null]);
  const [inputErrors, setInputErrors] = useState<string[]>(['', '', '', '']);

  const results = useQueries({
    queries: SLOTS.map((i) => ({
      queryKey: ['comparison', submittedIds[i]],
      queryFn: ({ signal }: { signal: AbortSignal }) => fetchPlayerDetails(submittedIds[i]!, undefined, signal),
      enabled: !!submittedIds[i],
      retry: 1,
    })),
  });

  const handleSearch = (index: number) => {
    const id = playerIds[index].trim();
    if (!id) {
      const errs = [...inputErrors];
      errs[index] = 'Please enter a Player ID';
      setInputErrors(errs);
      return;
    }
    const ids = [...submittedIds];
    ids[index] = id;
    setSubmittedIds(ids);
    const errs = [...inputErrors];
    errs[index] = '';
    setInputErrors(errs);
  };

  const handleRemove = (index: number) => {
    const ids = [...submittedIds];
    ids[index] = null;
    setSubmittedIds(ids);
    const pids = [...playerIds];
    pids[index] = '';
    setPlayerIds(pids);
  };

  const handleInputChange = (index: number, value: string) => {
    const pids = [...playerIds];
    pids[index] = value;
    setPlayerIds(pids);
    const errs = [...inputErrors];
    errs[index] = '';
    setInputErrors(errs);
  };

  const getPlayerRank = (playerIndex: number, stat: StatKey): number | null => {
    const players = results.map(r => r.data ? { ...r.data.playerData, avatarUrl: r.data.avatarUrl } as SlotPlayer : null);
    const ranked = SLOTS
      .filter(i => !!players[i])
      .map(i => ({ i, val: getNumericValue(players[i], stat) }))
      .sort((a, b) => b.val - a.val);
    const entry = ranked.find(r => r.i === playerIndex);
    return entry ? ranked.indexOf(entry) + 1 : null;
  };

  const hasAnyPlayer = results.some(r => !!r.data);

  return (
    <div className="comparison-container">
      <div className="comparison-header">
        <FaExchangeAlt className="header-icon" />
        <h1>Player Comparison</h1>
        <p>Compare up to 4 players side-by-side</p>
      </div>

      <div className="player-inputs-grid">
        {SLOTS.map((index) => {
          const result = results[index];
          const player = result.data ? { ...result.data.playerData, avatarUrl: result.data.avatarUrl, playerId: String(result.data.userId) } as SlotPlayer : null;
          const isLoading = result.isLoading;
          const isError = result.isError;

          return (
            <div key={index} className="player-input-card">
              <div className="input-header">
                <span>Player {index + 1}</span>
                {player && (
                  <button onClick={() => handleRemove(index)} className="remove-button" aria-label="Remove player">
                    <FaTimes />
                  </button>
                )}
              </div>

              {!player ? (
                <>
                  <div className="search-input-group">
                    <input
                      type="text"
                      placeholder="Enter Player ID"
                      value={playerIds[index]}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch(index)}
                      className="player-id-input"
                    />
                    <button onClick={() => handleSearch(index)} disabled={isLoading} className="search-button">
                      {isLoading ? <div className="mini-spinner" /> : <FaSearch />}
                    </button>
                  </div>
                  {inputErrors[index] && <div className="error-message">{inputErrors[index]}</div>}
                  {isError && <div className="error-message">Failed to fetch player data</div>}
                </>
              ) : (
                <div className="player-preview">
                  <img src={player.avatarUrl} alt={player.alias} className="player-preview-avatar" loading="lazy" />
                  <div className="player-preview-info">
                    <div className="player-preview-name">{player.alias}</div>
                    <div className="player-preview-id">ID: {submittedIds[index]}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hasAnyPlayer && (
        <div className="comparison-table-container">
          {statCategories.map((category) => {
            const players = results.map(r => r.data ? { ...r.data.playerData, avatarUrl: r.data.avatarUrl } as SlotPlayer : null);
            return (
              <div key={category.title} className="stat-category">
                <h3 className="category-title">{category.title}</h3>
                <div className="comparison-table">
                  <div className="table-row header-row">
                    <div className="stat-label-cell">Stat</div>
                    {SLOTS.map((i) => (
                      <div key={i} className="player-cell">
                        {players[i] ? players[i]!.alias : '-'}
                      </div>
                    ))}
                  </div>
                  {category.stats.map((stat) => (
                    <div key={stat.key} className="table-row">
                      <div className="stat-label-cell">{stat.label}</div>
                      {SLOTS.map((i) => {
                        const rank = getPlayerRank(i, stat.key);
                        return (
                          <div
                            key={i}
                            className={`player-cell ${rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : rank === 4 ? 'rank-4' : ''}`}
                          >
                            {getStatValue(players[i], stat.key)}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!hasAnyPlayer && (
        <div className="empty-state">
          <FaSearch className="empty-icon" />
          <h3>No Players Added</h3>
          <p>Search for players to start comparing their stats</p>
        </div>
      )}
    </div>
  );
};

export default PlayerComparison;
