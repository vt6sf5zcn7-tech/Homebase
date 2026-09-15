import { DistrictConfig, SchoolPeriod, CalendarEvent, LetterDay, ToDoItem, NotificationSettings, NotificationItem, HomeworkAssignment } from '../types';
import { getTodayDateStr, offsetDateStr } from '../services/letterDayEngine';

// Default to Paul D. Schreiber High School in Port Washington UFSD (Zip Code: 11050)
export const PORT_WASHINGTON_CONFIG: DistrictConfig = {
  schoolName: 'Paul D. Schreiber High School (Port Washington UFSD 11050)',
  districtWebsite: 'https://sch.portnet.org',
  cycleLength: 6,
  letters: ['A', 'B', 'C', 'D', 'E', 'F'],
  offDayPolicy: 'pause_cycle',
  lastVerifiedDate: getTodayDateStr(),
  verifiedSource: 'Port Washington UFSD 11050 Official Calendar & Portnet Bell Schedule',
  anchorDate: getTodayDateStr(),
  anchorLetter: 'C',
  offDays: [
    { date: '2026-09-07', name: 'Labor Day (No School)', type: 'holiday', pausesCycle: true },
    { date: '2026-09-14', name: 'Rosh Hashanah (No School)', type: 'holiday', pausesCycle: true },
    { date: '2026-09-23', name: 'Yom Kippur (No School)', type: 'holiday', pausesCycle: true },
    { date: '2026-10-12', name: 'Columbus Day / Indigenous Peoples Day', type: 'holiday', pausesCycle: true },
    { date: '2026-11-03', name: 'Superintendent Conference Day (Staff Only)', type: 'pd_day', pausesCycle: true },
    { date: '2026-11-11', name: 'Veterans Day Observed', type: 'holiday', pausesCycle: true },
    { date: '2026-11-26', name: 'Thanksgiving Recess', type: 'break', pausesCycle: true },
    { date: '2026-11-27', name: 'Thanksgiving Recess', type: 'break', pausesCycle: true },
    { date: '2026-12-24', name: 'Winter Recess Begins', type: 'break', pausesCycle: true },
    { date: '2027-01-18', name: 'Dr. Martin Luther King Jr. Day', type: 'holiday', pausesCycle: true },
    { date: '2027-02-15', name: 'Presidents Day / Mid-Winter Recess', type: 'break', pausesCycle: true },
  ],
  manualOverrides: {},
};

export const INITIAL_DISTRICT_CONFIG: DistrictConfig = PORT_WASHINGTON_CONFIG;

