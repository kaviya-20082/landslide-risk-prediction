import React, { useState } from 'react';

export const AnalyticsView: React.FC = () => {
  const [selectedDuration, setSelectedDuration] = useState<number>(24);
  const [testRainfall, setTestRainfall] = useState<number>(142);

  // Caine Threshold equation: I = 14.82 * D^(-0.39)
  const calcThresholdRate = (d: number) => +(14.82 * Math.pow(d, -0.39)).toFixed(1);
  const hourlyRate = +(testRainfall / selectedDuration).toFixed(1);
  const thresholdRate = calcThresholdRate(selectedDuration);
  const isBreached = hourlyRate >= thresholdRate;

  return (
    <div className="flex flex-col w-full text-[#dfe2ee] pb-16 font-mono max-w-7xl mx-auto px-3 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4edea3] text-[20px]">analytics</span>
            <h1 className="font-headline text-[18px] font-bold text-[#dfe2ee]">
              Geotechnical Risk Analytics
            </h1>
          </div>
          <p className="text-[11px] text-[#bbcabf] font-sans">
            Prototype baseline status and an illustrative rainfall-duration reference calculator using sample values.
          </p>
        </div>

        <span className="px-2 py-1 rounded bg-[#262a33] text-[#4edea3] border border-[#31353e] text-[9px] font-bold">
          BASELINE ONLY · NOT VALIDATED
        </span>
      </div>

      {/* Grid: Model Stats + Caine I-D Threshold Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        
        {/* Baseline Method Status Card */}
        <div className="bg-[#1c2028] border border-[#262a33] rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between border-b border-[#262a33] pb-2 mb-2">
            <span className="font-headline text-[14px] font-bold text-[#dfe2ee]">
              Baseline Engine Status
            </span>
            <span className="text-[9px] text-[#ffb95f] font-bold">NO TRAINED MODEL</span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-[#0a0e16] p-2 rounded text-center border border-[#262a33]">
              <div className="text-[9px] text-[#86948a] uppercase">Training</div>
              <div className="font-headline text-[14px] font-bold text-[#ffb95f]">NOT AVAILABLE</div>
              <div className="text-[8px] text-[#86948a]">No model artifact</div>
            </div>
            <div className="bg-[#0a0e16] p-2 rounded text-center border border-[#262a33]">
              <div className="text-[9px] text-[#86948a] uppercase">Validation</div>
              <div className="font-headline text-[14px] font-bold text-[#ffb95f]">NOT RUN</div>
              <div className="text-[8px] text-[#86948a]">No labeled evaluation set</div>
            </div>
            <div className="bg-[#0a0e16] p-2 rounded text-center border border-[#262a33]">
              <div className="text-[9px] text-[#86948a] uppercase">Data Source</div>
              <div className="font-headline text-[14px] font-bold text-[#ffb95f]">MOCK INPUTS</div>
              <div className="text-[8px] text-[#86948a]">No external feed connected</div>
            </div>
          </div>

          {/* Baseline Inputs */}
          <div className="space-y-1.5 text-[10px]">
            <div className="text-[#86948a] uppercase font-bold text-[9px]">Six heuristic inputs (not learned feature importance):</div>
            <div className="grid grid-cols-2 gap-2 text-[#dfe2ee]">
              <span>Rainfall</span>
              <span>Soil moisture</span>
              <span>Slope</span>
              <span>Elevation</span>
              <span>Vegetation cover (NDVI)</span>
              <span>Historical landslides</span>
            </div>
            <p className="text-[#86948a]">The baseline applies fixed, documented prototype weights. They are not trained or validated against local events.</p>
          </div>
        </div>

        {/* Caine (1980) Rainfall-Duration (I-D) Threshold Model */}
        <div className="bg-[#1c2028] border border-[#262a33] rounded-xl p-3 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#262a33] pb-2 mb-2">
              <span className="font-headline text-[14px] font-bold text-[#dfe2ee]">
                Reference I-D Threshold Calculator (Caine)
              </span>
              <span className="text-[9px] text-[#ffb95f] font-bold">ILLUSTRATIVE ONLY</span>
            </div>

            <p className="text-[11px] text-[#bbcabf] font-sans mb-3">
              $I = 14.82 \cdot D^{-0.39}$. This reference equation is shown for exploration only; it is not locally calibrated and does not produce a landslide probability or safety determination.
            </p>

            {/* Interactive Inputs */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-[#0a0e16] p-2 rounded border border-[#262a33]">
                <label className="text-[9px] text-[#86948a] uppercase block mb-1">Rain Duration (Hours)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="72"
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-[#181c24] text-[#dfe2ee] border border-[#262a33] px-2 py-1 rounded text-[13px] font-bold"
                />
              </div>

              <div className="bg-[#0a0e16] p-2 rounded border border-[#262a33]">
                <label className="text-[9px] text-[#86948a] uppercase block mb-1">Total Rainfall (mm)</label>
                <input 
                  type="number" 
                  min="10" 
                  max="500"
                  value={testRainfall}
                  onChange={(e) => setTestRainfall(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-[#181c24] text-[#dfe2ee] border border-[#262a33] px-2 py-1 rounded text-[13px] font-bold"
                />
              </div>
            </div>

            {/* Outcome Display */}
            <div className={`p-3 rounded border text-[11px] ${isBreached ? 'bg-[#93000a]/20 border-[#ff7a73]' : 'bg-[#10b981]/20 border-[#4edea3]'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#86948a] uppercase text-[9px]">Calculated Intensity:</span>
                <span className="font-bold text-[14px]">{hourlyRate} mm/hr</span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#86948a] uppercase text-[9px]">Failure Threshold:</span>
                <span className="font-bold text-[14px]">{thresholdRate} mm/hr</span>
              </div>
              <div className={`font-bold mt-2 text-[12px] flex items-center gap-1.5 ${isBreached ? 'text-[#ff7a73]' : 'text-[#4edea3]'}`}>
                <span className="material-symbols-outlined text-[16px]">
                  {isBreached ? 'dangerous' : 'verified'}
                </span>
                {isBreached ? 'ABOVE ILLUSTRATIVE REFERENCE THRESHOLD' : 'BELOW ILLUSTRATIVE REFERENCE THRESHOLD'}
              </div>
            </div>
          </div>

          <div className="text-[9px] text-[#86948a] pt-2 border-t border-[#262a33] mt-2">
            Example inputs only. No Geological Survey of India or regional calibration data is connected.
          </div>
        </div>

      </div>

      {/* Historical Slide Catalog Archive */}
      <div className="bg-[#1c2028] border border-[#262a33] rounded-xl overflow-hidden shadow-md">
        <div className="px-3 py-2 bg-[#262a33] border-b border-[#31353e] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#4edea3]">folder_managed</span>
            <span className="font-headline text-[13px] font-bold text-[#dfe2ee]">
              Historical Landslide Catalog · Sample Records
            </span>
          </div>
          <span className="text-[9px] text-[#ffb95f]">SAMPLE DATA · NOT VERIFIED</span>
        </div>

        <div className="overflow-x-auto text-[11px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#181c24] text-[9px] uppercase text-[#86948a] border-b border-[#262a33]">
                <th className="p-2.5">Date</th>
                <th className="p-2.5">Location</th>
                <th className="p-2.5">Slide Type</th>
                <th className="p-2.5">Trigger Rainfall</th>
                <th className="p-2.5">Estimated Debris Volume</th>
                <th className="p-2.5">Road Blockage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262a33]">
              <tr className="hover:bg-[#262a33]/40">
                <td className="p-2.5 font-bold text-[#dfe2ee]">18 Aug 2021</td>
                <td className="p-2.5 text-[#bbcabf]">Mudis Hairpin #9</td>
                <td className="p-2.5 text-[#ff7a73] font-bold">Rotational Soil Slump</td>
                <td className="p-2.5 text-[#4edea3]">168 mm (24h)</td>
                <td className="p-2.5">4,200 m³</td>
                <td className="p-2.5 text-[#ff7a73]">18 Hours Closed</td>
              </tr>
              <tr className="hover:bg-[#262a33]/40">
                <td className="p-2.5 font-bold text-[#dfe2ee]">09 Jul 2019</td>
                <td className="p-2.5 text-[#bbcabf]">Waterfalls Estate West</td>
                <td className="p-2.5 text-[#ffb95f]">Colluvial Debris Flow</td>
                <td className="p-2.5 text-[#4edea3]">192 mm (24h)</td>
                <td className="p-2.5">8,500 m³</td>
                <td className="p-2.5 text-[#ff7a73]">36 Hours Closed</td>
              </tr>
              <tr className="hover:bg-[#262a33]/40">
                <td className="p-2.5 font-bold text-[#dfe2ee]">14 Aug 2018</td>
                <td className="p-2.5 text-[#bbcabf]">Karamalai Ridge Pass</td>
                <td className="p-2.5 text-[#ff7a73]">Translational Rock Slide</td>
                <td className="p-2.5 text-[#4edea3]">210 mm (24h)</td>
                <td className="p-2.5">12,000 m³</td>
                <td className="p-2.5 text-[#ff7a73]">4 Days Blocked</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
