import React from 'react';
import { 
  Sun, 
  Wind, 
  Zap, 
  Cpu, 
  Cylinder, 
  Ship, 
  Activity, 
  ArrowRight, 
  Layers, 
  Share2, 
  Flame, 
  AlertTriangle,
  Radio,
  Power
} from 'lucide-react';

export default function EnergyFlowDiagram({
  solarState,
  windState,
  combinedState,
  electrolyzerState,
  fuelCellState,
  config,
  isRunning,
}) {
  const isSolarGenerating = solarState.power > 0;
  const isWindGenerating = windState.power > 0;
  const isElyActive = electrolyzerState.electrolyzerPower > 0;
  const isFuelCellActive = fuelCellState.active;
  const hasSurplus = electrolyzerState.surplusPower > 0;

  return (
    <div className="glass-panel rounded-2xl p-5 lg:p-6 border border-slate-800/90 shadow-2xl space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base lg:text-lg font-bold text-white font-heading">
                Interactive System Energy Flow & Topology Architecture
              </h2>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE SCADA BUS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Photovoltaic & Aerodynamic Generation → Common DC Bus → PEM Electrolyzer → H₂ Compression → Marine Fuel Cell Ship
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 rounded-full bg-emerald-400 animate-pulse" /> Power Active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 rounded-full bg-purple-400 animate-pulse" /> H₂ Mass Flow
          </span>
        </div>
      </div>

      {/* Schematic Diagram Layout */}
      <div className="relative overflow-x-auto py-4">
        <div className="min-w-[920px] grid grid-cols-5 gap-4 items-center relative">
          
          {/* ================= COLUMN 1: RENEWABLE GENERATION ================= */}
          <div className="flex flex-col gap-4">
            
            {/* Solar Node */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              isSolarGenerating 
                ? 'bg-amber-500/10 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                : 'bg-slate-900/60 border-slate-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Sun className="w-4 h-4 animate-spin-slow" /> Solar PV
                </span>
                <span className="text-slate-400">{config.solarRatedPower} kWp</span>
              </div>
              <div className="text-xl font-extrabold font-mono-num text-white">
                {solarState.power.toFixed(1)} <span className="text-xs text-amber-400 font-mono">kW</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1 flex justify-between">
                <span>G: {config.solarIrradiance} W/m²</span>
                <span>η: {solarState.efficiency}%</span>
              </div>
            </div>

            {/* Wind Node */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              windState.isCutOut
                ? 'bg-red-500/15 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                : isWindGenerating
                  ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'bg-slate-900/60 border-slate-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className={`flex items-center gap-1.5 font-bold ${windState.isCutOut ? 'text-red-400' : 'text-cyan-400'}`}>
                  <Wind className={`w-4 h-4 ${isWindGenerating ? 'animate-spin-slow' : ''}`} /> Wind Turbine
                </span>
                <span className="text-slate-400">{config.windRatedPower} kW</span>
              </div>
              <div className="text-xl font-extrabold font-mono-num text-white">
                {windState.power.toFixed(1)} <span className="text-xs text-cyan-400 font-mono">kW</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1 flex justify-between">
                <span>v: {windState.windSpeed} m/s</span>
                <span className={windState.isCutOut ? 'text-red-400 font-bold' : ''}>
                  {windState.isCutOut ? 'CUT-OUT' : `${((windState.power/config.windRatedPower)*100).toFixed(0)}% load`}
                </span>
              </div>
            </div>

          </div>

          {/* ================= COLUMN 2: POWER ELECTRONICS & CONVERTERS ================= */}
          <div className="flex flex-col gap-4">
            
            {/* Solar MPPT Converter */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center relative">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">DC-DC MPPT</span>
              <div className="text-xs font-bold text-slate-200 mt-0.5">Boost Converter</div>
              <span className="text-[10px] font-mono text-amber-400 mt-1 block">
                {isSolarGenerating ? 'Tracking MPP (98.5%)' : 'Standby'}
              </span>
            </div>

            {/* Wind AC/DC Rectifier */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center relative">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">AC-DC Rectifier</span>
              <div className="text-xs font-bold text-slate-200 mt-0.5">IGBT Synchronous</div>
              <span className={`text-[10px] font-mono mt-1 block ${windState.isCutOut ? 'text-red-400' : 'text-cyan-400'}`}>
                {windState.isCutOut ? 'Inhibited' : isWindGenerating ? 'Active Sync (97.8%)' : 'Idle'}
              </span>
            </div>

          </div>

          {/* ================= COLUMN 3: COMMON DC BUS & DISTRIBUTION ================= */}
          <div className="flex flex-col items-center justify-center gap-3">
            
            {/* Common DC Bus Bar Box */}
            <div className="w-full p-4 rounded-xl bg-emerald-950/30 border-2 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)] text-center relative">
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider mb-1">
                <Zap className="w-4 h-4 fill-current" /> Common DC Bus
              </div>
              <div className="text-2xl font-extrabold font-mono-num text-white">
                {combinedState.totalPower.toFixed(1)} <span className="text-xs text-emerald-400 font-mono">kW</span>
              </div>
              <div className="text-[10px] font-mono text-slate-300 mt-1">
                750 VDC Regulated
              </div>

              {/* Sub-dispatch splits */}
              <div className="mt-3 pt-2 border-t border-emerald-500/30 text-[10px] font-mono flex flex-col gap-1 text-left">
                <div className="flex justify-between text-purple-300">
                  <span>→ Electrolyzer:</span>
                  <span className="font-bold">{electrolyzerState.electrolyzerPower.toFixed(1)} kW</span>
                </div>
                <div className="flex justify-between text-amber-300">
                  <span>→ Auxiliary Load:</span>
                  <span>{config.auxiliaryLoad} kW</span>
                </div>
                {hasSurplus && (
                  <div className="flex justify-between text-cyan-300 font-semibold">
                    <span>→ {config.surplusStrategy === 'grid' ? 'Grid Export:' : 'Curtailed:'}</span>
                    <span>{electrolyzerState.surplusPower.toFixed(1)} kW</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ================= COLUMN 4: ELECTROLYZER & STORAGE ================= */}
          <div className="flex flex-col gap-4">
            
            {/* PEM Electrolyzer Node */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              isElyActive
                ? 'bg-purple-500/10 border-purple-500/40 shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                : 'bg-slate-900/60 border-slate-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="flex items-center gap-1.5 text-purple-400 font-bold">
                  <Cylinder className="w-4 h-4" /> PEM Electrolyzer
                </span>
                <span className="text-slate-400">{config.electrolyzerRatedPower} kW</span>
              </div>
              <div className="text-xl font-extrabold font-mono-num text-white">
                {electrolyzerState.h2RateKgPerHr.toFixed(3)} <span className="text-xs text-purple-400 font-mono">kg/h</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1 flex justify-between">
                <span>Input: {electrolyzerState.electrolyzerPower} kW</span>
                <span className="text-purple-300 font-bold">H₂ Output</span>
              </div>
            </div>

            {/* H2 Storage Tank Node */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300 font-semibold flex items-center gap-1">
                  <Cylinder className="w-3.5 h-3.5 text-cyan-400" /> H₂ Storage Tank
                </span>
                <span className="text-cyan-400 font-mono">{config.tankDesignPressure} bar</span>
              </div>
              <div className="text-lg font-bold font-mono text-slate-100">
                {((config.h2TankCapacity * (config.initialTankFillPct/100))).toFixed(1)} / {config.h2TankCapacity} kg
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mt-1.5 overflow-hidden">
                <div 
                  style={{ width: `${config.initialTankFillPct}%` }}
                  className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full"
                />
              </div>
            </div>

          </div>

          {/* ================= COLUMN 5: DOWNSTREAM APPLICATION (SHIP FUEL CELL) ================= */}
          <div className="flex flex-col gap-4">
            
            {/* Marine Fuel Cell Node */}
            <div className={`p-4 rounded-xl border transition-all ${
              isFuelCellActive
                ? 'bg-gradient-to-br from-purple-500/20 to-blue-600/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                : 'bg-slate-900/50 border-slate-800 opacity-70'
            }`}>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="flex items-center gap-1.5 text-purple-300 font-bold">
                  <Ship className="w-4 h-4 text-cyan-400" /> Marine Ship FC
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  isFuelCellActive ? 'bg-purple-500/30 text-purple-200' : 'bg-slate-800 text-slate-500'
                }`}>
                  {isFuelCellActive ? 'ACTIVE' : 'STANDBY'}
                </span>
              </div>

              <div className="text-xl font-extrabold font-mono-num text-white">
                {fuelCellState.power} <span className="text-xs text-cyan-400 font-mono">kW</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                Zero-Emission Marine Propulsion
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-purple-300 flex justify-between">
                <span>H₂ Consumed:</span>
                <span>{fuelCellState.h2ConsumptionKgHr} kg/h</span>
              </div>
            </div>

            {/* Application Note */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 leading-snug">
              <strong className="text-slate-300 block mb-0.5">Maritime Application:</strong>
              Green H₂ enables heavy ship auxiliary electrification, eliminating maritime SOx, NOx, and CO₂ emissions.
            </div>

          </div>

        </div>
      </div>

      {/* SVG Connecting Flow Lines (Visual Path) */}
      <div className="hidden lg:block w-full h-4 overflow-hidden relative">
        <div className={`w-full h-0.5 bg-gradient-to-r from-amber-500 via-emerald-400 to-purple-500 ${isRunning ? 'animate-flow-normal' : ''}`} />
      </div>

    </div>
  );
}
