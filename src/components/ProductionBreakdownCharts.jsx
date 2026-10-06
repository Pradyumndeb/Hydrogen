import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ReferenceLine 
} from 'recharts';
import { PieChart as PieIcon, Cylinder, Sun, Wind, Activity } from 'lucide-react';

export default function ProductionBreakdownCharts({
  solarPower,
  windPower,
  history,
  electrolyzerState,
  currentSimTimeLabel,
}) {
  // Donut chart data
  const pieData = [
    { name: 'Solar PV', value: Math.max(0.1, solarPower), color: '#f59e0b' },
    { name: 'Wind Turbine', value: Math.max(0.1, windPower), color: '#06b6d4' },
  ];

  const total = solarPower + windPower;
  const solarPct = total > 0 ? ((solarPower / total) * 100).toFixed(1) : 0;
  const windPct = total > 0 ? ((windPower / total) * 100).toFixed(1) : 0;

  // Hydrogen history slice
  const h2ChartData = history.slice(-24);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      
      {/* Donut Chart: Renewable Energy Contribution */}
      <div className="glass-panel rounded-2xl p-5 lg:p-6 border border-slate-800/90 shadow-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-slate-800/80">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <PieIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-heading">
                Renewable Energy Contribution
              </h3>
              <p className="text-[11px] text-slate-400">
                Instantaneous mix between Solar PV and Wind Turbine
              </p>
            </div>
          </div>

          {/* Donut Graphic */}
          <div className="h-52 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val) => [`${Number(val).toFixed(1)} kW`, 'Generation']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold font-mono-num text-white">
                {total.toFixed(0)}
              </span>
              <span className="text-[10px] uppercase font-mono text-emerald-400 font-semibold">
                Total kW
              </span>
            </div>
          </div>
        </div>

        {/* Legend / Legend stats */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80 font-mono text-xs">
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
              <Sun className="w-3.5 h-3.5" /> Solar PV
            </div>
            <div className="text-base font-bold text-white font-mono-num mt-1">
              {solarPct}%
            </div>
            <span className="text-[10px] text-slate-400">{solarPower.toFixed(1)} kW</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-[11px]">
              <Wind className="w-3.5 h-3.5" /> Wind Turbine
            </div>
            <div className="text-base font-bold text-white font-mono-num mt-1">
              {windPct}%
            </div>
            <span className="text-[10px] text-slate-400">{windPower.toFixed(1)} kW</span>
          </div>
        </div>
      </div>

      {/* Area Chart: Hydrogen Production Rate & Profile Over Time */}
      <div className="lg:col-span-2 glass-panel rounded-2xl p-5 lg:p-6 border border-slate-800/90 shadow-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Cylinder className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-heading">
                  Hydrogen Production Rate Telemetry
                </h3>
                <p className="text-[11px] text-slate-400">
                  Mass flow production rate (kg/h) correlated to renewable power availability
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Current Flow</span>
              <span className="text-base font-bold font-mono-num text-purple-400">
                {electrolyzerState.h2RateKgPerHr.toFixed(3)} kg/h
              </span>
            </div>
          </div>

          <div className="h-56 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={h2ChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorH2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} fontFamily="JetBrains Mono" />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} fontFamily="JetBrains Mono" unit=" kg/h" />
                <Tooltip 
                  formatter={(val) => [`${Number(val).toFixed(3)} kg/h`, 'H₂ Production Rate']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                />
                {currentSimTimeLabel && (
                  <ReferenceLine 
                    x={currentSimTimeLabel} 
                    stroke="#a855f7" 
                    strokeWidth={2} 
                    strokeDasharray="3 3"
                    label={{ value: 'Now', position: 'top', fill: '#c084fc', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="h2Rate"
                  stroke="#a855f7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorH2)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
          <span>Specific Consumption: 55 kWh/kg</span>
          <span>STP Normal Volume: 1 kg H₂ ≈ 11.12 Nm³</span>
        </div>
      </div>

    </div>
  );
}
