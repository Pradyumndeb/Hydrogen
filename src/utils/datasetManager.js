import { PHYSICAL_CONSTANTS } from './constants.js';

/**
 * Calculates solar irradiance diurnal curve based on hour of day (0-24)
 * Peak at solar noon (~12:30), 0 before 05:45 and after 18:45
 */
export function getDiurnalSolarFraction(hourOfDay) {
  const sunrise = 5.75; // 05:45
  const sunset = 18.75; // 18:45
  if (hourOfDay < sunrise || hourOfDay > sunset) return 0;
  
  // Sine curve normalized between sunrise and sunset
  const dayLength = sunset - sunrise;
  const progress = (hourOfDay - sunrise) / dayLength;
  return Math.sin(progress * Math.PI);
}

/**
 * Generates a realistic baseline dataset for a specified date and time window
 * with timestamps and physical solar/wind baseline values.
 */
export function generateBaselineDataset({
  date = '2026-09-30',
  startTime = '00:00',
  endTime = '23:59',
  timeStepMinutes = 15,
  solarRatedPower = 100,
  windRatedPower = 120,
  baseIrradiance = 900,
  baseWindSpeed = 9.2,
}) {
  const dataset = [];
  
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  
  const startTotalMinutes = startH * 60 + startM;
  let endTotalMinutes = endH * 60 + endM;
  if (endTotalMinutes <= startTotalMinutes) {
    endTotalMinutes = 24 * 60; // full day if same or wrap
  }

  for (let m = startTotalMinutes; m <= endTotalMinutes; m += timeStepMinutes) {
    const hour = Math.floor(m / 60);
    const minute = m % 60;
    const hourFraction = hour + minute / 60;
    
    const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    const isoDateTime = `${date}T${timeString}:00`;

    // 1. Solar baseline: Diurnal curve with slight atmospheric variations
    const solarFraction = getDiurnalSolarFraction(hourFraction);
    // Subtle realistic variations throughout the day
    const atmosphericVariance = solarFraction > 0 ? (1 + 0.06 * Math.sin(hourFraction * 1.5)) : 0;
    const irradiance = Math.round(Math.max(0, baseIrradiance * solarFraction * atmosphericVariance));
    
    // Baseline solar power at STC (25°C baseline)
    const solarPower = Number((solarRatedPower * (irradiance / 1000)).toFixed(2));

    // 2. Wind baseline: Natural diurnal thermal variation + atmospheric cycle
    // Wind often picks up in afternoon due to thermal gradients
    const thermalWindFactor = 1 + 0.22 * Math.sin((hourFraction - 10) * (Math.PI / 12));
    const atmosphericTurbulence = 0.5 * Math.sin(hourFraction * 2.8) + 0.3 * Math.cos(hourFraction * 4.1);
    const windSpeed = Number(Math.max(0.5, (baseWindSpeed * thermalWindFactor + atmosphericTurbulence)).toFixed(1));

    // Baseline wind power using standard cubic power curve (cut-in: 3.0, rated: 11.5, cut-out: 25.0)
    let windPower = 0;
    if (windSpeed >= 3.0 && windSpeed < 11.5) {
      windPower = windRatedPower * Math.pow((windSpeed - 3.0) / (11.5 - 3.0), 3);
    } else if (windSpeed >= 11.5 && windSpeed <= 25.0) {
      windPower = windRatedPower;
    } else {
      windPower = 0;
    }
    windPower = Number(Math.min(windRatedPower, windPower).toFixed(2));

    dataset.push({
      id: `pt-${m}`,
      minuteOffset: m - startTotalMinutes,
      time: timeString,
      dateTime: isoDateTime,
      hour: hourFraction,
      // Baseline raw values (NEVER overwritten)
      baselineIrradiance: irradiance,
      baselineSolarPower: solarPower,
      baselineWindSpeed: windSpeed,
      baselineWindPower: windPower,
      isMeasured: false, // will be true if loaded from CSV
      source: 'simulated_baseline',
    });
  }

  return dataset;
}

/**
 * Applies weather controls and simulation physical parameters to baseline dataset
 * without modifying baseline values.
 */
