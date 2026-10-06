import React from 'react';
import { 
  Sun, 
  Wind, 
  Zap, 
  Cylinder, 
  TrendingUp, 
  Gauge, 
  Thermometer, 
  Activity, 
  Layers, 
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

export default function MainPowerCards({
  solarState,
  windState,
  combinedState,
  electrolyzerState,
  accumulators,
  history,
  config,
  weatherMode,
  dataSource = 'weather_adjusted',
}) {
  // Sparkline data (last 15 points)
  const sparklineData = history.slice(-15).map((pt, idx) => ({
    i: idx,
    solar: pt.solarPower,
    wind: pt.windPower,
    combined: pt.combinedPower,
    h2: pt.h2Rate,
  }));

  // Tank calculations
  const tankMass = Math.min(config.h2TankCapacity, accumulators.totalH2ProducedKg + (config.h2TankCapacity * (config.initialTankFillPct / 100)));
  const tankFillPct = Math.min(100, Math.max(0, (tankMass / config.h2TankCapacity) * 100));
  const tankPressureBar = Math.round((tankFillPct / 100) * config.tankDesignPressure);

  const renderSourceBadge = () => {
    if (dataSource === 'measured') {
      return (
        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          Measured (CSV)
        </span>
      );
    }
    if (dataSource === 'weather_adjusted') {
      return (
        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
          Weather-Adjusted
        </span>
      );
    }
    return (
      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30">
        Modelled
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
      
      {/* ================= CARD 1: SOLAR PV GENERATION ================= */}
      <div className="glass-panel glass-panel-solar rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-amber-500/40 hover:shadow-[0_8px_30px_rgba(245,158,11,0.12)]">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Sun className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 font-mono">
                Generation Node 01
              </span>
              <h3 className="text-sm font-semibold text-white">Solar PV System</h3>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {renderSourceBadge()}
            <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-slate-800 text-slate-300 border border-slate-700">
              {config.solarRatedPower} kWp
            </span>
          </div>
        </div>

        {/* Primary Metric: Current Power */}
        <div className="my-2.5">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl lg:text-4xl font-extrabold font-mono-num text-white tracking-tight drop-shadow-sm">
              {solarState.power.toFixed(1)}
            </span>
            <span className="text-sm font-bold text-amber-400 font-mono">kW</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
            <span className="text-slate-300 font-medium">Status:</span>
            <span className="text-amber-300 font-medium">{solarState.status}</span>
          </div>
        </div>

        {/* Live Sparkline Graph */}
        <div className="h-14 w-full my-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id="solarSpark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="solar" 
                stroke="#f59e0b" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#solarSpark)" 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sub-metrics Grid */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80">
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 font-mono block">Energy Output</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold font-mono-num text-slate-100">
                {accumulators.solarEnergyKWh.toFixed(2)}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">kWh</span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 font-mono block">PV Efficiency</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold font-mono-num text-amber-300">
                {solarState.efficiency.toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                ({solarState.tempDeratePct > 0 ? `-${solarState.tempDeratePct}% T` : 'Nom'})
              </span>
            </div>
          </div>
        </div>

        {/* Card Footer badges */}
        <div className="flex items-center justify-between mt-2.5 pt-2 text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <Sun className="w-3 h-3 text-amber-400" />
            <span>G: {config.solarIrradiance} W/m²</span>
          </span>
          <span className="flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-red-400" />
            <span>T_cell: {config.solarCellTemp}°C</span>
          </span>
        </div>
      </div>

      {/* ================= CARD 2: WIND POWER GENERATION ================= */}
      <div className={`glass-panel glass-panel-wind rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_8px_30px_rgba(6,182,212,0.12)] ${
        windState.isCutOut ? 'border-red-500/60 bg-red-950/20' : ''
      }`}>
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              windState.isCutOut 
                ? 'bg-red-500/20 border-red-500/40 text-red-400' 
                : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
            }`}>
              <Wind className={`w-5 h-5 ${windState.power > 0 ? 'animate-spin-slow' : ''}`} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400/90 font-mono">
                Generation Node 02
              </span>
              <h3 className="text-sm font-semibold text-white">Wind Turbine</h3>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {renderSourceBadge()}
            <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-slate-800 text-slate-300 border border-slate-700">
              {config.windRatedPower} kW
            </span>
          </div>
        </div>

        {/* Primary Metric: Current Power */}
        <div className="my-2.5">
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl lg:text-4xl font-extrabold font-mono-num tracking-tight drop-shadow-sm ${
              windState.isCutOut ? 'text-red-400' : 'text-white'
            }`}>
              {windState.power.toFixed(1)}
            </span>
            <span className="text-sm font-bold text-cyan-400 font-mono">kW</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs">
            {windState.isCutOut ? (
              <span className="inline-flex items-center gap-1 text-red-400 font-semibold animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                Cut-out shutdown (&gt;{config.windCutOutSpeed} m/s)
              </span>
            ) : (
              <span className="text-cyan-300 font-medium">{windState.status}</span>
            )}
          </div>
        </div>

        {/* Live Sparkline Graph */}
        <div className="h-14 w-full my-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id="windSpark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="wind" 
                stroke="#06b6d4" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#windSpark)" 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sub-metrics Grid */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80">
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 font-mono block">Energy Output</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold font-mono-num text-slate-100">
                {accumulators.windEnergyKWh.toFixed(2)}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">kWh</span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 font-mono block">Wind Velocity</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-base font-bold font-mono-num ${windState.isCutOut ? 'text-red-400' : 'text-cyan-300'}`}>
                {windState.windSpeed.toFixed(1)}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">m/s</span>
            </div>
          </div>
        </div>

        {/* Card Footer badges */}
        <div className="flex items-center justify-between mt-2.5 pt-2 text-[11px] text-slate-400 font-mono">
          <span>Cut-in: {config.windCutInSpeed} m/s</span>
          <span>Rated: {config.windRatedSpeed} m/s</span>
          <span className={windState.isCutOut ? 'text-red-400 font-bold' : ''}>
            Cut-out: {config.windCutOutSpeed} m/s
          </span>
        </div>
      </div>

      {/* ================= CARD 3: COMBINED HYBRID GENERATION ================= */}
      <div className="glass-panel glass-panel-hybrid rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-emerald-500/40 hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)]">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400/90 font-mono">
                Hybrid Summation
              </span>
              <h3 className="text-sm font-semibold text-white">Combined Generation</h3>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {renderSourceBadge()}
            <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              P_pv + P_wind
            </span>
          </div>
        </div>

        {/* Primary Metric: Total Power */}
        <div className="my-2.5">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl lg:text-4xl font-extrabold font-mono-num text-white tracking-tight drop-shadow-sm">
              {combinedState.totalPower.toFixed(1)}
            </span>
            <span className="text-sm font-bold text-emerald-400 font-mono">kW</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
            <span>Solar: <strong className="text-amber-300 font-mono">{combinedState.solarShare}%</strong></span>
            <span>•</span>
            <span>Wind: <strong className="text-cyan-300 font-mono">{combinedState.windShare}%</strong></span>
          </div>
        </div>

        {/* Contribution Bar Graph */}
        <div className="my-3">
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden flex shadow-inner border border-slate-700/50">
            <div 
              style={{ width: `${combinedState.solarShare}%` }} 
              className="bg-gradient-to-r from-amber-500 to-amber-400 h-full transition-all duration-300"
              title={`Solar Contribution: ${combinedState.solarShare}%`}
            />
            <div 
              style={{ width: `${combinedState.windShare}%` }} 
              className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-full transition-all duration-300"
              title={`Wind Contribution: ${combinedState.windShare}%`}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-1 px-1">
            <span className="text-amber-400">☀️ Solar ({solarState.power.toFixed(0)} kW)</span>
            <span className="text-cyan-400">💨 Wind ({windState.power.toFixed(0)} kW)</span>
          </div>
        </div>

        {/* Sub-metrics Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 font-mono block">Total Cumulative</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold font-mono-num text-emerald-300">
                {accumulators.totalEnergyKWh.toFixed(2)}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">kWh</span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 font-mono block">Plant Capacity</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold font-mono-num text-slate-200">
                {(config.solarRatedPower + config.windRatedPower)}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">kW installed</span>
            </div>
          </div>
        </div>

        {/* Card Footer badges */}
        <div className="flex items-center justify-between mt-2.5 pt-2 text-[11px] text-slate-400 font-mono">
          <span className="text-slate-300">Net Bus Avail:</span>
          <span className="text-emerald-300 font-bold">
            {electrolyzerState.availablePower.toFixed(1)} kW (Aux: -{config.auxiliaryLoad} kW)
          </span>
        </div>
      </div>

      {/* ================= CARD 4: HYDROGEN PRODUCTION ================= */}
      <div className="glass-panel glass-panel-h2 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-purple-500/40 hover:shadow-[0_8px_30px_rgba(139,92,246,0.12)]">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <Cylinder className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400/90 font-mono">
                Electrolysis Node 03
              </span>
              <h3 className="text-sm font-semibold text-white">Green H₂ Production</h3>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {renderSourceBadge()}
            <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30">
              {config.electrolyzerRatedPower} kW Ely
            </span>
          </div>
        </div>

        {/* Production Rate & Tank Visual in horizontal split */}
        <div className="flex items-center justify-between gap-3 my-2">
          {/* Rate & input */}
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl lg:text-4xl font-extrabold font-mono-num text-white tracking-tight drop-shadow-sm">
                {electrolyzerState.h2RateKgPerHr.toFixed(3)}
              </span>
              <span className="text-sm font-bold text-purple-400 font-mono">kg/h</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex flex-col gap-0.5">
              <span>Ely Input: <strong className="text-purple-300 font-mono">{electrolyzerState.electrolyzerPower.toFixed(1)} kW</strong></span>
              <span className="text-[11px] text-slate-500">Volumetric: {electrolyzerState.h2RateNm3PerHr.toFixed(1)} Nm³/h</span>
            </div>
          </div>

          {/* High-tech Hydrogen Tank Visual */}
          <div className="flex flex-col items-center">
            <div className="relative w-14 h-20 rounded-t-xl rounded-b-lg border-2 border-purple-400/60 bg-slate-900/90 overflow-hidden flex flex-col justify-end shadow-[0_0_15px_rgba(139,92,246,0.25)]">
              {/* Tank valve top */}
              <div className="absolute top-0 inset-x-3 h-1.5 bg-purple-300 rounded-b" />
              
              {/* Filling Liquid/Gas Layer */}
              <div 
                style={{ height: `${tankFillPct}%` }}
                className="w-full bg-gradient-to-t from-purple-600 via-indigo-500 to-cyan-400 transition-all duration-500 relative flex items-center justify-center"
              >
                {/* Bubble animation inside if active */}
                {electrolyzerState.h2RateKgPerHr > 0 && (
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent animate-pulse" />
                )}
              </div>

              {/* Tank percentage badge */}
              <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold font-mono text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                {tankFillPct.toFixed(0)}%
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-1">{tankPressureBar} bar</span>
          </div>
        </div>

        {/* Sub-metrics Grid */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80">
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 font-mono block">Total H₂ Produced</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold font-mono-num text-purple-300">
                {accumulators.totalH2ProducedKg.toFixed(2)}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">kg</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              ({(accumulators.totalH2ProducedKg * 1000).toFixed(0)} g)
            </span>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 font-mono block">Ely Efficiency</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold font-mono-num text-slate-100">
                {electrolyzerState.lhvEfficiency}%
              </span>
              <span className="text-[10px] text-slate-400 font-mono">LHV</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              SEC: {config.specificEnergyConsumption} kWh/kg
            </span>
          </div>
        </div>

        {/* Card Footer badges */}
        <div className="flex items-center justify-between mt-2.5 pt-2 text-[11px] text-slate-400 font-mono">
          <span className="text-slate-300 truncate max-w-[170px]" title={electrolyzerState.status}>
            {electrolyzerState.status}
          </span>
          <span className="text-purple-300 font-semibold">
            Tank: {tankMass.toFixed(1)} / {config.h2TankCapacity} kg
          </span>
        </div>
      </div>

    </div>
  );
}
