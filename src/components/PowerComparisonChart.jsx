import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Brush,
  ReferenceLine
} from 'recharts';
import { 
  LineChart as ChartIcon, 
  Clock, 
  Maximize2, 
  Zap, 
  Sun, 
  Wind, 
  Cylinder, 
  Activity, 
  Layers,
  ZoomIn
} from 'lucide-react';

export default function PowerComparisonChart({ 
  history, 
  currentSimTimeLabel = '12:00',
  currentTimePoint = null,
}) {
  // Time range filter: '1h' | '6h' | '12h' | '24h' | 'full'
  const [timeRange, setTimeRange] = useState('full');
  const [showBrush, setShowBrush] = useState(true);
  
  // Series visibility toggles for all 6 required telemetry channels
  const [visibleSeries, setVisibleSeries] = useState({
    solar: true,
    wind: true,
    combined: true,
    electrolyzer: true,
    h2Rate: true,
    cumulativeH2: true,
  });

  const toggleSeries = (key) => {
    setVisibleSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Filter dataset based on selected time range
  const getFilteredData = () => {
    if (!history || history.length === 0) return [];
    if (timeRange === 'full') return history;

    // Determine slice count based on range
    const totalCount = history.length;
    let count = totalCount;
    if (timeRange === '1h') count = Math.min(totalCount, 12);
    else if (timeRange === '6h') count = Math.min(totalCount, 25);
    else if (timeRange === '12h') count = Math.min(totalCount, 49);
    else if (timeRange === '24h') count = Math.min(totalCount, 97);

    // If current time index is found, center around it or take trailing
    const currentIdx = history.findIndex((pt) => pt.time === currentSimTimeLabel);
    if (currentIdx !== -1 && count < totalCount) {
      const start = Math.max(0, Math.min(totalCount - count, currentIdx - Math.floor(count / 2)));
      return history.slice(start, start + count);
    }

    return history.slice(-count);
  };

  const chartData = getFilteredData();

  // Custom rich engineering tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/40 shadow-2xl text-xs font-mono min-w-[230px] backdrop-blur-xl">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/80">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Time: {label}</span>
            </span>
            {label === currentSimTimeLabel && (
              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                CURRENT
              </span>
            )}
          </div>
          <div className="space-y-1.5">
            {payload.map((entry, index) => {
              const isH2 = entry.dataKey === 'h2Rate' || entry.dataKey === 'cumulativeH2';
              const unit = entry.dataKey === 'h2Rate' ? 'kg/h' : entry.dataKey === 'cumulativeH2' ? 'kg' : 'kW';
              return (
                <div key={`tooltip-${index}`} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-300">{entry.name}:</span>
                  </span>
                  <span className="font-bold text-white font-mono-num">
                    {Number(entry.value).toFixed(isH2 ? 3 : 1)} {unit}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-2xl p-5 lg:p-6 border border-slate-800/90 shadow-2xl relative space-y-4">
      
      {/* Chart Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        
        {/* Title & Description */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <ChartIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base lg:text-lg font-bold text-white font-heading">
                Renewable Generation & Green Hydrogen Telemetry Timeline
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                6-SERIES SYNCHRONIZED
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Solar PV, Wind Turbine, Hybrid Bus, Electrolyzer Dispatch, Instantaneous H₂ Rate, and Cumulative Production
            </p>
          </div>
        </div>

        {/* Time range selector pills & Brush toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1 mr-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" /> Range:
          </span>
          {['1h', '6h', '12h', '24h', 'full'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                timeRange === range
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {range === 'full' ? 'FULL PERIOD' : range.toUpperCase()}
            </button>
          ))}

          <button
            onClick={() => setShowBrush(!showBrush)}
            className={`p-1.5 rounded-lg border text-xs font-mono transition-all ml-1 ${
              showBrush 
                ? 'bg-slate-800 text-cyan-300 border-cyan-500/40' 
                : 'bg-slate-900/60 text-slate-500 border-slate-800'
            }`}
            title="Toggle Interactive Zoom Brush Slider"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Series Visibility Toggles Bar (All 6 Required Telemetries) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 py-1 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-mono text-[11px] mr-1">Display Series:</span>
          
          {/* 1. Solar PV */}
          <button
            onClick={() => toggleSeries('solar')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-mono transition-all ${
              visibleSeries.solar
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-900/40 text-slate-500 border-slate-800 line-through opacity-60'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Solar PV (kW)</span>
          </button>

          {/* 2. Wind Turbine */}
          <button
            onClick={() => toggleSeries('wind')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-mono transition-all ${
              visibleSeries.wind
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-sm'
                : 'bg-slate-900/40 text-slate-500 border-slate-800 line-through opacity-60'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>Wind Turbine (kW)</span>
          </button>

          {/* 3. Combined Total */}
          <button
            onClick={() => toggleSeries('combined')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-mono transition-all ${
              visibleSeries.combined
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-slate-900/40 text-slate-500 border-slate-800 line-through opacity-60'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Combined Total (kW)</span>
          </button>

          {/* 4. Electrolyzer Input */}
          <button
            onClick={() => toggleSeries('electrolyzer')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-mono transition-all ${
              visibleSeries.electrolyzer
                ? 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-sm'
                : 'bg-slate-900/40 text-slate-500 border-slate-800 line-through opacity-60'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span>Electrolyzer Input (kW)</span>
          </button>

          {/* 5. Hydrogen Production Rate */}
          <button
            onClick={() => toggleSeries('h2Rate')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-mono transition-all ${
              visibleSeries.h2Rate
                ? 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/40 shadow-sm'
                : 'bg-slate-900/40 text-slate-500 border-slate-800 line-through opacity-60'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-400" />
            <span>H₂ Rate (kg/h)</span>
          </button>

          {/* 6. Cumulative Hydrogen */}
          <button
            onClick={() => toggleSeries('cumulativeH2')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-mono transition-all ${
              visibleSeries.cumulativeH2
                ? 'bg-teal-500/15 text-teal-300 border-teal-500/40 shadow-sm'
                : 'bg-slate-900/40 text-slate-500 border-slate-800 line-through opacity-60'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
            <span>Cumulative H₂ (kg)</span>
          </button>
        </div>

        {/* Current Time Indicator badge */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-300 bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-800/60">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Timeline Marker: <strong className="text-white">{currentSimTimeLabel}</strong></span>
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="h-80 sm:h-96 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 15, right: 35, left: -5, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorWind" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorCombined" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorEly" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorH2Rate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e879f9" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#e879f9" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorCumH2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.7} />
            
            <XAxis 
              dataKey="time" 
              stroke="#64748b" 
              fontSize={11} 
              tickLine={false}
              fontFamily="JetBrains Mono"
            />
            
            {/* Left Y-Axis: Power (kW) */}
            <YAxis 
              yAxisId="power"
              stroke="#64748b" 
              fontSize={11} 
              tickLine={false}
              unit=" kW"
              fontFamily="JetBrains Mono"
            />

            {/* Right Y-Axis: Hydrogen Metrics (kg or kg/h) */}
            <YAxis 
              yAxisId="hydrogen"
              orientation="right"
              stroke="#a855f7" 
              fontSize={11} 
              tickLine={false}
              unit=" kg"
              fontFamily="JetBrains Mono"
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Vertical Reference Line indicating Current Simulation Time (Requirement 5) */}
            {currentSimTimeLabel && (
              <ReferenceLine 
                x={currentSimTimeLabel} 
                yAxisId="power"
                stroke="#38bdf8" 
                strokeWidth={2.5} 
                strokeDasharray="4 4"
                label={{ 
                  value: `▶ Now: ${currentSimTimeLabel}`, 
                  position: 'top', 
                  fill: '#38bdf8', 
                  fontSize: 11,
                  fontFamily: 'JetBrains Mono',
                  fontWeight: 'bold',
                }} 
              />
            )}

            {/* 1. Combined Total Power */}
            {visibleSeries.combined && (
              <Area
                yAxisId="power"
                type="monotone"
                dataKey="combinedPower"
                name="Combined Total Power"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorCombined)"
                dot={false}
              />
            )}

            {/* 2. Solar PV Power */}
            {visibleSeries.solar && (
              <Area
                yAxisId="power"
                type="monotone"
                dataKey="solarPower"
                name="Solar PV Power"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSolar)"
                dot={false}
              />
            )}

            {/* 3. Wind Turbine Power */}
            {visibleSeries.wind && (
              <Area
                yAxisId="power"
                type="monotone"
                dataKey="windPower"
                name="Wind Turbine Power"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorWind)"
                dot={false}
              />
            )}

            {/* 4. Electrolyzer Power */}
            {visibleSeries.electrolyzer && (
              <Area
                yAxisId="power"
                type="monotone"
                dataKey="electrolyzerPower"
                name="Electrolyzer Power"
                stroke="#a855f7"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#colorEly)"
                dot={false}
              />
            )}

            {/* 5. Hydrogen Production Rate (kg/h) on secondary axis */}
            {visibleSeries.h2Rate && (
              <Line
                yAxisId="hydrogen"
                type="monotone"
                dataKey="h2Rate"
                name="H₂ Rate (kg/h)"
                stroke="#e879f9"
                strokeWidth={2}
                dot={false}
              />
            )}

            {/* 6. Cumulative Hydrogen Production (kg) on secondary axis */}
            {visibleSeries.cumulativeH2 && (
              <Line
                yAxisId="hydrogen"
                type="monotone"
                dataKey="cumulativeH2"
                name="Cumulative H₂ (kg)"
                stroke="#2dd4bf"
                strokeWidth={2.2}
                strokeDasharray="2 2"
                dot={false}
              />
            )}

            {/* Interactive Brush for Zooming into smaller time ranges (Requirement 5) */}
            {showBrush && chartData.length > 5 && (
              <Brush 
                dataKey="time" 
                height={26} 
                stroke="#06b6d4"
                fill="#0b1329"
                tickFormatter={(val) => val}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer with Mathematical & Chronological Summary */}
      <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Combined = Solar + Wind</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Electrolyzer = min(P_comb, P_rated_ely)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400" />
            <span>Rate = P_ely / 55 kWh/kg</span>
          </span>
        </div>
        <div className="text-slate-500">
          Vertical dashed cyan line indicates active simulation clock timestamp
        </div>
      </div>

    </div>
  );
}
