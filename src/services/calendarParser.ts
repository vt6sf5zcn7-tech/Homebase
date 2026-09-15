import { CalendarEvent, HomeworkAssignment } from '../types';

/**
 * Parses standard iCalendar (.ics) content (used by Apple Calendar, Google Calendar, Canvas, Blackboard)
 */
export function parseICalendar(icsContent: string, source: 'apple_calendar' | 'google_calendar'): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const lines = icsContent.split(/\r\n|\n|\r/);
  
  let currentEvent: Partial<CalendarEvent> | null = null;
  let inEvent = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    // Handle line folding (lines starting with space or tab)
    while (i + 1 < lines.length && (lines[i + 1].startsWith(' ') || lines[i + 1].startsWith('\t'))) {
      i++;
      line += lines[i].trim();
    }

    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEvent = {
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        source,
        category: 'personal',
      };
    } else if (line === 'END:VEVENT' && inEvent && currentEvent) {
      if (currentEvent.title && currentEvent.date) {
        events.push({
          id: currentEvent.id || `evt-${Date.now()}`,
          title: currentEvent.title,
          date: currentEvent.date,
          startTime: currentEvent.startTime || '12:00',
          endTime: currentEvent.endTime || '13:00',
          location: currentEvent.location,
          source,
          category: currentEvent.category || 'personal',
        });
      }
      inEvent = false;
      currentEvent = null;
    } else if (inEvent && currentEvent) {
      if (line.startsWith('SUMMARY:')) {
        currentEvent.title = line.substring(8);
      } else if (line.startsWith('LOCATION:')) {
        currentEvent.location = line.substring(9);
      } else if (line.startsWith('DTSTART')) {
        const val = line.split(':')[1] || '';
        // Handles YYYYMMDD or YYYYMMDDTHHMMSS
        if (val.length >= 8) {
          const y = val.substring(0, 4);
          const m = val.substring(4, 6);
          const d = val.substring(6, 8);
          currentEvent.date = `${y}-${m}-${d}`;
          if (val.includes('T') && val.length >= 13) {
            const tIdx = val.indexOf('T');
            const hh = val.substring(tIdx + 1, tIdx + 3);
            const mm = val.substring(tIdx + 3, tIdx + 5);
            currentEvent.startTime = `${hh}:${mm}`;
          } else {
            currentEvent.startTime = '09:00';
          }
        }
      } else if (line.startsWith('DTEND')) {
        const val = line.split(':')[1] || '';
        if (val.includes('T') && val.length >= 13) {
          const tIdx = val.indexOf('T');
          const hh = val.substring(tIdx + 1, tIdx + 3);
          const mm = val.substring(tIdx + 3, tIdx + 5);
          currentEvent.endTime = `${hh}:${mm}`;
        } else {
          currentEvent.endTime = '10:00';
        }
      }
    }
  }

  return events;
}

// Sample downloadable iCal template for testing
export function generateSampleICal(type: 'apple' | 'google'): string {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  if (type === 'apple') {
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.15.7//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:apple-evt-1@icloud.com
DTSTART:${today}T180000Z
DTEND:${today}T193000Z
SUMMARY:Soccer Team Practice & Drills
LOCATION:Lower Turf Field
END:VEVENT
BEGIN:VEVENT
UID:apple-evt-2@icloud.com
DTSTART:${today}T194500Z
DTEND:${today}T203000Z
SUMMARY:Family Dinner
LOCATION:Home Dining Room
END:VEVENT
END:VCALENDAR`;
  } else {
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Google Inc//Google Calendar 70.9054//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:google-evt-1@google.com
DTSTART:${today}T160000Z
DTEND:${today}T171500Z
SUMMARY:Robotics Club Autonomous Coding
LOCATION:Room 104
END:VEVENT
BEGIN:VEVENT
UID:google-evt-2@google.com
DTSTART:${today}T204500Z
DTEND:${today}T213000Z
SUMMARY:SAT Prep & Math Review Call
LOCATION:Online Zoom
END:VEVENT
END:VCALENDAR`;
  }
}