// 9-Period official Schreiber High School bell schedule (8:05 AM - 3:05 PM)
export const SCHREIBER_PERIODS: SchoolPeriod[] = [
  {
    id: 'p1',
    periodNumber: 1,
    name: 'AP Chemistry',
    room: 'Sci-304',
    teacher: 'Dr. Evelyn Martinez',
    color: '#3B82F6', // Blue
    startTime: '08:05',
    endTime: '08:51',
    daysActive: ['A', 'B', 'C', 'D', 'E'],
    friends: ['Maya Chen', 'Liam Vance', 'Sam K.'],
  },
  {
    id: 'p2',
    periodNumber: 2,
    name: 'Homeroom & AP US History',
    room: 'Hum-108',
    teacher: 'Ms. Rebecca Ross',
    color: '#F59E0B', // Amber
    startTime: '08:55',
    endTime: '09:45',
    daysActive: ['A', 'B', 'D', 'E', 'F'],
    friends: ['Liam Vance', 'Chloe Brooks'],
  },
  {
    id: 'p3',
    periodNumber: 3,
    name: 'Honors Pre-Calculus',
    room: 'Math-210',
    teacher: 'Mr. David Larson',
    color: '#8B5CF6', // Purple
    startTime: '09:49',
    endTime: '10:35',
    daysActive: ['A', 'B', 'C', 'E', 'F'],
    friends: ['Jordan Smith', 'Ava Patel'],
  },
  {
    id: 'p4',
    periodNumber: 4,
    name: 'Spanish III Honors',
    room: 'ModLang-202',
    teacher: 'Sra. Elena Gomez',
    color: '#06B6D4', // Cyan
    startTime: '10:39',
    endTime: '11:25',
    daysActive: ['B', 'C', 'D', 'E', 'F'],
    friends: ['Sam K.', 'Noah Rivera'],
  },
  {
    id: 'p5',
    periodNumber: 5,
    name: 'Period 5 Study Hall (Free Period)',
    room: 'Library Media Ctr',
    teacher: 'Mr. Henderson',
    color: '#10B981', // Emerald
    startTime: '11:29',
    endTime: '12:15',
    daysActive: ['A', 'B', 'C', 'D', 'E', 'F'],
    isStudyHall: true,
    friends: ['Maya Chen', 'Noah Rivera'],
  },
  {
    id: 'p6',
    periodNumber: 6,
    name: 'Lunch & Student Commons',
    room: 'Cafeteria Commons',
    teacher: 'Faculty Supervision',
    color: '#64748B', // Slate
    startTime: '12:19',
    endTime: '13:05',
    daysActive: ['A', 'B', 'C', 'D', 'E', 'F'],
    friends: ['Maya', 'Liam', 'Jordan', 'Chloe', 'Ava'],
  },
  {
    id: 'p7',
    periodNumber: 7,
    name: 'AP English Literature',
    room: 'Lang-115',
    teacher: 'Mrs. Cynthia Howard',
    color: '#EC4899', // Pink
    startTime: '13:09',
    endTime: '13:55',
    daysActive: ['A', 'C', 'D', 'E', 'F'],
    friends: ['Chloe Brooks', 'Emma Watson'],
  },
  {
    id: 'p8',
    periodNumber: 8,
    name: 'Intro to Engineering & CAD',
    room: 'Tech-101',
    teacher: 'Mr. Robert Alvarez',
    color: '#F97316', // Orange
    startTime: '13:59',
    endTime: '14:45',
    daysActive: ['A', 'B', 'C', 'D', 'F'],
    friends: ['Jordan Smith', 'Liam Vance'],
  },
  {
    id: 'p9',
    periodNumber: 9,
    name: 'Extra Help & Advisory / Clubs',
    room: 'Campus Center',
    teacher: 'Academic Faculty',
    color: '#6366F1', // Indigo
    startTime: '14:49',
    endTime: '15:05',
    daysActive: ['A', 'B', 'C', 'D', 'E', 'F'],
    isStudyHall: true,
    friends: ['Maya', 'Jordan'],
  },
];

export const INITIAL_PERIODS: SchoolPeriod[] = SCHREIBER_PERIODS;

export const INITIAL_TODOS: ToDoItem[] = [
  {
    id: 'todo-1',
    title: 'Wear school ID badge around neck before entering',
    completed: false,
    category: 'Urgent',
    priority: 'high',
    dueDate: getTodayDateStr(),
    notes: 'Schreiber security requires lanyard and physical student badge at main doors.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'todo-2',
    title: 'Charge school Chromebook fully to 100% tonight',
    completed: false,
    category: 'School',
    priority: 'high',
    dueDate: offsetDateStr(getTodayDateStr(), 1),
    notes: 'Plug in before 9:00 PM for tomorrow morning.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'todo-3',
    title: 'Lab notebook writeup for Chem Period 1',
    completed: false,
    category: 'School',
    priority: 'normal',
    dueDate: offsetDateStr(getTodayDateStr(), 1),
    notes: 'Titration data table and percent yield calculation.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'todo-4',
    title: 'Pack gym uniform / running sneakers for Cross Country',
    completed: true,
    category: 'Personal',
    priority: 'normal',
    dueDate: getTodayDateStr(),
    notes: 'Meet at track bleachers after Period 9.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'todo-5',
    title: 'Pay AP Exam registration fee online',
    completed: false,
    category: 'School',
    priority: 'normal',
    dueDate: offsetDateStr(getTodayDateStr(), 5),
    notes: 'Total Care portal link.',
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  morningSchoolIdReminder: true,
  morningReminderTime: '07:15',
  nightChromebookReminder: true,
  nightReminderTime: '20:30',
  periodChangeReminder: true,
  offDayAlerts: true,
  soundEnabled: true,
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'School ID Reminder',
    body: 'Don’t forget to wear your school ID before heading out to Schreiber High!',
    time: '7:15 AM',
    type: 'school_id',
    read: false,
    scheduledFor: 'Every morning at 7:15 AM',
  },
  {
    id: 'notif-2',
    title: 'Chromebook Charging Reminder',
    body: 'Plug in your school Chromebook tonight so you are at 100% battery tomorrow.',
    time: '8:30 PM',
    type: 'chromebook',
    read: false,
    scheduledFor: 'Every night at 8:30 PM',
  },
  {
    id: 'notif-3',
    title: 'Upcoming Off Day: Yom Kippur',
    body: 'School will be closed on Wednesday, Sept 23 for Yom Kippur. Day cycle will pause.',
    time: 'Yesterday',
    type: 'off_day',
    read: true,
    scheduledFor: '2026-09-23',
  },
];

