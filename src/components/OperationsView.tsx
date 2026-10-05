import React, { useState } from 'react';
import { SectorData } from '../types';
import { RiskPrediction } from '../ml/risk';

interface OperationsViewProps {
  sector: SectorData;
  prediction: RiskPrediction | null;
  onOpenEocPlan: () => void;
}

export const OperationsView: React.FC<OperationsViewProps> = ({ sector, prediction, onOpenEocPlan }) => {
  const [copiedSitRep, setCopiedSitRep] = useState<boolean>(false);

  const handleExportSitRep = () => {
    const sitrep = `
=== LANDSLIDEGUARD SITUATION REPORT (SITREP) ===
TIME: ${new Date().toISOString()} (UTC)
SECTOR: ${sector.name} (${sector.region})
BASELINE RISK INDEX: ${prediction ? `${prediction.category} (${prediction.score}/100; not a validated probability)` : 'UNAVAILABLE'}
METEOROLOGY: Rain 24h: ${sector.rain24h}mm | Soil Moisture: ${sector.soilMoisture}% | Slope: ${sector.slopeAngle}°
PORE PRESSURE: ${sector.porePressure} kPa (Critical threshold: 42 kPa exceeded)
DISPLACEMENT: +${sector.slopeShearDisp} mm lateral shear creep
CIVIL DEFENSE ACTIONS:
- 300m Convex perimeter evacuation declared
- Pollachi-Valparai Highway SH-78 closed at Aliyar checkpost
- NDRF Battalion Unit 4 staged at Valparai Fire Station
- Shelter A (Valparai CHC) open with medical trauma team
AUTHORIZED BY: EOC COMMAND DUTY OFFICER (INCIDENT COMMANDER)
================================================
    `.trim();

    navigator.clipboard.writeText(sitrep);
    setCopiedSitRep(true);
    setTimeout(() => setCopiedSitRep(false), 3000);
  };

  return (
    <div className="flex flex-col w-full text-[#dfe2ee] pb-16 font-mono max-w-7xl mx-auto px-3 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4edea3] text-[20px]">military_tech</span>
            <h1 className="font-headline text-[18px] font-bold text-[#dfe2ee]">
              EOC Incident Operations &amp; Logistics Hub
            </h1>
          </div>
          <p className="text-[11px] text-[#bbcabf] font-sans">
            Incident command coordination, NDRF rapid deployment, and official Situation Report (SitRep) compiler. Risk inputs shown are sample data.
          </p>
        </div>

        <button
          onClick={handleExportSitRep}
          className="px-3 py-1.5 rounded bg-[#4edea3] text-[#003824] hover:bg-[#6ffbbe] text-[10px] font-bold uppercase transition flex items-center gap-1.5 shadow cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">content_paste</span>
          {copiedSitRep ? 'SitRep Copied to Clipboard!' : 'Export SitRep Briefing'}
        </button>
      </div>

      {/* Grid: Road Closures + NDRF Field Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        
        {/* Road & Transit Closures */}
        <div className="bg-[#1c2028] border border-[#262a33] rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between border-b border-[#262a33] pb-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#ffb95f]">traffic</span>
              <span className="font-headline text-[14px] font-bold text-[#dfe2ee]">
                Highland Arterial Transit Closures
              </span>
            </div>
            <span className="text-[9px] text-[#ff7a73] font-bold">2 ROADS RESTRICTED</span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="p-2.5 rounded bg-[#0a0e16] border border-[#ff7a73]/50 flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#ff7a73] mt-0.5">block</span>
              <div className="flex-1">
                <div className="font-bold text-[#dfe2ee] flex justify-between">
                  <span>State Highway SH-78 (Valparai Ghat Road)</span>
                  <span className="text-[#ff7a73] text-[9px] font-bold uppercase">CLOSED TO ALL TRANSIT</span>
                </div>
                <div className="text-[#bbcabf] text-[10px] mt-0.5">
                  Blockage point: Hairpin #8 to #11 (Debris spill &amp; road undercut). Traffic halted at Aliyar Checkpost.
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded bg-[#0a0e16] border border-[#ffb95f]/50 flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#ffb95f] mt-0.5">warning</span>
              <div className="flex-1">
                <div className="font-bold text-[#dfe2ee] flex justify-between">
                  <span>Mudis-Sheikalmudi Link Road</span>
                  <span className="text-[#ffb95f] text-[9px] font-bold uppercase">ESSENTIAL VEHICLES ONLY</span>
                </div>
                <div className="text-[#bbcabf] text-[10px] mt-0.5">
                  Police pilot escorts for NDRF rescue convoys and medical transport only. Speed limit 15 km/h.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NDRF & First Responder Logistics Staging */}
        <div className="bg-[#1c2028] border border-[#262a33] rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between border-b border-[#262a33] pb-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#4edea3]">local_shipping</span>
              <span className="font-headline text-[14px] font-bold text-[#dfe2ee]">
                First Responder &amp; Heavy Machinery Staging
              </span>
            </div>
            <span className="text-[9px] text-[#4edea3] font-bold">BATTALION 04</span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="p-2.5 rounded bg-[#0a0e16] border border-[#262a33] flex items-center justify-between">
              <div>
                <div className="font-bold text-[#dfe2ee]">NDRF Strike Team Alpha (24 Personnel)</div>
                <div className="text-[#bbcabf] text-[10px]">Equipped with victim location cameras &amp; chain saws</div>
              </div>
              <span className="text-[#4edea3] font-bold text-[10px]">ON SCENE (HAIRPIN 8)</span>
            </div>

            <div className="p-2.5 rounded bg-[#0a0e16] border border-[#262a33] flex items-center justify-between">
              <div>
                <div className="font-bold text-[#dfe2ee]">Heavy Earth Excavators (3 JCB / 2 Poclain)</div>
                <div className="text-[#bbcabf] text-[10px]">Clearing 15m roadway slump and boulders</div>
              </div>
              <span className="text-[#4edea3] font-bold text-[10px]">OPERATIONAL</span>
            </div>

            <div className="p-2.5 rounded bg-[#0a0e16] border border-[#262a33] flex items-center justify-between">
              <div>
                <div className="font-bold text-[#dfe2ee]">IAF Helicopter Medevac (Helipad 2)</div>
                <div className="text-[#bbcabf] text-[10px]">Mi-17V5 on 15-minute takeoff notice at Sulur Airbase</div>
              </div>
              <span className="text-[#ffb95f] font-bold text-[10px]">WEATHER STANDBY</span>
            </div>
          </div>
        </div>

      </div>

      {/* Live SitRep Terminal Output */}
      <div className="bg-[#0a0e16] border border-[#262a33] rounded-xl p-3 shadow-inner">
        <div className="flex items-center justify-between border-b border-[#1c2028] pb-2 mb-2 text-[10px]">
          <span className="text-[#4edea3] font-bold">TERMINAL: EOC-VALPARAI-SITREP.LOG</span>
          <span className="text-[#86948a]">ENCRYPTED CIVIL DEFENSE MESH</span>
        </div>

        <pre className="text-[10px] text-[#bbcabf] font-mono leading-relaxed whitespace-pre-wrap">
{`[${new Date().toLocaleTimeString()} UTC] EOC_CORE: Displaying sample geotechnical inputs for ${sector.name}.
[${new Date().toLocaleTimeString()} UTC] BASELINE_INDEX: ${prediction ? `${prediction.score}/100 (${prediction.category}); heuristic, not a validated probability.` : 'unavailable; backend request not successful.'}
[${new Date().toLocaleTimeString()} UTC] DISPATCH: Alert SMS dispatched to 1,420 phones in Ward 3.
[${new Date().toLocaleTimeString()} UTC] LOGISTICS: NDRF Unit 4 deployed. Road SH-78 closed to transit. (Sample display)`}
        </pre>
      </div>
    </div>
  );
};
