import { ECONOMIC_VALVE_OPEN, renderPartnerSlot } from "./config/valve";

export function bootApp(): void {
  const root = document.getElementById("app");
  if (!root) return;
  const partnerHtml = renderPartnerSlot("header");
  if (partnerHtml && !ECONOMIC_VALVE_OPEN) {
    throw new Error("Closed-valve invariant violated");
  }
  root.dataset.ready = "true";
}

if (typeof document !== "undefined") {
  bootApp();
}
