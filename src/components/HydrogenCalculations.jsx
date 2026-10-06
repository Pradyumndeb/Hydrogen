import React from 'react';
import { 
  Cylinder, 
  Zap, 
  Gauge, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  Calculator, 
  Layers, 
  AlertCircle,
  FileCode,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { PHYSICAL_CONSTANTS } from '../utils/constants';

export default function HydrogenCalculations({
  electrolyzerState,
  accumulators,
  config,
  onUpdateConfig,
}) {
  const currentTotalGrams = (accumulators.totalH2ProducedKg * 1000).toFixed(1);
  const sec = config.specificEnergyConsumption || 55;

  return (
    <div className="glass-panel rounded-2xl p-5 lg:p-6 border border-slate-800/90 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base lg:text-lg font-bold text-white font-heading">
                Renewable Electricity to Green Hydrogen Conversion
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30">
                FARADAY THERMODYNAMICS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Electrochemical mass-balance integration from hybrid renewable bus to PEM electrolyzer
            </p>
          </div>
        </div>

        {/* Theoretical Estimate Notice Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>Notice: Theoretical Estimate (PEM/Alkaline Model)</span>
        </div>
      </div>

      {/* Primary Metrics Grid (6 KPI cards as requested) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Metric 1: Instantaneous Rate */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/30 transition-all">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Instantaneous Rate</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold font-mono-num text-white">
              {electrolyzerState.h2RateKgPerHr.toFixed(3)}
            </span>
            <span className="text-xs font-bold text-purple-400 font-mono">kg/h</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
            {electrolyzerState.h2RateGPerMin.toFixed(1)} g/min
          </span>
        </div>

        {/* Metric 2: Total Hydrogen (kg & grams) */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/30 transition-all">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Cumulative Mass</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold font-mono-num text-purple-300">
              {accumulators.totalH2ProducedKg.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-slate-400 font-mono">kg</span>
          </div>
          <span className="text-[10px] text-purple-400/80 font-mono mt-0.5 block">
            ({currentTotalGrams} g)
          </span>
        </div>

        {/* Metric 3: Daily Production Estimate */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/30 transition-all">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Daily Estimate</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold font-mono-num text-cyan-300">
              {electrolyzerState.dailyH2EstimateKg.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-400 font-mono">kg/day</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
            At constant P_ely
          </span>
        </div>

        {/* Metric 4: Energy Supplied to Ely */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/30 transition-all">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Energy Consumed</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold font-mono-num text-slate-100">
              {accumulators.electrolyzerEnergyKWh.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-slate-400 font-mono">kWh</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
            Input: {electrolyzerState.electrolyzerPower.toFixed(1)} kW
          </span>
        </div>

        {/* Metric 5: Specific Energy Consumption */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/30 transition-all">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Specific Energy</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold font-mono-num text-amber-300">
              {sec}
            </span>
            <span className="text-xs font-bold text-slate-400 font-mono">kWh/kg</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
            Default: 55 kWh/kg
          </span>
        </div>

        {/* Metric 6: Electrolyzer Efficiency */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/30 transition-all">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Stack Efficiency</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold font-mono-num text-emerald-400">
              {electrolyzerState.lhvEfficiency}%
            </span>
            <span className="text-xs font-bold text-slate-400 font-mono">LHV</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
            HHV: {electrolyzerState.hhvEfficiency}%
          </span>
        </div>

      </div>

      {/* Step-by-Step Live Mathematical Substitution Card */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 font-mono text-xs space-y-3">
        <div className="flex items-center justify-between text-slate-300 font-semibold border-b border-slate-800/80 pb-2">
          <span className="flex items-center gap-1.5 text-purple-400">
            <FileCode className="w-4 h-4" />
            Live Mathematical Equation Substitution
          </span>
          <span className="text-[11px] text-slate-500">Real-Time Evaluation</span>
        </div>

        <div className="space-y-2 text-slate-300">
          {/* Step 1: Available Electrolyzer Power */}
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
            <div className="text-slate-400 text-[11px] mb-1">
              Step 1: Electrolyzer Available Power (after Balance of Plant Auxiliary Load)
            </div>
            <div className="text-purple-300 font-bold">
              P_electrolyzer = min( (P_solar + P_wind) - P_aux , P_rated_ely )
            </div>
            <div className="text-slate-400 mt-1 flex items-center gap-1.5 text-[11px]">
              <ArrowRight className="w-3 h-3 text-cyan-400" />
              <span>
                P_electrolyzer = min( ({electrolyzerState.availablePower + config.auxiliaryLoad} - {config.auxiliaryLoad}) kW , {config.electrolyzerRatedPower} kW )
                = <strong className="text-white font-mono-num">{electrolyzerState.electrolyzerPower} kW</strong>
              </span>
            </div>
          </div>

          {/* Step 2: Hydrogen Production Rate */}
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
            <div className="text-slate-400 text-[11px] mb-1">
              Step 2: Instantaneous Hydrogen Mass Flow Rate (kg/h)
            </div>
            <div className="text-purple-300 font-bold">
              H₂ Rate (kg/h) = P_electrolyzer (kW) / Specific Energy Consumption (kWh/kg)
            </div>
            <div className="text-slate-400 mt-1 flex items-center gap-1.5 text-[11px]">
              <ArrowRight className="w-3 h-3 text-cyan-400" />
              <span>
                H₂ Rate = {electrolyzerState.electrolyzerPower} kW / {sec} kWh/kg ={' '}
                <strong className="text-purple-400 font-mono-num">{electrolyzerState.h2RateKgPerHr} kg/h</strong>
                {' '}({(electrolyzerState.h2RateKgPerHr * PHYSICAL_CONSTANTS.NM3_PER_KG_H2).toFixed(2)} Nm³/h at STP)
              </span>
            </div>
          </div>

          {/* Step 3: Cumulative Hydrogen Mass Integration */}
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
            <div className="text-slate-400 text-[11px] mb-1">
              Step 3: Cumulative Hydrogen Production Integral over Simulation Time
            </div>
            <div className="text-purple-300 font-bold">
              M_H₂ (t) = ∫ [ P_electrolyzer(t) / SEC ] dt = E_electrolyzer / SEC
            </div>
            <div className="text-slate-400 mt-1 flex items-center gap-1.5 text-[11px]">
              <ArrowRight className="w-3 h-3 text-cyan-400" />
              <span>
                M_H₂ = {accumulators.electrolyzerEnergyKWh.toFixed(2)} kWh / {sec} kWh/kg ={' '}
                <strong className="text-emerald-400 font-mono-num">{accumulators.totalH2ProducedKg.toFixed(2)} kg</strong>
                {' '}({currentTotalGrams} grams)
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
