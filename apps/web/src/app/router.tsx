import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { lazy, Suspense } from "react";
import { PageLoader } from "@/components/shared/PageLoader";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const ResumeAnalysis = lazy(() => import("@/pages/ResumeAnalysis"));
const AIInterview = lazy(() => import("@/pages/AIInterview"));
const VoiceInterview = lazy(() => import("@/pages/VoiceInterview"));
const CodingAssessment = lazy(() => import("@/pages/CodingAssessment"));
const InterviewHistory = lazy(() => import("@/pages/InterviewHistory"));
const CareerCoach = lazy(() => import("@/pages/CareerCoach"));

const wrap = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: wrap(Dashboard) },
      { path: "resume", element: wrap(ResumeAnalysis) },
      { path: "interview", element: wrap(AIInterview) },
      { path: "voice", element: wrap(VoiceInterview) },
      { path: "coding", element: wrap(CodingAssessment) },
      { path: "history", element: wrap(InterviewHistory) },
      { path: "history/:id", element: wrap(InterviewHistory) },
      { path: "coach", element: wrap(CareerCoach) },
      { path: "achievements", element: wrap(Dashboard) },
      { path: "settings", element: wrap(Dashboard) },
    ],
  },
]);
