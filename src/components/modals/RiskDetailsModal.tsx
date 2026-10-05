import React from 'react';
import { SectorData } from '../../types';
import { RiskPrediction } from '../../ml/risk';

interface RiskDetailsModalProps {
  sector: SectorData;
  prediction: RiskPrediction | null;
  onClose: () => void;
}

export const RiskDetailsModal: React.FC<RiskDetailsModalProps> = ({ sector, prediction, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-[#111827] border border-[#262a33] rounded-xl overflow-hidden shadow-2xl flex flex-col font-mono text-[#dfe2ee]">
        
        {/* Header */}
        <div className="px-4 py-3 bg-[#1c2028] border-b border-[#262a33] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#4edea3]">geology</span>
            <div>
              <div className="text-[10px] text-[#86948a] uppercase">Geotechnical Analysis</div>
              <h2 className="text-[14px] font-bold font-headline">{sector.name} — Geotechnical Parameters</h2>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded bg-[#262a33] hover:bg-[#31353e] flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-[12px]">
          <div className="p-3 rounded bg-[#181c24] border border-[#4edea3]/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#86948a] uppercase">Baseline risk index</span>
              <span className="font-bold text-[#4edea3]">
                {prediction ? `${prediction.score}/100 · ${prediction.category}` : 'Prediction unavailable'}
              </span>
            </div>
            <p className="text-[10px] text-[#bbcabf]">
              {prediction?.disclaimer ?? 'The backend prediction could not be loaded. No local substitute is being shown.'}
            </p>
            <div className="space-y-1.5">
              {prediction?.factors.map((factor) => (
                <div key={factor.key} className="flex items-start justify-between gap-3 text-[10px]">
                  <span className="text-[#dfe2ee]">{factor.explanation}</span>
                  <span className="flex-shrink-0 text-[#ffb95f]">{factor.contributionPoints}/{factor.maximumPoints} pts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 rounded bg-[#181c24] border border-[#262a33]">
              <div className="text-[9px] text-[#86948a] uppercase">Factor of Safety (FS)</div>
              <div className="text-[18px] font-bold text-[#ff7a73]">0.94</div>
              <div className="text-[9px] text-[#ff7a73]">&lt; 1.0 (Unstable Equilibrium)</div>
            </div>
            <div className="p-2.5 rounded bg-[#181c24] border border-[#262a33]">
              <div className="text-[9px] text-[#86948a] uppercase">Pore Water Press (u)</div>
              <div className="text-[18px] font-bold text-[#ff7a73]">{sector.porePressure} kPa</div>
              <div className="text-[9px] text-[#86948a]">Critical limit: 42 kPa</div>
            </div>
            <div className="p-2.5 rounded bg-[#181c24] border border-[#262a33]">
              <div className="text-[9px] text-[#86948a] uppercase">Shear Displacement</div>
              <div className="text-[18px] font-bold text-[#ffb95f]">{sector.slopeShearDisp} mm</div>
              <div className="text-[9px] text-[#ffb95f]">Creep rate: 0.8mm/hr</div>
            </div>
            <div className="p-2.5 rounded bg-[#181c24] border border-[#262a33]">
              <div className="text-[9px] text-[#86948a] uppercase">Internal Friction (φ)</div>
              <div className="text-[18px] font-bold text-[#4edea3]">29.4°</div>
              <div className="text-[9px] text-[#86948a]">Cohesion c': 12.8 kPa</div>
            </div>
          </div>

          {/* Geological Stratigraphy profile */}
          <div className="p-3 rounded bg-[#1c2028] border border-[#262a33] space-y-2">
            <div className="text-[10px] text-[#4edea3] uppercase font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">layers</span>
              Subsurface Stratigraphy & Slip Plane Horizon
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between p-2 rounded bg-[#0a0e16] border border-[#262a33]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#3b2b1e]"></span>
                  <span>0.0m - 3.2m: Colluvial Topsoil & Silt (High Porosity)</span>
                </div>
                <span className="text-[#4edea3] font-bold">100% Sat</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#0a0e16] border border-[#ff7a73]/50">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#ff7a73]"></span>
                  <span className="text-[#ff7a73] font-bold">3.2m - 7.8m: Active Rupture Surface (Weathered Charnockite)</span>
                </div>
                <span className="text-[#ff7a73] font-bold">SHEAR PLANE</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#0a0e16] border border-[#262a33]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#5a6275]"></span>
                  <span>7.8m - 25.0m: Intact Archaean Gneiss Bedrock</span>
                </div>
                <span className="text-[#bbcabf]">Competent Strata</span>
              </div>
            </div>
          </div>

          {/* Telemetry Sensor health note */}
          <div className="p-3 rounded bg-[#181c24] border border-[#262a33] text-[11px] leading-relaxed text-[#bbcabf]">
            <span className="text-[#4edea3] font-bold">Sensor Validation: </span>
            The prediction above is a transparent baseline index calculated from the sector's sample inputs. No trained model, connected sensor feed, or locally validated calibration is represented here.
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#181c24] border-t border-[#262a33] flex justify-end">
          <button onClick={onClose} className="px-4 py-1.5 rounded bg-[#262a33] hover:bg-[#31353e] text-[11px] font-bold uppercase transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