export const mockDistrictConfig = INITIAL_DISTRICT_CONFIG;
export const mockSchoolPeriods = INITIAL_PERIODS;
export const mockTodos = INITIAL_TODOS;
export const mockNotificationSettings = DEFAULT_NOTIFICATION_SETTINGS;
export const mockNotifications = INITIAL_NOTIFICATIONS;

export const DISTRICT_PRESETS = [
  {
    zipCode: '11050',
    schoolName: 'Paul D. Schreiber High School',
    districtName: 'Port Washington Union Free School District',
    url: 'https://sch.portnet.org',
    cycle: '6-day (A-F)',
    bellSchedule: '8:05 AM - 3:05 PM (9 Periods)',
    config: PORT_WASHINGTON_CONFIG,
    periods: SCHREIBER_PERIODS,
  },
  {
    zipCode: '11050',
    schoolName: 'Carrie Palmer Weber Middle School',
    districtName: 'Port Washington Union Free School District',
    url: 'https://web.portnet.org',
    cycle: '6-day (A-F)',
    bellSchedule: '8:05 AM - 2:55 PM',
    config: {
      ...PORT_WASHINGTON_CONFIG,
      schoolName: 'Carrie Palmer Weber Middle School (Port Washington 11050)',
      districtWebsite: 'https://web.portnet.org',
    },
    periods: SCHREIBER_PERIODS,
  },
];