export function computeWeatherAdjustedData(
  baselineDataset,
  weatherSettings,
  turbineSettings,
  solarSettings,
  electrolyzerSettings,
  currentSimIndex = 0,
  pauseContext = null
) {
  let cumulativeH2 = 0;
  const sec = electrolyzerSettings.specificEnergyConsumption || 55;
  const pRatedEly = electrolyzerSettings.electrolyzerRatedPower || 180;
  const pAux = electrolyzerSettings.auxiliaryLoad || 0;

  const { pausedIndex, pausedCumulativeH2 } = pauseContext || {};
  const hasPauseAnchor = pausedIndex !== undefined && pausedIndex !== null && pausedCumulativeH2 !== undefined && pausedCumulativeH2 !== null;

  return baselineDataset.map((pt, index) => {
    // Determine time delta in hours for cumulative integration
    let dtHours = 0;
    if (index > 0) {
      const prevPt = baselineDataset[index - 1];
      dtHours = Math.max(0, (pt.minuteOffset - prevPt.minuteOffset) / 60);
    }

    // 1. Solar Weather Adjustment Model
    // Cloud cover factor: 0% clouds = 1.0, 100% clouds = ~0.15 irradiance
    const cloudFactor = Math.max(0.1, 1 - 0.85 * (weatherSettings.cloudCover / 100));
    
    // Irradiance adjustment:
    // If user explicitly controls irradiance slider, scale baseline relative to 1000 W/m² standard
    const irradianceScale = weatherSettings.solarIrradiance / 1000;
    const adjustedIrradiance = Math.round(
      Math.max(0, pt.baselineIrradiance * cloudFactor * irradianceScale)
    );

    // Temperature derating: -0.4% per °C above 25°C
    const tempFactor = 1 + (solarSettings.solarTempCoeff || -0.004) * (weatherSettings.solarCellTemp - 25);
    
    // Solar generation adjustment slider (0 - 100%)
    const solarAdjFactor = (weatherSettings.solarGenAdjustment ?? 100) / 100;

    // Adjusted Solar Power Output
    const rawSolarPower = (solarSettings.solarRatedPower || 100) * 
      (adjustedIrradiance / 1000) * 
      Math.max(0.1, tempFactor) * 
      solarAdjFactor;
    const solarPower = Number(Math.min(solarSettings.solarRatedPower || 100, Math.max(0, rawSolarPower)).toFixed(2));

    // 2. Wind Weather Adjustment Model
    // If wind speed is user-adjusted or from weather presets:
    // When user sets a specific weather preset/slider, apply wind adjustment factor or direct speed
    let activeWindSpeed = pt.baselineWindSpeed;
    if (weatherSettings.windSpeedOverride !== undefined && weatherSettings.windSpeedOverride !== null) {
      // Direct speed override with baseline diurnal shape
      const baselineAvg = 9.2;
      const variation = pt.baselineWindSpeed - baselineAvg;
      activeWindSpeed = Math.max(0, weatherSettings.windSpeedOverride + variation * 0.4);
    }
    activeWindSpeed = Number(activeWindSpeed.toFixed(1));

    // Aerodynamic cubic power curve with strict cut-in, rated, and cut-out
    const v = activeWindSpeed;
    const vCutIn = turbineSettings.windCutInSpeed ?? 3.0;
    const vRated = turbineSettings.windRatedSpeed ?? 11.5;
    const vCutOut = turbineSettings.windCutOutSpeed ?? 25.0;
    const pRatedWind = turbineSettings.windRatedPower ?? 120;

    let windPower = 0;
    let turbineStatus = 'Active';

    if (v < vCutIn) {
      windPower = 0;
      turbineStatus = 'Below Cut-in Speed (Idle)';
    } else if (v >= vCutIn && v < vRated) {
      const normalizedV = (v - vCutIn) / (vRated - vCutIn);
      windPower = pRatedWind * Math.pow(normalizedV, 3);
      turbineStatus = 'Partial Load';
    } else if (v >= vRated && v <= vCutOut) {
      windPower = pRatedWind;
      turbineStatus = 'Rated Capacity (Pitch Regulated)';
    } else {
      // Cut-out safety shutdown
      windPower = 0;
      turbineStatus = '⚠️ Safety Cut-Out Shutdown (Rotor Braked)';
    }
    windPower = Number(Math.min(pRatedWind, Math.max(0, windPower)).toFixed(2));

    // 3. Combined Hybrid Power
    const combinedPower = Number((solarPower + windPower).toFixed(2));

    // 4. Electrolyzer Power Dispatch
    // Formula: Electrolyzer Input Power = min(Combined Power, Electrolyzer Rated Power)
    // Account for BOP auxiliary load if configured
    const availablePower = Math.max(0, combinedPower - pAux);
    const electrolyzerPower = Number(Math.min(availablePower, pRatedEly).toFixed(2));

    // 5. Hydrogen Production Rate (kg/h) = Electrolyzer Input Power (kW) / SEC (kWh/kg)
    const h2RateKgPerHr = electrolyzerPower > 0 ? Number((electrolyzerPower / sec).toFixed(4)) : 0;

    // 6. Cumulative Hydrogen Integration (kg)
    if (hasPauseAnchor) {
      if (index === pausedIndex) {
        cumulativeH2 = pausedCumulativeH2;
      } else if (index > pausedIndex) {
        cumulativeH2 += h2RateKgPerHr * dtHours;
      } else {
        cumulativeH2 += h2RateKgPerHr * dtHours;
      }
    } else {
      cumulativeH2 += h2RateKgPerHr * dtHours;
    }
    const cumulativeH2Kg = Number(cumulativeH2.toFixed(3));

    // Data Source Classification
    let dataSource = 'modelled';
    if (pt.isMeasured) {
      const isWeatherModified = 
        Math.abs(weatherSettings.solarIrradiance - 1000) > 10 ||
        weatherSettings.cloudCover > 10 ||
        Math.abs(weatherSettings.solarCellTemp - 25) > 2 ||
        (weatherSettings.windSpeedOverride !== undefined && weatherSettings.windSpeedOverride !== null);
      dataSource = isWeatherModified ? 'weather_adjusted' : 'measured';
    } else {
      dataSource = (weatherSettings.isCustom || weatherSettings.scenario !== 'good') 
        ? 'weather_adjusted' 
        : 'simulated_baseline';
    }

    return {
      ...pt,
      // Active adjusted telemetries
      solarPower,
      windPower,
      combinedPower,
      electrolyzerPower,
      h2Rate: Number(h2RateKgPerHr.toFixed(3)),
      cumulativeH2: cumulativeH2Kg,
      irradiance: adjustedIrradiance,
      windSpeed: activeWindSpeed,
      turbineStatus,
      dataSource,
      isCurrentTime: index === currentSimIndex,
    };
  });
}

