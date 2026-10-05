import React, { useState } from 'react';
import { SectorData } from '../types';

interface MapViewProps {
  sector: SectorData;
  onOpenRiskDetails: () => void;
  onOpenEocPlan: () => void;
}

export const MapView: React.FC<MapViewProps> = ({
  sector,
  onOpenRiskDetails,
  onOpenEocPlan
}) => {
  const [activeLayers, setActiveLayers] = useState<{
    tiltmeters: boolean;
    radarRain: boolean;
    evacRoutes: boolean;
    faultLines: boolean;
    contours: boolean;
  }>({
    tiltmeters: true,
    radarRain: true,
    evacRoutes: true,
    faultLines: true,
    contours: true
  });

  const [selectedPin, setSelectedPin] = useState<string | null>('SECTOR 4B');

  const toggleLayer = (key: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col w-full text-[#dfe2ee] pb-16 font-mono max-w-7xl mx-auto px-3 pt-2">
      {/* Map Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4edea3] text-[20px]">map</span>
            <h1 className="font-headline text-[18px] font-bold text-[#dfe2ee]">
              Tactical GIS Hazard &amp; Evacuation Map
            </h1>
          </div>
          <p className="text-[11px] text-[#bbcabf] font-sans">
            High-density LIDAR topography, Doppler precipitation radar, and telemetry node GIS overlay.
          </p>
        </div>

        {/* GIS Status indicator */}
        <div className="flex items-center gap-2 text-[9px]">
          <span className="px-2 py-1 rounded bg-[#10b981] text-[#003824] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#003824] animate-ping"></span>
            GIS STREAM 1m RES
          </span>
          <span className="px-2 py-1 rounded bg-[#262a33] text-[#bbcabf] border border-[#31353e]">
            DATUM: WGS 84 / UTM 43N
          </span>
        </div>
      </div>

      {/* Layer Toggle Filter Toolbar */}
      <div className="bg-[#1c2028] border border-[#262a33] p-2 rounded-lg flex items-center gap-2 overflow-x-auto no-scrollbar mb-2 text-[10px]">
        <span className="text-[#86948a] uppercase font-bold text-[9px] flex-shrink-0">Map Layers:</span>
        <button
          onClick={() => toggleLayer('tiltmeters')}
          className={`px-2.5 py-1 rounded font-bold uppercase transition flex items-center gap-1 cursor-pointer flex-shrink-0 ${
            activeLayers.tiltmeters ? 'bg-[#4edea3] text-[#003824]' : 'bg-[#262a33] text-[#bbcabf]'
          }`}
        >
          <span className="material-symbols-outlined text-[13px]">sensors</span>
          Borehole Arrays ({activeLayers.tiltmeters ? 'ON' : 'OFF'})
        </button>

        <button
          onClick={() => toggleLayer('radarRain')}
          className={`px-2.5 py-1 rounded font-bold uppercase transition flex items-center gap-1 cursor-pointer flex-shrink-0 ${
            activeLayers.radarRain ? 'bg-[#ffb95f] text-[#472a00]' : 'bg-[#262a33] text-[#bbcabf]'
          }`}
        >
          <span className="material-symbols-outlined text-[13px]">thunderstorm</span>
          Radar Cloudburst ({activeLayers.radarRain ? 'ON' : 'OFF'})
        </button>

        <button
          onClick={() => toggleLayer('evacRoutes')}
          className={`px-2.5 py-1 rounded font-bold uppercase transition flex items-center gap-1 cursor-pointer flex-shrink-0 ${
            activeLayers.evacRoutes ? 'bg-[#38bdf8] text-[#032b43]' : 'bg-[#262a33] text-[#bbcabf]'
          }`}
        >
          <span className="material-symbols-outlined text-[13px]">alt_route</span>
          Evac Corridors ({activeLayers.evacRoutes ? 'ON' : 'OFF'})
        </button>

        <button
          onClick={() => toggleLayer('faultLines')}
          className={`px-2.5 py-1 rounded font-bold uppercase transition flex items-center gap-1 cursor-pointer flex-shrink-0 ${
            activeLayers.faultLines ? 'bg-[#ff7a73] text-[#79000e]' : 'bg-[#262a33] text-[#bbcabf]'
          }`}
        >
          <span className="material-symbols-outlined text-[13px]">polyline</span>
          Rupture Faults ({activeLayers.faultLines ? 'ON' : 'OFF'})
        </button>
      </div>

      {/* Main Big GIS Map Stage */}
      <div className="relative w-full h-[460px] bg-[#0a0e16] border border-[#262a33] rounded-xl overflow-hidden shadow-2xl select-none">
        {/* Background Satellite Aerial Map */}
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDlQ_qD6_nrcBMUUm8ba8HNmlFqpo98Kg_G0eD_XskVA_yFRXPAqK9c0jG1KJ8KqNyRNQ5TBQ2RCqHWwCODDL7r7tUUh42Hw-7DH6FJrFGr87FoLOzxZDMl0A8mglzMWyDUs6531L_r_MupBiVc6GGBM0SIBfs_8DxfK9eNlvCnyWy9U7WXdsKHNOOFKA5z--s24Y3qwVLE1u1KtY8_UAVq5Aj6ek5-3Bzx7zexGuFTfiNaUbs-jpVo')",
            opacity: 0.55
          }}
        />

        {/* Tactical SVG HUD and Vectors */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="gisGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(78, 222, 163, 0.09)" strokeWidth="0.8"></path>
            </pattern>
            <radialGradient id="stormGlow" cx="45%" cy="35%" r="60%">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.5)"></stop>
              <stop offset="40%" stopColor="rgba(255, 185, 95, 0.25)"></stop>
              <stop offset="85%" stopColor="rgba(56, 189, 248, 0.05)"></stop>
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0)"></stop>
            </radialGradient>
          </defs>

          <rect width="100%" height="100%" fill="url(#gisGrid)"></rect>

          {/* Radar Rain Overlay */}
          {activeLayers.radarRain && (
            <ellipse cx="280" cy="220" rx="160" ry="110" fill="url(#stormGlow)"></ellipse>
          )}

          {/* Fault Lines & Rupture Boundaries */}
          {activeLayers.faultLines && (
            <>
              <path 
                d="M 120,80 L 190,130 L 260,180 L 320,240 L 410,290" 
                stroke="#ff7a73" 
                strokeWidth="2.5" 
                strokeDasharray="6,4" 
                fill="none" 
              />
              <text x="330" y="250" fill="#ff7a73" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                MUDIS FAULT ZONE F-4
              </text>
            </>
          )}

          {/* Evacuation Corridors & Green Arrows */}
          {activeLayers.evacRoutes && (
            <g>
              <path 
                d="M 260,180 Q 230,280 180,330 T 120,400" 
                stroke="#38bdf8" 
                strokeWidth="3" 
                strokeDasharray="5,3" 
                fill="none" 
              />
              <circle cx="120" cy="400" r="6" fill="#38bdf8" />
              <text x="135" y="405" fill="#38bdf8" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                PRIMARY EVAC CORRIDOR (ROAD SH-78)
              </text>
            </g>
          )}

          {/* Topographic Elevation Contours */}
          {activeLayers.contours && (
            <g opacity="0.4">
              <path d="M 0,100 C 150,80 300,140 600,120" stroke="#bbcabf" strokeWidth="1" fill="none" />
              <path d="M 0,160 C 180,140 320,210 600,170" stroke="#bbcabf" strokeWidth="1" fill="none" />
              <path d="M 0,220 C 200,200 350,280 600,240" stroke="#bbcabf" strokeWidth="1" fill="none" />
              <path d="M 0,300 C 220,260 400,340 600,310" stroke="#bbcabf" strokeWidth="1" fill="none" />
            </g>
          )}
        </svg>

        {/* Interactive Tactical Pins */}
        {/* Sector 4B Critical Pin */}
        <div 
          onClick={() => setSelectedPin('SECTOR 4B')}
          className="absolute top-[180px] left-[260px] -translate-x-1/2 -translate-y-full flex flex-col items-center cursor-pointer group z-20"
        >
          <div className="px-2 py-0.5 bg-[#93000a] text-white text-[10px] font-bold rounded shadow-xl flex items-center gap-1 border border-[#ff7a73] ring-4 ring-[#ff7a73]/20 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            SECTOR 4B (86% CRIT)
          </div>
          <div className="w-3.5 h-3.5 bg-[#93000a] rotate-45 -mt-2 border-r border-b border-[#ff7a73]"></div>
        </div>

        {/* Tiltmeter BH-12 Pin */}
        {activeLayers.tiltmeters && (
          <div 
            onClick={() => setSelectedPin('BH-12')}
            className="absolute top-[130px] left-[190px] flex items-center gap-1.5 bg-[#181c24]/90 border border-[#4edea3] px-2 py-0.5 rounded cursor-pointer hover:scale-105 transition z-10"
          >
            <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
            <span className="text-[9px] text-[#4edea3] font-bold">BH-12 TILT</span>
          </div>
        )}

        {/* Piezometer PZ-04 Pin */}
        {activeLayers.tiltmeters && (
          <div 
            onClick={() => setSelectedPin('PZ-04')}
            className="absolute top-[230px] left-[310px] flex items-center gap-1.5 bg-[#181c24]/90 border border-[#ffb95f] px-2 py-0.5 rounded cursor-pointer hover:scale-105 transition z-10"
          >
            <span className="w-2 h-2 rounded-full bg-[#ffb95f]"></span>
            <span className="text-[9px] text-[#ffb95f] font-bold">PZ-04 (48.2 kPa)</span>
          </div>
        )}

        {/* Evac Shelter Pin */}
        <div 
          onClick={() => setSelectedPin('SHELTER A')}
          className="absolute top-[380px] left-[110px] flex items-center gap-1.5 bg-[#111827]/95 border border-[#38bdf8] px-2 py-1 rounded cursor-pointer hover:scale-105 transition z-10 shadow-lg"
        >
          <span className="material-symbols-outlined text-[16px] text-[#38bdf8]">local_hospital</span>
          <span className="text-[10px] text-[#dfe2ee] font-bold">Shelter A (CHC Valparai)</span>
        </div>

        {/* Selected Pin Info HUD Overlay */}
        {selectedPin && (
          <div className="absolute top-3 left-3 bg-[#111827]/95 border border-[#262a33] p-3 rounded-lg shadow-2xl max-w-xs text-[11px] backdrop-blur z-30">
            <div className="flex items-center justify-between border-b border-[#262a33] pb-1.5 mb-2">
              <span className="font-bold text-[#4edea3]">{selectedPin} FOCUS TARGET</span>
              <button 
                onClick={() => setSelectedPin(null)} 
                className="text-[#86948a] hover:text-white"
              >
                ✕
              </button>
            </div>
            {selectedPin === 'SECTOR 4B' ? (
              <div className="space-y-1 text-[10px]">
                <div className="text-[#ff7a73] font-bold">CRITICAL FAILURE THREAT (P=0.86)</div>
                <div className="text-[#bbcabf]">Target: Mudis High Pass Escarpment</div>
                <div className="text-[#bbcabf]">Precipitation: 142mm (24h) | Slope: 34°</div>
                <div className="text-[#ff7a73]">Pore Water Pressure: 48.2 kPa</div>
                <div className="pt-2 flex gap-1.5">
                  <button 
                    onClick={onOpenRiskDetails} 
                    className="flex-1 px-2 py-1 rounded bg-[#262a33] hover:bg-[#31353e] text-[9px] font-bold text-center"
                  >
                    Risk Data
                  </button>
                  <button 
                    onClick={onOpenEocPlan} 
                    className="flex-1 px-2 py-1 rounded bg-[#93000a] text-white text-[9px] font-bold text-center"
                  >
                    EOC Plan
                  </button>
                </div>
              </div>
            ) : selectedPin === 'SHELTER A' ? (
              <div className="space-y-1 text-[10px]">
                <div className="text-[#38bdf8] font-bold">PRIMARY EVACUATION ASSEMBLY POINT</div>
                <div className="text-[#bbcabf]">Capacity: 450 Persons (182 Current)</div>
                <div className="text-[#4edea3]">Power Generator: ONLINE</div>
                <div className="text-[#4edea3]">Trauma Care Team: ON SCENE</div>
                <div className="text-[#86948a]">Coordinates: 10.3242° N, 76.9538° E</div>
              </div>
            ) : (
              <div className="space-y-1 text-[10px]">
                <div className="text-[#4edea3] font-bold">BOREHOLE TELEMETRY NODE ACTIVE</div>
                <div className="text-[#bbcabf]">Depth: 22.0m below ground level</div>
                <div className="text-[#bbcabf]">Last Synchronized: 8 seconds ago</div>
                <div className="text-[#ffb95f]">Sampling Interval: 30s High Frequency</div>
              </div>
            )}
          </div>
        )}

        {/* Map Corner Compass HUD */}
        <div className="absolute bottom-3 right-3 bg-[#111827]/90 border border-[#262a33] p-2 rounded text-center text-[9px] z-20 backdrop-blur">
          <div className="text-[#4edea3] font-bold">▲ N</div>
          <div className="text-[#86948a]">10.32° N</div>
          <div className="text-[#86948a]">76.95° E</div>
        </div>
      </div>
    </div>
  );
};
