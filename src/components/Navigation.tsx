import React from 'react';

export type TabType = 'dashboard' | 'risk-map' | 'live-telemetry' | 'analytics' | 'alerts' | 'operations-hub';

interface NavigationProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  alertBadgeCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onChangeTab,
  alertBadgeCount = 3
}) => {
  const navItems: { id: TabType; label: string; icon: string; badge?: number }[] = [
    { id: 'dashboard', label: 'Dash', icon: 'dashboard' },
    { id: 'risk-map', label: 'Map', icon: 'map' },
    { id: 'live-telemetry', label: 'Telem', icon: 'show_chart' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics' },
    { id: 'alerts', label: 'Alerts', icon: 'warning', badge: alertBadgeCount },
    { id: 'operations-hub', label: 'Ops', icon: 'more_horiz' },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-[#0f131c]/95 backdrop-blur-xl border-t border-[#262a33] shadow-[0_-2px_12px_rgba(0,0,0,0.5)]">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`relative flex flex-col items-center justify-center min-w-[44px] min-h-[44px] transition cursor-pointer select-none ${
                isActive ? 'text-[#4edea3]' : 'text-[#bbcabf] hover:text-[#dfe2ee]'
              }`}
            >
              <div className="relative">
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.badge && item.badge > 0 && !isActive && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-[#ff7a73] text-[#79000e] text-[8px] font-mono font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[9px] font-mono uppercase mt-0.5 tracking-wider ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#4edea3] mt-0.5"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
