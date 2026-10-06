import { PHYSICAL_CONSTANTS } from './constants';

/**
 * Calculates Solar PV Power Output based on:
 * P_solar = P_rated * (G / 1000) * [1 + gamma * (T_cell - 25)]
 * Clamped to [0, P_rated].
 */
export function calculateSolarPower(config, irradiance = config.solarIrradiance, cellTemp = config.solarCellTemp) {
  const G = Math.max(0, irradiance);
  const T = cellTemp;
  const P_rated = config.solarRatedPower;
  const gamma = config.solarTempCoeff || -0.004;

  if (G <= 0) return { power: 0, efficiency: 0, status: 'Night / Dark' };

  // Derating factor for temperature
  const tempFactor = 1 + gamma * (T - PHYSICAL_CONSTANTS.STC_TEMP);
  const adjFactor = (config.solarGenAdjustment !== undefined ? config.solarGenAdjustment : 100) / 100;
  const rawPower = P_rated * (G / PHYSICAL_CONSTANTS.STANDARD_IRRADIANCE) * Math.max(0.1, tempFactor) * adjFactor;
  
  // Clamped power output
  const power = Math.min(P_rated, Math.max(0, rawPower));
  
  // Real-time solar module efficiency
  const currentEfficiency = config.solarNominalEfficiency * Math.max(0.5, tempFactor);

  let status = 'Normal Operation';
  if (power >= P_rated * 0.98) status = 'Peak Rating';
  else if (G < 200) status = 'Low Irradiance';

  return {
    power: Number(power.toFixed(2)),
    efficiency: Number(currentEfficiency.toFixed(2)),
    status,
    tempDeratePct: Number(((1 - tempFactor) * 100).toFixed(1)),
  };
}

/**
 * Calculates Wind Turbine Power Output using cubic aerodynamic power curve
 * with cut-in, rated, and cut-out safety shutdown behavior.
 */
export function calculateWindPower(config, windSpeed = config.windSpeed) {
  const v = Math.max(0, windSpeed);
  const P_rated = config.windRatedPower;
  const v_cutIn = config.windCutInSpeed;
  const v_rated = config.windRatedSpeed;
  const v_cutOut = config.windCutOutSpeed;

  let power = 0;
  let status = 'Active';
  let turbineState = 'running'; // 'below_cutin' | 'partial_load' | 'rated_load' | 'cut_out_shutdown'

  if (v < v_cutIn) {
    power = 0;
    status = 'Below Cut-in Speed (Idle)';
    turbineState = 'below_cutin';
  } else if (v >= v_cutIn && v < v_rated) {
    // Cubic aerodynamic power curve
    const normalizedV = (v - v_cutIn) / (v_rated - v_cutIn);
    power = P_rated * Math.pow(normalizedV, 3);
    status = 'Partial Load Generation';
    turbineState = 'partial_load';
  } else if (v >= v_rated && v <= v_cutOut) {
    // Pitch / stall regulation keeps generation at rated capacity
    power = P_rated;
    status = 'Rated Capacity (Pitch Regulated)';
    turbineState = 'rated_load';
  } else {
    // Cut-out shutdown: aerodynamic feathering + mechanical brake
    power = 0;
    status = '⚠️ Cut-Out Safety Shutdown (> ' + v_cutOut + ' m/s)';
    turbineState = 'cut_out_shutdown';
  }

  // Ensure within [0, P_rated]
  power = Math.min(P_rated, Math.max(0, power));

  return {
    power: Number(power.toFixed(2)),
    status,
    turbineState,
    windSpeed: Number(v.toFixed(1)),
    isCutOut: turbineState === 'cut_out_shutdown',
  };
}

/**
 * Calculates Combined Hybrid Power & Contribution
 */
export function calculateCombinedPower(solarPower, windPower) {
  const total = Number((solarPower + windPower).toFixed(2));
  const solarShare = total > 0 ? Number(((solarPower / total) * 100).toFixed(1)) : 0;
  const windShare = total > 0 ? Number(((windPower / total) * 100).toFixed(1)) : 0;

  return {
    totalPower: total,
    solarShare,
    windShare,
  };
}

