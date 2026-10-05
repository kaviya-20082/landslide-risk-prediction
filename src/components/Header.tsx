import React, { useState, useEffect } from 'react';

interface HeaderProps {
  currentSectorId: string;
  onSelectSector: (sectorId: string) => void;
  userRole: 'EOC AUTH' | 'COMMUNITY' | 'ADMIN';
  onSelectRole: (role: 'EOC AUTH' | 'COMMUNITY' | 'ADMIN') => void;
  onOpenNotifications: () => void;
  unreadCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentSectorId,
  onSelectSector,
  userRole,
  onSelectRole,
  onOpenNotifications,
  unreadCount
}) => {
  const [utcTime, setUtcTime] = useState<string>('08:42:15');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${hours}:${minutes}:${seconds}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-[#0f131c]/95 backdrop-blur-xl border-b border-[#262a33] shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
      <div className="max-w-7xl mx-auto px-3 py-1 flex flex-col justify-between gap-1">
        
        {/* Top Demo Data Status */}
        <div className="flex items-center justify-between gap-2 text-[9px] font-mono uppercase tracking-wider text-[#86948a] border-b border-[#1c2028] pb-1">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[13px] text-[#4edea3]">sensors</span>
            <span className="text-[#bbcabf]">TELEMETRY: DEMO DATA</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-ping"></span>
            <span className="text-[#4edea3] font-semibold">UTC {utcTime}</span>
          </div>
        </div>

        {/* Primary Controls & Brand Row */}
        <div className="flex items-center justify-between gap-2 py-0.5">
          {/* Logo & Title */}
          <div className="flex items-center gap-2">
            <img 
              alt="LandslideGuard Emblem" 
              className="h-8 w-auto object-contain flex-shrink-0" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWMPIWDB1KQ8QPSfPGrt7EgCh8Zy4HRPpy_Xn0hTLJDmY2Flx8S5AeQsBcY60D35u7E2f6NdTuttrDD0JNhmmagFLaMM9uIOAvwxtVWARslIF0Ytrekt3NWT2A-EyVk74zM4kb2I3dXsotGTCv08ysekHJFDCs09QLgrA5DI_Sm2ZCf-othOL4L1kTO8gqu5sXYnaJN43UNGiTxz8iGsJyOWS7tLTDFNnHsXen1M8MLg7CV7ByRAeO"
            />
            <div className="flex flex-col">
              <span className="font-headline text-[15px] font-bold text-[#dfe2ee] leading-tight tracking-tight">
                LandslideGuard
              </span>
              <span className="font-mono text-[9px] text-[#bbcabf] uppercase tracking-widest">
                Dashboard
              </span>
            </div>
          </div>

          {/* Region selector & Authority Mode & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Region Dropdown */}
            <div className="relative flex items-center bg-[#181c24] border border-[#262a33] rounded px-2 py-1">
              <select 
                value={currentSectorId}
                onChange={(e) => onSelectSector(e.target.value)}
                className="bg-transparent text-[11px] font-mono text-[#4edea3] uppercase focus:outline-none appearance-none pr-4 cursor-pointer font-bold"
              >
                <option className="bg-[#1c2028] text-[#dfe2ee]" value="valparai">Valparai, TN</option>
                <option className="bg-[#1c2028] text-[#dfe2ee]" value="munnar">Munnar, KL</option>
                <option className="bg-[#1c2028] text-[#dfe2ee]" value="kodaikanal">Kodaikanal, TN</option>
                <option className="bg-[#1c2028] text-[#dfe2ee]" value="wayanad">Wayanad, KL</option>
                <option className="bg-[#1c2028] text-[#dfe2ee]" value="darjeeling">Darjeeling, WB</option>
              </select>
              <span className="material-symbols-outlined text-[14px] text-[#4edea3] pointer-events-none absolute right-1">
                expand_more
              </span>
            </div>

            {/* Role Switcher */}
            <div className="relative hidden xs:flex items-center bg-[#181c24] border border-[#262a33] rounded px-2 py-1">
              <select 
                value={userRole}
                onChange={(e) => onSelectRole(e.target.value as any)}
                className="bg-transparent text-[11px] font-mono text-[#dfe2ee] uppercase focus:outline-none appearance-none pr-4 cursor-pointer"
              >
                <option className="bg-[#1c2028] text-[#dfe2ee]" value="EOC AUTH">EOC AUTH</option>
                <option className="bg-[#1c2028] text-[#dfe2ee]" value="COMMUNITY">COMMUNITY</option>
                <option className="bg-[#1c2028] text-[#dfe2ee]" value="ADMIN">ADMIN</option>
              </select>
              <span className="material-symbols-outlined text-[13px] text-[#bbcabf] pointer-events-none absolute right-1">
                shield_person
              </span>
            </div>

            {/* Notification Bell */}
            <button 
              onClick={onOpenNotifications}
              title="Tactical Incident Notifications"
              className="relative w-8 h-8 flex items-center justify-center rounded bg-[#181c24] border border-[#262a33] text-[#bbcabf] hover:text-[#dfe2ee] hover:border-[#4edea3]/50 transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff7a73] text-[#79000e] rounded-full text-[9px] font-mono flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Avatar */}
            <div 
              title="Command Officer Profile"
              className="w-8 h-8 rounded-full bg-[#4edea3] flex items-center justify-center flex-shrink-0 ring-1 ring-[#4edea3]/30 cursor-pointer shadow-sm hover:brightness-110 transition"
            >
              <span className="material-symbols-outlined text-[#003824] text-[18px]">person</span>
            </div>
          </div>
        </div>

        {/* Data Source Sub-Status Bar */}
        <div className="flex items-center justify-between text-[9px] font-mono px-1 pt-0.5">
          <div className="flex items-center gap-1.5 text-[#4edea3]">
            <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
            <span className="font-bold">DEMO DISPLAY ACTIVE</span>
          </div>
          <div className="text-[#86948a] truncate">
            EXTERNAL SENSOR FEEDS: NOT CONNECTED
          </div>
        </div>

      </div>
    </header>
  );
};
