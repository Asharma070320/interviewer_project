import { useState } from "react";
import Editor from "@monaco-editor/react";
import {
  Play, CheckCircle2, XCircle, Clock, ChevronRight,
  Lightbulb, Code2, BarChart3, Trophy, RefreshCw, Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { CodingLanguage, CodingProblem } from "@/types";

const PROBLEMS: CodingProblem[] = [
  {
    id: "1", title: "Two Sum", difficulty: "beginner", category: "Array",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\n**Example 1:**\n\`\`\`\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\n\`\`\`\n\n**Example 2:**\n\`\`\`\nInput: nums = [3,2,4], target = 6\nOutput: [1,2]\n\`\`\``,
    starterCode: {
      javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n  // Your solution here\n  \n}`,
      typescript: `function twoSum(nums: number[], target: number): number[] {\n  // Your solution here\n  \n}`,
      python: `def two_sum(nums: list[int], target: int) -> list[int]:\n    # Your solution here\n    pass`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your solution here\n        return new int[]{};\n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your solution here\n    }\n};`,
    },
    testCases: [
      { id: "1", input: "[2,7,11,15], 9", expectedOutput: "[0,1]" },
      { id: "2", input: "[3,2,4], 6", expectedOutput: "[1,2]" },
      { id: "3", input: "[3,3], 6", expectedOutput: "[0,1]", isHidden: true },
    ],
    constraints: ["2 ≤ nums.length ≤ 10⁴", "-10⁹ ≤ nums[i] ≤ 10⁹", "-10⁹ ≤ target ≤ 10⁹"],
    hints: ["Try using a hash map to store previously seen values", "For each number, check if target - number exists in your map"],
    timeLimit: 2000, memoryLimit: 256,
  },
  {
    id: "2", title: "Valid Parentheses", difficulty: "beginner", category: "Stack",
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.\n\n**Example:**\n\`\`\`\nInput: s = "()[]{}"\nOutput: true\nInput: s = "(]"\nOutput: false\n\`\`\``,
    starterCode: {
      javascript: `function isValid(s) {\n  // Your solution here\n}`,
      typescript: `function isValid(s: string): boolean {\n  // Your solution here\n  return false;\n}`,
      python: `def is_valid(s: str) -> bool:\n    # Your solution here\n    pass`,
      java: `class Solution {\n    public boolean isValid(String s) {\n        return false;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    bool isValid(string s) {\n        return false;\n    }\n};`,
    },
    testCases: [
      { id: "1", input: '"()[]{}"', expectedOutput: "true" },
      { id: "2", input: '"(]"', expectedOutput: "false" },
      { id: "3", input: '"([)]"', expectedOutput: "false", isHidden: true },
    ],
    constraints: ["1 ≤ s.length ≤ 10⁴", "s consists of parentheses only '()[]{}'"],
    hints: ["Use a stack data structure", "Push opening brackets, pop and match for closing brackets"],
    timeLimit: 2000, memoryLimit: 256,
  },
  {
    id: "3", title: "Longest Substring Without Repeating Characters", difficulty: "intermediate", category: "Sliding Window",
    description: `Given a string s, find the length of the longest substring without repeating characters.\n\n**Example:**\n\`\`\`\nInput: s = "abcabcbb"\nOutput: 3 (the answer is "abc")\n\`\`\``,
    starterCode: {
      javascript: `function lengthOfLongestSubstring(s) {\n  // Your solution here\n}`,
      typescript: `function lengthOfLongestSubstring(s: string): number {\n  return 0;\n}`,
      python: `def length_of_longest_substring(s: str) -> int:\n    pass`,
      java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        return 0;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        return 0;\n    }\n};`,
    },
    testCases: [
      { id: "1", input: '"abcabcbb"', expectedOutput: "3" },
      { id: "2", input: '"bbbbb"', expectedOutput: "1" },
      { id: "3", input: '"pwwkew"', expectedOutput: "3" },
    ],
    constraints: ["0 ≤ s.length ≤ 5 × 10⁴", "s consists of English letters, digits, symbols and spaces"],
    hints: ["Use a sliding window with two pointers", "Track character positions with a hash map"],
    timeLimit: 2000, memoryLimit: 256,
  },
];

const difficultyColors = {
  beginner: "text-emerald-500",
  intermediate: "text-amber-500",
  advanced: "text-orange-500",
  expert: "text-red-500",
};

export default function CodingAssessment() {
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem>(PROBLEMS[0]);
  const [language, setLanguage] = useState<CodingLanguage>("javascript");
  const [code, setCode] = useState(PROBLEMS[0].starterCode.javascript);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [output, setOutput] = useState<null | { passed: number; total: number; results: Array<{ passed: boolean; input: string; expected: string; actual: string }> }>(null);
  const [aiReview, setAiReview] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  const selectProblem = (problem: CodingProblem) => {
    setSelectedProblem(problem);
    setCode(problem.starterCode[language]);
    setOutput(null);
    setAiReview("");
    setShowHint(false);
    setHintIndex(0);
  };

  const handleLanguageChange = (lang: string) => {
    const l = lang as CodingLanguage;
    setLanguage(l);
    setCode(selectedProblem.starterCode[l]);
  };

  const runCode = async () => {
    setRunning(true);
    setOutput(null);
    await new Promise((r) => setTimeout(r, 1500));
    const results = selectedProblem.testCases.filter((t) => !t.isHidden).map((tc) => ({
      passed: Math.random() > 0.3,
      input: tc.input,
      expected: tc.expectedOutput,
      actual: tc.expectedOutput,
    }));
    setOutput({ passed: results.filter((r) => r.passed).length, total: results.length, results });
    setRunning(false);
  };

  const submitCode = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 2000));
    const results = selectedProblem.testCases.map((tc) => ({
      passed: Math.random() > 0.15,
      input: tc.input,
      expected: tc.expectedOutput,
      actual: tc.expectedOutput,
    }));
    setOutput({ passed: results.filter((r) => r.passed).length, total: results.length, results });
    setAiReview(`**AI Code Review:**\n\nYour solution shows good understanding of the problem. The time complexity is O(n) with a hash map approach which is optimal.\n\n**Strengths:**\n- Clean and readable code\n- Edge cases handled properly\n\n**Suggestions:**\n- Consider adding early termination for empty arrays\n- Variable naming could be more descriptive`);
    setSubmitting(false);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Problem list sidebar */}
      <div className="w-64 shrink-0 border-r bg-background flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-bold text-sm">Coding Assessment</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{PROBLEMS.length} problems</p>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {PROBLEMS.map((p) => (
              <button
                key={p.id}
                onClick={() => selectProblem(p)}
                className={cn(
                  "w-full text-left p-3 rounded-lg text-sm transition-all",
                  selectedProblem.id === p.id
                    ? "bg-primary/10 border border-primary/30"
                    : "hover:bg-accent"
                )}
              >
                <p className="font-medium truncate">{p.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn("text-[10px] font-semibold capitalize", difficultyColors[p.difficulty])}>
                    {p.difficulty}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{p.category}</span>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Problem description */}
        <div className="w-[45%] border-r flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h3 className="font-bold">{selectedProblem.title}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge className={cn("text-[10px] capitalize", difficultyColors[selectedProblem.difficulty])} variant="outline">
                  {selectedProblem.difficulty}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">{selectedProblem.category}</Badge>
              </div>
            </div>
          </div>
          <Tabs defaultValue="description" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-4 mt-2 self-start">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="hints">Hints</TabsTrigger>
              <TabsTrigger value="ai-review">AI Review</TabsTrigger>
            </TabsList>
            <ScrollArea className="flex-1 px-4 pb-4">
              <TabsContent value="description" className="mt-3 space-y-4">
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
                  {selectedProblem.description.split("\n").map((line, i) => (
                    <p key={i} className="mb-1">{line}</p>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Constraints</p>
                  <ul className="space-y-1">
                    {selectedProblem.constraints.map((c, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-muted-foreground" /> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
              <TabsContent value="hints" className="mt-3 space-y-3">
                {selectedProblem.hints.map((hint, i) => (
                  <Card key={i} className={cn(i > hintIndex && "opacity-40 pointer-events-none")}>
                    <CardContent className="p-3 flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-sm">{i <= hintIndex ? hint : "Click 'Show Hint' to reveal"}</p>
                    </CardContent>
                  </Card>
                ))}
                {hintIndex < selectedProblem.hints.length - 1 && (
                  <Button variant="outline" size="sm" onClick={() => setHintIndex((h) => h + 1)}>
                    <Lightbulb className="h-4 w-4" /> Show Next Hint
                  </Button>
                )}
              </TabsContent>
              <TabsContent value="ai-review" className="mt-3">
                {aiReview ? (
                  <div className="text-sm whitespace-pre-line text-muted-foreground">{aiReview}</div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                    <Sparkles className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Submit your code to get AI review</p>
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Editor + Output */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor toolbar */}
          <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/30">
            <Code2 className="h-4 w-4 text-muted-foreground" />
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-36 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
              <Clock className="h-3.5 w-3.5" />
              <span>Limit: {selectedProblem.timeLimit}ms</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCode(selectedProblem.starterCode[language])}>
                <RefreshCw className="h-3.5 w-3.5" /> Reset
              </Button>
              <Button variant="outline" size="sm" loading={running} onClick={runCode}>
                <Play className="h-3.5 w-3.5" /> Run
              </Button>
              <Button size="sm" variant="gradient" loading={submitting} onClick={submitCode}>
                <Trophy className="h-3.5 w-3.5" /> Submit
              </Button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={language === "cpp" ? "cpp" : language}
              value={code}
              onChange={(v) => setCode(v ?? "")}
              theme="vs-dark"
              options={{
                fontSize: 13,
                fontFamily: "JetBrains Mono, Fira Code, monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 12, bottom: 12 },
                lineNumbers: "on",
                renderLineHighlight: "all",
                suggestOnTriggerCharacters: true,
                tabSize: 2,
                wordWrap: "on",
              }}
            />
          </div>

          {/* Test output */}
          {output && (
            <div className="border-t">
              <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 border-b">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Test Results</span>
                <Badge className={output.passed === output.total ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"} variant="outline">
                  {output.passed}/{output.total} passed
                </Badge>
              </div>
              <ScrollArea className="h-32">
                <div className="p-3 space-y-2">
                  {output.results.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs">
                      {r.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                      )}
                      <span className="text-muted-foreground">Input: <code className="text-foreground">{r.input}</code></span>
                      <span className="text-muted-foreground">Expected: <code className="text-foreground">{r.expected}</code></span>
                      {!r.passed && <span className="text-muted-foreground">Got: <code className="text-red-400">{r.actual}</code></span>}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
