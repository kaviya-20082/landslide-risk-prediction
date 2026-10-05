import React, { useEffect, useState } from 'react';
import { SectorData, IncidentEvent } from '../types';
import { RiskPrediction } from '../ml/risk';
import { requestRiskPrediction, sectorToPredictionRequest, toRiskPrediction } from '../api/riskPrediction';
import { SECTORS_DATA } from '../data/mockData';

const DEMO_MAP_LOCATIONS = Object.values(SECTORS_DATA).map((sector, index) => ({
  ...sector,
  mapPosition: [
    { top: '39%', left: '55%' },
    { top: '25%', left: '31%' },
    { top: '58%', left: '27%' },
    { top: '65%', left: '71%' },
    { top: '28%', left: '83%' },
  ][index],
}));

function riskMarkerColor(level: RiskPrediction['category'] | undefined): string {
  switch (level) {
    case 'LOW': return '#4edea3';
    case 'MODERATE': return '#ffb95f';
    case 'HIGH': return '#ee9800';
    case 'CRITICAL': return '#ff7a73';
    default: return '#86948a';
  }
}

interface DashboardViewProps {
  sector: SectorData;
  prediction: RiskPrediction | null;
  predictionLoading: boolean;
  predictionError: string | null;
  onSelectSector: (sectorId: string) => void;
  incidents: IncidentEvent[];
  onOpenEocPlan: () => void;
  onOpenRiskDetails: () => void;
  onOpenForecast: () => void;
  onOpenDecisionSupport: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sector,
  prediction,
  predictionLoading,
  predictionError,
  onSelectSector,
  incidents,
  onOpenEocPlan,
  onOpenRiskDetails,
  onOpenForecast,
  onOpenDecisionSupport,
}) => {
  // Simulator State
  const [simRain, setSimRain] = useState<number>(180);
  const [acknowledged, setAcknowledged] = useState<boolean>(false);
  const [mapLayer, setMapLayer] = useState<'standard' | 'contours' | 'saturation'>('standard');
  const [mapZoom, setMapZoom] = useState<number>(1);
  const [hoveredTrendPoint, setHoveredTrendPoint] = useState<string | null>(null);
  const [scenarioPrediction, setScenarioPrediction] = useState<RiskPrediction | null>(null);
  const [isScenarioLoading, setIsScenarioLoading] = useState<boolean>(false);
  const [scenarioError, setScenarioError] = useState<string | null>(null);
  const [scenarioRefresh, setScenarioRefresh] = useState<number>(0);
  const [mapPredictions, setMapPredictions] = useState<Record<string, RiskPrediction | null>>({});
  const [isMapLoading, setIsMapLoading] = useState<boolean>(false);
  const [selectedMapLocationId, setSelectedMapLocationId] = useState<string>(sector.id);

  useEffect(() => {
    setSelectedMapLocationId(sector.id);
  }, [sector.id]);

  useEffect(() => {
    const controller = new AbortController();
    setMapPredictions({});
    setIsMapLoading(true);

    Promise.all(DEMO_MAP_LOCATIONS.map(async (location) => {
      const request = sectorToPredictionRequest(location);
      try {
        const response = await requestRiskPrediction(request, controller.signal);
        return [location.id, toRiskPrediction(response, request)] as const;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') throw error;
        return [location.id, null] as const;
      }
    }))
      .then((results) => setMapPredictions(Object.fromEntries(results)))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setMapPredictions(Object.fromEntries(DEMO_MAP_LOCATIONS.map((location) => [location.id, null])));
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsMapLoading(false);
      });

    return () => controller.abort();
  }, []);

  const selectedMapLocation = DEMO_MAP_LOCATIONS.find((location) => location.id === selectedMapLocationId) ?? sector;
  const selectedMapPrediction = selectedMapLocation.id === sector.id
    ? prediction ?? mapPredictions[selectedMapLocation.id] ?? null
    : mapPredictions[selectedMapLocation.id] ?? null;

  useEffect(() => {
    setSimRain(sector.rain24h);
  }, [sector.id, sector.rain24h]);

  useEffect(() => {
    const controller = new AbortController();
    const request = sectorToPredictionRequest(sector, simRain);

    setScenarioPrediction(null);
    setScenarioError(null);
    setIsScenarioLoading(true);

    const delay = window.setTimeout(() => {
      requestRiskPrediction(request, controller.signal)
        .then((response) => setScenarioPrediction(toRiskPrediction(response, request)))
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === 'AbortError') return;
          setScenarioError(error instanceof Error ? error.message : 'Scenario prediction failed.');
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsScenarioLoading(false);
        });
    }, 250);

    return () => {
      window.clearTimeout(delay);
      controller.abort();
    };
  }, [sector, simRain, scenarioRefresh]);

  const simRiskScore = scenarioPrediction?.score ?? null;
  const deltaVal = simRiskScore !== null && prediction ? simRiskScore - prediction.score : null;
  const leadingFactor = prediction?.factors.reduce((highest, factor) => (
    factor.contributionPoints > highest.contributionPoints ? factor : highest
  ), prediction.factors[0]);
  const factorColors = ['#ff7a73', '#ffb95f', '#ee9800', '#4edea3', '#86948a', '#bbcabf'];
  const illustrativeScenarios = [
    { time: 'NOW', rainfallMm: sector.rain24h },
    { time: '+6h', rainfallMm: Math.min(250, sector.rain24h + 25) },
    { time: '+12h', rainfallMm: Math.min(250, sector.rain24h + 45) },
    { time: '+24h', rainfallMm: Math.max(0, sector.rain24h - 25) },
  ];
  const riskStatus = {
    tag: scenarioPrediction?.category ?? 'UNAVAILABLE',
    label: scenarioPrediction ? `${scenarioPrediction.category} RISK INDEX` : 'PREDICTION UNAVAILABLE',
    color: scenarioPrediction?.category === 'CRITICAL' || scenarioPrediction?.category === 'HIGH'
      ? 'text-[#ff7a73]'
      : scenarioPrediction?.category === 'MODERATE'
      ? 'text-[#ffb95f]'
      : 'text-[#4edea3]',
  };

  const handleRunBaseline = () => setScenarioRefresh((value) => value + 1);

  const handleResetSim = () => {
    setSimRain(sector.rain24h);
  };

  const handleAcknowledge = () => {
    setAcknowledged(!acknowledged);
  };

  return (
    <div className="flex flex-col w-full text-[#dfe2ee] pb-16 font-mono">
      
      {/* 1. Header & Region Context */}
      <div className="px-3 pt-2 pb-1 flex flex-col gap-1.5 max-w-7xl mx-auto w-full">
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <span className="font-headline text-[20px] font-bold text-[#dfe2ee] tracking-tight">
              Landslide Risk Command Center
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#262a33] text-[#4edea3] text-[9px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse"></span>
              SYS ACTIVE
            </span>
          </div>
          <p className="text-[11px] text-[#bbcabf] font-sans">
            Sample environmental inputs &amp; transparent baseline risk assessment
          </p>
        </div>

        {/* Live indicator info strip */}
          <div className="flex items-center justify-between text-[9px] text-[#bbcabf] bg-[#181c24] px-2 py-1 rounded border border-[#262a33]">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[13px] text-[#4edea3]">sensors</span>
            <span>DATA MODE: SAMPLE SECTOR RECORD</span>
          </div>
          <span className="text-[#86948a]">BASELINE HEURISTIC · NOT LIVE</span>
        </div>

        {/* Quick Switcher Chips */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 no-scrollbar">
          {[
            { id: 'valparai', label: 'Valparai, TN' },
            { id: 'munnar', label: 'Munnar, KL' },
            { id: 'kodaikanal', label: 'Kodaikanal, TN' },
            { id: 'wayanad', label: 'Wayanad, KL' },
            { id: 'darjeeling', label: 'Darjeeling, WB' }
          ].map((item) => {
            const isSelected = sector.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectSector(item.id)}
                className={`flex-shrink-0 px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#4edea3] text-[#003824] shadow-sm'
                    : 'bg-[#262a33] text-[#dfe2ee] hover:bg-[#31353e]'
                }`}
              >
                {isSelected && <span className="material-symbols-outlined text-[12px]">location_on</span>}
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Critical Early Warning Banner */}
      <div className="px-3 py-1 max-w-7xl mx-auto w-full">
        <div className="bg-[#93000a] text-[#ffdad6] rounded-xl p-3 flex flex-col gap-2 shadow-xl border border-[#ff7a73]/40">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px] text-[#ffb4ab] animate-bounce">warning</span>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-[#ffb4ab] font-bold">
                  Model Status: Baseline · {prediction ? prediction.category : predictionLoading ? 'Loading' : 'Unavailable'}
                </div>
                <div className="font-headline text-[15px] font-bold leading-tight text-white">
                  {prediction ? `${prediction.category} RISK INDEX` : predictionLoading ? 'LOADING BASELINE RISK INDEX' : 'RISK INDEX UNAVAILABLE'}
                </div>
              </div>
            </div>
            <div className="px-2 py-0.5 rounded bg-[#690005] border border-[#ff7a73]/50 text-[#ffdad6] text-[11px] font-bold tracking-widest uppercase">
              {prediction ? `${prediction.score}/100 INDEX` : predictionLoading ? 'LOADING' : 'UNAVAILABLE'}
            </div>
          </div>

          <div className="text-[11px] text-[#ffdad6]/90 leading-relaxed">
            <strong className="text-white font-bold">{sector.region}: </strong>
            Severe shear-plane instability detected via borehole tiltmeters &amp; acoustic pore telemetry.
          </div>

          <div className="grid grid-cols-3 gap-1 bg-[#0a0e16]/60 p-2 rounded border border-black/20">
            <div className="flex flex-col text-center">
              <span className="text-[9px] text-[#86948a] uppercase">PRECIPITATION</span>
              <span className="text-[12px] font-bold text-[#ffb4ab]">{sector.rain24h} mm</span>
            </div>
            <div className="flex flex-col text-center">
              <span className="text-[9px] text-[#86948a] uppercase">SOIL SATURATION</span>
              <span className="text-[12px] font-bold text-[#ffb4ab]">{sector.soilMoisture}%</span>
            </div>
            <div className="flex flex-col text-center">
              <span className="text-[9px] text-[#86948a] uppercase">SLOPE ANGLE</span>
              <span className="text-[12px] font-bold text-[#ffb4ab]">{sector.slopeAngle}° STEEP</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[9px] text-[#ffdad6]/80">
            <span className="material-symbols-outlined text-[13px] text-[#ffb4ab]">shield</span>
            <span>REC: {sector.recAction}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button 
              onClick={handleAcknowledge}
              className={`font-bold uppercase py-2 px-3 rounded text-center text-[11px] transition cursor-pointer active:opacity-80 shadow-md ${
                acknowledged 
                  ? 'bg-[#1c2028] border border-[#4edea3] text-[#4edea3]' 
                  : 'bg-[#ffb4ab] text-[#690005] hover:bg-white'
              }`}
            >
              {acknowledged ? '✓ ACKNOWLEDGED' : 'Acknowledge'}
            </button>
            <button 
              onClick={onOpenEocPlan}
              className="bg-[#262a33] text-white hover:bg-[#31353e] font-bold uppercase py-2 px-3 rounded text-center text-[11px] transition cursor-pointer border border-[#3c4a42]"
            >
              View EOC Plan
            </button>
          </div>
        </div>
      </div>

      {/* 3. Top Statistics Grid (2x3 Tactical Telemetry) */}
      <div className="px-3 py-1 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {/* Stat 1 */}
          <div className="bg-[#1c2028] border border-[#262a33] p-2.5 rounded flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-[#86948a]">
              <span className="text-[9px] uppercase tracking-wider">Baseline Risk Index</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff7a73]"></span>
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="font-headline text-[22px] font-bold text-[#ff7a73]">{prediction?.score ?? '--'}</span>
              <span className="text-[9px] text-[#ff7a73] font-bold uppercase">{prediction?.category ?? (predictionLoading ? 'LOADING' : 'UNAVAILABLE')}</span>
            </div>
            <div className="text-[9px] text-[#ffb3ad] flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[11px]">arrow_upward</span>
              <span>Prototype heuristic · sample inputs</span>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="bg-[#1c2028] border border-[#262a33] p-2.5 rounded flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-[#86948a]">
              <span className="text-[9px] uppercase tracking-wider">Active Alerts</span>
              <span className="material-symbols-outlined text-[13px] text-[#ffb3ad]">campaign</span>
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="font-headline text-[22px] font-bold text-[#dfe2ee]">3</span>
              <span className="text-[9px] text-[#bbcabf] font-bold uppercase">SECTORS</span>
            </div>
            <div className="text-[9px] text-[#ffb3ad]">
              1 Critical • 2 High Watch
            </div>
          </div>

          {/* Stat 3 */}
          <div className="bg-[#1c2028] border border-[#262a33] p-2.5 rounded flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-[#86948a]">
              <span className="text-[9px] uppercase tracking-wider">High Risk Zones</span>
              <span className="material-symbols-outlined text-[13px] text-[#ffb95f]">explore</span>
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="font-headline text-[22px] font-bold text-[#ffb95f]">7</span>
              <span className="text-[9px] text-[#bbcabf] font-bold uppercase">ZONES</span>
            </div>
            <div className="text-[9px] text-[#bbcabf]">
              Across 42 monitored km²
            </div>
          </div>

          {/* Stat 4 */}
          <div className="bg-[#1c2028] border border-[#262a33] p-2.5 rounded flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-[#86948a]">
              <span className="text-[9px] uppercase tracking-wider">24h Precip</span>
              <span className="material-symbols-outlined text-[13px] text-[#4edea3]">rainy</span>
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="font-headline text-[22px] font-bold text-[#4edea3]">{sector.rain24h}</span>
              <span className="text-[9px] text-[#86948a]">mm</span>
            </div>
            <div className="text-[9px] text-[#ff7a73] font-bold">
              Exceeds 120mm red-line
            </div>
          </div>

          {/* Stat 5 */}
          <div className="bg-[#1c2028] border border-[#262a33] p-2.5 rounded flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-[#86948a]">
              <span className="text-[9px] uppercase tracking-wider">Soil Moisture</span>
              <span className="material-symbols-outlined text-[13px] text-[#ffb95f]">water_drop</span>
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="font-headline text-[22px] font-bold text-[#ffb95f]">{sector.soilMoisture}%</span>
              <span className="text-[9px] text-[#bbcabf] font-bold">SAT</span>
            </div>
            <div className="text-[9px] text-[#ffb3ad]">
              +18% above field capacity
            </div>
          </div>

          {/* Stat 6 */}
          <div className="bg-[#1c2028] border border-[#262a33] p-2.5 rounded flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-[#86948a]">
              <span className="text-[9px] uppercase tracking-wider">Prediction Method</span>
              <span className="material-symbols-outlined text-[13px] text-[#4edea3]">psychology</span>
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="font-headline text-[15px] font-bold text-[#ffb95f]">BASELINE</span>
              <span className="text-[9px] text-[#ffb95f] font-bold uppercase">UNVALIDATED</span>
            </div>
            <div className="text-[9px] text-[#86948a]">
              No trained model connected
            </div>
          </div>
        </div>
      </div>

      {/* 4. Sample Landslide Risk Map Card */}
      <div className="px-3 py-1 max-w-7xl mx-auto w-full">
        <div className="bg-[#1c2028] border border-[#262a33] rounded-xl overflow-hidden flex flex-col shadow-md">
          {/* Card Header */}
          <div className="px-3 py-2 bg-[#262a33] flex items-center justify-between border-b border-[#31353e]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#4edea3]">satellite_alt</span>
              <span className="font-headline text-[14px] font-bold text-[#dfe2ee]">Landslide Risk Map · Sample Layer</span>
            </div>
            <div className="flex items-center gap-1 text-[9px]">
              <span className="px-1.5 py-0.5 rounded bg-[#262a33] text-[#ffb95f] font-bold">DEMO / SIMULATED</span>
              <span className="px-1.5 py-0.5 rounded bg-[#31353e] text-[#bbcabf]">ILLUSTRATIVE</span>
            </div>
          </div>

          {/* Tactical Interactive Map Stage */}
          <div className="relative w-full h-80 bg-[#0a0e16] overflow-hidden select-none">
            {/* Background Satellite Terrain (hotlinked per instructions) */}
            <div 
              className="w-full h-full bg-cover bg-center transition-all duration-300"
              style={{
                backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDlQ_qD6_nrcBMUUm8ba8HNmlFqpo98Kg_G0eD_XskVA_yFRXPAqK9c0jG1KJ8KqNyRNQ5TBQ2RCqHWwCODDL7r7tUUh42Hw-7DH6FJrFGr87FoLOzxZDMl0A8mglzMWyDUs6531L_r_MupBiVc6GGBM0SIBfs_8DxfK9eNlvCnyWy9U7WXdsKHNOOFKA5z--s24Y3qwVLE1u1KtY8_UAVq5Aj6ek5-3Bzx7zexGuFTfiNaUbs-jpVo')",
                opacity: mapLayer === 'saturation' ? 0.25 : 0.45,
                transform: `scale(${mapZoom})`,
                transformOrigin: 'center center'
              }}
            />

            {/* Tactical SVG Radar & Contours Overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="tacGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(78, 222, 163, 0.08)" strokeWidth="0.7"></path>
                </pattern>
                <radialGradient id="radarGlow" cx="58%" cy="42%" r="45%">
                  <stop offset="0%" stopColor="rgba(239, 68, 68, 0.45)"></stop>
                  <stop offset="45%" stopColor="rgba(255, 185, 95, 0.15)"></stop>
                  <stop offset="90%" stopColor="rgba(78, 222, 163, 0.0)"></stop>
                </radialGradient>
              </defs>

              <rect width="100%" height="100%" fill="url(#tacGrid)"></rect>

              {/* High Risk Polygon Zone */}
              <polygon 
                points="160,70 260,85 290,170 210,210 140,150" 
                fill="rgba(239, 68, 68, 0.25)" 
                stroke="#ff7a73" 
                strokeWidth="1.5" 
                strokeDasharray="3,3"
              />

              {/* Moderate Risk Zone */}
              <polygon 
                points="60,110 130,120 150,180 80,240 30,190" 
                fill="rgba(255, 185, 95, 0.18)" 
                stroke="#ffb95f" 
                strokeWidth="1.2"
              />

              {/* Topographic Contours */}
              {mapLayer !== 'saturation' && (
                <>
                  <path d="M -20,180 Q 80,140 180,180 T 380,150" fill="none" stroke="rgba(187, 202, 191, 0.25)" strokeWidth="1"></path>
                  <path d="M -10,210 Q 90,170 190,210 T 390,190" fill="none" stroke="rgba(187, 202, 191, 0.25)" strokeWidth="1"></path>
                  <path d="M 0,240 Q 100,200 200,240 T 400,220" fill="none" stroke="rgba(187, 202, 191, 0.2)" strokeWidth="1"></path>
                </>
              )}

              {/* Radar ping circle around active sector */}
              <circle cx="215" cy="135" r="32" fill="url(#radarGlow)"></circle>
              <circle 
                cx="215" 
                cy="135" 
                r="46" 
                fill="none" 
                stroke="rgba(239, 68, 68, 0.6)" 
                strokeWidth="1.2" 
                className="animate-ping" 
                style={{ transformOrigin: '215px 135px', animationDuration: '2.5s' }}
              />
            </svg>

            {/* Dynamic Tactical HUD Markers */}
            {/* Historical Slippage Marker 1 */}
            <div 
              title="Historical Landslide Breach (2021)"
              className="absolute top-14 left-8 flex items-center gap-1 bg-[#262a33]/90 border border-[#31353e] px-1.5 py-0.5 rounded shadow cursor-pointer hover:border-[#ffb3ad]"
            >
              <span className="material-symbols-outlined text-[13px] text-[#ffb3ad]">landslide</span>
              <span className="text-[9px] text-[#bbcabf]">HIST-2021</span>
            </div>

            {/* Sensor Array Node Pin */}
            <div 
              title="Sensor Node SN-09 Active"
              className="absolute top-28 left-20 flex flex-col items-center cursor-pointer group"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-[#4edea3] ring-2 ring-[#0f131c] group-hover:scale-125 transition"></div>
              <span className="text-[9px] text-[#4edea3] bg-[#0f131c]/90 border border-[#262a33] px-1 rounded mt-0.5">
                SN-09
              </span>
            </div>

            {/* Hospital / Evac Shelter Marker */}
            <div 
              title="Primary Disaster Relief Shelter"
              className="absolute bottom-6 right-8 flex items-center gap-1 bg-[#262a33]/95 border border-[#31353e] px-1.5 py-0.5 rounded shadow cursor-pointer hover:border-[#4edea3]"
            >
              <span className="material-symbols-outlined text-[14px] text-[#4edea3]">local_hospital</span>
              <span className="text-[9px] text-[#dfe2ee]">Valparai CHC (Shelter A)</span>
            </div>

            {/* Clickable demo monitoring locations; marker colors use API results only. */}
            {DEMO_MAP_LOCATIONS.map((location, index) => {
              const locationPrediction = location.id === sector.id
                ? prediction ?? mapPredictions[location.id]
                : mapPredictions[location.id];
              const markerColor = riskMarkerColor(locationPrediction?.category);
              const isSelected = selectedMapLocationId === location.id;

              return (
                <button
                  key={location.id}
                  type="button"
                  title={`${location.name}: ${locationPrediction ? `${locationPrediction.score}/100 ${locationPrediction.category}` : 'Risk index unavailable'}`}
                  aria-label={`Select ${location.name}, ${locationPrediction ? `${locationPrediction.score} risk index, ${locationPrediction.category}` : 'risk index unavailable'}`}
                  aria-pressed={isSelected}
                  onClick={() => {
                    setSelectedMapLocationId(location.id);
                    onSelectSector(location.id);
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 cursor-pointer z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                  style={{ top: location.mapPosition?.top, left: location.mapPosition?.left }}
                >
                  <span
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[9px] font-bold text-[#0f131c] shadow-lg ${isSelected ? 'ring-4 ring-white/35 scale-110' : ''}`}
                    style={{ backgroundColor: markerColor, borderColor: isSelected ? '#ffffff' : '#0f131c' }}
                  >
                    {index + 1}
                  </span>
                  <span className="max-w-24 truncate px-1 py-0.5 bg-[#0f131c]/90 border border-[#262a33] rounded text-[8px] text-white">
                    {location.name.replace(/ Sector.*/, '').replace(/ Road Sector.*/, '')}
                  </span>
                </button>
              );
            })}

            {/* Tactical Map Floating Controls */}
            <div className="absolute top-2 right-2 flex flex-col gap-1 bg-[#0f131c]/90 p-1 rounded backdrop-blur border border-[#262a33]">
              <button 
                onClick={() => setMapZoom(prev => Math.min(1.8, prev + 0.2))}
                title="Zoom In"
                className="w-7 h-7 flex items-center justify-center rounded bg-[#262a33] text-[#dfe2ee] hover:text-[#4edea3] hover:bg-[#31353e] transition"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
              </button>
              <button 
                onClick={() => setMapZoom(prev => Math.max(0.8, prev - 0.2))}
                title="Zoom Out"
                className="w-7 h-7 flex items-center justify-center rounded bg-[#262a33] text-[#dfe2ee] hover:text-[#4edea3] hover:bg-[#31353e] transition"
              >
                <span className="material-symbols-outlined text-[16px]">remove</span>
              </button>
              <button 
                onClick={() => setMapLayer(prev => prev === 'standard' ? 'contours' : prev === 'contours' ? 'saturation' : 'standard')}
                title={`Toggle Layer (Current: ${mapLayer})`}
                className={`w-7 h-7 flex items-center justify-center rounded transition ${
                  mapLayer !== 'standard' ? 'bg-[#4edea3] text-[#003824]' : 'bg-[#262a33] text-[#dfe2ee] hover:text-[#4edea3]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">layers</span>
              </button>
              <button 
                onClick={() => setMapZoom(1)}
                title="Reset View"
                className="w-7 h-7 flex items-center justify-center rounded bg-[#262a33] text-[#dfe2ee] hover:text-[#4edea3] hover:bg-[#31353e] transition"
              >
                <span className="material-symbols-outlined text-[16px]">my_location</span>
              </button>
            </div>

            {/* Map Legend Drawer */}
            <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-[#0f131c]/90 px-2 py-1 rounded backdrop-blur border border-[#262a33] text-[9px]">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
                <span>Low</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#ffb95f]"></span>
                <span>Mod</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#ee9800]"></span>
                <span>High</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#ff7a73]"></span>
                <span>Crit</span>
              </div>
            </div>
          </div>

          {/* Selected demo monitoring location details */}
          <div className="p-3 bg-[#1c2028] flex flex-col gap-2 border-t border-[#262a33]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]" style={{ color: riskMarkerColor(selectedMapPrediction?.category) }}>fmd_bad</span>
                <div>
                  <div className="font-headline text-[14px] font-bold text-[#dfe2ee]">{selectedMapLocation.name}</div>
                  <div className="text-[9px] text-[#bbcabf]">DEMO / SIMULATED LOCATION · {selectedMapLocation.subName}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-[#86948a]">BASELINE RISK INDEX</div>
                <span className="px-2 py-1 rounded border text-[11px] font-bold" style={{ color: riskMarkerColor(selectedMapPrediction?.category), borderColor: riskMarkerColor(selectedMapPrediction?.category), backgroundColor: '#0f131c' }}>
                  {selectedMapPrediction
                    ? `${selectedMapPrediction.score}/100 · ${selectedMapPrediction.category}`
                    : isMapLoading || predictionLoading ? 'LOADING' : 'UNAVAILABLE'}
                </span>
              </div>
            </div>

            <p className="text-[9px] text-[#86948a]">
              Marker legend: green LOW · yellow MODERATE · orange HIGH · red CRITICAL. Gray means no backend result.
            </p>

            {/* Telemetry Key Matrix (8 grid cells) */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 bg-[#0a0e16] p-1.5 rounded border border-[#262a33] text-[9px]">
              <div className="p-1">
                <div className="text-[#86948a]">RAIN</div>
                <div className="text-[#dfe2ee] font-bold">{sector.rain24h} mm</div>
              </div>
              <div className="p-1">
                <div className="text-[#86948a]">MOISTURE</div>
                <div className="text-[#dfe2ee] font-bold">{sector.soilMoisture}%</div>
              </div>
              <div className="p-1">
                <div className="text-[#86948a]">SLOPE</div>
                <div className="text-[#dfe2ee] font-bold">{sector.slopeAngle}°</div>
              </div>
              <div className="p-1">
                <div className="text-[#86948a]">ELEV</div>
                <div className="text-[#dfe2ee] font-bold">{sector.elevation} m</div>
              </div>
              <div className="p-1">
                <div className="text-[#86948a]">VEGETATION</div>
                <div className="text-[#dfe2ee] font-bold">{(sector.vegetationNdvi * 100).toFixed(0)}% NDVI</div>
              </div>
              <div className="p-1">
                <div className="text-[#86948a]">PAST SLIDES</div>
                <div className="text-[#dfe2ee] font-bold">{sector.pastSlidesCount} Events</div>
              </div>
              <div className="p-1">
                <div className="text-[#86948a]">PORE PRESS</div>
                <div className="text-[#ff7a73] font-bold">{sector.porePressure} kPa</div>
              </div>
              <div className="p-1">
                <div className="text-[#86948a]">CONFIDENCE</div>
                <div className="text-[#4edea3] font-bold">{sector.aiConfidence}%</div>
              </div>
            </div>

            {/* Quick Action Micro-buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={onOpenRiskDetails}
                className="bg-[#262a33] hover:bg-[#31353e] hover:text-[#4edea3] py-2 px-1 rounded text-center text-[10px] text-[#dfe2ee] transition border border-[#3c4a42] cursor-pointer"
              >
                Risk Details
              </button>
              <button 
                onClick={onOpenForecast}
                className="bg-[#262a33] hover:bg-[#31353e] hover:text-[#4edea3] py-2 px-1 rounded text-center text-[10px] text-[#dfe2ee] transition border border-[#3c4a42] cursor-pointer"
              >
                View Forecast
              </button>
              <button 
                onClick={onOpenDecisionSupport}
                className="bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] py-2 px-1 rounded text-center text-[10px] font-bold transition shadow cursor-pointer"
              >
                Decision Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Rainfall → Risk Scenario Simulator (Hackathon Star Feature) */}
      <div className="px-3 py-1 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-br from-[#1c2028] via-[#1c2028] to-[#262a33] border border-[#262a33] rounded-xl p-3 flex flex-col gap-2 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#4edea3] animate-pulse">tune</span>
              <span className="font-headline text-[14px] font-bold text-[#dfe2ee]">Predictive Scenario Simulator</span>
            </div>
              <span className="px-1.5 py-0.5 rounded bg-[#262a33] text-[#ffb95f] text-[9px] font-bold">BASELINE · SAMPLE DATA</span>
          </div>
          
          <p className="text-[11px] text-[#bbcabf] font-sans">
            Baseline Risk Index · Model Status: Baseline. Hypothetical rainfall scenario only, not a forecast or validated probability.
          </p>
          {predictionError && <p role="alert" className="text-[10px] text-[#ff7a73]">{predictionError}</p>}
          {scenarioError && <p role="alert" className="text-[10px] text-[#ff7a73]">{scenarioError}</p>}

          {/* Tactical Monospace Slider */}
          <div className="bg-[#0a0e16] p-2.5 rounded border border-[#262a33] flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[#86948a] uppercase">SIMULATED RAIN ACCUMULATION</span>
              <span className="text-[#ffb95f] font-bold font-headline text-[15px]">{simRain} mm</span>
            </div>
            <input 
              type="range"
              min="50"
              max="250"
              step="5"
              value={simRain}
              onChange={(e) => setSimRain(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-[#31353e] rounded-lg appearance-none cursor-pointer accent-[#4edea3]"
            />
            <div className="flex justify-between text-[#86948a] text-[9px]">
              <span>50 mm (Nominal)</span>
              <span className="text-[#4edea3] font-bold">Current: {sector.rain24h} mm</span>
              <span>250 mm (Extreme)</span>
            </div>
          </div>

          {/* Baseline Index Comparison */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#0a0e16] p-2 rounded border border-[#262a33] flex flex-col text-center">
              <span className="text-[9px] text-[#86948a] uppercase">CURRENT BASELINE INDEX</span>
              <span className="font-headline text-[18px] font-bold text-[#dfe2ee] mt-0.5">{prediction ? `${prediction.score}/100` : predictionLoading ? 'LOADING' : 'UNAVAILABLE'}</span>
              <span className="text-[9px] text-[#ff7a73] font-bold">{prediction?.category ?? ''}</span>
            </div>
            <div className="bg-[#0a0e16] p-2 rounded border border-[#262a33] flex flex-col text-center">
              <span className="text-[9px] text-[#86948a] uppercase">SCENARIO BASELINE INDEX</span>
              <span className={`font-headline text-[18px] font-bold mt-0.5 ${riskStatus.color}`}>
                {simRiskScore === null ? (isScenarioLoading ? 'LOADING' : 'UNAVAILABLE') : `${simRiskScore}/100`}
              </span>
              <span className={`text-[9px] font-bold ${riskStatus.color}`}>
                {riskStatus.tag}
              </span>
            </div>
            <div className="bg-[#0a0e16] p-2 rounded border border-[#262a33] flex flex-col text-center">
              <span className="text-[9px] text-[#86948a] uppercase">INDEX CHANGE</span>
              <span className={`font-headline text-[18px] font-bold mt-0.5 ${deltaVal === null ? 'text-[#86948a]' : deltaVal >= 0 ? 'text-[#ffb3ad]' : 'text-[#4edea3]'}`}>
                {deltaVal === null ? '--' : deltaVal >= 0 ? `+${deltaVal.toFixed(1)}` : deltaVal.toFixed(1)}
              </span>
              <span className="text-[9px] text-[#86948a]">Not a probability</span>
            </div>
          </div>

          {/* Dynamic Danger Progression Bar */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[9px]">
              <span className="text-[#86948a] uppercase">FAILURE THRESHOLD GRADIENT</span>
              <span className={`font-bold ${riskStatus.color}`}>{riskStatus.label}</span>
            </div>
            <div className="w-full h-2 rounded bg-[#31353e] overflow-hidden flex">
              <div className="h-full bg-[#4edea3]" style={{ width: '25%' }}></div>
              <div className="h-full bg-[#ffb95f]" style={{ width: '25%' }}></div>
              <div className="h-full bg-[#ee9800]" style={{ width: '25%' }}></div>
              <div className="h-full bg-[#ff7a73]" style={{ width: '25%' }}></div>
            </div>
            {/* Indicator Needle Marker */}
            <div className="relative w-full h-2 -mt-1.5">
              <div 
                className="absolute top-0 w-2.5 h-2.5 rounded-full bg-white shadow-md transition-all duration-150 border border-black/40 -translate-x-1/2" 
                style={{ left: `${Math.min(98, Math.max(2, simRiskScore ?? 0))}%` }}
              ></div>
            </div>
          </div>

          {/* Simulator Tactical Actions */}
          <div className="flex gap-2 pt-1">
            <button 
              onClick={handleRunBaseline}
              disabled={isScenarioLoading}
              className="flex-1 bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] text-[11px] font-bold py-2 rounded uppercase tracking-wider flex items-center justify-center gap-1 shadow cursor-pointer transition"
            >
              {isScenarioLoading ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                  <span>Requesting Baseline...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                  <span>Recalculate Baseline</span>
                </>
              )}
            </button>
            <button 
              onClick={handleResetSim}
              className="px-4 bg-[#262a33] text-[#dfe2ee] hover:bg-[#31353e] text-[11px] font-bold py-2 rounded uppercase border border-[#3c4a42] cursor-pointer transition"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* 6. Baseline Factor Contributions */}
      <div className="px-3 py-1 max-w-7xl mx-auto w-full">
        <div className="bg-[#1c2028] border border-[#262a33] rounded-xl p-3 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#4edea3]">analytics</span>
              <span className="font-headline text-[14px] font-bold text-[#dfe2ee]">Baseline Factor Contributions</span>
            </div>
            <span className="text-[9px] text-[#86948a]">HEURISTIC POINTS · NOT SHAP</span>
          </div>

          <p className="text-[11px] text-[#bbcabf] font-sans">
            {prediction
              ? <>Transparent contributions to the selected sector's <strong className="text-[#ff7a73] font-bold">{prediction.score}/100 {prediction.category}</strong> baseline index. These points are not probability or model attribution values.</>
              : predictionLoading ? 'Loading backend factor contributions…' : 'Baseline prediction unavailable; no local estimate is substituted.'}
          </p>

          <div className="flex flex-col gap-2 pt-1 text-[9px]">
            {prediction?.factors.map((factor, index) => (
              <div key={factor.key} className="flex flex-col gap-0.5">
                <div className="flex justify-between gap-2">
                  <span className="text-[#dfe2ee]">{factor.label} ({factor.value} {factor.unit})</span>
                  <span className="font-bold flex-shrink-0" style={{ color: factorColors[index] }}>
                    {factor.contributionPoints}/{factor.maximumPoints} points
                  </span>
                </div>
                <div className="w-full bg-[#0a0e16] h-2 rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all duration-300"
                    style={{
                      width: `${(factor.contributionPoints / factor.maximumPoints) * 100}%`,
                      backgroundColor: factorColors[index],
                    }}
                  ></div>
                </div>
                <p className="text-[#86948a] leading-relaxed">{factor.explanation}</p>
              </div>
            ))}
          </div>

          {/* Synthesis Callout */}
          {leadingFactor && <div className="bg-[#181c24] p-2 rounded border border-[#262a33] flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#4edea3] flex-shrink-0 mt-0.5">lightbulb</span>
            <span className="text-[11px] text-[#bbcabf] font-sans leading-relaxed">
              <strong className="text-[#dfe2ee]">Largest heuristic contribution: </strong>
              {leadingFactor
                ? `${leadingFactor.label} contributes ${leadingFactor.contributionPoints} of ${leadingFactor.maximumPoints} possible points. ${leadingFactor.explanation}`
                : predictionLoading ? 'Waiting for the baseline API response.' : 'No backend prediction is available.'}
            </span>
          </div>}
        </div>
      </div>

      {/* 7. Illustrative Risk Index Scenarios */}
      <div className="px-3 py-1 max-w-7xl mx-auto w-full">
        <div className="bg-[#1c2028] border border-[#262a33] rounded-xl p-3 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#ffb3ad]">trending_up</span>
              <span className="font-headline text-[14px] font-bold text-[#dfe2ee]">Illustrative Risk Index Scenarios</span>
            </div>
            <span className="text-[9px] text-[#ffb3ad] font-bold">SAMPLE TRACE · NOT OBSERVED HISTORY</span>
          </div>

          {/* Trend Area Visualization (Inline SVG) */}
          <div className="relative w-full h-32 bg-[#0a0e16] rounded p-2 flex flex-col justify-end border border-[#262a33]">
            {hoveredTrendPoint && (
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#262a33] text-[9px] text-[#4edea3] border border-[#31353e]">
                {hoveredTrendPoint}
              </div>
            )}
            <svg className="w-full h-24 overflow-visible" viewBox="0 0 320 80" preserveAspectRatio="none">
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff7a73" stopOpacity="0.45"></stop>
                  <stop offset="100%" stopColor="#ff7a73" stopOpacity="0.0"></stop>
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="0" y1="20" x2="320" y2="20" stroke="#31353e" strokeWidth="0.7" strokeDasharray="2,2" />
              <line x1="0" y1="45" x2="320" y2="45" stroke="#31353e" strokeWidth="0.7" strokeDasharray="2,2" />

              {/* Area */}
              <polygon points="0,65 50,56 100,48 150,40 200,30 250,22 320,12 320,80 0,80" fill="url(#riskGrad)"></polygon>

              {/* Polyline Path: 42% -> 51% -> 57% -> 63% -> 71% -> 78% -> 86% */}
              <polyline 
                points="0,65 50,56 100,48 150,40 200,30 250,22 320,12" 
                fill="none" 
                stroke="#ff7a73" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              ></polyline>

              {/* Plot points with hover info */}
              <circle 
                cx="0" cy="65" r="3.5" fill="#4edea3" className="cursor-pointer"
                onMouseEnter={() => setHoveredTrendPoint('-24h: 42% Stable')}
                onMouseLeave={() => setHoveredTrendPoint(null)}
              />
              <circle 
                cx="50" cy="56" r="3.5" fill="#4edea3" className="cursor-pointer"
                onMouseEnter={() => setHoveredTrendPoint('-18h: 51% Normal')}
                onMouseLeave={() => setHoveredTrendPoint(null)}
              />
              <circle 
                cx="100" cy="48" r="3.5" fill="#ffb95f" className="cursor-pointer"
                onMouseEnter={() => setHoveredTrendPoint('-12h: 57% Caution')}
                onMouseLeave={() => setHoveredTrendPoint(null)}
              />
              <circle 
                cx="150" cy="40" r="3.5" fill="#ffb95f" className="cursor-pointer"
                onMouseEnter={() => setHoveredTrendPoint('Illustrative sample index: 63')}
                onMouseLeave={() => setHoveredTrendPoint(null)}
              />
              <circle 
                cx="200" cy="30" r="3.5" fill="#ff7a73" className="cursor-pointer"
                onMouseEnter={() => setHoveredTrendPoint('Illustrative sample index: 71')}
                onMouseLeave={() => setHoveredTrendPoint(null)}
              />
              <circle 
                cx="250" cy="22" r="3.5" fill="#ff7a73" className="cursor-pointer"
                onMouseEnter={() => setHoveredTrendPoint('Illustrative sample index: 78')}
                onMouseLeave={() => setHoveredTrendPoint(null)}
              />
              <circle cx="320" cy="12" r="4.5" fill="#ff7a73" />
              <circle 
                cx="320" cy="12" r="3.5" fill="#ffffff" className="cursor-pointer"
                onMouseEnter={() => setHoveredTrendPoint(prediction ? `NOW: ${prediction.score}/100 ${prediction.category}` : 'Current baseline index unavailable')}
                onMouseLeave={() => setHoveredTrendPoint(null)}
              />
            </svg>

            {/* Time Axis */}
            <div className="flex justify-between text-[9px] text-[#86948a] pt-1">
              <span>-24h (42)</span>
              <span>-18h (51)</span>
              <span>-12h (57)</span>
              <span>-6h (71)</span>
              <span className="text-[#ff7a73] font-bold">NOW ({prediction?.score ?? '--'})</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-[9px] pt-1">
            {illustrativeScenarios.map((scenario) => (
              <div key={scenario.time} className="bg-[#0a0e16] p-2 rounded border border-[#262a33] flex flex-col items-center">
                <span className="text-[#86948a]">{scenario.time} · Sample rainfall</span>
                <span className="text-[#ffb95f] font-bold text-[12px]">{scenario.rainfallMm} mm</span>
                <span className="text-[#bbcabf]">No forecast score</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 8. Environmental Conditions Telemetry Bar */}
      <div className="px-3 py-1 max-w-7xl mx-auto w-full">
        <div className="bg-[#1c2028] border border-[#262a33] rounded-xl p-3 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#4edea3]">thermostat</span>
              <span className="font-headline text-[14px] font-bold text-[#dfe2ee]">Microclimate &amp; Geo Sensors</span>
            </div>
            <span className="text-[9px] text-[#4edea3] font-bold">VALPARAI AUTOMATED AWS</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[9px]">
            <div className="bg-[#0a0e16] p-2 rounded border border-[#262a33] flex flex-col">
              <span className="text-[#86948a] uppercase">RAINFALL 24H</span>
              <span className="font-headline text-[15px] font-bold text-[#4edea3]">{sector.rain24h} mm</span>
              <span className="text-[#ffb3ad]">↑ 28% intensity</span>
            </div>
            <div className="bg-[#0a0e16] p-2 rounded border border-[#262a33] flex flex-col">
              <span className="text-[#86948a] uppercase">SOIL MOISTURE</span>
              <span className="font-headline text-[15px] font-bold text-[#ffb95f]">{sector.soilMoisture}%</span>
              <span className="text-[#ffb3ad]">↑ 12% over 3h</span>
            </div>
            <div className="bg-[#0a0e16] p-2 rounded border border-[#262a33] flex flex-col">
              <span className="text-[#86948a] uppercase">SLOPE SHEAR</span>
              <span className="font-headline text-[15px] font-bold text-[#ff7a73]">{sector.slopeAngle}°</span>
              <span className="text-[#86948a]">Disp: +{sector.slopeShearDisp}mm</span>
            </div>
            <div className="bg-[#0a0e16] p-2 rounded border border-[#262a33] flex flex-col">
              <span className="text-[#86948a] uppercase">TEMPERATURE</span>
              <span className="font-headline text-[15px] font-bold text-[#dfe2ee]">{sector.temp}°C</span>
              <span className="text-[#86948a]">Dew Pt: {sector.dewPoint}°C</span>
            </div>
            <div className="bg-[#0a0e16] p-2 rounded border border-[#262a33] flex flex-col">
              <span className="text-[#86948a] uppercase">HUMIDITY</span>
              <span className="font-headline text-[15px] font-bold text-[#4edea3]">{sector.humidity}%</span>
              <span className="text-[#86948a]">High condensation</span>
            </div>
            <div className="bg-[#0a0e16] p-2 rounded border border-[#262a33] flex flex-col">
              <span className="text-[#86948a] uppercase">WIND GUSTS</span>
              <span className="font-headline text-[15px] font-bold text-[#dfe2ee]">{sector.windSpeed} km/h</span>
              <span className="text-[#86948a]">{sector.windDir}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 9. Tactical Incident & Risk Timeline */}
      <div className="px-3 py-1 max-w-7xl mx-auto w-full">
        <div className="bg-[#1c2028] border border-[#262a33] rounded-xl p-3 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#4edea3]">history</span>
              <span className="font-headline text-[14px] font-bold text-[#dfe2ee]">Chronological Incident Feed</span>
            </div>
            <span className="text-[9px] text-[#86948a]">TODAY (UTC+5:30)</span>
          </div>

          {/* Timeline Items */}
          <div className="flex flex-col gap-1.5 text-[9px]">
            {incidents.map((ev) => {
              const isCrit = ev.threatLevel === 'CRITICAL';
              const isHigh = ev.threatLevel === 'HIGH';
              const iconMap: Record<string, string> = {
                response: 'support',
                incident: 'crisis_alert',
                warning: 'notification_important',
                model: 'psychology',
                sensor: 'water_drop',
                weather: 'thunderstorm'
              };

              return (
                <div 
                  key={ev.id} 
                  className="flex items-start gap-2 bg-[#0a0e16] p-2 rounded border border-[#262a33]"
                >
                  <span className={`font-bold w-10 flex-shrink-0 ${isCrit ? 'text-[#ff7a73]' : isHigh ? 'text-[#ffb95f]' : 'text-[#4edea3]'}`}>
                    {ev.time}
                  </span>
                  <span className={`material-symbols-outlined text-[15px] flex-shrink-0 mt-0.5 ${isCrit ? 'text-[#ff7a73]' : isHigh ? 'text-[#ffb95f]' : 'text-[#4edea3]'}`}>
                    {iconMap[ev.type] || 'circle'}
                  </span>
                  <div className="flex-1">
                    <span className={`font-bold ${isCrit ? 'text-[#ff7a73]' : 'text-[#dfe2ee]'}`}>
                      {ev.title}
                    </span>
                    <div className="text-[#bbcabf] text-[10px] font-sans mt-0.5">
                      {ev.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 10. Data Quality & Safety Disclaimer */}
      <div className="px-3 pt-1 pb-4 flex flex-col gap-2 max-w-7xl mx-auto w-full">
        <div className="bg-[#181c24] border border-[#262a33] p-2 rounded flex items-center justify-between text-[#86948a] text-[9px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
            <span>DATA SOURCE: MOCK SECTOR RECORDS</span>
          </div>
          <div className="flex items-center gap-1 text-[#4edea3]">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            <span>LIVE FEEDS: NOT CONNECTED</span>
          </div>
        </div>
        <div className="px-1 text-[9px] text-[#86948a]/80 leading-relaxed text-center font-sans">
          DEMO / SAMPLE DATA • Transparent heuristic baseline only; no external sensor or forecast source is connected. This index is not a validated probability and does not replace official IMD or DEOC advisories.
        </div>
      </div>

    </div>
  );
};
