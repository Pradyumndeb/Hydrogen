import React, { useState } from 'react';
import { 
  Sliders, 
  Sun, 
  Wind, 
  Zap, 
  Cylinder, 
  RotateCcw, 
  CloudRain, 
  Gauge, 
  Thermometer, 
  Radio, 
  X,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DEFAULT_CONFIG, WEATHER_PRESETS } from '../utils/constants';

export default function ControlPanel({
  config,
  onUpdateConfig,
  onResetDefaults,
  weatherPresets,
  onUpdateWeatherPresets,
}) {
  const [activeTab, setActiveTab] = useState('solar'); // 'solar' | 'wind' | 'ely' | 'weather'

  const handleSliderChange = (key, value) => {
    onUpdateConfig({ [key]: Number(value) });
  };

  const handleWeatherPresetChange = (type, key, value) => {
    onUpdateWeatherPresets({
      ...weatherPresets,
      [type]: {
        ...weatherPresets[type],
        [key]: Number(value),
      },
    });
  };

  return (
    <div className="glass-panel rounded-2xl p-5 lg:p-6 border border-slate-800/90 shadow-2xl space-y-5">
      
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base lg:text-lg font-bold text-white font-heading">
              Interactive System Parameters & Control Panel
            </h2>
            <p className="text-xs text-slate-400">
              Modulate physical capacities, environmental inputs, and stack limits with real-time reactive recalculation
            </p>
          </div>
        </div>

        <button
          onClick={onResetDefaults}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-all self-start sm:self-center"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Navigation Tabs for Parameters */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('solar')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
            activeTab === 'solar'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Sun className="w-4 h-4 text-amber-400" />
          <span>Solar PV ({config.solarRatedPower} kW)</span>
        </button>

        <button
          onClick={() => setActiveTab('wind')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
            activeTab === 'wind'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Wind className="w-4 h-4 text-cyan-400" />
          <span>Wind Turbine ({config.windRatedPower} kW)</span>
        </button>

        <button
          onClick={() => setActiveTab('ely')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
            activeTab === 'ely'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Cylinder className="w-4 h-4 text-purple-400" />
          <span>Electrolyzer & Storage</span>
        </button>

        <button
          onClick={() => setActiveTab('weather')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
            activeTab === 'weather'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <CloudRain className="w-4 h-4 text-blue-400" />
          <span>Weather Presets</span>
        </button>
      </div>

      {/* Tab 1: Solar PV Controls */}
      {activeTab === 'solar' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Installed Capacity */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Installed Solar Capacity</span>
              <span className="font-bold font-mono text-amber-400">{config.solarRatedPower} kW</span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="5"
              value={config.solarRatedPower}
              onChange={(e) => handleSliderChange('solarRatedPower', e.target.value)}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>10 kW</span>
              <span>500 kW</span>
            </div>
          </div>

          {/* Current Solar Irradiance */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Solar Irradiance (G)</span>
              <span className="font-bold font-mono text-amber-400">{config.solarIrradiance} W/m²</span>
            </div>
            <input
              type="range"
              min="0"
              max="1200"
              step="10"
              value={config.solarIrradiance}
              onChange={(e) => handleSliderChange('solarIrradiance', e.target.value)}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0 (Night)</span>
              <span>1000 (STC)</span>
              <span>1200 W/m²</span>
            </div>
          </div>

          {/* Solar Panel Efficiency */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Panel Nominal Efficiency</span>
              <span className="font-bold font-mono text-amber-400">{config.solarNominalEfficiency}%</span>
            </div>
            <input
              type="range"
              min="12"
              max="26"
              step="0.5"
              value={config.solarNominalEfficiency}
              onChange={(e) => handleSliderChange('solarNominalEfficiency', e.target.value)}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>12% (Poly)</span>
              <span>21.5% (Mono PERC)</span>
              <span>26% (TOPCon)</span>
            </div>
          </div>

          {/* Cell Temperature */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Cell Temperature (T_cell)</span>
              <span className="font-bold font-mono text-amber-400">{config.solarCellTemp}°C</span>
            </div>
            <input
              type="range"
              min="-10"
              max="70"
              step="1"
              value={config.solarCellTemp}
              onChange={(e) => handleSliderChange('solarCellTemp', e.target.value)}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-10°C</span>
              <span>25°C (STC)</span>
              <span>70°C (Hot)</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Wind Turbine Controls */}
      {activeTab === 'wind' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Rated Wind Capacity */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Rated Wind Capacity</span>
              <span className="font-bold font-mono text-cyan-400">{config.windRatedPower} kW</span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="5"
              value={config.windRatedPower}
              onChange={(e) => handleSliderChange('windRatedPower', e.target.value)}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>10 kW</span>
              <span>500 kW</span>
            </div>
          </div>

          {/* Current Wind Speed */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Current Wind Speed (v)</span>
              <span className={`font-bold font-mono ${config.windSpeed >= config.windCutOutSpeed ? 'text-red-400' : 'text-cyan-400'}`}>
                {config.windSpeed} m/s
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="35"
              step="0.5"
              value={config.windSpeed}
              onChange={(e) => handleSliderChange('windSpeed', e.target.value)}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0 m/s</span>
              <span>{config.windRatedSpeed} (Rated)</span>
              <span>35 m/s</span>
            </div>
          </div>

          {/* Cut-in Speed */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Cut-in Speed</span>
              <span className="font-bold font-mono text-cyan-400">{config.windCutInSpeed} m/s</span>
            </div>
            <input
              type="range"
              min="1.5"
              max="5.0"
              step="0.1"
              value={config.windCutInSpeed}
              onChange={(e) => handleSliderChange('windCutInSpeed', e.target.value)}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1.5 m/s</span>
              <span>5.0 m/s</span>
            </div>
          </div>

          {/* Rated Speed */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Rated Speed</span>
              <span className="font-bold font-mono text-cyan-400">{config.windRatedSpeed} m/s</span>
            </div>
            <input
              type="range"
              min="8.0"
              max="16.0"
              step="0.5"
              value={config.windRatedSpeed}
              onChange={(e) => handleSliderChange('windRatedSpeed', e.target.value)}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>8.0 m/s</span>
              <span>16.0 m/s</span>
            </div>
          </div>

          {/* Cut-out Speed */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Cut-out Safety Speed</span>
              <span className="font-bold font-mono text-red-400">{config.windCutOutSpeed} m/s</span>
            </div>
            <input
              type="range"
              min="18.0"
              max="30.0"
              step="0.5"
              value={config.windCutOutSpeed}
              onChange={(e) => handleSliderChange('windCutOutSpeed', e.target.value)}
              className="w-full accent-red-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>18 m/s</span>
              <span>25 m/s (Standard)</span>
              <span>30 m/s</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Electrolyzer & Storage Controls */}
      {activeTab === 'ely' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Rated Electrolyzer Power */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Rated Electrolyzer Power</span>
              <span className="font-bold font-mono text-purple-400">{config.electrolyzerRatedPower} kW</span>
            </div>
            <input
              type="range"
              min="20"
              max="600"
              step="10"
              value={config.electrolyzerRatedPower}
              onChange={(e) => handleSliderChange('electrolyzerRatedPower', e.target.value)}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>20 kW</span>
              <span>600 kW</span>
            </div>
          </div>

          {/* Specific Energy Consumption */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Specific Consumption (SEC)</span>
              <span className="font-bold font-mono text-purple-400">{config.specificEnergyConsumption} kWh/kg</span>
            </div>
            <input
              type="range"
              min="45"
              max="75"
              step="1"
              value={config.specificEnergyConsumption}
              onChange={(e) => handleSliderChange('specificEnergyConsumption', e.target.value)}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>45 (High Eff)</span>
              <span>55 (Default)</span>
              <span>75 kWh/kg</span>
            </div>
          </div>

          {/* Storage Tank Capacity */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Storage Tank Capacity</span>
              <span className="font-bold font-mono text-purple-400">{config.h2TankCapacity} kg</span>
            </div>
            <input
              type="range"
              min="20"
              max="500"
              step="10"
              value={config.h2TankCapacity}
              onChange={(e) => handleSliderChange('h2TankCapacity', e.target.value)}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>20 kg</span>
              <span>500 kg (Commercial)</span>
            </div>
          </div>

          {/* Initial Tank Fill % & Auxiliary Load */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300 font-semibold">Initial Tank Fill</span>
                <span className="font-bold font-mono text-purple-400">{config.initialTankFillPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={config.initialTankFillPct}
                onChange={(e) => handleSliderChange('initialTankFillPct', e.target.value)}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Auxiliary BOP Load:</span>
              <span className="text-xs font-mono font-bold text-amber-300">{config.auxiliaryLoad} kW</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Weather Preset Configurations */}
      {activeTab === 'weather' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Good Weather Config */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-400 pb-2 border-b border-amber-500/20">
              <Sun className="w-4 h-4" /> Good Weather Preset Assumptions
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-300">Solar Irradiance:</span>
                  <span className="text-amber-400 font-bold">{weatherPresets.good.solarIrradiance} W/m²</span>
                </div>
                <input
                  type="range"
                  min="600"
                  max="1200"
                  step="25"
                  value={weatherPresets.good.solarIrradiance}
                  onChange={(e) => handleWeatherPresetChange('good', 'solarIrradiance', e.target.value)}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-300">Wind Speed:</span>
                  <span className="text-cyan-400 font-bold">{weatherPresets.good.windSpeed} m/s</span>
                </div>
                <input
                  type="range"
                  min="4.0"
                  max="14.0"
                  step="0.5"
                  value={weatherPresets.good.windSpeed}
                  onChange={(e) => handleWeatherPresetChange('good', 'windSpeed', e.target.value)}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Bad Weather Config */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-400 pb-2 border-b border-blue-500/20">
              <CloudRain className="w-4 h-4" /> Bad Weather Preset Assumptions
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-300">Solar Irradiance:</span>
                  <span className="text-amber-400 font-bold">{weatherPresets.bad.solarIrradiance} W/m²</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="400"
                  step="10"
                  value={weatherPresets.bad.solarIrradiance}
                  onChange={(e) => handleWeatherPresetChange('bad', 'solarIrradiance', e.target.value)}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-300">Wind Speed (Can be high gale or calm):</span>
                  <span className="text-cyan-400 font-bold">{weatherPresets.bad.windSpeed} m/s</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="30.0"
                  step="0.5"
                  value={weatherPresets.bad.windSpeed}
                  onChange={(e) => handleWeatherPresetChange('bad', 'windSpeed', e.target.value)}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>1 m/s (Calm)</span>
                  <span>15 m/s (Storm Gust)</span>
                  <span>&gt;25 m/s (Cut-out)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid Export Strategy & Safety Parameters Footer */}
      <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-800/80 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <span className="text-slate-300 font-semibold">Surplus Dispatch Strategy:</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="surplusStrategy"
              checked={config.surplusStrategy === 'grid'}
              onChange={() => handleSliderChange('surplusStrategy', 'grid')}
              className="accent-emerald-500"
            />
            <span className={config.surplusStrategy === 'grid' ? 'text-emerald-300 font-bold' : ''}>Export to Grid</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="surplusStrategy"
              checked={config.surplusStrategy === 'curtail'}
              onChange={() => handleSliderChange('surplusStrategy', 'curtail')}
              className="accent-amber-500"
            />
            <span className={config.surplusStrategy === 'curtail' ? 'text-amber-300 font-bold' : ''}>Curtail / Dump Resistor</span>
          </label>
        </div>

        <div className="text-[11px] text-slate-500">
          Parameter updates propagate instantaneously to all active ODE solver ticks
        </div>
      </div>

    </div>
  );
}
