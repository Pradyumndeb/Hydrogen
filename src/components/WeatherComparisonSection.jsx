import React, { useState } from 'react';
import { 
  Sun, 
  CloudRain, 
  Wind, 
  Zap, 
  ArrowRight, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  HelpCircle,
  BarChart3,
  Sliders,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { computeWeatherComparison } from '../utils/simulationEngine';
import { WEATHER_PRESETS } from '../utils/constants';

export default function WeatherComparisonSection({
  config,
  activeWeatherMode,
  setWeatherMode,
}) {
  // Custom scenario configuration if user overrides
  const [customBadWindSpeed, setCustomBadWindSpeed] = useState(15.5);
  const [customBadIrradiance, setCustomBadIrradiance] = useState(175);

  const presetsToUse = {
    ...WEATHER_PRESETS,
    bad: {
      ...WEATHER_PRESETS.bad,
      solarIrradiance: customBadIrradiance,
      windSpeed: customBadWindSpeed,
    }
  };

  const comparison = computeWeatherComparison(config, presetsToUse);

  // Data for Grouped Bar Chart
  const barChartData = [
    {
      metric: 'Solar PV',
      'Good Weather': comparison.good.solarPower,
      'Bad Weather': comparison.bad.solarPower,
      unit: 'kW',
    },
    {
      metric: 'Wind Turbine',
      'Good Weather': comparison.good.windPower,
      'Bad Weather': comparison.bad.windPower,
      unit: 'kW',
    },
    {
      metric: 'Combined Total',
      'Good Weather': comparison.good.totalPower,
      'Bad Weather': comparison.bad.totalPower,
      unit: 'kW',
    },
    {
      metric: 'H₂ Rate (x10)',
      'Good Weather': Number((comparison.good.h2Rate * 10).toFixed(1)),
      'Bad Weather': Number((comparison.bad.h2Rate * 10).toFixed(1)),
      unit: '0.1 kg/h',
    },
  ];

  // Transition Curve Data (simulating transition from Good to Bad weather in 7 steps)
  const transitionData = [
    { step: 'T0 (Clear)', solar: comparison.good.solarPower, wind: comparison.good.windPower, total: comparison.good.totalPower },
    { step: 'T1 (Clouds)', solar: Number((comparison.good.solarPower * 0.7).toFixed(1)), wind: Number((comparison.good.windPower * 1.1).toFixed(1)), total: 0 },
    { step: 'T2 (Overcast)', solar: Number((comparison.good.solarPower * 0.45).toFixed(1)), wind: Number((comparison.good.windPower * 1.25).toFixed(1)), total: 0 },
    { step: 'T3 (Wind Surge)', solar: Number((comparison.good.solarPower * 0.25).toFixed(1)), wind: Number((comparison.bad.windPower * 0.9).toFixed(1)), total: 0 },
    { step: 'T4 (Storm Front)', solar: Number((comparison.bad.solarPower * 1.1).toFixed(1)), wind: comparison.bad.windPower, total: 0 },
    { step: 'T5 (Heavy Rain)', solar: comparison.bad.solarPower, wind: comparison.bad.windPower, total: comparison.bad.totalPower },
  ].map(item => ({
    ...item,
    total: item.total || Number((item.solar + item.wind).toFixed(1))
  }));

  const isCutOutActive = customBadWindSpeed >= config.windCutOutSpeed;

  return (
    <div className="glass-panel rounded-2xl p-5 lg:p-6 border border-slate-800/90 shadow-2xl space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Sun className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base lg:text-lg font-bold text-white font-heading">
                Weather Scenarios & Generation Comparison
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                SCENARIO BENCHMARK
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Evaluates Solar PV attenuation, wind aerodynamic variations, and high-wind turbine cut-out safety shutdown
            </p>
          </div>
        </div>

        {/* Quick weather scenario buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setCustomBadWindSpeed(15.5);
              setCustomBadIrradiance(175);
              setWeatherMode('good');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeWeatherMode === 'good'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Apply Good Weather</span>
          </button>

          <button
            onClick={() => {
              setCustomBadWindSpeed(15.5);
              setCustomBadIrradiance(175);
              setWeatherMode('bad');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeWeatherMode === 'bad' && !isCutOutActive
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.25)]'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5 text-blue-400" />
            <span>Apply Bad Weather (Wind Surge)</span>
          </button>

          <button
            onClick={() => {
              setCustomBadWindSpeed(26.5); // > 25 m/s cut-out
              setCustomBadIrradiance(90);
              setWeatherMode('bad');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isCutOutActive
                ? 'bg-red-500/20 text-red-300 border border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.25)]'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-red-300'
            }`}
            title="Demonstrate high wind speed exceeding 25 m/s cut-out threshold"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>Test Cut-Out Gale (&gt;25 m/s)</span>
          </button>
        </div>
      </div>

      {/* Comparison Scorecards (Good vs Bad side-by-side with Delta) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Good Weather Card */}
        <div className={`p-4 rounded-xl border transition-all ${
          activeWeatherMode === 'good'
            ? 'bg-amber-500/10 border-amber-500/40 shadow-lg'
            : 'bg-slate-900/50 border-slate-800'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="flex items-center gap-1.5 text-sm font-bold text-amber-400">
              <Sun className="w-4 h-4" /> Good Weather
            </span>
            <span className="text-[11px] font-mono text-slate-400">Scenario A</span>
          </div>

          <div className="mt-3 space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Solar Irradiance:</span>
              <span className="text-white font-bold">{comparison.good.irradiance} W/m²</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Wind Velocity:</span>
              <span className="text-white font-bold">{comparison.good.windSpeed} m/s</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
              <span className="text-amber-400">Solar PV Power:</span>
              <span className="text-amber-300 font-bold font-mono-num">{comparison.good.solarPower} kW</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cyan-400">Wind Power:</span>
              <span className="text-cyan-300 font-bold font-mono-num">{comparison.good.windPower} kW</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-800 font-semibold text-sm">
              <span className="text-emerald-400 font-sans">Combined Total:</span>
              <span className="text-emerald-300 font-mono-num">{comparison.good.totalPower} kW</span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-purple-300 pt-1">
              <span>H₂ Production Rate:</span>
              <span className="font-bold">{comparison.good.h2Rate} kg/h</span>
            </div>
          </div>
        </div>

        {/* Delta Analysis Card */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-bold text-slate-200">Comparative Delta</span>
              <span className="text-[11px] font-mono text-slate-400">Δ Bad vs Good</span>
            </div>

            <div className="mt-4 text-center">
              <span className="text-[11px] text-slate-400 uppercase font-mono block">
                Total Combined Power Change
              </span>
              <div className="flex items-center justify-center gap-2 mt-1">
                {comparison.deltaPower >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-400" />
                )}
                <span className={`text-3xl font-extrabold font-mono-num ${
                  comparison.deltaPower >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {comparison.deltaPower >= 0 ? `+${comparison.deltaPower}` : comparison.deltaPower} kW
                </span>
              </div>
              <span className={`inline-block mt-1 text-xs font-mono font-bold px-2 py-0.5 rounded ${
                comparison.pctChange >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
              }`}>
                {comparison.pctChange >= 0 ? `+${comparison.pctChange}%` : `${comparison.pctChange}%`} Difference
              </span>
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-cyan-300 block mb-0.5">Engineering Finding:</strong>
            {isCutOutActive ? (
              <span className="text-red-300">
                Wind speed exceeds cut-out ({customBadWindSpeed} m/s &gt; {config.windCutOutSpeed} m/s). Turbine shuts down for structural integrity.
              </span>
            ) : comparison.good.windPower < comparison.bad.windPower ? (
              <span>
                Solar drops sharply (-{((1 - comparison.bad.solarPower / comparison.good.solarPower) * 100).toFixed(0)}%), but wind storm increases output (+{((comparison.bad.windPower - comparison.good.windPower)).toFixed(1)} kW), buffering the DC bus!
              </span>
            ) : (
              <span>
                Both solar irradiance and wind are reduced in this scenario, leading to a {Math.abs(comparison.pctChange)}% reduction in combined electrolysis power.
              </span>
            )}
          </div>
        </div>

        {/* Bad Weather Card */}
        <div className={`p-4 rounded-xl border transition-all ${
          activeWeatherMode === 'bad'
            ? isCutOutActive ? 'bg-red-500/10 border-red-500/40 shadow-lg' : 'bg-blue-500/10 border-blue-500/40 shadow-lg'
            : 'bg-slate-900/50 border-slate-800'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className={`flex items-center gap-1.5 text-sm font-bold ${isCutOutActive ? 'text-red-400' : 'text-blue-400'}`}>
              <CloudRain className="w-4 h-4" /> Bad Weather
            </span>
            <span className="text-[11px] font-mono text-slate-400">Scenario B</span>
          </div>

          <div className="mt-3 space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Solar Irradiance:</span>
              <span className="text-white font-bold">{comparison.bad.irradiance} W/m²</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Wind Velocity:</span>
              <span className={`font-bold ${isCutOutActive ? 'text-red-400' : 'text-white'}`}>
                {comparison.bad.windSpeed} m/s {isCutOutActive && '(CUT-OUT!)'}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
              <span className="text-amber-400">Solar PV Power:</span>
              <span className="text-amber-300 font-bold font-mono-num">{comparison.bad.solarPower} kW</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cyan-400">Wind Power:</span>
              <span className={`font-bold font-mono-num ${isCutOutActive ? 'text-red-400' : 'text-cyan-300'}`}>
                {comparison.bad.windPower} kW {isCutOutActive && '(OFFLINE)'}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-800 font-semibold text-sm">
              <span className="text-emerald-400 font-sans">Combined Total:</span>
              <span className="text-emerald-300 font-mono-num">{comparison.bad.totalPower} kW</span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-purple-300 pt-1">
              <span>H₂ Production Rate:</span>
              <span className="font-bold">{comparison.bad.h2Rate} kg/h</span>
            </div>
          </div>
        </div>

      </div>

      {/* Dual Visualizations: Grouped Bar Chart + Transition Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
        
        {/* Chart 1: Grouped Bar Chart */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-200 font-mono flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Grouped Generation Benchmark (Good vs Bad)
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">Unit: kW (H₂: x10 kg/h)</span>
          </div>
          
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="metric" stroke="#64748b" fontSize={11} tickLine={false} fontFamily="JetBrains Mono" />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} fontFamily="JetBrains Mono" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', paddingTop: '8px' }} />
                <Bar dataKey="Good Weather" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Bad Weather" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Weather Transition Dynamics */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-200 font-mono flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-emerald-400" />
              Generation Profile During Weather Front Transition
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">Clear Sky → Storm Front</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={transitionData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="step" stroke="#64748b" fontSize={10} tickLine={false} fontFamily="JetBrains Mono" />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} fontFamily="JetBrains Mono" unit=" kW" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'JetBrains Mono' }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="total" name="Combined Total" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="solar" name="Solar PV" stroke="#f59e0b" strokeWidth={1.8} strokeDasharray="3 3" dot={{ r: 2 }} />
                <Line type="monotone" dataKey="wind" name="Wind Turbine" stroke="#06b6d4" strokeWidth={1.8} strokeDasharray="3 3" dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Assumptions & Physical Constraints Table */}
      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono">
        <div className="flex items-center justify-between text-slate-300 font-semibold mb-2">
          <span>Mathematical Assumptions & Scenario Configuration</span>
          <span className="text-slate-500 text-[10px]">IEC 61400 / NREL Models</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] text-slate-400">
          <div>
            <span className="text-slate-500 block">Good Weather G:</span>
            <span className="text-amber-400">{presetsToUse.good.solarIrradiance} W/m² (Air Mass 1.5)</span>
          </div>
          <div>
            <span className="text-slate-500 block">Bad Weather G:</span>
            <span className="text-blue-400">{presetsToUse.bad.solarIrradiance} W/m² (Heavy stratus cloud)</span>
          </div>
          <div>
            <span className="text-slate-500 block">Good Wind Speed:</span>
            <span className="text-cyan-400">{presetsToUse.good.windSpeed} m/s (Near rated power)</span>
          </div>
          <div>
            <span className="text-slate-500 block">Cut-Out Limit:</span>
            <span className="text-red-400">{config.windCutOutSpeed} m/s (Structural protection)</span>
          </div>
        </div>
      </div>

    </div>
  );
}