/**
 * Parses user-uploaded CSV file content
 * Expected CSV formats:
 * timestamp, solar_power, wind_power, irradiance, wind_speed
 * or time, solarPower, windPower, etc.
 */
export function parseCSVDataset(csvText, solarRatedPower = 100, windRatedPower = 120) {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header line and one data row.');
  }

  const rawHeaders = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));
  
  // Find column indices
  const timeIdx = rawHeaders.findIndex((h) => h.includes('time') || h.includes('date') || h.includes('ts'));
  const solarIdx = rawHeaders.findIndex((h) => h.includes('solar') || h.includes('pv'));
  const windIdx = rawHeaders.findIndex((h) => h.includes('wind'));
  const irrIdx = rawHeaders.findIndex((h) => h.includes('irr') || h.includes('poa') || h.includes('ghi'));
  const speedIdx = rawHeaders.findIndex((h) => (h.includes('speed') || h.includes('vel')) && !h.includes('solar'));

  if (timeIdx === -1 && solarIdx === -1 && windIdx === -1) {
    throw new Error('CSV must contain identifiable columns such as Time, Solar Power, and Wind Power.');
  }

  const parsedData = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map((c) => c.trim().replace(/['"]/g, ''));
    if (row.length < 2 || !row[0]) continue;

    const rawTime = timeIdx >= 0 ? row[timeIdx] : `Hour ${i}`;
    let timeLabel = rawTime;
    // Format timestamp if ISO or full datetime
    if (rawTime.includes('T') || rawTime.includes(' ')) {
      try {
        const d = new Date(rawTime);
        if (!isNaN(d.getTime())) {
          timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        }
      } catch (e) {
        // keep rawTime
      }
    }

    const solarPower = solarIdx >= 0 && !isNaN(Number(row[solarIdx])) ? Number(row[solarIdx]) : 0;
    const windPower = windIdx >= 0 && !isNaN(Number(row[windIdx])) ? Number(row[windIdx]) : 0;
    const irradiance = irrIdx >= 0 && !isNaN(Number(row[irrIdx])) ? Number(row[irrIdx]) : Math.round((solarPower / solarRatedPower) * 1000);
    const windSpeed = speedIdx >= 0 && !isNaN(Number(row[speedIdx])) ? Number(row[speedIdx]) : 8.5;

    parsedData.push({
      id: `csv-${i}`,
      minuteOffset: (i - 1) * 15,
      time: timeLabel,
      dateTime: rawTime,
      hour: (i - 1) * 0.25,
      baselineIrradiance: irradiance,
      baselineSolarPower: solarPower,
      baselineWindSpeed: windSpeed,
      baselineWindPower: windPower,
      isMeasured: true,
      source: 'csv_upload',
    });
  }

  if (parsedData.length === 0) {
    throw new Error('No valid numeric data rows could be extracted from the CSV file.');
  }

  return parsedData;
}

/**
 * Exports current dataset to CSV format for download
 */
export function exportDatasetToCSV(data, filename = 'hybrid_hydrogen_simulation_data.csv') {
  const headers = [
    'Timestamp',
    'Time',
    'Solar_PV_Power_kW',
    'Wind_Turbine_Power_kW',
    'Combined_Renewable_Power_kW',
    'Electrolyzer_Power_kW',
    'H2_Production_Rate_kg_h',
    'Cumulative_H2_kg',
    'Solar_Irradiance_W_m2',
    'Wind_Speed_m_s',
    'Data_Source'
  ];

  const rows = data.map((d) => [
    d.dateTime || d.time,
    d.time,
    d.solarPower,
    d.windPower,
    d.combinedPower,
    d.electrolyzerPower,
    d.h2Rate,
    d.cumulativeH2,
    d.irradiance,
    d.windSpeed,
    d.dataSource
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
