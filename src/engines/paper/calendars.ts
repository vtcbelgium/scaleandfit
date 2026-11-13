export interface HolidayEntry {
  date: string; // YYYY-MM-DD
  name: string;
}

export interface CalendarCell {
  isoDate: string;
  day: number;
  inMonth: boolean;
  isWeekend: boolean;
  holidayNames: string[];
}

export interface MonthCalendarGrid {
  year: number;
  month: number; // 1..12
  monthName: string;
  weekStartsMonday: boolean;
  headers: string[];
  weeks: CalendarCell[][];
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function formatUtcIso(d: Date): string {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

export function buildMonthCalendarGrid(
  year: number,
  month: number,
  weekStartsMonday = true,
  holidays: HolidayEntry[] = []
): MonthCalendarGrid {
  if (!(month >= 1 && month <= 12 && Number.isInteger(year))) {
    throw new RangeError("Invalid year or month");
  }
  const holidayMap = new Map<string, string[]>();
  for (const h of holidays) {
    const arr = holidayMap.get(h.date) ?? [];
    arr.push(h.name);
    holidayMap.set(h.date, arr);
  }

  const first = new Date(Date.UTC(year, month - 1, 1));
  const firstDow = first.getUTCDay(); // 0=Sun..6=Sat
  const offset = weekStartsMonday ? (firstDow + 6) % 7 : firstDow;
  const gridStart = new Date(Date.UTC(year, month - 1, 1 - offset));

  const weeks: CalendarCell[][] = [];
  for (let w = 0; w < 6; w++) {
    const row: CalendarCell[] = [];
    for (let d = 0; d < 7; d++) {
      const cur = new Date(gridStart.getTime() + (w * 7 + d) * 86400000);
      const iso = formatUtcIso(cur);
      const dow = cur.getUTCDay();
      row.push({
        isoDate: iso,
        day: cur.getUTCDate(),
        inMonth: cur.getUTCMonth() + 1 === month && cur.getUTCFullYear() === year,
        isWeekend: dow === 0 || dow === 6,
        holidayNames: holidayMap.get(iso) ?? [],
      });
    }
    // Omit trailing row if entirely next month
    if (w === 5 && row.every((c) => !c.inMonth)) {
      continue;
    }
    weeks.push(row);
  }

  const headers = weekStartsMonday
    ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return {
    year,
    month,
    monthName: MONTH_NAMES[month - 1],
    weekStartsMonday,
    headers,
    weeks,
  };
}
