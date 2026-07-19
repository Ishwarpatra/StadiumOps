# StadiumOps Pro — AI-Powered Smart Stadium Operations

A real-time intelligent stadium operations platform powered by **Google Gemini AI**, enabling dynamic crowd management, revenue optimization, and predictive incident response for large-scale venues.

---

## 🎯 Chosen Vertical: Smart Stadium Operations & Revenue Optimization

StadiumOps Pro addresses critical operational inefficiencies in large sports and entertainment venues:

**Key Pain Points Addressed:**
- **Concession Queue Chaos:** Real-time queue monitoring prevents revenue loss from long wait times and abandonment
- **Unpredictable Crowd Bottlenecks:** AI-driven hotspot detection predicts congestion before it impacts operations
- **Manual Staffing Allocation:** Dynamic staff deployment based on demand forecasting and live incidents
- **Lost Revenue Visibility:** Comprehensive dashboard tracks concessions, ticketing, and merchandise revenue in real-time
- **Reactive Incident Response:** Shift from reactive to predictive operations with AI-driven recommendations

---

## 🤖 Approach & AI Integration Logic

### How Gemini AI Powers the System

1. **Predictive Crowd Analytics**
   - Analyzes historical queue patterns and real-time sensor data
   - Predicts bottleneck formation 10-15 minutes in advance
   - Recommends preemptive staff redeployment before congestion peaks

2. **Dynamic Pricing & Revenue Optimization**
   - Gemini evaluates concession demand, queue length, and historical sales velocity
   - Recommends optimal pricing adjustments for surge periods (e.g., halftime, post-game)
   - Estimates revenue impact of staffing and pricing decisions

3. **Intelligent Incident Routing**
   - Classifies incoming incidents (medical, security, maintenance) by severity and location
   - Routes to nearest available staff and predicts resolution time
   - Suggests concurrent preventive actions (e.g., reroute foot traffic if one gate goes down)

4. **Operational Diagnostics**
   - Monitors system health: API latency, database consistency, real-time sync
   - Identifies anomalies (e.g., POS terminals offline, sensor data stale)
   - Suggests remediation steps based on venue infrastructure

### Data Inputs to Gemini
- Real-time simulation state: attendance, revenue, active staff, queue times
- Historical hotspot and bottleneck patterns
- Incident logs and resolution times
- Venue-specific configuration (capacity, staffing models, thresholds)

### Outputs & Actions
- AI-driven recommendations displayed in **AI Actions Panel** on Dashboard
- Automated alerts when thresholds are breached
- Suggested staff deployment routes and priorities
- Predictive metrics (estimated queue clear times, revenue forecasts)

---

## 🏗️ How It Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│           React Frontend (Vite + Tailwind)              │
│  ┌──────────┬────────────┬────────────┬──────────────┐  │
│  │Dashboard │ Revenue    │ Staffing   │ Settings     │  │
│  │          │ Concession │ Map        │              │  │
│  └──────────┴────────────┴────────────┴──────────────┘  │
│                                                          │
│  Local State: Simulation, Hotspots, Bottlenecks        │
│  Persistence: localStorage + Backend Sync               │
└─────────────────────────────────────────────────────────┘
         │                          │
         │ (5s polling)            │ (WebSocket / REST)
         ▼                          ▼
┌──────────────────────────────────────────────────┐
│      Backend API (Express.js on Node.js)         │
│  ├─ /api/simulation – Simulation state           │
│  ├─ /api/incidents – Real-time incidents        │
│  ├─ /api/config – Venue configuration            │
│  └─ /api/audit-logs – Operational audit trail   │
└──────────────────────────────────────────────────┘
         │
         ├─ Google Gemini AI API
         │  └─ Generate predictive recommendations
         │     & diagnostic insights
         │
         ├─ Cloud Databases (Simulation)
         │  └─ Persist state, audit logs
         │
         └─ IoT Simulated Data
            └─ Queue sensors, POS terminals,
               turnstiles (mocked in development)
