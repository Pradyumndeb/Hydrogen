import React from 'react';
import { 
  Zap, 
  Activity, 
  Cylinder, 
  Leaf, 
  CheckCircle2, 
  TrendingUp, 
  Percent, 
  Award 
} from 'lucide-react';
import { PHYSICAL_CONSTANTS } from '../utils/constants';

export default function KPICardsRow({
  accumulators,
  electrolyzerState,
  combinedState,
  config,
}) {
  // Avoided CO2 in kilograms (Green H2 avoids ~9.3 kg CO2 per kg H2 produced vs gray SMR)
  const co2AvoidedKg = (accumulators.totalH2ProducedKg * PHYSICAL_CONSTANTS.CO2_AVOIDED_PER_KG_GREEN_H2).toFixed(1);

  // Renewable utilization factor (% of available renewable power successfully routed to electrolyzer or grid)
  const powerUtilizationPct = combinedState.totalPower > 0
    ? Math.min(100, Math.round(((electrolyzerState.electrolyzerPower + config.auxiliaryLoad) / combinedState.totalPower) * 100))
    : 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* KPI 1: Total Renewable Energy */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800/90 relative overflow-hidden flex items-center gap-3.5">
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-mono text-slate-400 block tracking-wider">
            Total Renewable Energy
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-extrabold font-mono-num text-white">
              {accumulators.totalEnergyKWh.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono">kWh</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            PV: {accumulators.solarEnergyKWh.toFixed(1)} | Wind: {accumulators.windEnergyKWh.toFixed(1)}
          </span>
        </div>
      </div>

      {/* KPI 2: Electrolyzer Utilization */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800/90 relative overflow-hidden flex items-center gap-3.5">
        <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-mono text-slate-400 block tracking-wider">
            Electrolyzer Utilization
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-extrabold font-mono-num text-purple-300">
              {electrolyzerState.utilizationPct}%
            </span>
            <span className="text-xs font-bold text-slate-400 font-mono">Capacity</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {electrolyzerState.electrolyzerPower.toFixed(1)} / {config.electrolyzerRatedPower} kW Rated
          </span>
        </div>
      </div>

      {/* KPI 3: Total Green Hydrogen */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800/90 relative overflow-hidden flex items-center gap-3.5">
        <div className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
          <Cylinder className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-mono text-slate-400 block tracking-wider">
            Total Green Hydrogen
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-extrabold font-mono-num text-cyan-300">
              {accumulators.totalH2ProducedKg.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-slate-400 font-mono">kg H₂</span>
          </div>
          <span className="text-[10px] text-cyan-400/80 font-mono">
            ({(accumulators.totalH2ProducedKg * 1000).toFixed(0)} grams)
          </span>
        </div>
      </div>

      {/* KPI 4: Carbon Emission Abated */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800/90 relative overflow-hidden flex items-center gap-3.5">
        <div className="p-3 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400">
          <Leaf className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-mono text-slate-400 block tracking-wider">
            CO₂ Abatement vs SMR
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-extrabold font-mono-num text-teal-300">
              {co2AvoidedKg}
            </span>
            <span className="text-xs font-bold text-slate-400 font-mono">kg CO₂</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            9.3 kg CO₂/kg H₂ avoided
          </span>
        </div>
      </div>

    </div>
  );
}
