import { getRiskCategory } from './thresholds';
import { RiskPrediction, RiskPredictionInputs } from './types';

const FACTOR_WEIGHTS = {
  rainfallMm: 28,
  soilMoisturePct: 22,
  slopeDegrees: 18,
  elevationMeters: 6,
  vegetationNdvi: 12,
  historicalLandslideCount: 14,
} satisfies Record<keyof RiskPredictionInputs, number>;

const INPUT_RANGES: Record<keyof RiskPredictionInputs, { min: number; max: number }> = {
  rainfallMm: { min: 0, max: 250 },
  soilMoisturePct: { min: 0, max: 100 },
  slopeDegrees: { min: 0, max: 45 },
  elevationMeters: { min: 0, max: 3000 },
  vegetationNdvi: { min: 0, max: 1 },
  historicalLandslideCount: { min: 0, max: 15 },
};

const FACTOR_DETAILS: Record<keyof RiskPredictionInputs, { label: string; unit: string; rationale: string }> = {
  rainfallMm: { label: 'Rainfall', unit: 'mm / 24h', rationale: 'Higher rainfall is assigned more index points within the prototype operating range.' },
  soilMoisturePct: { label: 'Soil moisture', unit: '%', rationale: 'Higher soil moisture is assigned more index points within the prototype range.' },
  slopeDegrees: { label: 'Slope', unit: 'degrees', rationale: 'Steeper slopes are assigned more index points within the prototype range.' },
  elevationMeters: { label: 'Elevation', unit: 'm', rationale: 'Elevation is a low-weight, provisional proxy; its relationship to risk requires local calibration.' },
  vegetationNdvi: { label: 'Vegetation cover (NDVI)', unit: 'NDVI', rationale: 'Lower NDVI is assigned more index points as a simple proxy for reduced vegetation cover.' },
  historicalLandslideCount: { label: 'Historical landslides', unit: 'events', rationale: 'More recorded past events are assigned more index points within the prototype range.' },
};

function boundedInput(key: keyof RiskPredictionInputs, value: number): number {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${key} must be a finite number.`);
  }

  const { min, max } = INPUT_RANGES[key];
  return Math.min(max, Math.max(min, value));
}

function normalize(value: number, min: number, max: number): number {
  return (value - min) / (max - min);
}

/**
 * Produces an unvalidated heuristic risk index, not a calibrated probability.
 * Inputs are clamped to prototype ranges and weighted points are fully inspectable.
 */
export function predictBaselineRisk(inputs: RiskPredictionInputs): RiskPrediction {
  const values: RiskPredictionInputs = {
    rainfallMm: boundedInput('rainfallMm', inputs.rainfallMm),
    soilMoisturePct: boundedInput('soilMoisturePct', inputs.soilMoisturePct),
    slopeDegrees: boundedInput('slopeDegrees', inputs.slopeDegrees),
    elevationMeters: boundedInput('elevationMeters', inputs.elevationMeters),
    vegetationNdvi: boundedInput('vegetationNdvi', inputs.vegetationNdvi),
    historicalLandslideCount: boundedInput('historicalLandslideCount', inputs.historicalLandslideCount),
  };

  const riskFractions: Record<keyof RiskPredictionInputs, number> = {
    rainfallMm: normalize(values.rainfallMm, 0, 250),
    soilMoisturePct: normalize(values.soilMoisturePct, 0, 100),
    slopeDegrees: normalize(values.slopeDegrees, 0, 45),
    elevationMeters: normalize(values.elevationMeters, 0, 3000),
    vegetationNdvi: 1 - normalize(values.vegetationNdvi, 0, 1),
    historicalLandslideCount: normalize(values.historicalLandslideCount, 0, 15),
  };

  const factors = (Object.keys(FACTOR_WEIGHTS) as Array<keyof RiskPredictionInputs>).map((key) => {
    const weight = FACTOR_WEIGHTS[key];
    const details = FACTOR_DETAILS[key];
    const contributionPoints = Number((riskFractions[key] * weight).toFixed(1));
    const value = values[key];
    const explanation = key === 'vegetationNdvi'
      ? `${details.rationale} Current NDVI ${value.toFixed(2)} contributes ${contributionPoints} of ${weight} possible points.`
      : `${details.rationale} Current value ${value} ${details.unit} contributes ${contributionPoints} of ${weight} possible points.`;

    return {
      key,
      label: details.label,
      value,
      unit: details.unit,
      contributionPoints,
      maximumPoints: weight,
      explanation,
    };
  });

  const score = Math.min(100, Math.max(0, Math.round(factors.reduce(
    (total, factor) => total + factor.contributionPoints,
    0,
  ))));

  return {
    score,
    category: getRiskCategory(score),
    factors,
    method: 'transparent-baseline-v1',
    dataStatus: 'mock-or-simulated',
    disclaimer: 'Prototype heuristic risk index, not a validated landslide probability. Inputs are mock or simulated; thresholds and weights require domain review and local validation.',
  };
}