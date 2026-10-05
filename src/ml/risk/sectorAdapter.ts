import { SectorData } from '../../types';
import { RiskPredictionInputs } from './types';

export function sectorToRiskInputs(sector: SectorData, rainfallMm = sector.rain24h): RiskPredictionInputs {
  return {
    rainfallMm,
    soilMoisturePct: sector.soilMoisture,
    slopeDegrees: sector.slopeAngle,
    elevationMeters: sector.elevation,
    vegetationNdvi: sector.vegetationNdvi,
    historicalLandslideCount: sector.pastSlidesCount,
  };
}