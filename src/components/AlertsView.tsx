import React, { useState } from 'react';
import { EVACUATION_SHELTERS } from '../data/mockData';
import { RiskPrediction } from '../ml/risk';
import { EvacShelter, SectorData } from '../types';

interface AlertsViewProps {
  sector: SectorData;
  prediction: RiskPrediction | null;
  predictionLoading: boolean;
  predictionError: string | null;
  onOpenEocPlan: () => void;
}

const RECOMMENDED_ACTIONS: Record<RiskPrediction['category'], string> = {
  LOW: 'Normal monitoring',
  MODERATE: 'Increase monitoring',
  HIGH: 'Prepare response team',
  CRITICAL: 'Initiate emergency response procedures',
};

const DEMO_ALERT_HISTORY = [
  { time: '14:05 UTC', location: 'Meppadi Chooralmala', score: 75, level: 'CRITICAL' },
  { time: '13:42 UTC', location: 'Valparai Sector 4B', score: 62, level: 'HIGH' },
  { time: '12:18 UTC', location: 'Darjeeling Cart Road', score: 60, level: 'HIGH' },
  { time: '11:30 UTC', location: 'Kodaikanal Ghat Road', score: 48, level: 'MODERATE' },
];

export const AlertsView: React.FC<AlertsViewProps> = ({
  sector,
  prediction,
  predictionLoading,
  predictionError,
  onOpenEocPlan,
}) => {
  const [shelters, setShelters] = useState<EvacShelter[]>(EVACUATION_SHELTERS);
  const [broadcastSent, setBroadcastSent] = useState<boolean>(false);
  const [sirenActive, setSirenActive] = useState<boolean>(false);
  const [broadcastMessage, setBroadcastMessage] = useState<string>(
    `[EMERGENCY EOC ADVISORY] Critical Landslide Warning in ${sector.name}. Evacuate immediately within 300m perimeter to Shelter A (Valparai CHC). Dial 1077 for emergency assistance.`
  );

  const handleSendBroadcast = () => {
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 6000);
  };

  const handleToggleSiren = () => {
    setSirenActive(!sirenActive);
  };

  return (
    <div className="flex flex-col w-full text-[#dfe2ee] pb-16 font-mono max-w-7xl mx-auto px-3 pt-2">
      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ff7a73] text-[20px]">emergency</span>
            <h1 className="font-headline text-[18px] font-bold text-[#dfe2ee]">
              Civil Defense Warning &amp; Mass Alert Dispatch
            </h1>
          </div>
          <p className="text-[11px] text-[#bbcabf] font-sans">
            Common Alerting Protocol (CAP), acoustic siren activation, and shelter occupancy management.
          </p>
        </div>

        <button 
          onClick={onOpenEocPlan}
          className="px-3 py-1.5 rounded bg-[#93000a] text-white hover:bg-[#ef4444] text-[10px] font-bold uppercase transition flex items-center gap-1.5 shadow"
        >
          <span className="material-symbols-outlined text-[16px]">menu_book</span>
          Open EOC Action Plan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        <section className="bg-[#1c2028] border border-[#262a33] rounded-xl p-3 shadow-md" aria-labelledby="early-warning-title">
          <div className="flex items-center justify-between border-b border-[#262a33] pb-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#ffb95f]">notifications_active</span>
              <h2 id="early-warning-title" className="font-headline text-[14px] font-bold text-[#dfe2ee]">Early Warning</h2>
            </div>
            <span className="text-[9px] text-[#86948a] font-bold">BASELINE · DEMO INPUTS</span>
          </div>

          {prediction ? (
            <>
              <div className={`mb-2 p-2 border rounded ${prediction.category === 'CRITICAL' ? 'border-[#ff7a73] bg-[#93000a]/20' : prediction.category === 'HIGH' ? 'border-[#ee9800] bg-[#ee9800]/10' : 'border-[#262a33] bg-[#0f131c]'}`}>
                <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                  <span className="font-bold text-[#dfe2ee]">{sector.name}</span>
                  <span className="font-bold" style={{ color: prediction.category === 'CRITICAL' ? '#ff7a73' : prediction.category === 'HIGH' ? '#ee9800' : '#bbcabf' }}>
                    {prediction.score}/100 · {prediction.category}
                  </span>
                </div>
                {prediction.category === 'HIGH' || prediction.category === 'CRITICAL' ? (
                  <p role="alert" className="mt-1 text-[11px] text-[#dfe2ee]">
                    {prediction.category === 'CRITICAL'
                      ? `Critical baseline risk at ${sector.name}. Initiate emergency response procedures.`
                      : `High baseline risk at ${sector.name}. Prepare the response team.`}
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] text-[#bbcabf]">No HIGH or CRITICAL warning for this location.</p>
                )}
              </div>
              <div className="text-[10px] text-[#bbcabf]">
                <span className="text-[#86948a] uppercase">Recommended action: </span>
                <span className="font-bold text-[#dfe2ee]">{RECOMMENDED_ACTIONS[prediction.category]}</span>
              </div>
              <p className="mt-2 text-[9px] text-[#86948a]">Prototype baseline index, not a validated probability or operational alert.</p>
            </>
          ) : (
            <p className="text-[11px] text-[#bbcabf]" role={predictionError ? 'alert' : undefined}>
              {predictionLoading ? 'Loading backend risk result...' : 'Backend risk result unavailable. No warning generated.'}
            </p>
          )}
        </section>

        <section className="bg-[#1c2028] border border-[#262a33] rounded-xl p-3 shadow-md" aria-labelledby="alert-history-title">
          <div className="flex items-center justify-between border-b border-[#262a33] pb-2 mb-2">
            <h2 id="alert-history-title" className="font-headline text-[14px] font-bold text-[#dfe2ee]">Alert History</h2>
            <span className="text-[9px] text-[#ffb95f] font-bold">DEMO / SIMULATED</span>
          </div>
          <div className="divide-y divide-[#262a33]">
            {DEMO_ALERT_HISTORY.map((alert) => (
              <div key={`${alert.time}-${alert.location}`} className="py-1.5 flex items-center justify-between gap-2 text-[10px]">
                <div className="min-w-0">
                  <div className="truncate font-bold text-[#dfe2ee]">{alert.location}</div>
                  <div className="text-[#86948a]">{alert.time} · {alert.score}/100</div>
                </div>
                <span className={`shrink-0 font-bold ${alert.level === 'CRITICAL' ? 'text-[#ff7a73]' : alert.level === 'HIGH' ? 'text-[#ee9800]' : 'text-[#ffb95f]'}`}>
                  {alert.level}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Broadcast Simulator and Siren Control */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        
        {/* Cell Broadcast & SMS Dispatcher */}
        <div className="bg-[#1c2028] border border-[#262a33] rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between border-b border-[#262a33] pb-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#4edea3]">cell_tower</span>
              <span className="font-headline text-[14px] font-bold text-[#dfe2ee]">
                CAP Cell Broadcast Dispatcher
              </span>
            </div>
            <span className="text-[9px] text-[#4edea3] font-bold">CARRIER GATEWAY READY</span>
          </div>

          <p className="text-[11px] text-[#bbcabf] font-sans mb-2">
            Dispatches loud priority audible override broadcast to all LTE/5G handsets registered to cell towers in Sector 4B.
          </p>

          <textarea
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            rows={3}
            className="w-full bg-[#0a0e16] border border-[#262a33] text-[#dfe2ee] p-2 rounded text-[11px] font-mono focus:border-[#4edea3] outline-none mb-2"
          />

          <div className="flex items-center justify-between">
            <span className="text-[9px] text-[#86948a]">ESTIMATED AUDIENCE: ~1,420 CITIZENS</span>
            <button
              onClick={handleSendBroadcast}
              className="px-4 py-2 rounded bg-[#ff7a73] hover:bg-white text-[#690005] font-bold uppercase text-[11px] transition flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              Issue Cell Broadcast
            </button>
          </div>

          {broadcastSent && (
            <div className="mt-2 p-2 rounded bg-[#10b981]/20 border border-[#4edea3] text-[#4edea3] text-[10px] font-bold flex items-center gap-1.5 animate-in fade-in">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              CAP Warning successfully broadcast to 1,420 devices across 3 base stations!
            </div>
          )}
        </div>

        {/* Hilltop Acoustic Siren System */}
        <div className="bg-[#1c2028] border border-[#262a33] rounded-xl p-3 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#262a33] pb-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#ffb95f]">campaign</span>
                <span className="font-headline text-[14px] font-bold text-[#dfe2ee]">
                  High-Decibel Hilltop Siren Horns (130 dB)
                </span>
              </div>
              <span className={`text-[9px] font-bold uppercase ${sirenActive ? 'text-[#ff7a73] animate-pulse' : 'text-[#86948a]'}`}>
                {sirenActive ? '● SIRENS SOUNDING' : 'STANDBY'}
              </span>
            </div>

            <p className="text-[11px] text-[#bbcabf] font-sans mb-3">
              Solar-powered omnidirectional sirens at Mudis summit and Upper Sholayar ridge to warn outdoor plantation workers.
            </p>

            <div className="p-3 rounded bg-[#0a0e16] border border-[#262a33] flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#86948a] uppercase">Current Siren Network Status</div>
                <div className="text-[13px] font-bold text-[#dfe2ee]">
                  {sirenActive ? 'CONTINUOUS WAIL PATTERN ENGAGED' : 'QUIET MONITORING MODE'}
                </div>
              </div>

              <button
                onClick={handleToggleSiren}
                className={`px-4 py-2 rounded font-bold uppercase text-[11px] transition cursor-pointer shadow flex items-center gap-1.5 ${
                  sirenActive 
                    ? 'bg-[#93000a] text-white border border-[#ff7a73]' 
                    : 'bg-[#ee9800] text-[#472a00] hover:bg-[#ffb95f]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {sirenActive ? 'volume_off' : 'volume_up'}
                </span>
                {sirenActive ? 'Silence Sirens' : 'Trigger Sirens'}
              </button>
            </div>
          </div>

          <div className="text-[9px] text-[#86948a] pt-2 border-t border-[#262a33] mt-2">
            Automated siren fallback test scheduled weekly every Wednesday 10:00 UTC.
          </div>
        </div>

      </div>

      {/* Evacuation Shelters Status Table */}
      <div className="bg-[#1c2028] border border-[#262a33] rounded-xl overflow-hidden shadow-md">
        <div className="px-3 py-2 bg-[#262a33] border-b border-[#31353e] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#4edea3]">night_shelter</span>
            <span className="font-headline text-[13px] font-bold text-[#dfe2ee]">
              Designated Emergency Evacuation Shelters
            </span>
          </div>
          <span className="text-[9px] text-[#4edea3] font-bold">TOTAL CAPACITY: 1,400 BEDS</span>
        </div>

        <div className="overflow-x-auto text-[11px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#181c24] text-[9px] uppercase text-[#86948a] border-b border-[#262a33]">
                <th className="p-2.5">Shelter Facility</th>
                <th className="p-2.5">Distance</th>
                <th className="p-2.5">Capacity / Occupancy</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Medical Staff</th>
                <th className="p-2.5">Aux Generator</th>
                <th className="p-2.5">Incident Officer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262a33]">
              {shelters.map((sh) => {
                const occupancyPct = Math.round((sh.currentOccupancy / sh.capacity) * 100);
                return (
                  <tr key={sh.id} className="hover:bg-[#262a33]/50 transition">
                    <td className="p-2.5 font-bold text-[#dfe2ee]">{sh.name}</td>
                    <td className="p-2.5 text-[#4edea3]">{sh.distanceKm} km</td>
                    <td className="p-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-[#0a0e16] h-1.5 rounded overflow-hidden">
                          <div className="bg-[#4edea3] h-full" style={{ width: `${occupancyPct}%` }}></div>
                        </div>
                        <span className="text-[10px] text-[#bbcabf]">
                          {sh.currentOccupancy} / {sh.capacity} ({occupancyPct}%)
                        </span>
                      </div>
                    </td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        sh.status === 'OPEN' ? 'bg-[#10b981]/20 text-[#4edea3]' : 'bg-[#262a33] text-[#bbcabf]'
                      }`}>
                        {sh.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-[#4edea3]">
                      {sh.medicalStaff ? '✓ ON DUTY' : 'STANDBY'}
                    </td>
                    <td className="p-2.5 text-[#4edea3]">
                      {sh.generatorPower ? '✓ ONLINE' : 'OFFLINE'}
                    </td>
                    <td className="p-2.5 text-[#bbcabf] text-[10px]">{sh.contactOfficer}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