/**
 * Calculates Electrolyzer operation and Hydrogen production rate
 */
export function calculateElectrolyzer(combinedPower, config, currentTankMass = 20) {
  const P_comb = combinedPower;
  const P_aux = config.auxiliaryLoad || 0;
  const P_ratedEly = config.electrolyzerRatedPower;
  const minLoadPct = config.electrolyzerMinLoadPct || 15;
  const sec = config.specificEnergyConsumption || 55; // kWh/kg
  const tankMax = config.h2TankCapacity;

  // Power available after auxiliary load
  const availablePower = Math.max(0, P_comb - P_aux);
  const minOperatingPower = P_ratedEly * (minLoadPct / 100);

  let electrolyzerPower = 0;
  let status = 'Standby (Low Renewable Power)';
  let isStandby = false;
  let isTankFull = currentTankMass >= tankMax;

  if (isTankFull) {
    status = 'Tank Full - Electrolyzer Paused';
    electrolyzerPower = 0;
  } else if (availablePower < minOperatingPower) {
    electrolyzerPower = 0;
    isStandby = true;
    status = `Standby (< ${minLoadPct}% Min Load)`;
  } else {
    electrolyzerPower = Math.min(availablePower, P_ratedEly);
    if (electrolyzerPower >= P_ratedEly * 0.99) {
      status = 'Operating at 100% Rated Capacity';
    } else {
      status = `Modulating Load (${((electrolyzerPower / P_ratedEly) * 100).toFixed(0)}%)`;
    }
  }

  // Surplus power after electrolyzer
  const surplusPower = Math.max(0, availablePower - electrolyzerPower);

  // Hydrogen production rate in kg/h
  const h2RateKgPerHr = electrolyzerPower > 0 ? electrolyzerPower / sec : 0;
  const h2RateNm3PerHr = h2RateKgPerHr * PHYSICAL_CONSTANTS.NM3_PER_KG_H2;
  const h2RateGPerMin = (h2RateKgPerHr * 1000) / 60;

  // Estimated efficiency based on Lower Heating Value (LHV = 33.33 kWh/kg)
  const lhvEfficiency = Number(((PHYSICAL_CONSTANTS.H2_LHV_KWH_KG / sec) * 100).toFixed(1));
  const hhvEfficiency = Number(((PHYSICAL_CONSTANTS.H2_HHV_KWH_KG / sec) * 100).toFixed(1));

  return {
    electrolyzerPower: Number(electrolyzerPower.toFixed(2)),
    availablePower: Number(availablePower.toFixed(2)),
    surplusPower: Number(surplusPower.toFixed(2)),
    h2RateKgPerHr: Number(h2RateKgPerHr.toFixed(3)),
    h2RateNm3PerHr: Number(h2RateNm3PerHr.toFixed(2)),
    h2RateGPerMin: Number(h2RateGPerMin.toFixed(2)),
    dailyH2EstimateKg: Number((h2RateKgPerHr * 24).toFixed(2)),
    lhvEfficiency,
    hhvEfficiency,
    status,
    isStandby,
    isTankFull,
    utilizationPct: Number(((electrolyzerPower / P_ratedEly) * 100).toFixed(1)),
  };
}

/**
 * Simulates Fuel Cell operation for Green Marine / Ship propulsion
 */
export function calculateFuelCell(config, currentTankMass = 20) {
  if (!config.fuelCellActive || currentTankMass <= 0.5) {
    return {
      power: 0,
      h2ConsumptionKgHr: 0,
      active: false,
      status: currentTankMass <= 0.5 ? 'Depleted Storage' : 'Offline / Standby',
    };
  }

  const P_fc = config.fuelCellRatedPower || 40; // kW
  const efficiency = (config.fuelCellEfficiency || 52) / 100;
  // Specific H2 consumption = P_fc / (LHV * efficiency)
  const h2ConsumptionRate = P_fc / (PHYSICAL_CONSTANTS.H2_LHV_KWH_KG * efficiency);

  return {
    power: P_fc,
    h2ConsumptionKgHr: Number(h2ConsumptionRate.toFixed(3)),
    active: true,
    status: 'Supplying Ship Electric Propulsion',
  };
}

