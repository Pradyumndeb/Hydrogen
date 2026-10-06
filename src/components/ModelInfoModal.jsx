import React from 'react';
import { 
  X, 
  BookOpen, 
  Sun, 
  Wind, 
  Zap, 
  Cylinder, 
  Ship, 
  Layers, 
  CheckCircle2, 
  ExternalLink,
  Code
} from 'lucide-react';

export default function ModelInfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] rounded-2xl border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-heading">
                Engineering Model Information & Mathematical Principles
              </h2>
              <p className="text-xs text-slate-400">
                Theoretical foundation, thermodynamic parameters, and simulation assumptions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed font-sans">
          
          {/* Section 1: Project Overview */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Project Architecture Overview
            </h3>
            <p className="text-xs text-slate-300">
              This system models an integrated hybrid microgrid consisting of a <strong>Solar Photovoltaic (PV) array</strong> and a <strong>Wind Turbine Generator</strong> coupled via a regulated <strong>Common DC Busbar (750 VDC)</strong>. The synthesized electrical power is conditioned and supplied to a <strong>Proton Exchange Membrane (PEM) Electrolyzer</strong> to generate high-purity Green Hydrogen through water electrolysis (2H₂O → 2H₂ + O₂). The produced hydrogen is compressed and stored in composite pressure vessels (350 bar) to supply clean fuel for downstream applications, specifically <strong>Marine Ship Propulsion Systems</strong>.
            </p>
          </div>

          {/* Section 2: Solar PV Mathematical Model */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 font-mono">
                <Sun className="w-4 h-4" /> 1. Solar Photovoltaic Generation Model
              </h3>
              <span className="text-[11px] font-mono text-slate-500">IEC 61724 Standard</span>
            </div>
            
            <p className="text-xs text-slate-400">
              Solar PV power output is modeled taking into account incoming solar irradiance (G) and crystalline silicon cell temperature derating (γ):
            </p>

            <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-amber-300 border border-slate-800 overflow-x-auto">
              P_solar = P_rated × (G / 1000) × [ 1 + γ × (T_cell - 25) ]
            </div>

            <ul className="text-xs space-y-1 text-slate-400 list-disc list-inside">
              <li><strong className="text-slate-200">G:</strong> Plane of Array (POA) solar irradiance in W/m² (Standard Test Condition STC = 1000 W/m²).</li>
              <li><strong className="text-slate-200">T_cell:</strong> Solar cell temperature in °C (Standard STC = 25°C).</li>
              <li><strong className="text-slate-200">γ:</strong> Temperature power coefficient (typically -0.004 /°C or -0.4%/°C).</li>
              <li><strong className="text-slate-200">Bounding limit:</strong> Output is bounded between 0 and P_rated.</li>
            </ul>
          </div>

          {/* Section 3: Wind Turbine Aerodynamic Power Curve */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2 font-mono">
                <Wind className="w-4 h-4" /> 2. Wind Turbine Aerodynamic Power Curve
              </h3>
              <span className="text-[11px] font-mono text-slate-500">IEC 61400-12</span>
            </div>

            <p className="text-xs text-slate-400">
              Wind power follows a 4-regime turbine curve governed by the cubic kinetic energy flux equation (P = 0.5 × ρ × A × Cp × v³) normalized to rated capacity:
            </p>

            <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-cyan-300 border border-slate-800 space-y-1.5">
              <div>• If v &lt; v_cutIn (3.0 m/s): P_wind = 0 (Rotor stationary/idle)</div>
              <div>• If v_cutIn ≤ v &lt; v_rated (11.5 m/s): P_wind = P_rated × [ (v - v_cutIn) / (v_rated - v_cutIn) ]³</div>
              <div>• If v_rated ≤ v ≤ v_cutOut (25.0 m/s): P_wind = P_rated (Pitch regulated limit)</div>
              <div>• If v &gt; v_cutOut: P_wind = 0 (⚠️ Cut-out safety shutdown: blade feathering & mechanical brake)</div>
            </div>

            <p className="text-xs text-slate-400">
              <em>Crucial Engineering Insight:</em> Bad weather does <strong>not</strong> necessarily lower wind generation! High wind storms actually allow the wind turbine to operate at its full rated capacity, compensating for cloud-diminished solar. However, extreme gale winds exceeding 25 m/s trigger safety cut-out to prevent aerodynamic overload and rotor destruction.
            </p>
          </div>

          {/* Section 4: Water Electrolysis & Faraday's Law */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2 font-mono">
                <Cylinder className="w-4 h-4" /> 3. Electrolyzer Sizing & Hydrogen Mass Flow
              </h3>
              <span className="text-[11px] font-mono text-slate-500">PEM Thermodynamics</span>
            </div>

            <p className="text-xs text-slate-400">
              The power available for the electrolyzer stack is determined by subtracting auxiliary loads (pumps, water deionizer, chillers):
            </p>

            <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-purple-300 border border-slate-800 space-y-1">
              <div>P_electrolyzer = min( (P_solar + P_wind) - P_aux , P_rated_ely )</div>
              <div>H₂ Production Rate (kg/h) = P_electrolyzer (kW) / SEC (kWh/kg)</div>
              <div>M_H₂ (t) = ∫ [ P_electrolyzer / SEC ] dt</div>
            </div>

            <ul className="text-xs space-y-1 text-slate-400 list-disc list-inside">
              <li><strong className="text-slate-200">Specific Energy Consumption (SEC):</strong> Default 55 kWh/kg based on current state-of-the-art commercial PEM stacks.</li>
              <li><strong className="text-slate-200">Lower Heating Value (LHV):</strong> 33.33 kWh/kg, giving an electrolyzer efficiency of η_LHV = (33.33 / 55) × 100% ≈ 60.6%.</li>
              <li><strong className="text-slate-200">Higher Heating Value (HHV):</strong> 39.4 kWh/kg, giving η_HHV = (39.4 / 55) × 100% ≈ 71.6%.</li>
              <li><strong className="text-slate-200">Turn-down limit:</strong> If available power drops below 15% of rated capacity, the electrolyzer transitions to Standby to avoid gas crossover hazards.</li>
            </ul>
          </div>

          {/* Section 5: Maritime Application */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-teal-400 flex items-center gap-2 font-mono">
              <Ship className="w-4 h-4" /> 4. Marine Fuel Cell Propulsion Application
            </h3>
            <p className="text-xs text-slate-400">
              The stored green hydrogen can be dispatched to a maritime electric propulsion system utilizing a <strong>Proton Exchange Membrane Fuel Cell (PEMFC)</strong>:
            </p>
            <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-teal-300 border border-slate-800">
              P_propulsion = m_dot_H2 × LHV × η_FuelCell
            </div>
            <p className="text-xs text-slate-400">
              This replaces conventional heavy bunker fuel (HFO) or marine diesel, offering 100% zero greenhouse emissions, eliminating SOx, NOx, and particulate matter in sensitive coastal ecosystems.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-900/80">
          <span className="text-[11px] font-mono text-slate-500">
            College Electrical Engineering Capstone Reference • Academic Demonstration Model
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all cursor-pointer"
          >
            Close Information
          </button>
        </div>

      </div>
    </div>
  );
}
