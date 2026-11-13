export const ECONOMIC_VALVE_OPEN = false as const;

export function renderPartnerSlot(_slotId: string): string {
  if (!ECONOMIC_VALVE_OPEN) {
    return "";
  }
  return "";
}
