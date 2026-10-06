# Hybrid Renewable Energy Generation and Green Hydrogen Production System
## Electrical Engineering Academic Capstone Dashboard & SCADA Simulation Environment

A modern, real-time, interactive engineering web dashboard demonstrating the integration of **Solar Photovoltaic (PV) modules**, a **Wind Turbine Generator**, and a **Proton Exchange Membrane (PEM) Electrolyzer** to generate clean green hydrogen fuel for zero-emission **Marine Ship Electric Propulsion**.

---

## 🌟 Key Features & Systems Modeled

### 1. Dashboard Header & Live Telemetry
- **Header Title**: Hybrid Renewable Energy and Green Hydrogen System
- **Subtitle**: Solar PV + Wind Turbine + Electrolyzer + Marine H₂ Storage
- **Live Clock**: Real-time updating UTC timestamp and clock.
- **Weather Status & Interactive Toggle**: Switch between **Good Weather** (clear sky, high irradiance) and **Bad Weather** (storm, dense cloud cover, variable wind).
- **Simulation Control Panel**:
  - `Start Simulation` (Play) / `Pause Simulation` (Pause)
  - `Reset Simulation` (Zero accumulators & re-initialize historical telemetries)
  - `Simulation Speed Multipliers`: 1x, 2x, 5x, 10x
  - `Auto Diurnal Demo Mode`: Simulates a complete 24-hour cycle (morning sunrise → noon peak → storm gusts → evening night)
  - `Downstream Ship Fuel Cell Toggle`: Dispatches stored green hydrogen to power an electric ship propulsion motor.

### 2. Main Power Generation Cards (4 Prominent Nodes)
- **Solar PV System (Node 01)**:
  - Instantaneous power output in **kW**
  - Cumulative solar energy generated in **kWh**
  - Real-time PV efficiency accounting for cell temperature derating: $\eta = \eta_{\text{nom}} \times [1 + \gamma \times (T_{\text{cell}} - 25)]$
  - Live animated mini sparkline area chart
  - POA Irradiance ($G$ in $\text{W/m}^2$) and Cell Temperature ($T_{\text{cell}}$ in $^\circ\text{C}$) telemetry
- **Wind Turbine (Node 02)**:
  - Instantaneous wind power output in **kW**
  - Cumulative wind energy generated in **kWh**
  - Wind velocity ($v$ in $\text{m/s}$)
  - Live animated mini sparkline area chart
  - Full aerodynamic operational state badges: Idle ($< v_{\text{cut-in}}$), Partial Load, Pitch Regulated Rated Power, and **Safety Cut-Out Shutdown** ($> 25\text{ m/s}$)
- **Combined Hybrid Generation (Summation Node)**:
  - Total hybrid power: $P_{\text{total}} = P_{\text{solar}} + P_{\text{wind}}$ in **kW**
  - Dynamic dual-color contribution breakdown bar (Solar % vs Wind %)
  - Cumulative total renewable energy in **kWh**
  - Net power available after auxiliary balance-of-plant load: $P_{\text{avail}} = \max(0, P_{\text{total}} - P_{\text{aux}})$
- **Green Hydrogen Production (Electrolysis Node 03)**:
  - Instantaneous mass flow rate in **kg/h**, volumetric flow in **Nm³/h**, and **g/min**
  - Cumulative green hydrogen mass produced in **kg** and **grams**
  - Electrolyzer electrical power consumption in **kW**
  - PEM stack efficiency based on Lower Heating Value ($\approx 60.6\% \text{ LHV}$) and Higher Heating Value ($\approx 71.6\% \text{ HHV}$)
  - **Dynamic High-Pressure Storage Cylinder**: High-tech cylinder graphic with liquid/gas filling percentage, pressure rating (350 bar), and internal active bubble animation.

### 3. Interactive Power Generation Comparison Graph
- Multi-series line & area chart displaying:
  1. Solar PV Power Generation (Amber)
  2. Wind Turbine Power Generation (Cyan)
  3. Combined Hybrid Generation (Emerald)
  4. Electrolyzer Input Power (Purple)
