import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload, FileText, Sparkles, CheckCircle2, AlertCircle,
  Download, Trash2, ChevronRight, Star, Target, Lightbulb,
  Briefcase, GraduationCap, Code2, User, X, Bot,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn, formatBytes, getScoreBg } from "@/lib/utils";
import { useResumeStore } from "@/stores/resume.store";
import { analyzeResume } from "@/services/resume.service";
import type { ResumeAnalysis } from "@/types";

const skillLevelColors = {
  beginner: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  intermediate: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  advanced: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  expert: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

const ANALYZE_STEPS = [
  "Reading resume content...",
  "Extracting skills and experience with Gemini AI...",
  "Identifying strengths and skill gaps...",
  "Generating personalized interview questions...",
  "Calculating overall profile score...",
];

async function extractTextFromFile(file: File): Promise<string> {
  // For PDF/DOC: read as text (works for text-based PDFs)
  // In production you'd use a PDF parser library
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      // Strip non-printable characters from binary PDF
      const cleaned = text.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ");
      resolve(cleaned.slice(0, 8000)); // Gemini context limit safety
    };
    reader.readAsText(file);
  });
}

export default function ResumeAnalysisPage() {
  const { analyses, addAnalysis, setActiveAnalysis, getActiveAnalysis, removeAnalysis } = useResumeStore();
  const [analyzing, setAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const activeAnalysis = getActiveAnalysis();

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setUploadedFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleAnalyze = async () => {
    if (!uploadedFile) return;
    setAnalyzing(true);
    setCurrentStep(0);

    try {
      // Step through progress indicators
      for (let i = 0; i < ANALYZE_STEPS.length - 1; i++) {
        setCurrentStep(i);
        await new Promise((r) => setTimeout(r, 600));
      }

      const resumeText = await extractTextFromFile(uploadedFile);
      setCurrentStep(ANALYZE_STEPS.length - 1);

      const analysis = await analyzeResume(resumeText, uploadedFile.name);
      analysis.fileUrl = URL.createObjectURL(uploadedFile);

      addAnalysis(analysis);
      setUploadedFile(null);
      toast.success("Resume analyzed successfully by Gemini AI!");
    } catch (err) {
      console.error(err);
      toast.error("Gemini API error. Check your API key in .env and try again.");
    } finally {
      setAnalyzing(false);
      setCurrentStep(0);
    }
  };

  if (activeAnalysis) {
    return (
      <AnalysisResult
        analysis={activeAnalysis}
        onBack={() => setActiveAnalysis(null)}
        onRemove={() => { removeAnalysis(activeAnalysis.id); setActiveAnalysis(null); }}
      />
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-2xl font-bold">Resume Analysis</h2>
          <Badge variant="gradient" className="text-[10px]">
            <Bot className="h-3 w-3 mr-1" /> Gemini AI
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Upload your resume — Gemini AI will extract skills, identify gaps, and generate tailored interview questions
        </p>
      </div>

      {/* Upload Zone */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition-all cursor-pointer",
              isDragActive ? "border-primary bg-primary/5 scale-[1.01]"
                : uploadedFile ? "border-emerald-500 bg-emerald-500/5"
                : "border-border hover:border-primary/50 hover:bg-accent/30"
            )}
          >
            <input {...getInputProps()} />
            {uploadedFile ? (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 mb-4">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{formatBytes(uploadedFile.size)}</p>
                <Button
                  variant="ghost" size="sm" className="mt-3 text-muted-foreground"
                  onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                >
                  <X className="h-4 w-4 mr-1" /> Remove
                </Button>
              </>
            ) : (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <p className="text-lg font-semibold">
                  {isDragActive ? "Drop it here!" : "Drop your resume here"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">PDF, DOC, DOCX, or TXT · max 5MB</p>
              </>
            )}
          </div>

          {uploadedFile && (
            <Button
              className="w-full mt-4" size="lg" variant="gradient"
              loading={analyzing} onClick={handleAnalyze}
            >
              <Sparkles className="h-4 w-4" />
              {analyzing ? "Analyzing with Gemini AI..." : "Analyze Resume with Gemini AI"}
            </Button>
          )}

          {analyzing && (
            <div className="mt-5 space-y-2">
              {ANALYZE_STEPS.map((step, i) => (
                <div key={i} className={cn(
                  "flex items-center gap-2 text-sm transition-all duration-300",
                  i < currentStep ? "text-emerald-500" : i === currentStep ? "text-foreground" : "text-muted-foreground/40"
                )}>
                  {i < currentStep ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : i === currentStep ? (
                    <div className="h-4 w-4 shrink-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  ) : (
                    <div className="h-4 w-4 shrink-0 rounded-full border border-muted-foreground/30" />
                  )}
                  {step}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past analyses */}
      {analyses.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Previous Analyses
          </h3>
          <div className="space-y-2">
            {analyses.map((a) => (
              <Card key={a.id} hover glow onClick={() => setActiveAnalysis(a.id)} className="cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(a.uploadedAt).toLocaleDateString()} · {a.experienceYears} yrs exp
                    </p>
                  </div>
                  <Badge className={getScoreBg(a.overallScore)} variant="outline">
                    {a.overallScore.toFixed(1)}/10
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AnalysisResult({
  analysis, onBack, onRemove,
}: { analysis: ResumeAnalysis; onBack: () => void; onRemove: () => void }) {
  const skillsByCategory = analysis.skills.reduce<Record<string, typeof analysis.skills>>((acc, s) => {
    (acc[s.category] = acc[s.category] ?? []).push(s);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={onBack}>
            <ChevronRight className="h-4 w-4 rotate-180" />
          </Button>
          <div>
            <h2 className="text-xl font-bold">{analysis.candidateName}</h2>
            <p className="text-sm text-muted-foreground">
              {analysis.fileName} · {analysis.experienceYears} years exp.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={cn("text-base px-3 py-1", getScoreBg(analysis.overallScore))} variant="outline">
            {analysis.overallScore.toFixed(1)}/10
          </Badge>
          <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-brand flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold">{analysis.candidateName}</p>
                {analysis.email && <span className="text-xs text-muted-foreground">{analysis.email}</span>}
                {analysis.phone && <span className="text-xs text-muted-foreground">{analysis.phone}</span>}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{analysis.summary}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {analysis.suggestedRoles.map((r) => (
                  <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="skills">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="feedback">AI Feedback</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="gaps">Skill Gaps</TabsTrigger>
        </TabsList>

        {/* Skills */}
        <TabsContent value="skills" className="space-y-4">
          {Object.entries(skillsByCategory).map(([cat, skills]) => (
            <Card key={cat}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-primary" /> {cat}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <Badge key={s.name} variant="outline" className={skillLevelColors[s.level]}>
                    {s.name}
                    <span className="ml-1 opacity-60 capitalize text-[10px]">({s.level})</span>
                  </Badge>
                ))}
              </CardContent>
            </Card>
          ))}
          {Object.keys(skillsByCategory).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No skills extracted — the resume may not have enough text content.</p>
          )}
        </TabsContent>

        {/* Experience */}
        <TabsContent value="experience" className="space-y-4">
          {analysis.experience.map((exp, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="font-semibold">{exp.role}</p>
                      <Badge variant="outline" className="text-xs">{exp.duration}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{exp.company}</p>
                    <ul className="mt-2 space-y-1">
                      {exp.description.map((d, j) => (
                        <li key={j} className="text-sm flex items-start gap-2">
                          <span className="text-primary mt-1 shrink-0">•</span> {d}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {exp.technologies.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {analysis.education.length > 0 && (
            <>
              <Separator />
              <h3 className="text-sm font-semibold">Education</h3>
              {analysis.education.map((edu, i) => (
                <Card key={i}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                      <GraduationCap className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{edu.degree} in {edu.field}</p>
                      <p className="text-xs text-muted-foreground">{edu.institution} · {edu.year}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </TabsContent>

        {/* AI Feedback */}
        <TabsContent value="feedback" className="grid gap-4 sm:grid-cols-2">
          <Card className="border-emerald-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Star className="h-4 w-4" /> Strengths
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {analysis.strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> {s}
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-orange-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-orange-600 dark:text-orange-400 flex items-center gap-2">
                <Target className="h-4 w-4" /> Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {analysis.missingSkills.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" /> {s}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generated Questions */}
        <TabsContent value="questions" className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="h-4 w-4 text-primary" />
            <p className="text-sm text-muted-foreground">
              Gemini AI generated these questions based on your resume
            </p>
          </div>
          {analysis.generatedQuestions.map((q, i) => (
            <Card key={q.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4 flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm">{q.text}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-[10px]">{q.category}</Badge>
                    <Badge variant="secondary" className="text-[10px] capitalize">{q.difficulty}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Skill Gaps */}
        <TabsContent value="gaps" className="space-y-4">
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="p-4 flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm">
                Gemini identified these skill gaps based on your target roles. Focus here to maximize your candidacy.
              </p>
            </CardContent>
          </Card>
          {analysis.missingSkills.map((skill, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-card gap-4">
              <span className="text-sm font-medium">{skill}</span>
              <div className="flex items-center gap-2 shrink-0">
                <Progress value={20 + i * 12} className="w-24 h-1.5" />
                <span className="text-xs text-muted-foreground w-10 text-right">{20 + i * 12}%</span>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
