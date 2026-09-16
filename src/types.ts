export type LetterDay = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface SchoolPeriod {
  id: string;
  periodNumber: number;
  name: string;
  room: string;
  teacher: string;
  color: string;
  startTime: string; // "08:00"
  endTime: string;   // "08:52"
  daysActive: LetterDay[]; // which letter days this period meets
  isStudyHall?: boolean;
  friends?: string[];
  emoji?: string; // e.g. "🧪", "📐", "📚", "🏛️", "🎨", "🏃", "🥪", "💻", "📖"
  subjectCategory?: string;
}

export interface OffDay {
  date: string; // "YYYY-MM-DD"
  name: string;
  type: 'holiday' | 'pd_day' | 'weather' | 'break' | 'weekend';
  pausesCycle: boolean; // true = cycle halts; false = skips letter
}

export interface DistrictConfig {
  schoolName: string;
  districtWebsite: string;
  cycleLength: 6 | 4 | 2; // 6-day (A-F), 4-day (A-D), 2-day (A/B)
  letters: LetterDay[];
  offDayPolicy: 'pause_cycle' | 'skip_letter' | 'fixed_weekday';
  lastVerifiedDate: string;
  verifiedSource: string;
  offDays: OffDay[];
  manualOverrides: Record<string, LetterDay>; // "YYYY-MM-DD" -> overridden letter
  anchorDate?: string;
  anchorLetter?: LetterDay;
}

export interface ToDoItem {
  id: string;
  title: string;
  completed: boolean;
  category: 'School' | 'Personal' | 'Clubs' | 'Urgent';
  dueDate?: string; // "YYYY-MM-DD"
  notes?: string;
  priority?: 'low' | 'normal' | 'high';
  createdAt: string;
}

export interface NotificationSettings {
  enabled: boolean;
  morningSchoolIdReminder: boolean;
  morningReminderTime: string; // "07:15"
  nightChromebookReminder: boolean;
  nightReminderTime: string; // "20:30"
  periodChangeReminder: boolean;
  offDayAlerts: boolean;
  soundEnabled: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  type: 'school_id' | 'chromebook' | 'off_day' | 'period' | 'general';
  read: boolean;
  scheduledFor: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "15:30"
  endTime: string;   // "17:00"
  location?: string;
  source: 'google_calendar' | 'apple_calendar' | 'school';
  category: 'sports' | 'club' | 'personal' | 'appointment' | 'academic';
}

export interface HomeworkAssignment {
  id: string;
  title: string;
  subject: string;
  periodId?: string;
  dueDate: string; // "YYYY-MM-DD"
  source?: string;
  description?: string;
  estimatedMinutes?: number;
  difficulty?: 'Light' | 'Moderate' | 'Challenging' | 'Heavy';
  completed: boolean;
  breakdown?: {
    subtask: string;
    minutes: number;
    description?: string;
  }[];
  aiSuggestedTips?: string;
}

export interface StudyBlock {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  subject: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "15:45"
  endTime: string;   // "16:30"
  durationMinutes: number;
  slotType: 'study_hall' | 'after_school' | 'evening';
  rationale: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface BalanceScheduleResult {
  scheduleFeasibility: 'Comfortable' | 'Optimal' | 'Tight' | 'Overloaded';
  workloadSummary: string;
  studyBlocks: StudyBlock[];
  smartSuggestions: string[];
  stressWarning?: string | null;
}

export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  room?: string;
  alternateLink?: string;
}

export interface ClassroomToDoItem {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description?: string;
  dueDate?: string; // "YYYY-MM-DD"
  dueTime?: string; // "HH:MM"
  alternateLink?: string;
  maxPoints?: number;
  submissionState?: string;
  isTurnedIn?: boolean;
}
