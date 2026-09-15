import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy Gemini client helper
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured.");
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// API: Parse Schedule from Photo / Image
app.post("/api/gemini/parse-schedule-photo", async (req, res) => {
  try {
    const { imageBase64, mimeType, schoolName } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Image data is required." });
    }

    // Clean base64 string if user passed data URI
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
    const cleanMimeType = mimeType || "image/jpeg";

    const ai = getGeminiClient();
    const prompt = `You are an expert high school schedule scanner, OCR parser, and student academic assistant.
A student has uploaded a photo or screenshot of their high school class schedule (could be a printed bell schedule paper, or a mobile portal screenshot like Genesis, PowerSchool, Infinite Campus, or Google Classroom).
School Context: "${schoolName || 'High School'}"

Analyze the image carefully.
Extract all class periods in order (Period 1, Period 2, etc.).
For each period found:
1. periodNumber: number (1, 2, 3, 4, 5, 6, 7, 8, 9...)
2. name: course or class title (e.g. "AP Chemistry", "Honors Pre-Calculus", "AP US History", "Spanish III", "Lunch", "Study Hall", "Physical Education", "English 11", "Robotics")
3. room: room number or location (e.g. "Sci-304", "Math-210", "Gym", "Cafeteria", "Room 115", or "Room --" if not visible)
4. teacher: teacher or instructor's name (e.g. "Dr. Martinez", "Ms. Ross", "Larson", or "Faculty" if not visible)
5. startTime: formatted as "HH:MM" in 24-hour time (e.g. "08:05", "08:55", "09:49", "10:39", "11:29", "12:19", "13:09", "13:59", "14:49")
6. endTime: formatted as "HH:MM" (e.g. "08:51", "09:45", "10:35", "11:25", "12:15", "13:05", "13:55", "14:45", "15:05")
7. daysActive: array of letter days this class meets (e.g. ["A", "B", "C", "D", "E", "F"] if daily, or specific days if indicated on the rotation like ["A", "B", "C", "D", "E"]). If unclear, default to all letters ["A", "B", "C", "D", "E", "F"].
8. isStudyHall: boolean (true for lunch, study hall, free period, commons, advisory)
9. color: modern hex color for the class card (e.g. #3B82F6 blue, #8B5CF6 purple, #10B981 emerald, #F59E0B amber, #06B6D4 cyan, #EC4899 pink, #F97316 orange)

Return structured JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: cleanMimeType,
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedSchoolName: { type: Type.STRING },
            studentName: { type: Type.STRING },
            confidenceNotes: { type: Type.STRING },
            periods: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  periodNumber: { type: Type.INTEGER },
                  name: { type: Type.STRING },
                  room: { type: Type.STRING },
                  teacher: { type: Type.STRING },
                  startTime: { type: Type.STRING },
                  endTime: { type: Type.STRING },
                  daysActive: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  isStudyHall: { type: Type.BOOLEAN },
                  color: { type: Type.STRING },
                },
                required: [
                  "periodNumber",
                  "name",
                  "room",
                  "teacher",
                  "startTime",
                  "endTime",
                  "daysActive",
                ],
              },
            },
          },
          required: ["periods", "confidenceNotes"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Parse schedule photo error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to parse schedule photo.",
    });
  }
});

// API: Estimate Homework Time
app.post("/api/gemini/estimate-homework", async (req, res) => {
  try {
    const { title, subject, description, gradeLevel, targetPace } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Assignment title is required." });
    }

    const ai = getGeminiClient();
    const prompt = `You are an expert high school academic advisor and homework estimator.
Analyze this homework assignment and provide a realistic, student-friendly estimation of completion time and an actionable study breakdown.

Assignment Title: "${title}"
Subject/Course: "${subject || "General"}"
Grade Level: "${gradeLevel || "High School (10th-12th)"}"
Details/Instructions: "${description || "Standard assignment"}"
Student Pace Preference: "${targetPace || "Focused"}"

Consider:
1. Reading speed (typically 150-200 words/min for textbooks + comprehension time)
2. Problem-solving speed (math/science: 3-6 mins per multi-step problem)
3. Writing/essay speed (drafting, editing, citations)
4. Mental fatigue and recommended breaks

Return a structured JSON with:
- estimatedMinutes (integer, realistic total time in minutes)
- difficulty ("Light" | "Moderate" | "Challenging" | "Heavy")
- breakdown: list of subtasks with subtask name, minutes (integer), and brief description
- studyTips: concise 1-2 actionable tips
- recommendedSessionType: e.g. "Single 35m sprint" or "2x 25m Pomodoro with 5m rest"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedMinutes: { type: Type.INTEGER },
            difficulty: { type: Type.STRING },
            breakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  subtask: { type: Type.STRING },
                  minutes: { type: Type.INTEGER },
                  description: { type: Type.STRING },
                },
                required: ["subtask", "minutes", "description"],
              },
            },
            studyTips: { type: Type.STRING },
            recommendedSessionType: { type: Type.STRING },
          },
          required: [
            "estimatedMinutes",
            "difficulty",
            "breakdown",
            "studyTips",
            "recommendedSessionType",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Homework estimation error:", error);
    // Return a thoughtful fallback if Gemini is unconfigured or rate limited
    return res.json({
      estimatedMinutes: 40,
      difficulty: "Moderate",
      breakdown: [
        { subtask: "Review requirements & prep notes", minutes: 8, description: "Gather materials and scan prompt" },
        { subtask: "Core work & problem execution", minutes: 24, description: "Focused deep work without distractions" },
        { subtask: "Self-check & final review", minutes: 8, description: "Verify against rubric and proofread" },
      ],
      studyTips: "Complete in a quiet environment before dinner to maximize retention.",
      recommendedSessionType: "Single 40-minute focus block",
      fallback: true,
      error: error?.message,
    });
  }
});

