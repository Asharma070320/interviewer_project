import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import type { ResumeAnalysis } from "@/types";

interface ResumeStore {
  analyses: ResumeAnalysis[];
  activeAnalysisId: string | null;
  addAnalysis: (analysis: ResumeAnalysis) => void;
  setActiveAnalysis: (id: string | null) => void;
  getActiveAnalysis: () => ResumeAnalysis | undefined;
  removeAnalysis: (id: string) => void;
}

export const useResumeStore = create<ResumeStore>()(
  devtools(
    persist(
      (set, get) => ({
        analyses: [],
        activeAnalysisId: null,

        addAnalysis: (analysis) =>
          set((state) => ({
            analyses: [analysis, ...state.analyses],
            activeAnalysisId: analysis.id,
          })),

        setActiveAnalysis: (id) => set({ activeAnalysisId: id }),

        getActiveAnalysis: () => {
          const { analyses, activeAnalysisId } = get();
          return analyses.find((a) => a.id === activeAnalysisId);
        },

        removeAnalysis: (id) =>
          set((state) => ({
            analyses: state.analyses.filter((a) => a.id !== id),
            activeAnalysisId: state.activeAnalysisId === id ? null : state.activeAnalysisId,
          })),
      }),
      { name: "resume-store" }
    )
  )
);