export const INITIAL_HOMEWORK: HomeworkAssignment[] = [
  {
    id: 'hw-1',
    title: 'AP Chemistry: Reaction Rates & Equilibrium Problem Set #4',
    subject: 'AP Chemistry',
    periodId: 'p1',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    source: 'google_classroom',
    description: 'Complete problems 14 through 28 on Le Chatelier principles. Show all equilibrium constant expressions and units.',
    estimatedMinutes: 45,
    difficulty: 'Challenging',
    completed: false,
    breakdown: [
      { subtask: 'Equilibrium constant derivations', minutes: 15, description: 'Write Ka/Kb and setup tables' },
      { subtask: 'Solving calculations 14-22', minutes: 20, description: 'Concentration shifts and stress analysis' },
      { subtask: 'Graphing and final check', minutes: 10, description: 'Review reaction quotient Q vs K' },
    ],
    aiSuggestedTips: 'Best scheduled during your Period 4 Study Hall today to ask Dr. Martinez clarifying questions before 8th period.',
  },
  {
    id: 'hw-2',
    title: 'AP US History: Progressive Era Primary Document Analysis (DBQ)',
    subject: 'AP United States History',
    periodId: 'p3',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // Day after tomorrow
    source: 'google_classroom',
    description: 'Read Documents A through G on Teddy Roosevelt trust-busting and Upton Sinclair The Jungle. Write thesis + 2 body paragraphs with HIPP analysis.',
    estimatedMinutes: 55,
    difficulty: 'Heavy',
    completed: false,
    breakdown: [
      { subtask: 'Annotate 7 primary documents', minutes: 20, description: 'Identify Historical Context, Intended Audience, Purpose, Point of View' },
      { subtask: 'Draft thesis and complex claim', minutes: 10, description: 'Establish clear counter-argument structure' },
      { subtask: 'Draft 2 body evidence paragraphs', minutes: 25, description: 'Incorporate outside historical evidence' },
    ],
    aiSuggestedTips: 'Split into two 30-min sessions. Do document sourcing before sports practice, then write the essay post-dinner.',
  },
  {
    id: 'hw-3',
    title: 'Spanish III: Subjunctive vs Indicative Practice Exercise 5.2',
    subject: 'Spanish III Honors',
    periodId: 'p7',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    source: 'google_classroom',
    description: 'Online textbook practice on expressing doubt, emotion, and necessity in Spanish sentences.',
    estimatedMinutes: 25,
    difficulty: 'Light',
    completed: false,
    breakdown: [
      { subtask: 'Review irregular subjunctive conjugations', minutes: 7, description: 'dar, ir, ser, haber, estar, saber' },
      { subtask: 'Sentence completion 1-20', minutes: 18, description: 'Online interactive portal submission' },
    ],
    aiSuggestedTips: 'Quick sprint assignment. Knock this out right after school for immediate momentum.',
  },
  {
    id: 'hw-4',
    title: 'Pre-Calculus: Unit Circle & Trigonometric Identities Review',
    subject: 'Honors Pre-Calculus',
    periodId: 'p2',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    source: 'manual',
    description: 'Prepare flashcards and verify 8 Pythagorean trigonometric identity transformations.',
    estimatedMinutes: 35,
    difficulty: 'Moderate',
    completed: false,
    breakdown: [
      { subtask: 'Identity derivation proofs', minutes: 20, description: 'sin^2 + cos^2 = 1 variations' },
      { subtask: 'Verification practice problems', minutes: 15, description: 'Solve textbook p. 248 #1-12' },
    ],
  },
];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Varsity Cross Country Track Practice',
    date: new Date().toISOString().split('T')[0],
    startTime: '15:45',
    endTime: '17:30',
    location: 'School Stadium & Trails',
    source: 'google_calendar',
    category: 'sports',
  },
  {
    id: 'evt-2',
    title: 'FIRST Robotics Programming Team Meeting',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    startTime: '16:00',
    endTime: '17:30',
    location: 'Lab Room 102',
    source: 'apple_calendar',
    category: 'club',
  },
  {
    id: 'evt-3',
    title: 'Orthodontist Appointment',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    startTime: '16:15',
    endTime: '17:00',
    location: '420 Westfield Ave Suite 2B',
    source: 'apple_calendar',
    category: 'appointment',
  },
];

export const mockHomeworkAssignments = INITIAL_HOMEWORK;
export const mockCalendarEvents = INITIAL_CALENDAR_EVENTS;


export const mockInitialStudyBlocks = [
  {
    id: 'block-1',
    assignmentId: 'hw-1',
    assignmentTitle: 'AP Chemistry: Acid-Base Titration Curves Analysis',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:51',
    endTime: '11:43',
    durationMinutes: 40,
    slotType: 'study_hall' as const,
    rationale: 'Knock this out during Period 4 Study Hall in the library before after-school practice.',
    subject: 'AP Chemistry',
  },
  {
    id: 'block-2',
    assignmentId: 'hw-3',
    assignmentTitle: 'Spanish III: Subjunctive vs Indicative Practice',
    date: new Date().toISOString().split('T')[0],
    startTime: '17:45',
    endTime: '18:15',
    durationMinutes: 25,
    slotType: 'after_school' as const,
    rationale: 'Quick 25-minute practice right after Cross Country Track Practice while energy is high.',
    subject: 'Spanish III Honors',
  },
  {
    id: 'block-3',
    assignmentId: 'hw-2',
    assignmentTitle: 'AP US History: Progressive Era DBQ Document Analysis',
    date: new Date().toISOString().split('T')[0],
    startTime: '19:30',
    endTime: '20:25',
    durationMinutes: 55,
    slotType: 'evening' as const,
    rationale: 'Deep focus essay drafting slot post-dinner in quiet study environment.',
    subject: 'AP US History',
  },
];

