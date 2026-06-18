import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import type { InterviewSession, DashboardStats, ScoreHistory } from "@/types";

interface InterviewStore {
  sessions: InterviewSession[];
  activeSessionId: string | null;
  stats: DashboardStats;
  scoreHistory: ScoreHistory[];
  addSession: (session: InterviewSession) => void;
  updateSession: (id: string, updates: Partial<InterviewSession>) => void;
  setActiveSession: (id: string | null) => void;
  getActiveSession: () => InterviewSession | undefined;
  getSessionById: (id: string) => InterviewSession | undefined;
  clearAll: () => void;
}

const mockStats: DashboardStats = {
  totalInterviews: 12,
  averageScore: 7.4,
  communicationScore: 7.8,
  technicalScore: 7.1,
  problemSolvingScore: 6.9,
  confidenceScore: 7.5,
  interviewsThisWeek: 3,
  scoreImprovement: 0.8,
  practiceStreak: 5,
};

const mockHistory: ScoreHistory[] = [
  { date: "2026-06-01", overall: 6.2, communication: 6.5, technical: 5.8 },
  { date: "2026-06-05", overall: 6.8, communication: 7.0, technical: 6.4 },
  { date: "2026-06-08", overall: 7.0, communication: 7.2, technical: 6.7 },
  { date: "2026-06-10", overall: 7.1, communication: 7.4, technical: 6.8 },
  { date: "2026-06-12", overall: 7.3, communication: 7.6, technical: 7.0 },
  { date: "2026-06-15", overall: 7.4, communication: 7.8, technical: 7.1 },
  { date: "2026-06-18", overall: 7.6, communication: 8.0, technical: 7.3 },
];

export const useInterviewStore = create<InterviewStore>()(
  devtools(
    persist(
      (set, get) => ({
        sessions: [],
        activeSessionId: null,
        stats: mockStats,
        scoreHistory: mockHistory,

        addSession: (session) =>
          set((state) => ({ sessions: [session, ...state.sessions] })),

        updateSession: (id, updates) =>
          set((state) => ({
            sessions: state.sessions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
          })),

        setActiveSession: (id) => set({ activeSessionId: id }),

        getActiveSession: () => {
          const { sessions, activeSessionId } = get();
          return sessions.find((s) => s.id === activeSessionId);
        },

        getSessionById: (id) => get().sessions.find((s) => s.id === id),

        clearAll: () => set({ sessions: [], activeSessionId: null }),
      }),
      { name: "interview-store", partialize: (state) => ({ sessions: state.sessions }) }
    )
  )
);
