# Project Requirements Document (PRD)

## 1. Introduction

This document defines the requirements for **StadiumOps Pro**, a **Smart Stadium Operations & Revenue Monitor Hub**. This application provides stadium management and event planners with real-time operational oversight, automated crowd bottleneck detection, active incident injection, adaptive staffing dispatches, and an interactive GCP Cloud Services panel to monitor security and configurations.

---

## 2. Problem Statement

Modern stadiums face major operational friction points that lead to massive capital leakage and high labor costs:
- **Concessions Congestion:** Long queues lead to lost impulse buys from fans.
- **Ticketing & Entry Bottlenecks:** Manual gate controls and ticketing slow down fan entry, requiring excessive temporary event-day staff.
- **Staffing Inefficiencies:** Operators over-staff or under-staff key gates and concession bays due to a lack of live predictive telemetry.
- **Venue Underutilization:** Facilities remain quiet or consume high utility power on non-event days.

---

## 3. Goals and Objectives

- **Eradicate Revenue Leakage:** Provide real-time sales gauges, concession queue alerts, and transaction tracking.
- **Optimize Staffing & Deployment:** Use automated algorithms to identify crowd congestion and recommend rapid steward dispatches.
- **Monetize the Venue 365 Days:** Support event-day simulations and non-event smart climate/power profiles.
- **Secure Configuration & GCP Integration:** Provide an interactive hub to verify Google Cloud services, API endpoints, and system-level credentials.

---

## 4. Key Functional Modules (Implemented)

### 4.1. Concourse Concessions & CV Monitoring
- Live track sales, customer volumes, and queue wait times across 24 concessions.
- Simulated computer-vision cameras identifying food/beverage OCR states.

### 4.2. Turnstile Throughput & Crowd Bottlenecks
- Live tracking of turnstile ticket scanning volumes across Gates A, B, C, and D.
- Interactive bottleneck visualizers highlighting queue build-ups and average waiting durations.

### 4.3. Adaptive Staffing Dispatch Engine
- Displays active stadium stewards, supervisors, and paramedics with their assigned sectors.
- Real-time "Dispatch Staff" module allowing operators to quickly dispatch stewards to relieve active bottlenecks.

### 4.4. Live Incident Injector & Logs
- Operators can inject dynamic incidents (such as Concessions POS Offline, Gate C Ticket Scan Failure, Concourse Spills) to test staff response times.
- Real-time scrolling incident log feed.

### 4.5. GCP Web Services Architecture Hub
- An interactive panel displaying active configurations for GKE, Cloud Run, Pub/Sub, Vertex AI, BigQuery, and 10+ other Google Cloud services.
- Live CLI console and ping test health checkers to view terminal diagnostics logs instantly.

---

## 5. Security & Environment Architecture

To adhere to enterprise security guidelines:
- Sensitive credentials (stadium API keys, stream IDs) are defined inside the environment variables system.
- An interactive **System Identifiers** disclosure card allows administrators to toggle the visibility of active UUIDs (`stadiumId`, `iotHubId`, `posTerminalId`, `cctvStreamId`) and view active Gemini model connection states securely.
