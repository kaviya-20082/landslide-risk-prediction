import React from 'react';
import { IncidentEvent } from '../../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: IncidentEvent[];
  onClear: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  incidents,
  onClear
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-[#111827] border-l border-[#262a33] flex flex-col font-mono text-[#dfe2ee] shadow-2xl">
        
        {/* Drawer Header */}
        <div className="p-4 bg-[#1c2028] border-b border-[#262a33] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#4edea3]">notifications_active</span>
            <div>
              <h2 className="text-[14px] font-bold font-headline">Command Incident Notifications</h2>
              <div className="text-[10px] text-[#86948a] uppercase">{incidents.length} Telemetry & Dispatch Events</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded bg-[#262a33] hover:bg-[#31353e] flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Incidents List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {incidents.map((item) => (
            <div 
              key={item.id} 
              className={`p-3 rounded border text-[11px] ${
                item.threatLevel === 'CRITICAL'
                  ? 'bg-[#181c24] border-[#ff7a73]/40'
                  : item.threatLevel === 'HIGH'
                  ? 'bg-[#181c24] border-[#ffb95f]/40'
                  : 'bg-[#181c24] border-[#262a33]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[#4edea3]">{item.time} UTC</span>
                <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                  item.threatLevel === 'CRITICAL'
                    ? 'bg-[#93000a] text-white'
                    : item.threatLevel === 'HIGH'
                    ? 'bg-[#ee9800]/20 text-[#ffb95f]'
                    : 'bg-[#262a33] text-[#bbcabf]'
                }`}>
                  {item.threatLevel || 'INFO'}
                </span>
              </div>
              <div className="font-bold text-[#dfe2ee] mb-0.5">{item.title}</div>
              <p className="text-[#bbcabf] text-[10.5px] leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#181c24] border-t border-[#262a33] flex items-center justify-between">
          <button 
            onClick={onClear}
            className="px-3 py-1.5 rounded bg-[#262a33] hover:bg-[#31353e] text-[10px] uppercase font-bold text-[#bbcabf]"
          >
            Acknowledge All
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#4edea3] text-[#003824] text-[11px] uppercase font-bold"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
