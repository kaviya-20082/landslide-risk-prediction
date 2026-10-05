import React, { useEffect, useState } from 'react';
import { SectorData } from '../../types';
import { RiskPrediction } from '../../ml/risk';
import { requestRiskPrediction, sectorToPredictionRequest, toRiskPrediction } from '../../api/riskPrediction';

interface ForecastModalProps {
  sector: SectorData;
  prediction: RiskPrediction | null;
  onClose: () => void;
}

export const ForecastModal: React.FC<ForecastModalProps> = ({ sector, prediction, onClose }) => {
  const forecastHours = [
    { time: 'NOW', rain: sector.rain24h, pore: sector.porePressure },
    { time: '+3h', rain: 35, pore: 51.4 },
    { time: '+6h', rain: 42, pore: 55.2 },
    { time: '+12h', rain: 30, pore: 56.8 },
    { time: '+18h', rain: 18, pore: 50.1 },
    { time: '+24h', rain: 12, pore: 44.3 },
    { time: '+48h', rain: 6, pore: 32.0 },
  ];
  const [forecastPredictions, setForecastPredictions] = useState<Array<RiskPrediction | null>>([]);
  const [isForecastLoading, setIsForecastLoading] = useState<boolean>(true);
  const [forecastError, setForecastError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setForecastPredictions([]);
    setForecastError(null);
    setIsForecastLoading(true);

    Promise.all(forecastHours.map(async (row) => {
      const request = sectorToPredictionRequest(sector, row.rain);
      const response = await requestRiskPrediction(request, controller.signal);
      return toRiskPrediction(response, request);
    }))
      .then(setForecastPredictions)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setForecastError(error instanceof Error ? error.message : 'Forecast scenario request failed.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsForecastLoading(false);
      });

    return () => controller.abort();
  }, [sector]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#111827] border border-[#262a33] rounded-xl overflow-hidden shadow-2xl flex flex-col font-mono text-[#dfe2ee]">
        
        {/* Header */}
        <div className="px-4 py-3 bg-[#1c2028] border-b border-[#262a33] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#4edea3]">cloud_sync</span>
            <div>
              <div className="text-[10px] text-[#86948a] uppercase">Illustrative Sample Scenario · Not a Forecast Feed</div>
              <h2 className="text-[14px] font-bold font-headline">{sector.name} — Baseline Index Scenarios</h2>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded bg-[#262a33] hover:bg-[#31353e] flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-[12px]">
          <div className="p-3 rounded bg-[#181c24] border border-[#262a33] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4edea3]">air</span>
              <div>
                <div className="text-[10px] text-[#86948a] uppercase">Sample Rainfall Scenarios</div>
                  <div className="font-bold text-[#dfe2ee]">Baseline risk index recalculated for illustrative rainfall inputs</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#4edea3]/20 text-[#4edea3] text-[10px] font-bold">
              MOCK DATA
            </span>
          </div>
          {forecastError && <p role="alert" className="text-[10px] text-[#ff7a73]">{forecastError}</p>}
          {isForecastLoading && <p className="text-[10px] text-[#ffb95f]">Requesting baseline scenario indices…</p>}

          {/* Timeline Table */}
          <div className="border border-[#262a33] rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1c2028] text-[10px] uppercase text-[#86948a] border-b border-[#262a33]">
                  <th className="p-2.5">Timeline Window</th>
                  <th className="p-2.5">Rainfall Input</th>
                  <th className="p-2.5">Pore Pressure</th>
                  <th className="p-2.5">Baseline Index</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262a33] text-[11px]">
                {forecastHours.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#1c2028]/50">
                    <td className="p-2.5 font-bold text-[#dfe2ee]">{row.time}</td>
                    <td className="p-2.5 text-[#4edea3]">{row.rain} mm / 24h</td>
                    <td className="p-2.5 text-[#ffb95f]">{row.pore} kPa</td>
                    <td className="p-2.5 font-bold">{forecastPredictions[idx] ? `${forecastPredictions[idx]!.score}/100` : 'Unavailable'}</td>
                    <td className={`p-2.5 font-bold ${forecastPredictions[idx]?.category === 'CRITICAL' || forecastPredictions[idx]?.category === 'HIGH' ? 'text-[#ff7a73]' : forecastPredictions[idx]?.category === 'MODERATE' ? 'text-[#ffb95f]' : 'text-[#86948a]'}`}>
                      {forecastPredictions[idx]?.category ?? 'UNAVAILABLE'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded bg-[#0a0e16] border border-[#ff7a73]/30 text-[11px] text-[#bbcabf] space-y-1">
            <div className="text-[#ff7a73] font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">crisis_alert</span>
              Illustrative scenarios only; not a meteorological forecast
            </div>
            <p>
              The future rows use example rainfall values with the baseline index. They do not predict future weather or landslide occurrence; no forecast data source is connected.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#181c24] border-t border-[#262a33] flex justify-end">
          <button onClick={onClose} className="px-4 py-1.5 rounded bg-[#262a33] hover:bg-[#31353e] text-[11px] font-bold uppercase transition">
            Close Forecast
          </button>
        </div>
      </div>
    </div>
  );
};
