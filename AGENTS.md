# AGENTS.md — ScaleAndFit (`scaleandfit.com`)

1. **Architecture:** Vanilla TypeScript + Vite static multi-route studio + client-side `pdf-lib` + Canvas API. Zero backend, zero cookies, zero external telemetry.
2. **Closed-Valve Mandate:** `ECONOMIC_VALVE_OPEN` in `src/config/valve.ts` MUST stay `false`. Never add ad scripts, affiliate URLs, or payment walls.
3. **Sovereign Copy Mandate:** Never write `"Zero Ads"`, `"No Ads"`, `"Ad-Free"`, or criticize advertising anywhere in HTML, copy, `<meta>`, or comments. Focus on: 100% Local In-Browser Execution, Zero Tracking Cookies, No Account Required, Zero Cloud Uploads.
4. **Always Verify:** Run `npx vitest run`, `npx tsc --noEmit`, and `npm run build` before finishing.
