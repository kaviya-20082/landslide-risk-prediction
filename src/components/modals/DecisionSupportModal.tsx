import React from 'react';
import { SectorData } from '../../types';
import { RiskPrediction } from '../../ml/risk';

interface DecisionSupportModalProps {
  sector: SectorData;
  prediction: RiskPrediction | null;
  onClose: () => void;
  onOpenEocPlan: () => void;
}

export const DecisionSupportModal: React.FC<DecisionSupportModalProps> = ({
  sector,
  prediction,
  onClose,
  onOpenEocPlan
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-[#111827] border border-[#4edea3]/40 rounded-xl overflow-hidden shadow-2xl flex flex-col font-mono text-[#dfe2ee]">
        
        {/* Header */}
        <div className="px-4 py-3 bg-[#003824] border-b border-[#4edea3]/30 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-[#4edea3]">psychology</span>
            <div>
              <div className="text-[10px] text-[#4edea3] uppercase font-bold">Prototype Geotechnical Decision Support</div>
              <h2 className="text-[14px] font-bold font-headline">{sector.name} — Recommended Interventions</h2>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded bg-black/30 hover:bg-black/50 text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-[12px]">
          {/* AI Recommendation Summary */}
          <div className="p-3 rounded bg-[#181c24] border border-[#262a33] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#4edea3]">Sample Action Options</span>
              <span className="text-[10px] text-[#86948a]">
                {prediction ? `BASELINE INDEX: ${prediction.score}/100 · ${prediction.category}` : 'BASELINE INDEX: UNAVAILABLE'}
              </span>
            </div>
            <p className="text-[11px] text-[#dfe2ee] leading-relaxed">
              {prediction
                ? `This prototype's heuristic risk index is ${prediction.score}/100 (${prediction.category}) from the selected sector inputs. It is not a calibrated probability or time-to-failure estimate.`
                : 'The backend prediction is unavailable, so no local substitute is shown.'} The actions below are illustrative options and require review by qualified local authorities; no sensor or forecast feed is connected.
            </p>
          </div>

          {/* Action List */}
          <div className="space-y-2">
            <div className="p-3 rounded bg-[#1c2028] border border-[#262a33] flex items-start gap-2.5">
              <span className="w-6 h-6 rounded bg-[#ff7a73]/20 text-[#ff7a73] font-bold text-[12px] flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </span>
              <div>
                <div className="font-bold text-[#dfe2ee]">Immediate Life Safety Evacuation</div>
                <div className="text-[#bbcabf] text-[11px]">
                  Evacuate 38 homes located within the 300m downslope runout trajectory towards Valparai CHC Shelter A.
                </div>
              </div>
            </div>

            <div className="p-3 rounded bg-[#1c2028] border border-[#262a33] flex items-start gap-2.5">
              <span className="w-6 h-6 rounded bg-[#ffb95f]/20 text-[#ffb95f] font-bold text-[12px] flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </span>
              <div>
                <div className="font-bold text-[#dfe2ee]">Controlled Surface Drainage Diversion</div>
                <div className="text-[#bbcabf] text-[11px]">
                  Deploy road crew with backhoes to unblock hillside catchwater drains and culvert #14 at Mudis bend to reduce water ingress into tension cracks.
                </div>
              </div>
            </div>

            <div className="p-3 rounded bg-[#1c2028] border border-[#262a33] flex items-start gap-2.5">
              <span className="w-6 h-6 rounded bg-[#4edea3]/20 text-[#4edea3] font-bold text-[12px] flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </span>
              <div>
                <div className="font-bold text-[#dfe2ee]">Geotechnical Monitoring Interval Acceleration</div>
                <div className="text-[#bbcabf] text-[11px]">
                  Increase borehole tiltmeter and piezometer polling frequency from 10 minutes to 30 seconds for high-resolution micro-creep tracking.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#181c24] border-t border-[#262a33] flex items-center justify-between">
          <button onClick={onClose} className="px-3 py-1.5 rounded bg-[#262a33] text-[11px] font-bold uppercase hover:bg-[#31353e]">
            Dismiss
          </button>
          <button 
            onClick={() => {
              onClose();
              onOpenEocPlan();
            }}
            className="px-4 py-1.5 rounded bg-[#10b981] hover:bg-[#4edea3] text-[#003824] text-[11px] font-bold uppercase transition flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">assignment_turned_in</span>
            Adopt into EOC Operations Plan
          </button>
        </div>
      </div>
    </div>
  );
};
