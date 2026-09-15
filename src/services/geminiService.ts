import { HomeworkAssignment, SchoolPeriod, CalendarEvent, BalanceScheduleResult, DistrictConfig } from '../types';

export interface EstimateHomeworkPayload {
  title: string;
  subject: string;
  description?: string;
  gradeLevel?: string;
  targetPace?: string;
}

export interface EstimateHomeworkResponse {
  estimatedMinutes: number;
  difficulty: 'Light' | 'Moderate' | 'Challenging' | 'Heavy';
  breakdown: Array<{
    subtask: string;
    minutes: number;
    description: string;
  }>;
  studyTips: string;
  recommendedSessionType: string;
  fallback?: boolean;
}

export async function requestHomeworkEstimate(payload: EstimateHomeworkPayload): Promise<EstimateHomeworkResponse> {
  const response = await fetch('/api/gemini/estimate-homework', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to estimate homework: ${response.statusText}`);
  }

  return response.json();
}

export interface AnalyzeDistrictPayload {
  districtName: string;
  districtUrl?: string;
  rawScheduleText?: string;
}

export interface AnalyzeDistrictResponse {
  schoolName: string;
  rotationType: string;
  letters: string[];
  offDayHandling: string;
  explanation: string;
  detectedHolidays: Array<{
    date: string;
    name: string;
    type: 'holiday' | 'pd_day' | 'weather' | 'break';
  }>;
  verificationTips: string;
  fallback?: boolean;
}

export async function requestDistrictCalendarAnalysis(payload: AnalyzeDistrictPayload): Promise<AnalyzeDistrictResponse> {
  const response = await fetch('/api/gemini/analyze-district-calendar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to analyze district calendar: ${response.statusText}`);
  }

  return response.json();
}

export interface BalanceSchedulePayload {
  currentDate: string;
  currentLetterDay: string;
  pendingHomework: HomeworkAssignment[];
  schoolSchedule: SchoolPeriod[];
  calendarEvents: CalendarEvent[];
  preferences?: {
    latestEndTime?: string;
    maxContinuousMinutes?: number;
    useStudyHalls?: boolean;
  };
}

export async function requestScheduleBalancing(payload: BalanceSchedulePayload): Promise<BalanceScheduleResult> {
  const response = await fetch('/api/gemini/balance-schedule', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to balance schedule: ${response.statusText}`);
  }

  return response.json();
}

export interface ParsedPeriodFromPhoto {
  periodNumber: number;
  name: string;
  room: string;
  teacher: string;
  startTime: string;
  endTime: string;
  daysActive: string[];
  isStudyHall?: boolean;
  color?: string;
}

export interface ParseSchedulePhotoResponse {
  detectedSchoolName?: string;
  studentName?: string;
  confidenceNotes: string;
  periods: ParsedPeriodFromPhoto[];
}

export async function parseScheduleFromPhoto(
  imageBase64: string,
  mimeType: string,
  schoolName?: string
): Promise<ParseSchedulePhotoResponse> {
  const response = await fetch('/api/gemini/parse-schedule-photo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType, schoolName }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to parse schedule photo: ${response.statusText}`);
  }

  return response.json();
}