```

### Key Screens

1. **Dashboard:** Live KPIs, AI recommendation engine, active incidents
2. **Revenue Concessions:** Real-time revenue breakdown, queue analytics, pricing recommendations
3. **Staffing Map:** Interactive stadium hotspot map with staff deployment UI
4. **Venue Management:** Fan sentiment, incident logs, real-time operational metrics
5. **Settings:** Credential management, threshold configuration, system diagnostics
6. **Help Center:** AI-powered diagnostics advisor and system health checks

### State Management & Persistence

- **Local State:** React hooks manage simulation, hotspots, bottlenecks, AI actions
- **localStorage:** Automatic fallback persistence for offline scenarios
- **Backend Sync:** 5-second polling syncs simulation state with server, handles offline conflicts
- **Toast Notifications:** Real-time user feedback for actions and alerts

---

## 📋 Key Assumptions & Design Decisions

1. **Simulation Over Real IoT:** 
   - All sensor data is mocked (queue times, revenue, staff assignments) for demo purposes
   - Production deployment would integrate real sensors (turnstiles, POS, occupancy)
   - Data structure mirrors real IoT schema for easy swap-in

2. **Client-Side Gemini Integration:**
   - Gemini API key is client-side (VITE_GEMINI_API_KEY) for demo simplicity
   - Production: Move to server-side backend with strict API key isolation
   - All AI insights generated on-demand to minimize API costs

3. **Frontend-Centric MVP:**
   - Rapid prototyping without full backend/database infrastructure
   - Demonstrates UX, AI recommendation logic, and real-time dashboard patterns
   - Backend skeleton provided in `server.ts` for future scaling

4. **Venue-Agnostic:**
   - Configuration stored in `data.ts` allows multi-venue support with simple extensions
   - Hardcoded stadium ID (`stadium_stg_coliseum_99b`) can be replaced with dynamic venue selector
   - Hotspot coordinates auto-generated via deterministic hash for flexibility

5. **Graceful Degradation:**
   - Offline mode buffers actions in localStorage and syncs when online
   - API failures fall back to client-side simulation state
   - Notifications persist in localStorage for audit compliance

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn

### Installation & Development

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
# Create a .env file or set system environment:
export VITE_GEMINI_API_KEY="your-gemini-api-key"
export STADIUM_ID="stadium_stg_coliseum_99b"
export IOT_HUB_ID="hub_mesh_west_gate_c"
export POS_TERMINAL_ID="pos_alpha_vendor_42"

# 3. Run development server
npm run dev

# 4. Open browser to http://localhost:5173
```

### Build for Production

```bash
# Type-check and build
npm run lint
npm run build

# Start production server
npm run start
```

### Testing

```bash
# Run unit tests (Jest + React Testing Library)
npm run test

# Run tests in watch mode
npm run test:watch
```

---

## 🔐 Security & Credentials

- **Gemini API Key:** Stored in environment variables, never hardcoded in source
- **Sensitive IDs:** Displayed with optional masking in Settings UI
- **Audit Trail:** All significant operations logged to `/api/audit-logs`
- **Production Recommendation:** Use GCP Secret Manager for credential injection

---

## 📊 Key Features

✅ **Real-Time Dashboard:** Live attendance, revenue, staff allocation, fan sentiment  
✅ **AI-Powered Recommendations:** Gemini-driven insights for staffing, pricing, and incident response  
✅ **Predictive Analytics:** Queue forecasting, revenue projections, bottleneck detection  
✅ **Interactive Staffing Map:** Drag-and-drop staff deployment to hotspots  
✅ **Comprehensive Revenue Tracking:** Concessions, ticketing, merchandise, with pricing levers  
✅ **Offline Mode:** Full functionality with automatic sync when connectivity returns  
✅ **Responsive Design:** Mobile-first UI, optimized for 2–27" displays  
✅ **Accessibility:** ARIA labels, keyboard navigation, WCAG 2.1 compliance (ongoing)

---

## 📁 Project Structure

```
StadiumOps/
├── /docs                      # Product specifications
│   ├── PRD.md                 # Product requirements & feature roadmap
│   ├── Architecture.md        # System design & component mapping
│   ├── Design.md              # Visual guidelines & accessibility
│   ├── Rules.md               # Development standards
│   └── Phases.md              # Development milestone phases
├── /src                       # React application
│   ├── /components            # Screen modules (Dashboard, Revenue, etc.)
│   │   ├── DashboardScreen.tsx
│   │   ├── RevenueScreen.tsx
│   │   ├── StaffingScreen.tsx
│   │   └── ...
│   ├── /utils                 # Shared utilities (UUID, formatting)
│   ├── App.tsx                # Main application shell
│   ├── types.ts               # TypeScript type definitions
│   ├── data.ts                # Mock data & initial state
│   └── index.css              # Tailwind & global styles
├── server.ts                  # Express backend (optional, for production)
├── package.json               # Dependencies & scripts
├── vite.config.ts             # Vite bundler configuration
├── tsconfig.json              # TypeScript configuration
└── index.html                 # HTML entry point
```

---

## 🤝 Contributing

1. Follow the **Rules.md** development standards (clean, modular code; commented complex logic)
2. Add unit tests for new features
3. Ensure `npm run lint` and `npm run type-check` pass
4. Submit PRs with clear descriptions of changes and design rationale

---

## 📝 License

This project is part of the Google AI Studio Challenge. All code and documentation are provided as-is for evaluation purposes.

---

## 🙋 Support & Feedback

For questions, issues, or feedback on functionality, refer to the **Help Center** screen within the app or open a GitHub issue.

---

**Last Updated:** July 2026  
**Built with:** React 19, Vite, Tailwind CSS, Google Gemini AI
