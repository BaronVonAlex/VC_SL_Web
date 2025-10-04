import React from 'react';
import { calculateBattleStats } from '../utils/statsUtil';

const getPlayerStat = (data, statName, defaultValue = 0) => {
  return data[statName] !== undefined ? data[statName] : defaultValue;
};

const CombatStats = ({ playerData }) => {
  const baseAttackStats = calculateBattleStats(
    getPlayerStat(playerData, 'baseAttackWin'),
    getPlayerStat(playerData, 'baseAttackDraw'),
    getPlayerStat(playerData, 'baseAttackLoss')
  );

  const baseDefenceStats = calculateBattleStats(
    getPlayerStat(playerData, 'baseDefenceWin'),
    getPlayerStat(playerData, 'baseDefenceDraw'),
    getPlayerStat(playerData, 'baseDefenceLoss')
  );

  const fleetStats = calculateBattleStats(
    getPlayerStat(playerData, 'fleetWin'),
    getPlayerStat(playerData, 'fleetDraw'),
    getPlayerStat(playerData, 'fleetLoss')
  );

  return (
    <div className="combat-stats">
      {['Fleet vs Fleet', 'Base Attack', 'Base Defence'].map((stat, index) => {
        let wins, draws, losses, totalBattles;
        if (stat === 'Fleet vs Fleet') {
          wins = getPlayerStat(playerData, 'fleetWin');
          draws = getPlayerStat(playerData, 'fleetDraw');
          losses = getPlayerStat(playerData, 'fleetLoss');
          totalBattles = fleetStats.totalBattles;
        } else if (stat === 'Base Attack') {
          wins = getPlayerStat(playerData, 'baseAttackWin');
          draws = getPlayerStat(playerData, 'baseAttackDraw');
          losses = getPlayerStat(playerData, 'baseAttackLoss');
          totalBattles = baseAttackStats.totalBattles;
        } else if (stat === 'Base Defence') {
          wins = getPlayerStat(playerData, 'baseDefenceWin');
          draws = getPlayerStat(playerData, 'baseDefenceDraw');
          losses = getPlayerStat(playerData, 'baseDefenceLoss');
          totalBattles = baseDefenceStats.totalBattles;
        }

        return (
          <div key={index} className="combat-bar">
            <h4>{stat}</h4>
            <div className="winrate-kd">
              <p><strong>Winrate:</strong> {stat === 'Fleet vs Fleet' ? fleetStats.winratePercent : stat === 'Base Attack' ? baseAttackStats.winratePercent : baseDefenceStats.winratePercent}%</p>
              <p><strong>K/D:</strong> {stat === 'Fleet vs Fleet' ? fleetStats.kdRatio : stat === 'Base Attack' ? baseAttackStats.kdRatio : baseDefenceStats.kdRatio}</p>
            </div>
            <div className="battle-breakdown">
              <div className="win">{wins} <span className="green-bar"></span></div>
              <div className="draw">{draws} <span className="yellow-bar"></span></div>
              <div className="loss">{losses} <span className="red-bar"></span></div>
            </div>

            <div className="total">{totalBattles} <span className="blue-bar"></span></div>
          </div>
        );
      })}
    </div>
  );
};

export default CombatStats;
