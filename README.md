# StadiumOps Pro - Smart Stadium Operations & Revenue Monitor Hub

StadiumOps Pro is an incredibly polished, real-time smart stadium operations, crowd bottleneck monitor, and revenue audit dashboard. Built using **React 19**, **Vite**, and **Tailwind CSS**, this hub integrates active crowd telemetry simulations, adaptive staffing engines, dynamic incident injectors, and a full-featured **GCP Web Services Integration & Diagnostics Suite** representing a production Google Cloud Platform architecture.

---

## 🚀 Chosen Vertical: Smart Stadium Operations & Revenue Monitor

StadiumOps Pro is designed to directly target the friction points that cause operational capital leakage, concession queue fatigue, and staffing ineffectiveness in sports coliseums and entertainment venues:
1. **Concession Congestion Monitor:** Scans 24 concessions for sales, transaction volume, and waiting times.
2. **Turnstile Throughput & Bottleneck Tracker:** Models high-frequency gate entries and average line wait times.
3. **Adaptive Staffing Dispatch Engine:** Allows operators to dynamically dispatch stewards and security patrols directly to relieve bottlenecked gates.
4. **Live Scenario Injector:** Simulates gate ticketing failures, concourse spillages, and POS offline events to track response times.
5. **Interactive GCP Diagnostics Panel:** Simulates 15 core Google Cloud Platform endpoints with active CLI reference, handshakes, ping testing, and console log outputs.

---

## 🛠️ GCP Web Services Architecture Integration

The hub contains an interactive **GCP Web Services** controller showcasing a standard production cloud stack:

*   **Core Compute:** Google Kubernetes Engine (GKE), Google Cloud Run, Cloud Functions.
*   **AI & Machine Learning:** Vertex AI Models, Cloud Vision API (Checkout OCR), MediaPipe Biometrics.
*   **Data Analytics & IoT:** Google BigQuery, Cloud Pub/Sub Telemetry, Cloud Dataflow.
*   **Storage & Databases:** Cloud SQL (PostgreSQL), Cloud Firestore NoSQL, Google Cloud Storage (GCS).
*   **Frontend & Engagement:** Google Maps Platform (3D Tiles), Firebase Cloud Messaging, Firebase Auth.
*   **Operational Efficiency:** Looker Analytics dashboards.

Operators can select any service, inspect its active category, review its standard Google Cloud CLI command, view latency metrics, and click **"Run Diagnostics Self-Test"** to execute simulated live connections with direct terminal outputs.

---

## 🔒 Security & Credentials Architecture

In compliance with enterprise security best practices:
- **Credential Masking:** System credentials and active API keys are loaded through typed environments and securely masked in the UI.
- **Sensitive UUID Toggles:** Critical stadium identifiers (`stadiumId`, `iotHubId`, `posTerminalId`, `cctvStreamId`) and Gemini API key states can be fully hidden or exposed dynamically by administrators.
- **Google Secret Manager Warning:** In production cloud environments, all secrets must be stored securely using GCP Secret Manager and injected into serverless containers rather than bundled in public frontend builds.

---

## 📂 Project Structure

```
/
├── /docs                 # Project Planning & Specifications
│   ├── PRD.md            # Product Requirements Document
│   ├── Architecture.md   # Cloud Topology and Component Mapping
│   ├── Rules.md          # Visual Craftsmanship & Development Rules
│   ├── Phases.md         # Development Milestone Phases
│   ├── Design.md         # Visual Aesthetics & Typography Guidelines
│   └── Memory.md         # Active Project Status Record
├── /src                  # React Codebase
│   ├── /components       # Modular Dashboard Screens
│   │   ├── DashboardScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── ...
│   ├── App.tsx           # Application Core
│   ├── types.ts          # Safe TypeScript Type Definitions
│   └── index.css         # Tailwind Ingest Rules
├── index.html            # App Entry HTML Page
├── package.json          # Dependency Manifest
└── vite.config.ts        # Vite Bundler Setup
```

---

## ⚡ Quick Start & Development Setup

### Full-Stack Server Architecture
StadiumOps Pro is implemented as a full-stack Node.js application. 
- **Backend:** A robust **Express** server (`server.ts`) runs on port `3000` to serve secure API configurations and act as a gateway/proxy.
- **Frontend:** Integrated directly with **Vite** as middleware in development for instant module replacement, and serving static assets from `/dist` in production.
- **Secure Credentials:** All sensitive API keys are stored on the server-side via Node environment variables to prevent public client-side bundle exposure.

### Prerequisites
- Node.js (v18+)
- npm

### Environment Variables
Configure the following in your `.env` or system environment:
```env
# Gemini AI Platform API Keys (kept server-side for maximum security)
GEMINI_API_KEY="your_server_side_gemini_key"

# Smart Stadium Credentials & Identifiers
STADIUM_ID="stadium_stg_coliseum_99b"
IOT_HUB_ID="hub_mesh_west_gate_c"
POS_TERMINAL_ID="pos_alpha_vendor_42"
CCTV_STREAM_ID="stream_unified_concourse_112"
APP_URL="https://example-stadium-ops.app"
```

### Installation
1. Install base dependencies:
   ```bash
   npm install
   ```

2. Spin up the full-stack server (runs Express on port 3000 and mounts Vite):
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000` to interact with the dashboard.

### Validation Commands
- Run typescript type checkers to confirm full compilability:
   ```bash
   npm run lint
   ```
- Build production assets (compiles client bundle and packages server file to `/dist/server.cjs` via `esbuild`):
   ```bash
   npm run build
   ```
- Start production full-stack bundle:
   ```bash
   npm run start
   ```
