import React, { useState } from 'react';
import { 
  Sun, 
  CloudRain, 
  Wind, 
  CloudSun, 
  Cloud, 
  Compass, 
  Gauge, 
  Thermometer, 
  RotateCcw, 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Info,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  SOLAR_PRESETS, 
  WIND_PRESETS, 
  COMBINED_WEATHER_SCENARIOS 
} from '../utils/constants';

export default function WeatherControlPanel({
  weatherSettings,
  onUpdateWeather,
  turbineSettings,
  onUpdateTurbine,
  solarSettings,
  onUpdateSolar,
  onRestoreDefaults,
  currentTelemetry,
}) {
  const [activeWeatherTab, setActiveWeatherTab] = useState('combined'); // 'combined' | 'solar' | 'wind'
  const [showTurbineConfig, setShowTurbineConfig] = useState(false);

  // Helper to determine compass cardinal direction from degrees
  const getCardinalDirection = (deg) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((deg % 360) / 45)) % 8;
    return directions[index];
  };

  // Select Combined Weather Scenario
  const handleSelectScenario = (scenarioKey) => {
    const preset = COMBINED_WEATHER_SCENARIOS[scenarioKey];
    if (!preset) return;

    if (scenarioKey === 'custom') {
      onUpdateWeather({
        scenario: 'custom',
        isCustom: true,
      });
      return;
    }

    onUpdateWeather({
      scenario: scenarioKey,
      isCustom: false,
      solarIrradiance: preset.solarIrradiance,
      cloudCover: preset.cloudCover,
      solarCellTemp: preset.solarCellTemp,
      solarGenAdjustment: preset.solarGenAdjustment,
      windSpeed: preset.windSpeed,
      windDirection: preset.windDirection,
      windSpeedOverride: preset.windSpeed,
      solarPreset: scenarioKey === 'good' ? 'clearSky' : scenarioKey === 'moderate' ? 'partlyCloudy' : 'overcast',
      windPreset: scenarioKey === 'good' ? 'moderate' : scenarioKey === 'moderate' ? 'moderate' : 'strong',
    });
  };

  // Select Solar Specific Preset
  const handleSelectSolarPreset = (presetKey) => {
    const preset = SOLAR_PRESETS[presetKey];
    if (!preset) return;

    onUpdateWeather({
      solarPreset: presetKey,
      solarIrradiance: preset.irradiance,
      cloudCover: preset.cloudCover,
      solarCellTemp: preset.panelTemp,
      solarGenAdjustment: preset.solarGenAdjustment,
      scenario: 'custom', // custom mixed weather
      isCustom: true,
    });
  };

  // Select Wind Specific Preset
  const handleSelectWindPreset = (presetKey) => {
    const preset = WIND_PRESETS[presetKey];
    if (!preset) return;

    onUpdateWeather({
      windPreset: presetKey,
      windSpeed: preset.windSpeed,
      windDirection: preset.windDirection,
      windSpeedOverride: preset.windSpeed,
      scenario: 'custom',
      isCustom: true,
    });
  };

  // Calculate Aerodynamic state badge
  const v = weatherSettings.windSpeed;
  const vCutIn = turbineSettings.windCutInSpeed ?? 3.0;
  const vRated = turbineSettings.windRatedSpeed ?? 11.5;
  const vCutOut = turbineSettings.windCutOutSpeed ?? 25.0;

  let turbineStateBadge = {
    label: 'Partial Load Generation',
    color: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
  };
  if (v < vCutIn) {
    turbineStateBadge = {
      label: `Idle (< ${vCutIn} m/s Cut-in)`,
      color: 'bg-slate-800 text-slate-400 border-slate-700',
    };
  } else if (v >= vRated && v <= vCutOut) {
    turbineStateBadge = {
      label: 'Rated Power (Pitch Regulated)',
      color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    };
  } else if (v > vCutOut) {
    turbineStateBadge = {
      label: `⚠️ Safety Cut-Out Shutdown (> ${vCutOut} m/s)`,
      color: 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse',
    };
  }

  return (
    <section className="glass-panel rounded-2xl p-5 lg:p-6 border border-slate-800/90 shadow-2xl relative overflow-hidden transition-all space-y-5">
      
      {/* 1. Header & Quick Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base lg:text-lg font-bold text-white font-heading">
                Interactive Weather Control & Microclimate Simulation
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                METEOROLOGICAL MODEL
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Modulate Solar PV Irradiance, Cloud Cover, Panel Temperature, Wind Velocity, and Turbine Aerodynamic Thresholds
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onRestoreDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-all shadow-sm active:scale-95"
            title="Restore all weather and turbine parameters to pristine initial settings"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Default Settings</span>
          </button>
        </div>
      </div>

      {/* 2. Combined Weather Scenario Selector (Requirement 4) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Combined Weather Scenarios:</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Instantaneous reactive recalculation across all generation nodes
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(COMBINED_WEATHER_SCENARIOS).map(([key, item]) => {
            const isSelected = weatherSettings.scenario === key;
            return (
              <button
                key={key}
                onClick={() => handleSelectScenario(key)}
                className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? `${item.badgeColor} shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/50 bg-slate-900/90`
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-white font-heading flex items-center gap-1.5">
                      {item.name}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>G: {item.solarIrradiance} W/m²</span>
                  <span>Wind: {item.windSpeed} m/s</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Parameters Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Active Weather Telemetry:</span>
          <span className="text-amber-300 flex items-center gap-1">
            <Sun className="w-3.5 h-3.5" /> {weatherSettings.solarIrradiance} W/m²
          </span>
          <span className="text-slate-300 flex items-center gap-1">
            <Cloud className="w-3.5 h-3.5 text-slate-400" /> {weatherSettings.cloudCover}% Clouds
          </span>
          <span className="text-red-300 flex items-center gap-1">
            <Thermometer className="w-3.5 h-3.5 text-red-400" /> {weatherSettings.solarCellTemp}°C
          </span>
          <span className="text-cyan-300 flex items-center gap-1">
            <Wind className="w-3.5 h-3.5" /> {weatherSettings.windSpeed} m/s ({weatherSettings.windDirection}° {getCardinalDirection(weatherSettings.windDirection)})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] border ${turbineStateBadge.color}`}>
            {turbineStateBadge.label}
          </span>
        </div>
      </div>

      {/* 3. Navigation Tabs: Solar PV Control vs Wind Turbine Control */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveWeatherTab('combined')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
            activeWeatherTab === 'combined'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All Weather Controls (Dual View)
        </button>
        <button
          onClick={() => setActiveWeatherTab('solar')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
            activeWeatherTab === 'solar'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span>Solar PV Weather</span>
        </button>
        <button
          onClick={() => setActiveWeatherTab('wind')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
            activeWeatherTab === 'wind'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wind className="w-3.5 h-3.5 text-cyan-400" />
          <span>Wind Weather</span>
        </button>
      </div>

      {/* 4. Weather Modulation Panels (Solar & Wind) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* ================= SOLAR PV WEATHER CONTROL (Requirement 2) ================= */}
        {(activeWeatherTab === 'combined' || activeWeatherTab === 'solar') && (
          <div className="glass-panel rounded-xl p-4 lg:p-5 border border-amber-500/30 space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-heading">
                    Solar PV Weather Control
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Irradiance, Cloud Attenuation & Cell Temperature
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono text-amber-400 font-bold">
                {currentTelemetry ? `${currentTelemetry.solarPower.toFixed(1)} kW Output` : ''}
              </span>
            </div>

            {/* Presets: Clear Sky, Partly Cloudy, Overcast, Rainy */}
            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-1.5 font-bold uppercase">
                Solar Weather Presets:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(SOLAR_PRESETS).map(([key, item]) => {
                  const isActive = weatherSettings.solarPreset === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectSolarPreset(key)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all text-center ${
                        isActive
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm font-bold'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slider 1: Solar Irradiance in W/m² (0 - 1200) */}
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Solar Irradiance (G):</span>
                </span>
                <span className="text-amber-400 font-bold text-sm font-mono-num">
                  {weatherSettings.solarIrradiance} W/m²
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1200"
                step="10"
                value={weatherSettings.solarIrradiance}
                onChange={(e) => onUpdateWeather({ solarIrradiance: Number(e.target.value), scenario: 'custom', isCustom: true })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>0 W/m² (Night)</span>
                <span>600 W/m² (Diffuse)</span>
                <span>1000 W/m² (STC Peak)</span>
                <span>1200 W/m²</span>
              </div>
            </div>

            {/* Slider 2: Cloud Cover (0% - 100%) */}
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5 text-slate-400" />
                  <span>Cloud Cover:</span>
                </span>
                <span className="text-cyan-300 font-bold text-sm font-mono-num">
                  {weatherSettings.cloudCover}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={weatherSettings.cloudCover}
                onChange={(e) => onUpdateWeather({ cloudCover: Number(e.target.value), scenario: 'custom', isCustom: true })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>0% (Clear)</span>
                <span>40% (Partly Cloudy)</span>
                <span>80% (Overcast)</span>
                <span>100% (Dense)</span>
              </div>
            </div>

            {/* Dual Row: Solar Panel Temperature & Generation Adjustment Slider */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Temperature Input */}
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-slate-300 font-bold flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-red-400" />
                    <span>Cell Temp:</span>
                  </span>
                  <span className="text-red-400 font-bold font-mono-num">
                    {weatherSettings.solarCellTemp}°C
                  </span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="65"
                  step="1"
                  value={weatherSettings.solarCellTemp}
                  onChange={(e) => onUpdateWeather({ solarCellTemp: Number(e.target.value), scenario: 'custom', isCustom: true })}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-400"
                />
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                  Temp Coeff: -0.4%/°C from 25°C
                </span>
              </div>

              {/* Solar Generation Adjustment Slider (0 - 100%) */}
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-slate-300 font-bold flex items-center gap-1">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                    <span>Solar Scaling:</span>
                  </span>
                  <span className="text-amber-300 font-bold font-mono-num">
                    {weatherSettings.solarGenAdjustment}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={weatherSettings.solarGenAdjustment}
                  onChange={(e) => onUpdateWeather({ solarGenAdjustment: Number(e.target.value), scenario: 'custom', isCustom: true })}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                  Derate factor (0% - 100%)
                </span>
              </div>

            </div>

          </div>
        )}

        {/* ================= WIND WEATHER CONTROL (Requirement 3) ================= */}
        {(activeWeatherTab === 'combined' || activeWeatherTab === 'wind') && (
          <div className="glass-panel rounded-xl p-4 lg:p-5 border border-cyan-500/30 space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-heading">
                    Wind Weather & Turbine Control
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Wind Velocity, Direction & Power Curve Thresholds
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                {currentTelemetry ? `${currentTelemetry.windPower.toFixed(1)} kW Output` : ''}
              </span>
            </div>

            {/* Presets: Calm, Light, Moderate, Strong, Storm */}
            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-1.5 font-bold uppercase">
                Wind Condition Presets:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {Object.entries(WIND_PRESETS).map(([key, item]) => {
                  const isActive = weatherSettings.windPreset === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectWindPreset(key)}
                      className={`px-2 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all text-center ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm font-bold'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slider 1: Wind Speed Slider (0 - 35 m/s) */}
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Wind Speed (v):</span>
                </span>
                <span className="text-cyan-400 font-bold text-sm font-mono-num">
                  {weatherSettings.windSpeed} m/s
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="35"
                step="0.1"
                value={weatherSettings.windSpeed}
                onChange={(e) => onUpdateWeather({ 
                  windSpeed: Number(e.target.value), 
                  windSpeedOverride: Number(e.target.value),
                  scenario: 'custom', 
                  isCustom: true 
                })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>0 m/s</span>
                <span className="text-amber-400">Cut-in: {vCutIn} m/s</span>
                <span className="text-cyan-400">Rated: {vRated} m/s</span>
                <span className="text-red-400 font-bold">Cut-out: {vCutOut} m/s</span>
                <span>35 m/s</span>
              </div>
            </div>

            {/* Wind Direction & Compass Rose */}
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-teal-400" />
                  <span>Wind Direction:</span>
                </span>
                <span className="text-teal-300 font-bold font-mono-num">
                  {weatherSettings.windDirection}° ({getCardinalDirection(weatherSettings.windDirection)})
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={weatherSettings.windDirection}
                onChange={(e) => onUpdateWeather({ windDirection: Number(e.target.value), scenario: 'custom', isCustom: true })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>0° (N)</span>
                <span>90° (E)</span>
                <span>180° (S)</span>
                <span>270° (W)</span>
                <span>360° (N)</span>
              </div>
            </div>

            {/* Collapsible Wind Turbine Settings (Requirement 3) */}
            <div className="pt-1">
              <button
                onClick={() => setShowTurbineConfig(!showTurbineConfig)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 transition-all"
              >
                <span className="flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Turbine Thresholds (Rated, Cut-In, Rated Speed, Cut-Out)</span>
                </span>
                {showTurbineConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showTurbineConfig && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2.5 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Rated Power</span>
                    <input
                      type="number"
                      value={turbineSettings.windRatedPower}
                      onChange={(e) => onUpdateTurbine({ windRatedPower: Number(e.target.value) })}
                      className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-bold text-xs"
                    />
                    <span className="text-[9px] text-slate-500">kW</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block">Cut-In Speed</span>
                    <input
                      type="number"
                      step="0.5"
                      value={turbineSettings.windCutInSpeed}
                      onChange={(e) => onUpdateTurbine({ windCutInSpeed: Number(e.target.value) })}
                      className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-amber-300 font-bold text-xs"
                    />
                    <span className="text-[9px] text-slate-500">m/s</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block">Rated Speed</span>
                    <input
                      type="number"
                      step="0.5"
                      value={turbineSettings.windRatedSpeed}
                      onChange={(e) => onUpdateTurbine({ windRatedSpeed: Number(e.target.value) })}
                      className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-emerald-300 font-bold text-xs"
                    />
                    <span className="text-[9px] text-slate-500">m/s</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block">Cut-Out Speed</span>
                    <input
                      type="number"
                      step="0.5"
                      value={turbineSettings.windCutOutSpeed}
                      onChange={(e) => onUpdateTurbine({ windCutOutSpeed: Number(e.target.value) })}
                      className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-red-400 font-bold text-xs"
                    />
                    <span className="text-[9px] text-slate-500">m/s</span>
                  </div>
                </div>
              )}
            </div>

            {/* Aerodynamic Physics Note */}
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] font-mono text-slate-400">
              <span className="text-cyan-300 font-bold">Aerodynamic Safety Principle:</span>{' '}
              Turbine strictly produces <span className="text-white font-bold">0 kW</span> when wind speed is below{' '}
              <span className="text-amber-300 font-bold">{vCutIn} m/s</span> or above safety cut-out threshold{' '}
              <span className="text-red-400 font-bold">{vCutOut} m/s</span>.
            </div>

          </div>
        )}

      </div>

    </section>
  );
}
