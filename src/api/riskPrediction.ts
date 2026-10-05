import { SectorData } from '../types';
import { RiskPrediction, RiskPredictionInputs } from '../ml/risk';

export interface RiskPredictionRequest {
  rainfall: number;
  soil_moisture: number;
  slope: number;
  elevation: number;
  ndvi: number;
  historical_landslides: number;
}

export interface ApiFactorContribution {
  name: string;
  contribution: number;
  explanation: string;
}

export interface RiskPredictionResponse {
  risk_score: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  factors: ApiFactorContribution[];
  model_status: 'baseline';
}

const API_BASE_URL = import.meta.env.VITE_RISK_API_URL ?? 'http://127.0.0.1:8000';
const PREDICT_URL = `${API_BASE_URL}/api/predict`;

const FACTOR_METADATA: Record<string, { key: keyof RiskPredictionInputs; unit: string; maximumPoints: number }> = {
  Rainfall: { key: 'rainfallMm', unit: 'mm / 24h', maximumPoints: 28 },
  'Soil moisture': { key: 'soilMoisturePct', unit: '%', maximumPoints: 22 },
  Slope: { key: 'slopeDegrees', unit: 'degrees', maximumPoints: 18 },
  Elevation: { key: 'elevationMeters', unit: 'm', maximumPoints: 6 },
  'Vegetation cover (NDVI)': { key: 'vegetationNdvi', unit: 'NDVI', maximumPoints: 12 },
  'Historical landslides': { key: 'historicalLandslideCount', unit: 'events', maximumPoints: 14 },
};

export function sectorToPredictionRequest(
  sector: SectorData,
  rainfall = sector.rain24h,
): RiskPredictionRequest {
  return {
    rainfall,
    soil_moisture: sector.soilMoisture,
    slope: sector.slopeAngle,
    elevation: sector.elevation,
    ndvi: sector.vegetationNdvi,
    historical_landslides: sector.pastSlidesCount,
  };
}

function isPredictionResponse(value: unknown): value is RiskPredictionResponse {
  if (!value || typeof value !== 'object') return false;
  const response = value as Partial<RiskPredictionResponse>;
  const allowedLevels = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];
  return Number.isInteger(response.risk_score)
    && response.risk_score! >= 0
    && response.risk_score! <= 100
    && allowedLevels.includes(response.risk_level ?? '')
    && response.model_status === 'baseline'
    && Array.isArray(response.factors)
    && response.factors.length === 6
    && response.factors.every((factor) => (
      typeof factor?.name === 'string'
      && typeof factor?.contribution === 'number'
      && typeof factor?.explanation === 'string'
    ));
}

export async function requestRiskPrediction(
  request: RiskPredictionRequest,
  signal?: AbortSignal,
): Promise<RiskPredictionResponse> {
  let response: Response;
  try {
    response = await fetch(PREDICT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new Error(`Risk API is unavailable at ${PREDICT_URL}. Start the FastAPI backend and try again.`);
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = payload && typeof payload === 'object' && 'detail' in payload
      ? JSON.stringify(payload.detail)
      : `HTTP ${response.status}`;
    throw new Error(`Risk API rejected the request: ${detail}`);
  }

  if (!isPredictionResponse(payload)) {
    throw new Error('Risk API returned a response that does not match the expected baseline contract.');
  }

  return payload;
}

export function toRiskPrediction(
  response: RiskPredictionResponse,
  request: RiskPredictionRequest,
): RiskPrediction {
  const values: RiskPredictionInputs = {
    rainfallMm: request.rainfall,
    soilMoisturePct: request.soil_moisture,
    slopeDegrees: request.slope,
    elevationMeters: request.elevation,
    vegetationNdvi: request.ndvi,
    historicalLandslideCount: request.historical_landslides,
  };

  return {
    score: response.risk_score,
    category: response.risk_level,
    factors: response.factors.map((factor) => {
      const metadata = FACTOR_METADATA[factor.name];
      if (!metadata) throw new Error(`Unknown factor returned by risk API: ${factor.name}`);
      return {
        key: metadata.key,
        label: factor.name,
        value: values[metadata.key],
        unit: metadata.unit,
        contributionPoints: factor.contribution,
        maximumPoints: metadata.maximumPoints,
        explanation: factor.explanation,
      };
    }),
    method: 'transparent-baseline-v1',
    dataStatus: 'mock-or-simulated',
    disclaimer: 'Baseline heuristic risk index, not a trained model or validated landslide probability. Sector inputs are sample data; no external environmental data source is connected.',
  };
}
