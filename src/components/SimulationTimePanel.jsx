import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Calendar, 
  FastForward, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Layers,
  ChevronRight,
  ArrowRight,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { SIMULATION_SPEEDS, TIME_STEP_OPTIONS } from '../utils/constants';

export default function SimulationTimePanel({
  simDate,
  setSimDate,
  simStartTime,
  setSimStartTime,
  simEndTime,
  setSimEndTime,
  timeStepMinutes,
  setTimeStepMinutes,
  simSpeed,
  setSimSpeed,
  simStatus,
  onPlay,
  onPause,
  onResume,
  onReset,
  currentSimDate,
  timelineProgress,
  onTimelineChange,
  datasetInfo,
  onUploadCsv,
  onExportCsv,
  onResetBaseline,
  onJumpToDateTime,
  isClockPaused = false,
  onToggleClockPause,
}) {
  const [jumpDate, setJumpDate] = useState(simDate);
  const [jumpTime, setJumpTime] = useState(simStartTime);
  const [showJumpModal, setShowJumpModal] = useState(false);
  const [fileError, setFileError] = useState(null);

  // Format current simulation time
  const simTimeString = currentSimDate ? currentSimDate.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }) : '00:00:00';

  const simDateString = currentSimDate ? currentSimDate.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }) : simDate;

  // Handle CSV file upload
  const handleFileChange = (e) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text === 'string') {
          onUploadCsv(text, file.name);
        }
      } catch (err) {
        setFileError(err.message || 'Failed to parse CSV file');
      }
    };
    reader.onerror = () => setFileError('Error reading uploaded CSV file');
    reader.readAsText(file);
    // Reset file input so re-uploading same file triggers event
    e.target.value = '';
  };

  const handleQuickDuration = (hours) => {
    const [startH, startM] = simStartTime.split(':').map(Number);
    let endTotalM = (startH + hours) * 60 + startM;
    if (endTotalM >= 24 * 60) {
      endTotalM = 23 * 60 + 59;
    }
    const endH = Math.floor(endTotalM / 60);
    const endM = endTotalM % 60;
    setSimEndTime(`${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`);
  };

  const handleJumpSubmit = (e) => {
    e.preventDefault();
    onJumpToDateTime(jumpDate, jumpTime);
    setShowJumpModal(false);
  };

  return (
    <section className="glass-panel glass-panel-glow rounded-2xl p-5 lg:p-6 border border-cyan-500/30 shadow-2xl relative overflow-hidden transition-all">
      {/* Decorative ambient gradient backdrop */}
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-32 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header Banner & Status Badges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-600/30 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Clock className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                simStatus === 'playing' ? 'bg-emerald-400' : simStatus === 'paused' ? 'bg-amber-400' : 'bg-slate-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                simStatus === 'playing' ? 'bg-emerald-500' : simStatus === 'paused' ? 'bg-amber-500' : 'bg-slate-500'
              }`} />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base lg:text-lg font-bold text-white font-heading tracking-tight">
                Simulation Time & Virtual Clock Control
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                INDEPENDENT SCADA ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Precise chronological synchronization of renewable generation curves, bus telemetry, and electrolyzer accumulation
            </p>
          </div>
        </div>

        {/* Status Pills and Dataset Source */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Virtual Clock Status */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold ${
            isClockPaused
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
              : simStatus === 'playing'
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
              : simStatus === 'paused'
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              isClockPaused
                ? 'bg-amber-400 animate-pulse'
                : simStatus === 'playing'
                ? 'bg-emerald-400 animate-ping'
                : simStatus === 'paused'
                ? 'bg-amber-400'
                : 'bg-slate-500'
            }`} />
            <span className="uppercase">{isClockPaused ? 'CLOCK PAUSED' : `State: ${simStatus}`}</span>
            <span className="text-slate-500">({simSpeed}x Speed)</span>
          </div>

          {/* Dataset Status Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300">
            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dataset:</span>
            <span className={`font-semibold ${datasetInfo.isCsv ? 'text-emerald-400' : 'text-cyan-300'}`}>
              {datasetInfo.isCsv ? `CSV: ${datasetInfo.fileName || 'Custom File'}` : 'Physics Baseline'}
            </span>
            <span className="text-[10px] text-slate-500">({datasetInfo.totalPoints} pts)</span>
          </div>
        </div>
      </div>

      {/* 2. Main Row: Digital Simulation Clock + Date/Time Window Selectors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 my-5 items-stretch relative z-10">
        
        {/* Left: Prominent Digital Simulation Clock Display */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-[#070e1c] border border-cyan-500/30 flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800/80">
            <span className="flex items-center gap-1.5 uppercase font-mono font-bold tracking-wider text-cyan-400 text-[11px]">
              <Calendar className="w-3.5 h-3.5" /> Virtual Simulation Clock
            </span>
            {isClockPaused ? (
              <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 border border-amber-500/50 px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                CLOCK PAUSED
              </span>
            ) : (
              <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                Independent of PC Clock
              </span>
            )}
          </div>

          <div className="my-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono-num text-white tracking-tight drop-shadow-[0_2px_10px_rgba(6,182,212,0.3)]">
                {simTimeString}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-cyan-300 font-mono mt-1">
                {simDateString}
              </div>
            </div>

            <div className="sm:text-right space-y-1">
              <div className="text-[11px] text-slate-400 font-mono">
                Progress: <span className="font-bold text-white font-mono-num">{timelineProgress.toFixed(1)}%</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Step Resolution: <span className="text-cyan-400 font-semibold">{timeStepMinutes} min</span>
              </div>
              <button
                onClick={() => setShowJumpModal(!showJumpModal)}
                className="text-[11px] text-cyan-400 hover:text-cyan-200 underline font-mono flex items-center gap-1 sm:justify-end"
              >
                <span>Jump to specific time</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Jump to specific Date & Time inline collapsible */}
          {showJumpModal && (
            <form onSubmit={handleJumpSubmit} className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">Target:</span>
              <input
                type="date"
                value={jumpDate}
                onChange={(e) => setJumpDate(e.target.value)}
                className="px-2 py-1 rounded bg-slate-800 text-white border border-slate-700 text-xs"
              />
              <input
                type="time"
                value={jumpTime}
                onChange={(e) => setJumpTime(e.target.value)}
                className="px-2 py-1 rounded bg-slate-800 text-white border border-slate-700 text-xs"
              />
              <button
                type="submit"
                className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
              >
                Go
              </button>
              <button
                type="button"
                onClick={() => setShowJumpModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
            </form>
          )}

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/80">
            <span>Range: {simStartTime} — {simEndTime}</span>
            <span>Tick Speed: {simSpeed}x</span>
          </div>
        </div>

        {/* Right: Simulation Configuration Inputs */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          
          {/* Input 1: Simulation Date Selector */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <label className="text-[11px] uppercase font-mono font-bold text-slate-400 block mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulation Date</span>
            </label>
            <input
              type="date"
              value={simDate}
              onChange={(e) => setSimDate(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 transition-all shadow-inner"
            />
            <span className="text-[10px] text-slate-500 font-mono mt-1 block">
              Reference solar calendar
            </span>
          </div>

          {/* Input 2: Start & End Time Selectors */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <label className="text-[11px] uppercase font-mono font-bold text-slate-400 block mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Time Window</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">Start</span>
                <input
                  type="time"
                  value={simStartTime}
                  onChange={(e) => setSimStartTime(e.target.value)}
                  className="w-full px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">End</span>
                <input
                  type="time"
                  value={simEndTime}
                  onChange={(e) => setSimEndTime(e.target.value)}
                  className="w-full px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 font-mono">
              <span>Quick:</span>
              <button onClick={() => handleQuickDuration(6)} className="hover:text-cyan-300">6h</button> •
              <button onClick={() => handleQuickDuration(12)} className="hover:text-cyan-300">12h</button> •
              <button onClick={() => handleQuickDuration(24)} className="hover:text-cyan-300">24h</button>
            </div>
          </div>

          {/* Input 3: Time-Step Selection */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <label className="text-[11px] uppercase font-mono font-bold text-slate-400 block mb-1 flex items-center gap-1.5">
              <FastForward className="w-3.5 h-3.5 text-cyan-400" />
              <span>Time-Step (Δt)</span>
            </label>
            <select
              value={timeStepMinutes}
              onChange={(e) => setTimeStepMinutes(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 shadow-inner"
            >
              {TIME_STEP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-500 font-mono mt-1 block">
              1 min, 5 min, 15 min, 30 min, 1h
            </span>
          </div>

        </div>
      </div>

      {/* 3. Transport Controls Row: Play, Pause, Resume, Reset + Speed Multipliers */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-4 rounded-xl bg-slate-900/80 border border-slate-800 relative z-10">
        
        {/* Playback Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {simStatus !== 'playing' ? (
            <button
              onClick={simStatus === 'paused' ? onResume : onPlay}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.35)] active:scale-95"
              title="Start / Resume virtual simulation clock"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{simStatus === 'paused' ? 'Resume' : 'Play'}</span>
            </button>
          ) : (
            <button
              onClick={onPause}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all shadow-[0_0_15px_rgba(245,158,11,0.35)] active:scale-95"
              title="Pause simulation clock"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </button>
          )}

          {simStatus === 'paused' && (
            <button
              onClick={onResume}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all"
              title="Resume simulation from current time"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Resume</span>
            </button>
          )}

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-mono bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:border-slate-500 hover:bg-slate-700 transition-all active:scale-95"
            title="Reset simulation clock to start time and zero cumulative values"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          {/* Separator between general transport controls and dedicated clock control */}
          <div className="h-6 w-px bg-slate-700/80 mx-1 hidden sm:block" />

          {/* Dedicated Independent Simulation Clock Pause/Resume Button */}
          <button
            onClick={onToggleClockPause}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all active:scale-95 ${
              isClockPaused
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : 'bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/25 shadow-sm'
            }`}
            title={isClockPaused ? 'Resume simulation clock advancement' : 'Freeze simulation clock at current timestamp'}
          >
            {isClockPaused ? (
              <>
                <Play className="w-4 h-4 fill-current text-cyan-400" />
                <span>Resume Clock</span>
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 fill-current text-amber-400" />
                <span>Pause Clock</span>
              </>
            )}
          </button>

          {/* CLOCK PAUSED Status Indicator */}
          {isClockPaused && (
            <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.25)] animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              CLOCK PAUSED
            </span>
          )}
        </div>

        {/* Speed Selector Buttons: 1x, 2x, 5x, 10x, 30x */}
        <div className="flex items-center gap-1.5 rounded-xl bg-slate-950 p-1 border border-slate-800">
          <span className="text-[11px] font-mono uppercase text-slate-400 px-2 font-bold flex items-center gap-1">
            <FastForward className="w-3 h-3 text-cyan-400" /> Speed:
          </span>
          {SIMULATION_SPEEDS.map((spd) => (
            <button
              key={spd}
              onClick={() => setSimSpeed(spd)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                simSpeed === spd
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* CSV Upload / Export Actions */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 hover:border-cyan-500/50 hover:text-cyan-300 cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Load CSV</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 hover:border-emerald-500/50 hover:text-emerald-300 transition-all"
            title="Export full simulated generation dataset to CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          {datasetInfo.isCsv && (
            <button
              onClick={onResetBaseline}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
              title="Revert back to default physics baseline"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {fileError && (
        <div className="mt-2.5 p-2 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{fileError}</span>
        </div>
      )}

      {/* 4. Interactive Timeline Scrubber Slider */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 relative z-10">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
          <span className="flex items-center gap-1 text-cyan-300 font-semibold">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Simulation Timeline Scrubber:</span>
            <span className="text-white font-mono-num font-bold ml-1">{simTimeString}</span>
          </span>
          <span className="text-slate-500">
            Drag slider forward or backward to inspect any point in time
          </span>
        </div>

        {/* Range Slider Track */}
        <div className="relative py-1">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={timelineProgress}
            onChange={(e) => onTimelineChange(Number(e.target.value))}
            className="w-full h-3 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none border border-slate-700/80 shadow-inner"
          />
        </div>

        {/* Timeline Axis Markers */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
          <span>{simStartTime} (Start)</span>
          <span className="hidden sm:inline">06:00 (Sunrise)</span>
          <span className="text-cyan-400 font-bold">12:00 (Solar Peak)</span>
          <span className="hidden sm:inline">18:00 (Sunset)</span>
          <span>{simEndTime} (End)</span>
        </div>
      </div>

    </section>
  );
}
