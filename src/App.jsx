import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import SimulationTimePanel from './components/SimulationTimePanel';
import WeatherControlPanel from './components/WeatherControlPanel';
import MainPowerCards from './components/MainPowerCards';
import PowerComparisonChart from './components/PowerComparisonChart';
import WeatherComparisonSection from './components/WeatherComparisonSection';
import HydrogenCalculations from './components/HydrogenCalculations';
import ControlPanel from './components/ControlPanel';
import EnergyFlowDiagram from './components/EnergyFlowDiagram';
import KPICardsRow from './components/KPICardsRow';
import ProductionBreakdownCharts from './components/ProductionBreakdownCharts';
import ModelInfoModal from './components/ModelInfoModal';

import { 
  DEFAULT_CONFIG, 
  WEATHER_PRESETS, 
  PHYSICAL_CONSTANTS,
  COMBINED_WEATHER_SCENARIOS,
} from './utils/constants';

import { calculateFuelCell } from './utils/simulationEngine';

import {
  generateBaselineDataset,
  computeWeatherAdjustedData,
  parseCSVDataset,
  exportDatasetToCSV,
} from './utils/datasetManager';

export default function App() {
  // ================= 1. SIMULATION TIME STATE =================
  const [simDate, setSimDate] = useState('2026-09-30');
  const [simStartTime, setSimStartTime] = useState('00:00');
  const [simEndTime, setSimEndTime] = useState('23:59');
  const [timeStepMinutes, setTimeStepMinutes] = useState(15); // 1, 5, 15, 30, 60
  const [simSpeed, setSimSpeed] = useState(1); // 1x, 2x, 5x, 10x, 30x
  const [simStatus, setSimStatus] = useState('playing'); // 'playing' | 'paused' | 'stopped'
  const [timelineIndex, setTimelineIndex] = useState(48); // Start at noon (~12:00) by default
  const [demoMode, setDemoMode] = useState(false);

  // Dedicated Simulation Clock Pause State (Independent of Dashboard simStatus)
  const [isClockPaused, setIsClockPaused] = useState(false);
  const [clockPauseSnapshot, setClockPauseSnapshot] = useState(null);

  // ================= 2. WEATHER & TURBINE CONTROL STATE =================
  const [weatherSettings, setWeatherSettings] = useState({
    scenario: 'good', // 'good' | 'moderate' | 'bad' | 'custom'
    solarPreset: 'clearSky',
    solarIrradiance: 950, // W/m²
    cloudCover: 8, // %
    solarCellTemp: 28, // °C
    solarGenAdjustment: 100, // %
    windPreset: 'moderate',
    windSpeed: 8.8, // m/s
    windDirection: 225, // degrees SW
    windSpeedOverride: 8.8,
    isCustom: false,
  });

  const [turbineSettings, setTurbineSettings] = useState({
    windRatedPower: 120, // kW
    windCutInSpeed: 3.0, // m/s
    windRatedSpeed: 11.5, // m/s
    windCutOutSpeed: 25.0, // m/s
  });

  const [solarSettings, setSolarSettings] = useState({
    solarRatedPower: 100, // kW
    solarNominalEfficiency: 21.5, // %
    solarTempCoeff: -0.004, // per °C
  });

  const [electrolyzerSettings, setElectrolyzerSettings] = useState({
    electrolyzerRatedPower: 180, // kW
    electrolyzerMinLoadPct: 15, // %
    specificEnergyConsumption: 55, // kWh/kg H2 (Default 55 kWh/kg)
    auxiliaryLoad: 5, // kW BOP
    h2TankCapacity: 100, // kg
    initialTankFillPct: 28, // %
    tankDesignPressure: 350, // bar
  });

  // Downstream Marine Ship Fuel Cell
  const [fuelCellActive, setFuelCellActive] = useState(false);
  const [isModelInfoOpen, setIsModelInfoOpen] = useState(false);
  const [isControlDrawerOpen, setIsControlDrawerOpen] = useState(false);

  // ================= 3. BASELINE DATASET & CSV INTEGRATION =================
  const [customCsvData, setCustomCsvData] = useState(null);
  const [csvFileName, setCsvFileName] = useState(null);

  // Purely derived baseline dataset (avoids cascading set-state-in-effect)
  const baselineData = useMemo(() => {
    if (customCsvData && customCsvData.length > 0) {
      return customCsvData;
    }
    return generateBaselineDataset({
      date: simDate,
      startTime: simStartTime,
      endTime: simEndTime,
      timeStepMinutes,
      solarRatedPower: solarSettings.solarRatedPower,
      windRatedPower: turbineSettings.windRatedPower,
    });
  }, [customCsvData, simDate, simStartTime, simEndTime, timeStepMinutes, solarSettings.solarRatedPower, turbineSettings.windRatedPower]);

  // ================= 4. REACTIVE WEATHER-ADJUSTED DATASET =================
  // Evaluates weather model on baseline data without mutating baseline
  const activeDataset = useMemo(() => {
    return computeWeatherAdjustedData(
      baselineData,
      weatherSettings,
      turbineSettings,
      solarSettings,
      electrolyzerSettings,
      timelineIndex,
      clockPauseSnapshot
    );
  }, [baselineData, weatherSettings, turbineSettings, solarSettings, electrolyzerSettings, timelineIndex, clockPauseSnapshot]);

  // Ensure timelineIndex is within bounds
  const safeIndex = Math.min(Math.max(0, timelineIndex), Math.max(0, activeDataset.length - 1));
  const currentPoint = activeDataset[safeIndex] || activeDataset[0];

  // Independent Virtual Simulation Clock Date
  const currentSimDate = useMemo(() => {
    const timeStr = currentPoint?.time || '12:00';
    const [h, m] = timeStr.split(':').map(Number);
    const [y, mon, d] = simDate.split('-').map(Number);
    return new Date(y, mon - 1, d, h || 0, m || 0, 0, 0);
  }, [simDate, currentPoint]);

  // Timeline progress percentage (0 - 100%)
  const timelineProgress = activeDataset.length > 1
    ? (safeIndex / (activeDataset.length - 1)) * 100
    : 0;

  // ================= 5. INSTANTANEOUS SYSTEM TELEMETRY =================
  const solarState = {
    power: currentPoint?.solarPower ?? 0,
    efficiency: Number((solarSettings.solarNominalEfficiency * (1 + solarSettings.solarTempCoeff * (weatherSettings.solarCellTemp - 25))).toFixed(1)),
    status: currentPoint?.solarPower > solarSettings.solarRatedPower * 0.95 
      ? 'Peak Solar Rating' 
      : currentPoint?.solarPower > 0 
      ? 'Normal Operation' 
      : 'Night / Dark',
    tempDeratePct: Number((Math.max(0, -solarSettings.solarTempCoeff * (weatherSettings.solarCellTemp - 25)) * 100).toFixed(1)),
  };

  const isCutOut = currentPoint ? (currentPoint.windSpeed > turbineSettings.windCutOutSpeed) : false;
  const windState = {
    power: currentPoint?.windPower ?? 0,
    windSpeed: currentPoint?.windSpeed ?? weatherSettings.windSpeed,
    status: currentPoint?.turbineStatus ?? 'Active',
    turbineState: isCutOut ? 'cut_out_shutdown' : currentPoint?.windPower > 0 ? 'running' : 'below_cutin',
    isCutOut,
  };

  const combinedState = {
    totalPower: currentPoint?.combinedPower ?? 0,
    solarShare: (currentPoint?.combinedPower ?? 0) > 0 
      ? Number(((currentPoint.solarPower / currentPoint.combinedPower) * 100).toFixed(1)) 
      : 0,
    windShare: (currentPoint?.combinedPower ?? 0) > 0 
      ? Number(((currentPoint.windPower / currentPoint.combinedPower) * 100).toFixed(1)) 
      : 0,
  };

  // Cumulative Energy & H2 Accumulators up to Current Point
  const accumulators = useMemo(() => {
    // If the clock is currently paused at pausedIndex:
    // "While the clock is paused, changing power values must update the instantaneous hydrogen production rate immediately.
    // Do not increase cumulative hydrogen production simply because I change the power settings.
    // Resume cumulative hydrogen integration only when simulation time advances."
    if (isClockPaused && clockPauseSnapshot && safeIndex === clockPauseSnapshot.pausedIndex) {
      return {
        solarEnergyKWh: clockPauseSnapshot.solarEnergyKWh,
        windEnergyKWh: clockPauseSnapshot.windEnergyKWh,
        totalEnergyKWh: clockPauseSnapshot.totalEnergyKWh,
        electrolyzerEnergyKWh: clockPauseSnapshot.electrolyzerEnergyKWh,
        totalH2ProducedKg: clockPauseSnapshot.cumulativeH2,
        elapsedSeconds: safeIndex * (timeStepMinutes * 60),
      };
    }

    // When resumed and time has advanced past the paused timestamp:
    if (clockPauseSnapshot && safeIndex > clockPauseSnapshot.pausedIndex) {
      let addSolar = 0;
      let addWind = 0;
      let addTotal = 0;
      let addEly = 0;
      let addH2 = 0;

      for (let i = clockPauseSnapshot.pausedIndex + 1; i <= safeIndex; i++) {
        const pt = activeDataset[i];
        if (!pt) continue;
        const dt = i > 0 
          ? Math.max(0, (pt.minuteOffset - activeDataset[i - 1].minuteOffset) / 60) 
          : (timeStepMinutes / 60);
        
        addSolar += pt.solarPower * dt;
        addWind += pt.windPower * dt;
        addTotal += pt.combinedPower * dt;
        addEly += pt.electrolyzerPower * dt;
        addH2 += pt.h2Rate * dt;
      }

      return {
        solarEnergyKWh: Number((clockPauseSnapshot.solarEnergyKWh + addSolar).toFixed(2)),
        windEnergyKWh: Number((clockPauseSnapshot.windEnergyKWh + addWind).toFixed(2)),
        totalEnergyKWh: Number((clockPauseSnapshot.totalEnergyKWh + addTotal).toFixed(2)),
        electrolyzerEnergyKWh: Number((clockPauseSnapshot.electrolyzerEnergyKWh + addEly).toFixed(2)),
        totalH2ProducedKg: Number((clockPauseSnapshot.cumulativeH2 + addH2).toFixed(3)),
        elapsedSeconds: safeIndex * (timeStepMinutes * 60),
      };
    }

    // Default continuous baseline accumulation
    let solarEnergyKWh = 0;
    let windEnergyKWh = 0;
    let totalEnergyKWh = 0;
    let electrolyzerEnergyKWh = 0;

    for (let i = 0; i <= safeIndex; i++) {
      const pt = activeDataset[i];
      if (!pt) continue;
      const dt = i > 0 
        ? Math.max(0, (pt.minuteOffset - activeDataset[i - 1].minuteOffset) / 60) 
        : (timeStepMinutes / 60);
      
      solarEnergyKWh += pt.solarPower * dt;
      windEnergyKWh += pt.windPower * dt;
      totalEnergyKWh += pt.combinedPower * dt;
      electrolyzerEnergyKWh += pt.electrolyzerPower * dt;
    }

    return {
      solarEnergyKWh: Number(solarEnergyKWh.toFixed(2)),
      windEnergyKWh: Number(windEnergyKWh.toFixed(2)),
      totalEnergyKWh: Number(totalEnergyKWh.toFixed(2)),
      electrolyzerEnergyKWh: Number(electrolyzerEnergyKWh.toFixed(2)),
      totalH2ProducedKg: currentPoint?.cumulativeH2 ?? 0,
      elapsedSeconds: safeIndex * (timeStepMinutes * 60),
    };
  }, [activeDataset, safeIndex, currentPoint, timeStepMinutes, isClockPaused, clockPauseSnapshot]);

  // Fuel cell operation (discharging stored H2 for marine ship propulsion)
  const currentTankMass = Math.min(
    electrolyzerSettings.h2TankCapacity,
    accumulators.totalH2ProducedKg + (electrolyzerSettings.h2TankCapacity * (electrolyzerSettings.initialTankFillPct / 100))
  );

  const fuelCellState = calculateFuelCell(
    { fuelCellActive, fuelCellRatedPower: 40, fuelCellEfficiency: 52 },
    currentTankMass
  );

  // Electrolyzer Telemetry at Current Simulation Time
  const electrolyzerPower = currentPoint?.electrolyzerPower ?? 0;
  const h2RateKgPerHr = currentPoint?.h2Rate ?? 0;
  const electrolyzerState = {
    electrolyzerPower,
    availablePower: Math.max(0, combinedState.totalPower - electrolyzerSettings.auxiliaryLoad),
    surplusPower: Math.max(0, combinedState.totalPower - electrolyzerSettings.auxiliaryLoad - electrolyzerPower),
    h2RateKgPerHr,
    h2RateNm3PerHr: Number((h2RateKgPerHr * PHYSICAL_CONSTANTS.NM3_PER_KG_H2).toFixed(2)),
    h2RateGPerMin: Number(((h2RateKgPerHr * 1000) / 60).toFixed(2)),
    dailyH2EstimateKg: Number((h2RateKgPerHr * 24).toFixed(1)),
    lhvEfficiency: Number(((PHYSICAL_CONSTANTS.H2_LHV_KWH_KG / electrolyzerSettings.specificEnergyConsumption) * 100).toFixed(1)),
    hhvEfficiency: Number(((PHYSICAL_CONSTANTS.H2_HHV_KWH_KG / electrolyzerSettings.specificEnergyConsumption) * 100).toFixed(1)),
    status: electrolyzerPower >= electrolyzerSettings.electrolyzerRatedPower * 0.98
      ? 'Operating at 100% Rated Capacity'
      : electrolyzerPower > 0
      ? `Modulating Load (${((electrolyzerPower / electrolyzerSettings.electrolyzerRatedPower) * 100).toFixed(0)}%)`
      : 'Standby / Low Renewable Power',
    isStandby: electrolyzerPower <= 0,
    isTankFull: currentTankMass >= electrolyzerSettings.h2TankCapacity,
    utilizationPct: Number(((electrolyzerPower / electrolyzerSettings.electrolyzerRatedPower) * 100).toFixed(1)),
  };

  // ================= 6. SIMULATION CLOCK ADVANCEMENT LOOP =================
  useEffect(() => {
    // Freeze advancing if dashboard is not playing OR simulation clock is independently paused
    if (simStatus !== 'playing' || isClockPaused) return;

    // Tick delay in milliseconds, inversely scaled by simSpeed
    // 1x = 1000ms, 2x = 500ms, 5x = 200ms, 10x = 100ms, 30x = 35ms
    const intervalMs = Math.max(35, Math.round(1000 / simSpeed));

    const interval = setInterval(() => {
      setTimelineIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= activeDataset.length) {
          // Loop seamlessly across simulation period
          return 0;
        }
        return nextIndex;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [simStatus, isClockPaused, simSpeed, activeDataset.length]);

  // Dedicated simulation clock pause/resume toggle (Independent of dashboard simStatus)
  const handleToggleClockPause = () => {
    setIsClockPaused((prev) => {
      const willPause = !prev;
      if (willPause) {
        // Freeze clock at current timestamp, locking cumulative values against inflation
        setClockPauseSnapshot({
          pausedIndex: safeIndex,
          pausedCumulativeH2: accumulators.totalH2ProducedKg,
          cumulativeH2: accumulators.totalH2ProducedKg,
          solarEnergyKWh: accumulators.solarEnergyKWh,
          windEnergyKWh: accumulators.windEnergyKWh,
          totalEnergyKWh: accumulators.totalEnergyKWh,
          electrolyzerEnergyKWh: accumulators.electrolyzerEnergyKWh,
        });
      }
      return willPause;
    });
  };

  // Transport handlers
  const handlePlay = () => setSimStatus('playing');
  const handlePause = () => setSimStatus('paused');
  const handleResume = () => setSimStatus('playing');
  
  const handleReset = () => {
    setTimelineIndex(0);
    setSimStatus('paused');
    setIsClockPaused(false);
    setClockPauseSnapshot(null);
  };

  // Timeline slider scrubber handler
  const handleTimelineChange = (percent) => {
    if (activeDataset.length === 0) return;
    const targetIdx = Math.min(
      activeDataset.length - 1,
      Math.max(0, Math.round((percent / 100) * (activeDataset.length - 1)))
    );
    setTimelineIndex(targetIdx);
    if (isClockPaused) {
      setClockPauseSnapshot({
        pausedIndex: targetIdx,
        pausedCumulativeH2: activeDataset[targetIdx]?.cumulativeH2 ?? 0,
        cumulativeH2: activeDataset[targetIdx]?.cumulativeH2 ?? 0,
        solarEnergyKWh: 0,
        windEnergyKWh: 0,
        totalEnergyKWh: 0,
        electrolyzerEnergyKWh: 0,
      });
    }
  };

  // Jump to specific Date & Time
  const handleJumpToDateTime = (targetDate, targetTime) => {
    setSimDate(targetDate);
    const targetMinutes = targetTime.split(':').reduce((acc, v, i) => acc + Number(v) * (i === 0 ? 60 : 1), 0);
    
    // Find closest point in dataset
    let closestIdx = 0;
    let minDiff = Infinity;
    activeDataset.forEach((pt, idx) => {
      const ptMinutes = pt.time.split(':').reduce((acc, v, i) => acc + Number(v) * (i === 0 ? 60 : 1), 0);
      const diff = Math.abs(ptMinutes - targetMinutes);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });
    setTimelineIndex(closestIdx);
  };

  // CSV Upload handler
  const handleUploadCsv = (csvText, fileName) => {
    const parsed = parseCSVDataset(csvText, solarSettings.solarRatedPower, turbineSettings.windRatedPower);
    setCustomCsvData(parsed);
    setCsvFileName(fileName);
    setTimelineIndex(0);
  };

  // Export CSV handler
  const handleExportCsv = () => {
    exportDatasetToCSV(activeDataset, `hydrogen_simulation_${simDate}.csv`);
  };

  // Revert back to default physics baseline
  const handleResetBaseline = () => {
    setCustomCsvData(null);
    setCsvFileName(null);
    setTimelineIndex(0);
  };

  // Restore Default Settings
  const handleRestoreDefaults = () => {
    setWeatherSettings({
      scenario: 'good',
      solarPreset: 'clearSky',
      solarIrradiance: 950,
      cloudCover: 8,
      solarCellTemp: 28,
      solarGenAdjustment: 100,
      windPreset: 'moderate',
      windSpeed: 8.8,
      windDirection: 225,
      windSpeedOverride: 8.8,
      isCustom: false,
    });
    setTurbineSettings({
      windRatedPower: 120,
      windCutInSpeed: 3.0,
      windRatedSpeed: 11.5,
      windCutOutSpeed: 25.0,
    });
    setSolarSettings({
      solarRatedPower: 100,
      solarNominalEfficiency: 21.5,
      solarTempCoeff: -0.004,
    });
    setElectrolyzerSettings({
      electrolyzerRatedPower: 180,
      electrolyzerMinLoadPct: 15,
      specificEnergyConsumption: 55,
      auxiliaryLoad: 5,
      h2TankCapacity: 100,
      initialTankFillPct: 28,
      tankDesignPressure: 350,
    });
    setSimSpeed(1);
    setTimeStepMinutes(15);
  };

  // Toggle combined weather preset from Header or Weather Comparison
  const handleToggleWeatherMode = (newMode) => {
    const scenarioKey = newMode === 'bad' ? 'bad' : 'good';
    const preset = COMBINED_WEATHER_SCENARIOS[scenarioKey];
    setWeatherSettings((prev) => ({
      ...prev,
      scenario: scenarioKey,
      isCustom: false,
      solarIrradiance: preset.solarIrradiance,
      cloudCover: preset.cloudCover,
      solarCellTemp: preset.solarCellTemp,
      solarGenAdjustment: preset.solarGenAdjustment,
      windSpeed: preset.windSpeed,
      windDirection: preset.windDirection,
      windSpeedOverride: preset.windSpeed,
      solarPreset: scenarioKey === 'good' ? 'clearSky' : 'overcast',
      windPreset: scenarioKey === 'good' ? 'moderate' : 'strong',
    }));
  };

  // Helper config object for child components that expect unified config
  const unifiedConfig = {
    ...DEFAULT_CONFIG,
    ...solarSettings,
    ...turbineSettings,
    ...electrolyzerSettings,
    solarIrradiance: weatherSettings.solarIrradiance,
    solarCellTemp: weatherSettings.solarCellTemp,
    cloudCover: weatherSettings.cloudCover,
    solarGenAdjustment: weatherSettings.solarGenAdjustment,
    windSpeed: weatherSettings.windSpeed,
    windDirection: weatherSettings.windDirection,
    fuelCellActive,
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 1. Dashboard Header */}
      <Header
        weatherMode={weatherSettings.scenario === 'bad' ? 'bad' : 'good'}
        setWeatherMode={handleToggleWeatherMode}
        isRunning={simStatus === 'playing'}
        setIsRunning={(running) => setSimStatus(running ? 'playing' : 'paused')}
        onReset={handleReset}
        simSpeed={simSpeed}
        setSimSpeed={setSimSpeed}
        demoMode={demoMode}
        setDemoMode={setDemoMode}
        onOpenModelInfo={() => setIsModelInfoOpen(true)}
        onToggleControlDrawer={() => setIsControlDrawerOpen(!isControlDrawerOpen)}
        fuelCellActive={fuelCellActive}
        setFuelCellActive={setFuelCellActive}
      />

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        
        {/* ================= SECTION A: SIMULATION TIME CONTROL (Requirement 1) ================= */}
        <SimulationTimePanel
          simDate={simDate}
          setSimDate={setSimDate}
          simStartTime={simStartTime}
          setSimStartTime={setSimStartTime}
          simEndTime={simEndTime}
          setSimEndTime={setSimEndTime}
          timeStepMinutes={timeStepMinutes}
          setTimeStepMinutes={setTimeStepMinutes}
          simSpeed={simSpeed}
          setSimSpeed={setSimSpeed}
          simStatus={simStatus}
          onPlay={handlePlay}
          onPause={handlePause}
          onResume={handleResume}
          onReset={handleReset}
          currentSimDate={currentSimDate}
          timelineProgress={timelineProgress}
          onTimelineChange={handleTimelineChange}
          datasetInfo={{
            totalPoints: activeDataset.length,
            isCsv: Boolean(customCsvData),
            fileName: csvFileName,
            timeStep: timeStepMinutes,
          }}
          onUploadCsv={handleUploadCsv}
          onExportCsv={handleExportCsv}
          onResetBaseline={handleResetBaseline}
          onJumpToDateTime={handleJumpToDateTime}
          isClockPaused={isClockPaused}
          onToggleClockPause={handleToggleClockPause}
        />

        {/* ================= SECTION B: WEATHER CONTROL SYSTEM (Requirements 2, 3, 4) ================= */}
        <WeatherControlPanel
          weatherSettings={weatherSettings}
          onUpdateWeather={(newSettings) => setWeatherSettings((prev) => ({ ...prev, ...newSettings }))}
          turbineSettings={turbineSettings}
          onUpdateTurbine={(newSettings) => setTurbineSettings((prev) => ({ ...prev, ...newSettings }))}
          solarSettings={solarSettings}
          onUpdateSolar={(newSettings) => setSolarSettings((prev) => ({ ...prev, ...newSettings }))}
          onRestoreDefaults={handleRestoreDefaults}
          currentTelemetry={{
            solarPower: solarState.power,
            windPower: windState.power,
            combinedPower: combinedState.totalPower,
            h2Rate: electrolyzerState.h2RateKgPerHr,
            turbineStatus: windState.status,
            dataSource: currentPoint?.dataSource || 'modelled',
          }}
        />

        {/* KPI Summary Cards */}
        <KPICardsRow
          accumulators={accumulators}
          electrolyzerState={electrolyzerState}
          combinedState={combinedState}
          config={unifiedConfig}
        />

        {/* 2. Main 4 Power Generation Cards */}
        <MainPowerCards
          solarState={solarState}
          windState={windState}
          combinedState={combinedState}
          electrolyzerState={electrolyzerState}
          accumulators={accumulators}
          history={activeDataset}
          config={unifiedConfig}
          weatherMode={weatherSettings.scenario}
          dataSource={currentPoint?.dataSource || 'weather_adjusted'}
        />

        {/* Interactive Energy Flow SCADA Diagram */}
        <EnergyFlowDiagram
          solarState={solarState}
          windState={windState}
          combinedState={combinedState}
          electrolyzerState={electrolyzerState}
          fuelCellState={fuelCellState}
          config={unifiedConfig}
          isRunning={simStatus === 'playing'}
        />

        {/* 3. Power Generation Comparison Graph (Requirement 5) */}
        <PowerComparisonChart 
          history={activeDataset} 
          currentSimTimeLabel={currentPoint?.time || '12:00'}
          currentTimePoint={currentPoint}
        />

        {/* 4. Good Weather vs Bad Weather Dedicated Comparison */}
        <WeatherComparisonSection
          config={unifiedConfig}
          activeWeatherMode={weatherSettings.scenario}
          setWeatherMode={handleToggleWeatherMode}
        />

        {/* Production Breakdown Donut & H2 Flow Rate Graph */}
        <ProductionBreakdownCharts
          solarPower={solarState.power}
          windPower={windState.power}
          history={activeDataset}
          electrolyzerState={electrolyzerState}
          currentSimTimeLabel={currentPoint?.time || '12:00'}
        />

        {/* 5. Renewable Electricity to Hydrogen Calculation Section (Requirement 6) */}
        <HydrogenCalculations
          electrolyzerState={electrolyzerState}
          accumulators={accumulators}
          config={unifiedConfig}
          onUpdateConfig={(updates) => {
            if (updates.specificEnergyConsumption !== undefined) {
              setElectrolyzerSettings((prev) => ({
                ...prev,
                specificEnergyConsumption: updates.specificEnergyConsumption,
              }));
            }
          }}
        />

        {/* 6. Interactive System Parameters (Control Panel Drawer) */}
        <ControlPanel
          config={unifiedConfig}
          onUpdateConfig={(newConfig) => {
            if (newConfig.solarRatedPower) setSolarSettings((p) => ({ ...p, solarRatedPower: newConfig.solarRatedPower }));
            if (newConfig.windRatedPower) setTurbineSettings((p) => ({ ...p, windRatedPower: newConfig.windRatedPower }));
            if (newConfig.specificEnergyConsumption) setElectrolyzerSettings((p) => ({ ...p, specificEnergyConsumption: newConfig.specificEnergyConsumption }));
            if (newConfig.electrolyzerRatedPower) setElectrolyzerSettings((p) => ({ ...p, electrolyzerRatedPower: newConfig.electrolyzerRatedPower }));
            if (newConfig.solarIrradiance) setWeatherSettings((p) => ({ ...p, solarIrradiance: newConfig.solarIrradiance, scenario: 'custom', isCustom: true }));
            if (newConfig.windSpeed) setWeatherSettings((p) => ({ ...p, windSpeed: newConfig.windSpeed, windSpeedOverride: newConfig.windSpeed, scenario: 'custom', isCustom: true }));
          }}
          onResetDefaults={handleRestoreDefaults}
          weatherPresets={WEATHER_PRESETS}
          onUpdateWeatherPresets={() => {}}
        />

      </main>

      {/* Footer */}
      <footer className="w-full glass-panel border-t border-slate-800/80 px-4 lg:px-8 py-4 text-xs font-mono text-slate-500">
        <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Hybrid Renewable Energy and Green Hydrogen Production System</span>
          </div>
          <div>
            Electrical Engineering Academic Capstone Project • SCADA Simulation Environment
          </div>
        </div>
      </footer>

      {/* Model Information & Theory Modal */}
      <ModelInfoModal
        isOpen={isModelInfoOpen}
        onClose={() => setIsModelInfoOpen(false)}
      />

    </div>
  );
}
