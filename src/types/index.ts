export type ThreatLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface SectorData {
  id: string;
  name: string;
  subName: string;
  region: string;
  state: string;
  boreholeId: string;
  locationCoord: string;
  currentRisk: number; // 0-100
  threatLevel: ThreatLevel;
  rain24h: number; // mm
  soilMoisture: number; // %
  slopeAngle: number; // degrees
  elevation: number; // meters
  vegetationNdvi: number; // 0-1
  pastSlidesCount: number;
  porePressure: number; // kPa
  aiConfidence: number; // %
  riskDelta1h: number;
  slopeShearDisp: number; // mm
  temp: number; // C
  dewPoint: number; // C
  humidity: number; // %
  windSpeed: number; // km/h
  windDir: string;
  recAction: string;
}

export interface IncidentEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  type: 'response' | 'incident' | 'warning' | 'model' | 'sensor' | 'weather';
  threatLevel?: ThreatLevel;
}

export interface SensorNode {
  id: string;
  code: string;
  type: 'Borehole Tiltmeter' | 'Piezometer' | 'TDR Strain' | 'Rain Gauge' | 'Acoustic Emission';
  location: string;
  depth: string;
  currentReading: string;
  unit: string;
  status: 'ONLINE' | 'WARNING' | 'ALERT' | 'OFFLINE';
  battery: number; // %
  signalStrength: number; // -dBm
  lastPing: string;
}

export interface EvacShelter {
  id: string;
  name: string;
  capacity: number;
  currentOccupancy: number;
  status: 'OPEN' | 'STANDBY' | 'FULL';
  coordinates: string;
  distanceKm: number;
  medicalStaff: boolean;
  generatorPower: boolean;
  contactOfficer: string;
}
