import { DistrictConfig, LetterDay, OffDay } from '../types';

export interface LetterDayCalculation {
  date: string;
  letter: LetterDay | null;
  isOffDay: boolean;
  offDayReason?: string;
  isWeekend: boolean;
  explanation: string;
  isOverridden: boolean;
  nextSchoolDayLetter?: LetterDay;
}

// Format local date YYYY-MM-DD reliably without timezone shifts
export function getTodayDateStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseYMD(dateStr: string): { year: number; month: number; day: number } {
  const [y, m, d] = dateStr.split('-').map(Number);
  return { year: y, month: m, day: d };
}

export function formatYMD(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function offsetDateStr(dateStr: string, days: number): string {
  const { year, month, day } = parseYMD(dateStr);
  const date = new Date(year, month - 1, day + days);
  return formatYMD(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function isWeekend(dateStr: string): boolean {
  const { year, month, day } = parseYMD(dateStr);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sun = 0, Sat = 6
}

export function formatFriendlyDate(dateStr: string): string {
  const { year, month, day } = parseYMD(dateStr);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatFullDate(dateStr: string): string {
  const { year, month, day } = parseYMD(dateStr);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

// Default verified anchor: Today is explicitly Day C as confirmed by school
export const VERIFIED_ANCHOR: { date: string; letter: LetterDay } = {
  date: getTodayDateStr(),
  letter: 'C',
};

export function getLetterDayForDate(
  targetDate: string,
  config: DistrictConfig
): LetterDayCalculation {
  const letters: LetterDay[] = config.letters && config.letters.length > 0
    ? config.letters
    : ['A', 'B', 'C', 'D', 'E', 'F'];

  // 1. Check manual override first
  if (config.manualOverrides && config.manualOverrides[targetDate]) {
    return {
      date: targetDate,
      letter: config.manualOverrides[targetDate],
      isOffDay: false,
      isWeekend: isWeekend(targetDate),
      explanation: `Manual override applied for ${formatFriendlyDate(targetDate)}: Forced to Day ${config.manualOverrides[targetDate]}.`,
      isOverridden: true,
    };
  }

  // 2. Check if weekend
  if (isWeekend(targetDate)) {
    const nextDate = getNextSchoolDate(targetDate, config);
    const nextCalc = getLetterDayForDate(nextDate, config);
    return {
      date: targetDate,
      letter: null,
      isOffDay: true,
      offDayReason: 'Weekend',
      isWeekend: true,
      explanation: `Weekend (No School). School resumes on ${formatFriendlyDate(nextDate)} as Day ${nextCalc.letter}.`,
      isOverridden: false,
      nextSchoolDayLetter: nextCalc.letter || undefined,
    };
  }

  // 3. Check if scheduled OffDay (holiday, conference day, weather closure)
  const offDayMatch = config.offDays?.find((od) => od.date === targetDate);
  if (offDayMatch) {
    const nextDate = getNextSchoolDate(targetDate, config);
    const nextCalc = getLetterDayForDate(nextDate, config);
    return {
      date: targetDate,
      letter: null,
      isOffDay: true,
      offDayReason: offDayMatch.name,
      isWeekend: false,
      explanation: `School Closed: ${offDayMatch.name}. Cycle paused; resumes on ${formatFriendlyDate(nextDate)} as Day ${nextCalc.letter}.`,
      isOverridden: false,
      nextSchoolDayLetter: nextCalc.letter || undefined,
    };
  }

  // 4. Calculate sequential active school days relative to anchor
  // Today is Day C by default
  const anchorDate = config.anchorDate || VERIFIED_ANCHOR.date;
  const anchorLetter = config.anchorLetter || VERIFIED_ANCHOR.letter;
  const anchorIndex = letters.indexOf(anchorLetter);

  if (targetDate === anchorDate) {
    return {
      date: targetDate,
      letter: anchorLetter,
      isOffDay: false,
      isWeekend: false,
      explanation: `Verified district cycle: Today is Day ${anchorLetter} at ${config.schoolName}.`,
      isOverridden: false,
    };
  }

  // Count active school days between anchorDate and targetDate
  let activeSchoolDays = 0;
  let currentDate = anchorDate;

  if (targetDate > anchorDate) {
    while (currentDate < targetDate) {
      // Step to next day
      currentDate = offsetDateStr(currentDate, 1);
      const isWk = isWeekend(currentDate);
      const isOff = config.offDays?.some((od) => od.date === currentDate && od.pausesCycle);

      if (!isWk && !isOff) {
        activeSchoolDays++;
      }
    }
  } else {
    while (currentDate > targetDate) {
      const isWk = isWeekend(currentDate);
      const isOff = config.offDays?.some((od) => od.date === currentDate && od.pausesCycle);

      if (!isWk && !isOff && currentDate !== anchorDate) {
        activeSchoolDays--;
      }
      currentDate = offsetDateStr(currentDate, -1);
    }
  }

  const cycleLen = letters.length;
  const cycleIndex = ((anchorIndex + activeSchoolDays) % cycleLen + cycleLen) % cycleLen;
  const calculatedLetter = letters[cycleIndex];

  return {
    date: targetDate,
    letter: calculatedLetter,
    isOffDay: false,
    isWeekend: false,
    explanation: `Rotates sequentially: Active school day #${activeSchoolDays >= 0 ? '+' : ''}${activeSchoolDays} from verified Day ${anchorLetter}.`,
    isOverridden: false,
  };
}

export function getNextSchoolDate(startDateStr: string, config: DistrictConfig): string {
  let curr = startDateStr;
  for (let i = 0; i < 30; i++) {
    curr = offsetDateStr(curr, 1);
    const isWk = isWeekend(curr);
    const isOff = config.offDays?.some((od) => od.date === curr);
    if (!isWk && !isOff) {
      return curr;
    }
  }
  return offsetDateStr(startDateStr, 1);
}

export function getUpcomingDaysForecast(
  startDateStr: string,
  daysCount: number,
  config: DistrictConfig
): LetterDayCalculation[] {
  const result: LetterDayCalculation[] = [];
  let curr = startDateStr;

  for (let i = 0; i < daysCount; i++) {
    result.push(getLetterDayForDate(curr, config));
    curr = offsetDateStr(curr, 1);
  }

  return result;
}