/**
 * Computes comparative snapshot for Good vs Bad weather scenarios
 */
export function computeWeatherComparison(config, weatherPresets) {
  const goodPreset = weatherPresets.good;
  const badPreset = weatherPresets.bad;

  // Good Weather Scenario
  const goodSolar = calculateSolarPower(config, goodPreset.solarIrradiance, goodPreset.solarCellTemp);
  const goodWind = calculateWindPower(config, goodPreset.windSpeed);
  const goodComb = calculateCombinedPower(goodSolar.power, goodWind.power);
  const goodEly = calculateElectrolyzer(goodComb.totalPower, config);

  // Bad Weather Scenario
  const badSolar = calculateSolarPower(config, badPreset.solarIrradiance, badPreset.solarCellTemp);
  const badWind = calculateWindPower(config, badPreset.windSpeed);
  const badComb = calculateCombinedPower(badSolar.power, badWind.power);
  const badEly = calculateElectrolyzer(badComb.totalPower, config);

  const deltaPower = Number((badComb.totalPower - goodComb.totalPower).toFixed(2));
  const pctChange = goodComb.totalPower > 0
    ? Number(((deltaPower / goodComb.totalPower) * 100).toFixed(1))
    : 0;

  const deltaH2 = Number((badEly.h2RateKgPerHr - goodEly.h2RateKgPerHr).toFixed(3));
  const pctChangeH2 = goodEly.h2RateKgPerHr > 0
    ? Number(((deltaH2 / goodEly.h2RateKgPerHr) * 100).toFixed(1))
    : 0;

  return {
    good: {
      solarPower: goodSolar.power,
      windPower: goodWind.power,
      totalPower: goodComb.totalPower,
      h2Rate: goodEly.h2RateKgPerHr,
      irradiance: goodPreset.solarIrradiance,
      windSpeed: goodPreset.windSpeed,
    },
    bad: {
      solarPower: badSolar.power,
      windPower: badWind.power,
      totalPower: badComb.totalPower,
      h2Rate: badEly.h2RateKgPerHr,
      irradiance: badPreset.solarIrradiance,
      windSpeed: badPreset.windSpeed,
      isCutOut: badWind.isCutOut,
    },
    deltaPower,
    pctChange,
    deltaH2,
    pctChangeH2,
  };
}

/**
 * Generates initial 24-hour historical dataset for charts
 */
export function generateInitial24HourHistory(config, weatherMode = 'good') {
  const data = [];
  const hours = 24;
  const now = new Date();

  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 3600 * 1000);
    const hourOfDay = timestamp.getHours();
    
    // Diurnal solar curve (peak at noon, 0 at night)
    let solarFraction = 0;
    if (hourOfDay >= 6 && hourOfDay <= 18) {
      const solarAngle = ((hourOfDay - 6) / 12) * Math.PI;
      solarFraction = Math.sin(solarAngle);
    }
    
    // Weather multiplier
    const weatherFactor = weatherMode === 'good' ? 0.9 + Math.random() * 0.15 : 0.2 + Math.random() * 0.1;
    const currentG = Math.max(0, Math.round(config.solarIrradiance * solarFraction * weatherFactor));
    
    // Wind with diurnal / natural variation
    const windBase = weatherMode === 'good' ? config.windSpeed : 14.5;
    const windNoise = (Math.sin(hourOfDay * 0.6) * 2.2) + (Math.random() - 0.5) * 1.5;
    const currentWindSpeed = Math.max(0, windBase + windNoise);

    const solar = calculateSolarPower(config, currentG, config.solarCellTemp);
    const wind = calculateWindPower(config, currentWindSpeed);
    const comb = calculateCombinedPower(solar.power, wind.power);
    const ely = calculateElectrolyzer(comb.totalPower, config);

    data.push({
      time: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hour: hourOfDay,
      solarPower: solar.power,
      windPower: wind.power,
      combinedPower: comb.totalPower,
      electrolyzerPower: ely.electrolyzerPower,
      h2Rate: ely.h2RateKgPerHr,
      irradiance: currentG,
      windSpeed: Number(currentWindSpeed.toFixed(1)),
    });
  }

  return data;
}
