# Rules Document

## 1. General Principles

This document outlines the rules and constraints for developing and maintaining the **StadiumOps Pro** hub. Adherence to these guidelines ensures exceptional UI craftsmanship, type safety, and clean code.

*   **Prioritize Visual Craftsmanship:** Implement beautiful, responsive layouts using deep slate tones, vibrant emerald status indicators, and clear typography pairings.
*   **Aesthetic Rhythm over Margins:** Use generous negative space, structured container borders, and smooth transitions (using Tailwind CSS and Motion) to guide operator attention.
*   **Type Safety First:** Declare all state and prop schemas inside `/src/types.ts` using strict TypeScript compiler settings.
*   **No Unnecessary Background Tasks:** Optimize event loops and interval timers in React hooks to prevent unnecessary memory leaks or UI freezing.

---

## 2. Technical Guidelines & Constraints

### 2.1. Environment Configuration & Security
- **Secure Key Mapping:** Sensitive variables (such as operational API keys) must be loaded from standard environment schemas.
- **VITE_ Prefix Precaution:** Developer environments must be warned that any variables prefixed with `VITE_` are compiled client-side by Vite. Production deployments should rely on server-side proxies or Google Secret Manager container injections.
- **Credentials Masking:** Implement clean UI masks (e.g. `• • • • •`) to prevent key exposure during operational reviews.

### 2.2. Interface Interaction & Diagnostics
- **Reactive State Machines:** Simulate high-frequency turnstile, concession, and incident events using robust React `useEffect` loops.
- **Dynamic Diagnostics:** All ping tests and diagnostics on web services should output clear CLI commands, network parameters, latency tallies, and human-scannable logs inside a dedicated developer console.

### 2.3. Code Quality & Linting
- All files must compile successfully via `tsc --noEmit`.
- Code must pass standard React linting checks and use modern, clean imports.
