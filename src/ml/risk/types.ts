export interface RiskPredictionInputs {
  rainfallMm: number;
  soilMoisturePct: number;
  slopeDegrees: number;
  elevationMeters: number;
  vegetationNdvi: number;
  historicalLandslideCount: number;
}

export type RiskCategory = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface RiskFactorContribution {
  key: keyof RiskPredictionInputs;
  label: string;
  value: number;
  unit: string;
  contributionPoints: number;
  maximumPoints: number;
  explanation: string;
}

export interface RiskPrediction {
  score: number;
  category: RiskCategory;
  factors: RiskFactorContribution[];
  method: 'transparent-baseline-v1';
  dataStatus: 'mock-or-simulated';
  disclaimer: string;
}