// Engineering constants and defaults for the Hybrid Renewable Energy & Green Hydrogen System

export const DEFAULT_CONFIG = {
  // Solar PV Parameters
  solarRatedPower: 100, // kW (Installed capacity)
  solarIrradiance: 850, // W/m² (Current default)
  solarNominalEfficiency: 21.5, // %
  solarTempCoeff: -0.004, // per °C (crystalline silicon: -0.4%/°C)
  solarCellTemp: 32, // °C
  solarGenAdjustment: 100, // % (0-100% adjustment factor)
  cloudCover: 15, // % (0-100%)
  
  // Wind Turbine Parameters
  windRatedPower: 120, // kW
  windSpeed: 9.2, // m/s
  windCutInSpeed: 3.0, // m/s
  windRatedSpeed: 11.5, // m/s
  windCutOutSpeed: 25.0, // m/s
  windDirection: 225, // degrees (0-360°)
  
  // Electrolyzer Parameters
  electrolyzerRatedPower: 180, // kW
  electrolyzerMinLoadPct: 15, // % of rated capacity (standby threshold)
  specificEnergyConsumption: 55, // kWh/kg H2 (Default theoretical SEC)
  auxiliaryLoad: 5, // kW (BOP: balance of plant pumps, deionizer, chiller)
  
  // Storage Tank Parameters
  h2TankCapacity: 100, // kg
  initialTankFillPct: 28, // %
  tankDesignPressure: 350, // bar (Type III / IV composite cylinder)
  
  // Marine Fuel Cell (Downstream Application)
  fuelCellRatedPower: 40, // kW (Propulsion/Aux ship load)
  fuelCellEfficiency: 52, // % (LHV basis)
  fuelCellActive: false, // Discharging to ship
  
  // Surplus Strategy
  surplusStrategy: 'grid', // 'grid' | 'curtail'
};

// 1. Solar PV Specific Weather Presets
export const SOLAR_PRESETS = {
  clearSky: {
    id: 'clearSky',
    name: 'Clear Sky',
    description: 'Direct peak sunshine, minimal cloud obstruction, higher panel temperature.',
    irradiance: 1000, // W/m²
    cloudCover: 5, // %
    panelTemp: 38, // °C
    solarGenAdjustment: 100, // %
    icon: 'Sun',
    color: 'text-amber-400',
  },
  partlyCloudy: {
    id: 'partlyCloudy',
    name: 'Partly Cloudy',
    description: 'Intermittent sunshine filtered by passing cumulus clouds.',
    irradiance: 650, // W/m²
    cloudCover: 40, // %
    panelTemp: 28, // °C
    solarGenAdjustment: 90, // %
    icon: 'CloudSun',
    color: 'text-yellow-300',
  },
  overcast: {
    id: 'overcast',
    name: 'Overcast',
    description: 'Thick stratiform cloud layer causing high diffuse radiation suppression.',
    irradiance: 250, // W/m²
    cloudCover: 85, // %
    panelTemp: 20, // °C
    solarGenAdjustment: 60, // %
    icon: 'Cloud',
    color: 'text-slate-300',
  },
  rainy: {
    id: 'rainy',
    name: 'Rainy',
    description: 'Heavy precipitation, dense rainclouds, and low ambient temperature.',
    irradiance: 120, // W/m²
    cloudCover: 98, // %
    panelTemp: 16, // °C
    solarGenAdjustment: 40, // %
    icon: 'CloudRain',
    color: 'text-blue-400',
  },
};

// 2. Wind Turbine Specific Condition Presets
export const WIND_PRESETS = {
  calm: {
    id: 'calm',
    name: 'Calm',
    description: 'Sub-cut-in winds (< 3.0 m/s). Rotor remains idle with zero power generation.',
    windSpeed: 1.8, // m/s
    windDirection: 180, // S
    icon: 'Wind',
    badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
  },
  light: {
    id: 'light',
    name: 'Light Wind',
    description: 'Gentle breeze above cut-in. Initial partial aerodynamic loading.',
    windSpeed: 5.2, // m/s
    windDirection: 210, // SSW
    icon: 'Wind',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
  },
  moderate: {
    id: 'moderate',
    name: 'Moderate Wind',
    description: 'Fresh breeze with high aerodynamic efficiency in cubic power curve zone.',
    windSpeed: 9.0, // m/s
    windDirection: 235, // SW
    icon: 'Wind',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  },
  strong: {
    id: 'strong',
    name: 'Strong Wind',
    description: 'High wind speed achieving full rated turbine capacity (pitch regulated).',
    windSpeed: 13.5, // m/s
    windDirection: 270, // W
    icon: 'Wind',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  },
  storm: {
    id: 'storm',
    name: 'Storm (Cut-Out)',
    description: 'Dangerous gale exceeding cut-out speed (> 25 m/s). Emergency rotor braking & feathering active.',
    windSpeed: 26.5, // m/s
    windDirection: 315, // NW
    icon: 'AlertTriangle',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
  },
};

