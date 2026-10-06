import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sun, 
  CloudRain, 
  Wind, 
  Zap, 
  Activity, 
  Info, 
  Clock, 
  SlidersHorizontal,
  Flame,
  Ship,
  Sparkles
} from 'lucide-react';

export default function Header({
  weatherMode,
  setWeatherMode,
  isRunning,
  setIsRunning,
  onReset,
  simSpeed,
  setSimSpeed,
  demoMode,
  setDemoMode,
  onOpenModelInfo,
  onToggleControlDrawer,
  fuelCellActive,
  setFuelCellActive,
}) {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentDateTime.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = currentDateTime.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5 shadow-2xl backdrop-blur-xl">
      <div className="max-w-[1720px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-4">
        
        {/* Left: Project Branding & Meta */}
        <div className="flex items-center gap-3.5 w-full xl:w-auto justify-between xl:justify-start">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-blue-600/30 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Zap className="w-6 h-6 text-cyan-400" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRunning ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isRunning ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg lg:text-xl font-bold tracking-tight text-white font-heading">
                  Hybrid Renewable Energy & Green Hydrogen System
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  EE CAPSTONE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Solar PV + Wind Turbine + PEM Electrolyzer + Marine H₂ Storage
              </p>
            </div>
          </div>

          {/* Mobile drawer toggle */}
          <button
            onClick={onToggleControlDrawer}
            className="xl:hidden p-2 rounded-lg bg-slate-800/70 border border-slate-700 text-slate-300 hover:text-white"
            title="System Parameters"
          >
            <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
          </button>
        </div>

        {/* Center: Live Date/Time & Weather Condition Badge */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 w-full xl:w-auto">
          {/* Real-time Clock */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 font-mono-num text-xs shadow-inner">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 hidden sm:inline">{formattedDate}</span>
            <span className="font-semibold text-cyan-300">{formattedTime}</span>
            <span className="text-[10px] text-slate-500 border-l border-slate-700 pl-1.5 uppercase">Sim UTC</span>
          </div>

          {/* Current Weather Condition Pill */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 pl-2 pr-1">Weather:</span>
            <button
              onClick={() => setWeatherMode(weatherMode === 'good' ? 'bad' : 'good')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                weatherMode === 'good'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.2)]'
              }`}
              title="Click to toggle Weather Condition"
            >
              {weatherMode === 'good' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                  <span>Good Weather (High Solar)</span>
                </>
              ) : (
                <>
                  <CloudRain className="w-3.5 h-3.5 text-blue-400 animate-bounce-subtle" />
                  <span>Bad Weather (Storm/Cloud)</span>
                </>
              )}
            </button>
          </div>

          {/* Fuel Cell Ship Downstream Application Toggle */}
          <button
            onClick={() => setFuelCellActive(!fuelCellActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              fuelCellActive
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.25)]'
                : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle Hydrogen Discharge to Marine Fuel Cell (Ship Propulsion)"
          >
            <Ship className="w-3.5 h-3.5 text-purple-400" />
            <span>Ship Fuel Cell</span>
            <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${fuelCellActive ? 'bg-purple-500/40 text-white' : 'bg-slate-800 text-slate-500'}`}>
              {fuelCellActive ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        {/* Right: Simulation Controls & Speed & Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 w-full xl:w-auto">
          {/* Demo Mode Toggle */}
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              demoMode
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
            title="Auto Diurnal Cycle Demo"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Demo Mode</span>
            <span className={`w-1.5 h-1.5 rounded-full ${demoMode ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
          </button>

          {/* Simulation Speed Selector */}
          <div className="flex items-center rounded-lg bg-slate-900/90 border border-slate-800 p-0.5">
            <span className="text-[10px] text-slate-500 px-2 font-mono uppercase">Speed</span>
            {[1, 2, 5, 10, 30].map((s) => (
              <button
                key={s}
                onClick={() => setSimSpeed(s)}
                className={`px-2 py-1 text-xs rounded font-mono-num transition-all ${
                  simSpeed === s
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Primary Simulation Controls */}
          <div className="flex items-center gap-1.5">
            {isRunning ? (
              <button
                onClick={() => setIsRunning(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all shadow-sm"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={() => setIsRunning(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all shadow-[0_0_12px_rgba(16,185,129,0.25)]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start</span>
              </button>
            )}

            <button
              onClick={onReset}
              className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              title="Reset Simulation Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Model Info Button */}
          <button
            onClick={onOpenModelInfo}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 text-xs transition-all"
            title="Engineering Formulas & Assumptions"
          >
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Model Info</span>
          </button>
        </div>

      </div>
    </header>
  );
}
