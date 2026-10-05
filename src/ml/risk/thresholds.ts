import { RiskCategory } from './types';

export const RISK_THRESHOLDS = {
  moderate: 25,
  high: 50,
  critical: 75,
} as const;

export function getRiskCategory(score: number): RiskCategory {
  if (score >= RISK_THRESHOLDS.critical) return 'CRITICAL';
  if (score >= RISK_THRESHOLDS.high) return 'HIGH';
  if (score >= RISK_THRESHOLDS.moderate) return 'MODERATE';
  return 'LOW';
}