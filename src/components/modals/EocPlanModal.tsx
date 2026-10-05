import React from 'react';
import { SectorData } from '../../types';
import { RiskPrediction } from '../../ml/risk';

interface EocPlanModalProps {
  sector: SectorData;
  prediction: RiskPrediction | null;
  onClose: () => void;
  onDispatchAlert: () => void;
}

export const EocPlanModal: React.FC<EocPlanModalProps> = ({
  sector,
  prediction,
  onClose,
  onDispatchAlert
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#111827] border border-[#ff7a73]/40 rounded-xl overflow-hidden shadow-2xl flex flex-col font-mono text-[#dfe2ee]">
        
        {/* Modal Header */}
        <div className="px-4 py-3 bg-[#93000a] text-white flex items-center justify-between border-b border-[#ff7a73]/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-white animate-pulse">crisis_alert</span>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-white/80">EOC Emergency Action Plan</div>
              <h2 className="text-[15px] font-bold font-headline">{sector.name} — Phase III Response</h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-[12px]">
          
          {/* Status Box */}
          <div className="p-3 rounded bg-[#1c2028] border border-[#262a33] flex items-center justify-between">
            <div>
              <div className="text-[10px] text-[#86948a] uppercase">Baseline Risk Index · Sample Inputs</div>
              <div className="text-[14px] font-bold text-[#ff7a73]">
                {prediction ? `${prediction.category} (${prediction.score}/100)` : 'Prediction unavailable'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-[#86948a] uppercase">Evac Perimeter Radius</div>
              <div className="text-[14px] font-bold text-[#4edea3]">300 METERS CONVEX</div>
            </div>
          </div>

          {/* Action SOP Checklist */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#4edea3] mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">fact_check</span>
              Mandated Incident Commander Action Protocols
            </h3>
            <div className="space-y-2">
              <div className="p-2.5 rounded bg-[#181c24] border-l-4 border-[#ff7a73] flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#ff7a73] mt-0.5">notification_important</span>
                <div>
                  <div className="font-bold text-[#dfe2ee]">1. Automated Public Alert Dispatch (CAP Protocol)</div>
                  <div className="text-[#bbcabf] text-[11px] leading-relaxed">
                    Broadcast multilingual Cell Broadcast audio warning to mobile towers serving Mudis Valley, Waterfall Estate & Hairpin 7-10.
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#181c24] border-l-4 border-[#ffb95f] flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#ffb95f] mt-0.5">traffic</span>
                <div>
                  <div className="font-bold text-[#dfe2ee]">2. Road Closure & Ghat Route Diversion</div>
                  <div className="text-[#bbcabf] text-[11px] leading-relaxed">
                    Barricade Pollachi-Valparai Highway (SH-78) at Aliyar Checkpost and Waterfalls junction. Restrict heavy transit vehicles immediately.
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#181c24] border-l-4 border-[#4edea3] flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#4edea3] mt-0.5">group_add</span>
                <div>
                  <div className="font-bold text-[#dfe2ee]">3. NDRF Battalion 04 Mobilization</div>
                  <div className="text-[#bbcabf] text-[11px] leading-relaxed">
                    Stage 24 rescue personnel with hydraulic cutting gear and earth-moving JCB excavators at Valparai Fire Station staging base.
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#181c24] border-l-4 border-[#4edea3] flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#4edea3] mt-0.5">local_hospital</span>
                <div>
                  <div className="font-bold text-[#dfe2ee]">4. Medical Relief Camp Ready State</div>
                  <div className="text-[#bbcabf] text-[11px] leading-relaxed">
                    Prepare Valparai Community Health Center (Shelter A) with 50 trauma beds, back-up power generators, and blood bank reserve.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Key Contacts */}
          <div className="p-3 rounded bg-[#0a0e16] border border-[#1c2028]">
            <div className="text-[10px] text-[#86948a] uppercase font-bold mb-1.5">Direct Incident Command Hotlines</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="p-1.5 rounded bg-[#181c24]">
                <div className="text-[#86948a]">DEOC Helpline</div>
                <div className="text-[#4edea3] font-bold">1077 / 0422-2301114</div>
              </div>
              <div className="p-1.5 rounded bg-[#181c24]">
                <div className="text-[#86948a]">NDRF Staging Lead</div>
                <div className="text-[#4edea3] font-bold">+91 94450 33812</div>
              </div>
              <div className="p-1.5 rounded bg-[#181c24]">
                <div className="text-[#86948a]">District Collector Ops</div>
                <div className="text-[#4edea3] font-bold">0422-2300000</div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="px-4 py-3 bg-[#181c24] border-t border-[#262a33] flex items-center justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded bg-[#262a33] hover:bg-[#31353e] text-[#dfe2ee] text-[11px] font-bold uppercase transition"
          >
            Close View
          </button>
          <button 
            onClick={() => {
              onDispatchAlert();
              onClose();
            }}
            className="px-4 py-2 rounded bg-[#93000a] hover:bg-[#ef4444] text-white text-[11px] font-bold uppercase flex items-center gap-1.5 transition shadow-lg"
          >
            <span className="material-symbols-outlined text-[16px]">cell_tower</span>
            Dispatch Emergency Broadcast
          </button>
        </div>

      </div>
    </div>
  );
};
