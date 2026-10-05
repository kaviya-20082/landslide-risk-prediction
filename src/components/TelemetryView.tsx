import React, { useState, useEffect } from 'react';
import { BOREHOLE_SENSORS } from '../data/mockData';
import { SensorNode } from '../types';

export const TelemetryView: React.FC = () => {
  const [sensors, setSensors] = useState<SensorNode[]>(BOREHOLE_SENSORS);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [livePore, setLivePore] = useState<number>(48.2);
  const [liveDisp, setLiveDisp] = useState<number>(4.2);

  // Micro-fluctuation simulation
  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      setLivePore(prev => +(prev + (Math.random() * 0.4 - 0.18)).toFixed(2));
      setLiveDisp(prev => +(prev + (Math.random() * 0.05 - 0.02)).toFixed(2));
    }, 2000);
    return () => clearInterval(interval);
  }, [isStreaming]);

  return (
    <div className="flex flex-col w-full text-[#dfe2ee] pb-16 font-mono max-w-7xl mx-auto px-3 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4edea3] text-[20px]">sensors</span>
            <h1 className="font-headline text-[18px] font-bold text-[#dfe2ee]">
              Subsurface Borehole Telemetry &amp; Array Heartbeat
            </h1>
          </div>
          <p className="text-[11px] text-[#bbcabf] font-sans">
            Demonstration readings for acoustic emission, piezometers &amp; borehole tiltmeters. No external sensor feed is connected.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <button 
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-3 py-1.5 rounded font-bold uppercase transition flex items-center gap-1.5 cursor-pointer ${
              isStreaming 
                ? 'bg-[#181c24] text-[#4edea3] border border-[#4edea3]' 
                : 'bg-[#262a33] text-[#bbcabf]'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-[#4edea3] animate-pulse' : 'bg-[#86948a]'}`}></span>
            {isStreaming ? 'SIMULATED DEMO STREAM (2s)' : 'DEMO STREAM PAUSED'}
          </button>
        </div>
      </div>

      {/* Simulated Sensor Waveform Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {/* Pore Water Pressure Sensor Waveform */}
        <div className="bg-[#1c2028] border border-[#ff7a73]/40 rounded-xl p-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#262a33] pb-2 mb-2">
            <div>
              <div className="text-[9px] text-[#86948a] uppercase">Vibrating Wire Piezometer #PZ-04</div>
              <div className="font-headline text-[15px] font-bold text-[#dfe2ee]">Pore-Water Pressure (u)</div>
            </div>
            <div className="text-right">
              <div className="text-[20px] font-bold text-[#ff7a73] font-headline">{livePore} kPa</div>
              <div className="text-[9px] text-[#ff7a73] font-bold">THRESHOLD: 42.0 kPa EXCEEDED</div>
            </div>
          </div>

          {/* Simulated SVG Stream */}
          <div className="relative w-full h-28 bg-[#0a0e16] rounded border border-[#262a33] overflow-hidden p-2 flex flex-col justify-end">
            <svg className="w-full h-20" viewBox="0 0 300 60" preserveAspectRatio="none">
              <path 
                d="M 0,45 Q 30,42 60,38 T 120,32 T 180,26 T 240,16 T 300,12" 
                fill="none" 
                stroke="#ff7a73" 
                strokeWidth="2" 
              />
              <path 
                d="M 0,45 Q 30,42 60,38 T 120,32 T 180,26 T 240,16 T 300,12 L 300,60 L 0,60 Z" 
                fill="rgba(255, 122, 115, 0.15)" 
              />
              <line x1="0" y1="25" x2="300" y2="25" stroke="#ef4444" strokeWidth="0.8" strokeDasharray="3,3" />
            </svg>
            <div className="flex justify-between text-[9px] text-[#86948a] pt-1">
              <span>-60s</span>
              <span>-30s</span>
              <span>-15s</span>
              <span className="text-[#ff7a73] font-bold">SIM SAMPLE</span>
            </div>
          </div>
        </div>

        {/* Biaxial Tiltmeter Displacement Waveform */}
        <div className="bg-[#1c2028] border border-[#ffb95f]/40 rounded-xl p-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#262a33] pb-2 mb-2">
            <div>
              <div className="text-[9px] text-[#86948a] uppercase">In-Place Inclinometer Array #TL-01</div>
              <div className="font-headline text-[15px] font-bold text-[#dfe2ee]">Shear Creep Displacement</div>
            </div>
            <div className="text-right">
              <div className="text-[20px] font-bold text-[#ffb95f] font-headline">+{liveDisp} mm</div>
              <div className="text-[9px] text-[#ffb95f] font-bold">RATE: +0.65 mm/hr</div>
            </div>
          </div>

          <div className="relative w-full h-28 bg-[#0a0e16] rounded border border-[#262a33] overflow-hidden p-2 flex flex-col justify-end">
            <svg className="w-full h-20" viewBox="0 0 300 60" preserveAspectRatio="none">
              <path 
                d="M 0,50 Q 50,48 100,42 T 200,30 T 300,20" 
                fill="none" 
                stroke="#ffb95f" 
                strokeWidth="2" 
              />
              <path 
                d="M 0,50 Q 50,48 100,42 T 200,30 T 300,20 L 300,60 L 0,60 Z" 
                fill="rgba(255, 185, 95, 0.15)" 
              />
            </svg>
            <div className="flex justify-between text-[9px] text-[#86948a] pt-1">
              <span>-60s</span>
              <span>-30s</span>
              <span>-15s</span>
              <span className="text-[#ffb95f] font-bold">SIM SAMPLE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Node Inventory Table */}
      <div className="bg-[#1c2028] border border-[#262a33] rounded-xl overflow-hidden shadow-md">
        <div className="px-3 py-2.5 bg-[#262a33] flex items-center justify-between border-b border-[#31353e]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#4edea3]">developer_board</span>
            <span className="font-headline text-[13px] font-bold text-[#dfe2ee]">
              Active Geological Borehole Telemetry Hardware ({sensors.length} Nodes)
            </span>
          </div>
          <span className="text-[9px] text-[#ffb95f] font-bold">{sensors.length} SAMPLE NODES · NOT LIVE</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="bg-[#181c24] text-[9px] uppercase text-[#86948a] border-b border-[#262a33]">
                <th className="p-2.5">Node ID</th>
                <th className="p-2.5">Instrument Type</th>
                <th className="p-2.5">Depth</th>
                <th className="p-2.5">Location Strata</th>
                <th className="p-2.5">Sample Reading</th>
                <th className="p-2.5">Battery</th>
                <th className="p-2.5">Telemetry Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262a33]">
              {sensors.map((node) => (
                <tr key={node.id} className="hover:bg-[#262a33]/50 transition">
                  <td className="p-2.5 font-bold text-[#4edea3]">{node.code}</td>
                  <td className="p-2.5 text-[#dfe2ee]">{node.type}</td>
                  <td className="p-2.5 text-[#bbcabf]">{node.depth}</td>
                  <td className="p-2.5 text-[#bbcabf]">{node.location}</td>
                  <td className="p-2.5 font-bold text-white">
                    {node.code.includes('PZ') ? `${livePore} ${node.unit}` : `${node.currentReading} ${node.unit}`}
                  </td>
                  <td className="p-2.5 text-[#4edea3]">{node.battery}%</td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      node.status === 'ALERT'
                        ? 'bg-[#93000a] text-white'
                        : node.status === 'WARNING'
                        ? 'bg-[#ee9800]/20 text-[#ffb95f]'
                        : 'bg-[#10b981]/20 text-[#4edea3]'
                    }`}>
                      {node.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