// 3. Combined Weather Scenario Presets
export const COMBINED_WEATHER_SCENARIOS = {
  good: {
    id: 'good',
    name: 'Good Weather',
    description: 'High solar irradiance (clear sky), favorable moderate wind, ideal hybrid output.',
    solarIrradiance: 950, // W/m²
    cloudCover: 8, // %
    solarCellTemp: 28, // °C
    windSpeed: 8.8, // m/s
    windDirection: 225, // SW
    solarGenAdjustment: 100, // %
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: 'Sun',
  },
  moderate: {
    id: 'moderate',
    name: 'Moderate Weather',
    description: 'Balanced seasonal conditions with partly cloudy skies and steady breeze.',
    solarIrradiance: 550, // W/m²
    cloudCover: 45, // %
    solarCellTemp: 24, // °C
    windSpeed: 7.5, // m/s
    windDirection: 200, // SSW
    solarGenAdjustment: 90, // %
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    icon: 'CloudSun',
  },
  bad: {
    id: 'bad',
    name: 'Bad Weather',
    description: 'Low solar irradiance (storm/rain). Wind speed elevated, demonstrating renewable complementarity unless cut-out.',
    solarIrradiance: 175, // W/m²
    cloudCover: 90, // %
    solarCellTemp: 16, // °C
    windSpeed: 15.5, // m/s
    windDirection: 315, // NW
    solarGenAdjustment: 50, // %
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    icon: 'CloudRain',
  },
  custom: {
    id: 'custom',
    name: 'Custom Weather',
    description: 'Fully manual user-defined environmental parameters for simulation experiments.',
    solarIrradiance: 850,
    cloudCover: 15,
    solarCellTemp: 32,
    windSpeed: 9.2,
    windDirection: 225,
    solarGenAdjustment: 100,
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    icon: 'Sliders',
  },
};

// Legacy Weather Presets reference for backwards compatibility
export const WEATHER_PRESETS = {
  good: COMBINED_WEATHER_SCENARIOS.good,
  bad: COMBINED_WEATHER_SCENARIOS.bad,
  extremeStorm: {
    name: 'Storm Gale (Cut-Out)',
    description: 'Severe weather exceeding safety limits (> 25 m/s) forcing wind turbine cut-out shutdown.',
    solarIrradiance: 90,
    solarCellTemp: 14,
    windSpeed: 26.5,
    icon: 'AlertTriangle',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
  },
};

// Simulation Speeds & Steps
export const SIMULATION_SPEEDS = [1, 2, 5, 10, 30]; // 1x, 2x, 5x, 10x, 30x

export const TIME_STEP_OPTIONS = [
  { value: 1, label: '1 Minute' },
  { value: 5, label: '5 Minutes' },
  { value: 15, label: '15 Minutes' },
  { value: 30, label: '30 Minutes' },
  { value: 60, label: '1 Hour' },
];

// Thermodynamic & Physical Constants
export const PHYSICAL_CONSTANTS = {
  H2_LHV_KWH_KG: 33.33, // Lower Heating Value of Hydrogen in kWh/kg
  H2_HHV_KWH_KG: 39.40, // Higher Heating Value of Hydrogen in kWh/kg
  H2_DENSITY_STP: 0.08988, // kg/m³ at STP (0°C, 1 atm)
  NM3_PER_KG_H2: 11.12, // Normal cubic meters per kilogram of H2
  CO2_AVOIDED_PER_KG_GREEN_H2: 9.3, // kg CO2 avoided vs Steam Methane Reforming (gray H2)
  STANDARD_IRRADIANCE: 1000, // W/m² (STC standard test condition)
  STC_TEMP: 25, // °C
};

