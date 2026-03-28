import { describe, it, expect } from 'vitest';
import { calculateBattleStats } from '../utils/statsUtil';

describe('calculateBattleStats', () => {
  it('calculates winrate correctly', () => {
    const result = calculateBattleStats(7, 1, 2);
    expect(result.totalBattles).toBe(10);
    expect(result.winratePercent).toBe('70.00');
  });

  it('returns zero winrate when no battles', () => {
    const result = calculateBattleStats(0, 0, 0);
    expect(result.totalBattles).toBe(0);
    expect(result.winratePercent).toBe('0.00');
    expect(result.kdRatio).toBe('0.00');
  });

  it('calculates kd ratio wins/losses', () => {
    const result = calculateBattleStats(10, 0, 5);
    expect(result.kdRatio).toBe('2.00');
  });

  it('uses wins as kd when no losses', () => {
    const result = calculateBattleStats(5, 0, 0);
    expect(result.kdRatio).toBe('5.00');
  });

  it('handles non-numeric inputs gracefully', () => {
    // @ts-expect-error — intentional invalid input
    const result = calculateBattleStats(undefined, null, NaN);
    expect(result.totalBattles).toBe(0);
    expect(result.winratePercent).toBe('0.00');
    expect(result.kdRatio).toBe('0.00');
  });

  it('caps winrate at 100% when all wins', () => {
    const result = calculateBattleStats(100, 0, 0);
    expect(parseFloat(result.winratePercent)).toBe(100);
  });

  it('includes draws in total battles but not wins', () => {
    const result = calculateBattleStats(5, 5, 0);
    expect(result.totalBattles).toBe(10);
    expect(result.winratePercent).toBe('50.00');
  });
});