- Selectable time window horizons: **Last 1 Hour**, **Last 6 Hours**, **Last 12 Hours**, and **Last 24 Hours**
- Interactive series visibility toggles to isolate or combine any telemetry feed
- Rich engineering hover tooltip displaying precise numerical readings and units.

### 4. Weather Comparison Section (Good vs Bad Weather Benchmark)
- Direct side-by-side comparison of **Scenario A (Good Weather)** vs **Scenario B (Bad Weather)**
- Grouped bar chart comparing Solar, Wind, Combined Generation, and Hydrogen output
- Dynamic transition curve demonstrating what happens to the power bus during a cold/storm front
- Quick scenario tester buttons, including **Test Cut-Out Gale (>25 m/s)** demonstrating aerodynamic rotor braking and shutdown.
- **Engineering Finding Callout**: Demonstrates that bad weather suppresses solar, but wind speed can simultaneously surge, providing renewable complementarity unless cut-out speed is exceeded.

### 5. Renewable Electricity to Hydrogen Calculation Section
- Explicit display of step-by-step mathematical substitution:
  1. $P_{\text{electrolyzer}} = \min( (P_{\text{solar}} + P_{\text{wind}}) - P_{\text{aux}} , P_{\text{rated, ely}} )$
  2. $\text{H}_2\text{ Rate (kg/h)} = P_{\text{electrolyzer}} / \text{SEC}$ (Default $\text{SEC} = 55\text{ kWh/kg}$)
  3. $M_{\text{H2}} = \int [ P_{\text{electrolyzer}} / \text{SEC} ] \, dt$
- Displays for:
  - Instantaneous rate ($\text{kg/h}$)
  - Cumulative mass ($\text{kg}$ & $\text{grams}$)
  - Daily projected estimate ($\text{kg/day}$)
  - Energy supplied to stack ($\text{kWh}$)
  - Specific energy consumption ($\text{kWh/kg}$)
  - Electrolyzer efficiency ($\% \text{ LHV}$)
- Clear theoretical estimate labeling and assumptions.

### 6. Interactive SCADA Energy Flow Topology Diagram
- Interactive schematic displaying:
  - `Solar PV Array` + `Wind Turbine`
  - `DC-DC MPPT Boost Converter` + `AC-DC Synchronous Rectifier`
  - `Common DC Busbar (750 VDC)`
  - `PEM Electrolyzer` + `Auxiliary BOP Load` + `Grid Export / Dump Resistor`
  - `Hydrogen Compressor & 350-bar Storage Cylinder`
  - `Marine PEM Fuel Cell System` powering electric ship propulsion
  - Real-time animated SVG power conduit flows.

### 7. Interactive Parameter Control Panel
- Sliders and numeric adjustments for:
  - **Solar**: Installed Capacity (kW), Irradiance ($G$), Efficiency (%), Cell Temp ($T_{\text{cell}}$)
  - **Wind**: Rated Capacity (kW), Wind Speed ($v$), Cut-in speed, Rated speed, Cut-out speed
  - **Electrolyzer**: Rated Power (kW), Specific Consumption (SEC), Tank Capacity (kg), Initial Fill (%)
  - **Weather Presets**: Customizing good weather and bad weather baseline parameters
  - **Surplus Strategy**: Grid Export vs Curtailment / Dump Resistor.

### 8. Engineering Model Information Modal
- Collapsible modal explaining all mathematical equations, thermodynamic values (LHV $33.33\text{ kWh/kg}$, HHV $39.40\text{ kWh/kg}$), Faraday's law, and academic citations (IEC 61400-12, IEC 61724).

---

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design System with dark glassmorphism
- **Charts & Visualization**: Recharts (Area, Bar, Line, Pie, and Sparkline components)
- **Icons**: Lucide React
- **Typography**: Outfit, Plus Jakarta Sans, and JetBrains Mono

---

## 🚀 How to Run Locally

1. **Install dependencies** (if starting fresh):
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

3. **Build production bundle**:
   ```bash
   npm run build
   ```