// API: Analyze School District Calendar & Letter Day Rotation Rules
app.post("/api/gemini/analyze-district-calendar", async (req, res) => {
  try {
    const { districtName, districtUrl, rawScheduleText } = req.body;

    const is11050 =
      (districtName && districtName.includes("11050")) ||
      (districtUrl && districtUrl.includes("11050")) ||
      (districtUrl && districtUrl.includes("portnet.org")) ||
      (districtName && /schreiber|port washington/i.test(districtName));

    const ai = getGeminiClient();
    const prompt = `You are a specialist in school district bell schedules, letter days (A, B, C, D, E, F rotation), and academic calendars.
A student is using this app because Saturn gave them the wrong letter day and they missed class!
Your job is to analyze the school/district information to determine the exact letter day rotation rules and identify off-days (teacher workdays, holidays, snow days) so the student NEVER gets told the wrong letter day.

${
  is11050
    ? `SPECIAL CONTEXT FOR ZIP CODE 11050 / PORT WASHINGTON:
This refers to Paul D. Schreiber High School / Port Washington Union Free School District (11050, Port Washington, NY, website: https://sch.portnet.org).
Schreiber High School uses a 6-day cycle (Letters A, B, C, D, E, F).
Crucial Off-Day Rule: Whenever school is closed (e.g. for Superintendent's Conference Day, Rosh Hashanah, Yom Kippur, snow emergency, or recess), the cycle PAUSES ("pause_cycle"). The next school day in session immediately resumes with the next scheduled letter day.
Upcoming off days include: Rosh Hashanah, Yom Kippur, Columbus Day, Superintendent Conference Day (Staff Only), Veterans Day, Thanksgiving, Winter Recess, MLK Day, Presidents Day Week.`
    : ""
}

School / District: "${districtName || (is11050 ? "Paul D. Schreiber High School (Port Washington UFSD 11050)" : "High School District")}"
District Website/Portal: "${districtUrl || (is11050 ? "https://sch.portnet.org" : "")}"
Calendar / Schedule Notes: "${rawScheduleText || "Standard A through F 6-day rotation. No school on weekends or holidays. When school is closed, the rotation pauses so the next open day is the next letter."}"

Analyze and determine:
1. The exact school name and letter rotation (e.g. ["A", "B", "C", "D", "E", "F"])
2. Off-day behavior:
   - "pause_cycle": (Standard in Port Washington / Schreiber HS and most US high schools) When school is closed for holiday/snow day, the rotation pauses. The next school day continues with the next letter in sequence.
   - "skip_letter": The missed day burns that letter.
   - "day_of_week_fixed": e.g. Mondays are always A, Tuesdays always B.
3. Detected upcoming off-days / holidays with exact dates.
4. Fail-safe explanation of why letter day confusion happens (such as Saturn skipping days or failing on superintendent conference days) and how Homebase guarantees 100% letter day accuracy.

Return structured JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            schoolName: { type: Type.STRING },
            rotationType: { type: Type.STRING },
            letters: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            offDayHandling: { type: Type.STRING },
            explanation: { type: Type.STRING },
            detectedHolidays: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING },
                  name: { type: Type.STRING },
                  type: { type: Type.STRING },
                },
                required: ["date", "name", "type"],
              },
            },
            verificationTips: { type: Type.STRING },
          },
          required: [
            "schoolName",
            "rotationType",
            "letters",
            "offDayHandling",
            "explanation",
            "detectedHolidays",
            "verificationTips",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("District calendar analysis error:", error);
    return res.json({
      schoolName: req.body.districtName || "Your High School",
      rotationType: "6_day_A_to_F",
      letters: ["A", "B", "C", "D", "E", "F"],
      offDayHandling: "pause_cycle",
      explanation: "Standard 6-day cycle: Holidays and weather closures pause the cycle. The next active school day resumes with the next sequential letter.",
      detectedHolidays: [
        { date: "2026-09-07", name: "Labor Day", type: "holiday" },
        { date: "2026-10-12", name: "Staff Development Day", type: "pd_day" },
        { date: "2026-11-11", name: "Veterans Day", type: "holiday" },
        { date: "2026-11-26", name: "Thanksgiving Recess", type: "break" },
        { date: "2026-11-27", name: "Thanksgiving Recess", type: "break" },
      ],
      verificationTips: "Always cross-check with morning announcements if emergency weather shifts the district schedule.",
      fallback: true,
    });
  }
});

// API: Intelligent Schedule Balancer & Study Slot Allocator
app.post("/api/gemini/balance-schedule", async (req, res) => {
  try {
    const {
      currentDate,
      currentLetterDay,
      pendingHomework,
      schoolSchedule,
      calendarEvents,
      preferences,
    } = req.body;

    const ai = getGeminiClient();
    const prompt = `You are an AI Academic Coach and Master Scheduler for a high school student.
Your mission is to balance homework assignments around their school schedule (accounting for letter day periods like Day ${currentLetterDay || "C"}), free periods / study halls, extracurricular activities, and sleep routines.

Current Date: ${currentDate || new Date().toISOString().split("T")[0]}
Today's Letter Day: ${currentLetterDay || "Day C"}

Pending Homework Assignments:
${JSON.stringify(pendingHomework || [], null, 2)}

School Classes Today & This Week (periods change based on letter day):
${JSON.stringify(schoolSchedule || [], null, 2)}

Existing Calendar Events (sports practices, family dinner, clubs from Apple/Google Calendar):
${JSON.stringify(calendarEvents || [], null, 2)}

Student Preferences:
- Preferred homework end time: ${preferences?.latestEndTime || "9:30 PM"}
- Max study block length before break: ${preferences?.maxContinuousMinutes || 45} minutes
- Use in-school free periods/study halls: ${preferences?.useStudyHalls !== false ? "Yes" : "No"}

Tasks:
1. Allocate realistic study blocks for pending homework before due dates.
2. Prioritize upcoming due dates and heavier difficulty assignments.
3. Suggest using study hall / free periods where available.
4. Avoid overlapping with scheduled sports/extracurricular events.
5. Provide a schedule feasibility rating and 2-3 actionable balancing tips.

Return structured JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scheduleFeasibility: { type: Type.STRING },
            workloadSummary: { type: Type.STRING },
            studyBlocks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  assignmentId: { type: Type.STRING },
                  assignmentTitle: { type: Type.STRING },
                  date: { type: Type.STRING },
                  startTime: { type: Type.STRING },
                  endTime: { type: Type.STRING },
                  durationMinutes: { type: Type.INTEGER },
                  slotType: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                },
                required: [
                  "id",
                  "assignmentTitle",
                  "date",
                  "startTime",
                  "endTime",
                  "durationMinutes",
                  "slotType",
                  "rationale",
                ],
              },
            },
            smartSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            stressWarning: { type: Type.STRING },
          },
          required: [
            "scheduleFeasibility",
            "workloadSummary",
            "studyBlocks",
            "smartSuggestions",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Schedule balance error:", error);
    // Intelligent algorithmic fallback
    const hwList = req.body?.pendingHomework || [];
    const dateStr = req.body?.currentDate || new Date().toISOString().split("T")[0];
    
    const fallbackBlocks = hwList.map((hw: any, idx: number) => {
      const startHour = 16 + idx; // 4:00 PM, 5:00 PM, etc.
      return {
        id: `slot-${idx + 1}`,
        assignmentId: hw.id || `hw-${idx + 1}`,
        assignmentTitle: hw.title || `Homework ${idx + 1}`,
        date: dateStr,
        startTime: `${startHour}:00`,
        endTime: `${startHour}:${hw.estimatedMinutes || 35}`,
        durationMinutes: hw.estimatedMinutes || 35,
        slotType: idx === 0 ? "after_school" : "evening",
        rationale: `Scheduled ahead of ${hw.dueDate || "upcoming class"} with break buffer.`,
      };
    });

    return res.json({
      scheduleFeasibility: "Balanced",
      workloadSummary: `Scheduled ${hwList.length} assignments totaling approximately ${hwList.reduce((acc: number, h: any) => acc + (h.estimatedMinutes || 30), 0)} minutes of focused work.`,
      studyBlocks: fallbackBlocks,
      smartSuggestions: [
        "Take a 10-minute water and stretch break between homework blocks.",
        "Tackle the highest concentration subject first while energy is highest.",
      ],
      stressWarning: null,
      fallback: true,
    });
  }
});

// Vite / static file serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
