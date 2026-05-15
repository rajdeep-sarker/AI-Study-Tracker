import React, { useState, useEffect } from "react";
import { X, Play, Clock, CheckCircle2, XCircle, ArrowRight, ArrowLeft, RefreshCw, Layers } from "lucide-react";
import { cn } from "../lib/utils";
import { SYLLABUS } from "../data";
import { motion, AnimatePresence } from "motion/react";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export function ExamModal({ profile, onClose }: { profile: any; onClose: () => void }) {
  const [step, setStep] = useState<"setup" | "loading" | "exam" | "result">("setup");
  const [selectedSubject, setSelectedSubject] = useState(SYLLABUS[0].subject);
  const [selectedChapter, setSelectedChapter] = useState(SYLLABUS[0].chapters[0]);
  const [numQuestions, setNumQuestions] = useState<number | "">(10);
  const [timeLimitMin, setTimeLimitMin] = useState<number | "">(10);
  const [topic, setTopic] = useState("");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQIndex, setCurrentQIndex] = useState(0);
  
  const [timeLeftTime, setTimeLeftTime] = useState(0); // in seconds
  
  const startTimer = (mins: number) => {
    setTimeLeftTime(mins * 60);
  };

  useEffect(() => {
    if (step === "exam" && timeLeftTime > 0) {
      const timer = setInterval(() => {
        setTimeLeftTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setStep("result");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeLeftTime]);

  // Update chapter dropdown when subject changes
  useEffect(() => {
    const subj = SYLLABUS.find(s => s.subject === selectedSubject);
    if (subj) {
      setSelectedChapter(subj.chapters[0]);
    }
  }, [selectedSubject]);

  const handleGenerate = async () => {
    setStep("loading");
    try {
      const { GoogleGenAI, Type } = await import("@google/genai");
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API key is not configured. Please add it to your environment variables on Netlify.");

      const ai = new GoogleGenAI({ apiKey });
      
      const examSchema = {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING, description: "Question text in Bengali" },
                options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Options in Bengali" },
                correctIndex: { type: Type.INTEGER, description: "Index of the correct option (0 to 3)" },
                explanation: { type: Type.STRING, description: "Short explanation for the correct answer in Bengali" }
              },
              required: ["question", "options", "correctIndex", "explanation"]
            }
          }
        },
        required: ["questions"]
      };

      const topicInstruction = topic ? `\nSpecific Topic Focus: ${topic}` : "";
      const profileInstruction = profile ? `\nTarget Audience: Name: ${profile.name || "N/A"}, Group: ${profile.group || "N/A"}, College: ${profile.college || "N/A"}, HSC Year: ${profile.hscYear || "N/A"}` : "";

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `Create a multiple choice exam in Bengali for HSC students. ${profileInstruction}
Subject: ${selectedSubject}
Chapter: ${selectedChapter}${topicInstruction}
Number of questions: ${Number(numQuestions) || 5}
Ensure the questions are academic, accurate, and suitable for HSC level. ALL questions and options MUST be in Bengali.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: examSchema,
          temperature: 0.7,
        }
      });

      if (!response.text) throw new Error("No text returned from Gemini");
      const data = JSON.parse(response.text);
      
      setQuestions(data.questions);
      setAnswers({});
      setCurrentQIndex(0);
      startTimer(Number(timeLimitMin) || 10);
      setStep("exam");
    } catch (error: any) {
      console.error("Client-side Gemini Error:", error);
      alert("Failed to generate exam. " + error.message);
      setStep("setup");
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) score++;
    });
    return score;
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#0b0e14] border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Layers className="w-5 h-5" />
            </span>
            Live Mock Exam
          </h2>
          {step === "setup" && (
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Setup State */}
        {step === "setup" && (
          <div className="p-6 md:p-8 flex-1 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  {SYLLABUS.map(s => <option key={s.subject} value={s.subject}>{s.subject}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Chapter</label>
                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  {SYLLABUS.find(s => s.subject === selectedSubject)?.chapters.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Specific Topic (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Dot Product, Projectile Motion..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Number of Questions</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    placeholder="e.g. 10"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(e.target.value ? Number(e.target.value) : "")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Time Limit (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    placeholder="e.g. 15"
                    value={timeLimitMin}
                    onChange={(e) => setTimeLimitMin(e.target.value ? Number(e.target.value) : "")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={handleGenerate}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
                >
                  <Play className="w-5 h-5 fill-current" /> Start Exam
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {step === "loading" && (
          <div className="p-12 flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin" />
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Generating Questions...</h3>
              <p className="text-slate-400">Our AI is preparing an exam on {selectedChapter}. Please wait.</p>
            </div>
          </div>
        )}

        {/* Exam State */}
        {step === "exam" && questions.length > 0 && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center text-sm font-medium">
              <span className="text-slate-300">Question {currentQIndex + 1} of {questions.length}</span>
              <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border", timeLeftTime < 60 ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-slate-900 border-slate-700 text-slate-300")}>
                <Clock className="w-4 h-4" />
                <span className="font-mono text-base">{formatTime(timeLeftTime)}</span>
              </div>
            </div>

            <div className="p-6 md:p-8 flex-1 overflow-y-auto">
              <h3 className="text-xl md:text-2xl font-medium text-white mb-8 leading-relaxed">
                {questions[currentQIndex].question}
              </h3>
              
              <div className="space-y-3">
                {questions[currentQIndex].options.map((opt, idx) => {
                  const isSelected = answers[currentQIndex] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setAnswers({ ...answers, [currentQIndex]: idx })}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4",
                        isSelected 
                          ? "bg-indigo-600/20 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]" 
                          : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700"
                      )}
                    >
                      <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0", isSelected ? "border-indigo-500" : "border-slate-600")}>
                        {isSelected && <div className="w-3 h-3 bg-indigo-500 rounded-full" />}
                      </div>
                      <span className="text-base">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between">
              <button
                onClick={() => setCurrentQIndex(Math.max(0, currentQIndex - 1))}
                disabled={currentQIndex === 0}
                className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-300 font-medium hover:bg-slate-900 disabled:opacity-50 disabled:hover:bg-transparent flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Prev
              </button>
              
              {currentQIndex === questions.length - 1 ? (
                <button
                  onClick={() => setStep("result")}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5" /> Submit Exam
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQIndex(currentQIndex + 1)}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-white font-medium flex items-center gap-2 transition-colors"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Result State */}
        {step === "result" && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="p-6 md:p-8 bg-slate-950 border-b border-slate-800 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-500/10 rounded-full border-2 border-indigo-500/30 mb-4">
                <span className="text-3xl font-black text-indigo-400">{calculateScore()}<span className="text-xl text-slate-500">/{questions.length}</span></span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Exam Completed!</h3>
              <p className="text-slate-400 text-sm">
                Subject: <strong className="text-slate-300">{selectedSubject}</strong> &middot; Chapter: <strong className="text-slate-300">{selectedChapter}</strong>
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {questions.map((q, qIdx) => {
                const userAns = answers[qIdx];
                const isCorrect = userAns === q.correctIndex;
                const isUnanswered = userAns === undefined;

                return (
                  <div key={qIdx} className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                    <div className="flex gap-3 mb-4">
                      {isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-rose-500 shrink-0" />
                      )}
                      <h4 className="font-medium text-white text-lg">{qIdx + 1}. {q.question}</h4>
                    </div>

                    <div className="space-y-2 pl-9 mb-4">
                      {q.options.map((opt, oIdx) => {
                        const isCorrectOption = oIdx === q.correctIndex;
                        const isSelectedIncorrect = !isCorrectOption && oIdx === userAns;

                        return (
                          <div 
                            key={oIdx} 
                            className={cn(
                              "p-3 rounded-xl border text-sm flex items-center gap-3",
                              isCorrectOption ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                              isSelectedIncorrect ? "bg-rose-500/10 border-rose-500/30 text-rose-400 line-through opacity-70" :
                              "bg-slate-900 border-slate-800 text-slate-400"
                            )}
                          >
                            <span className="font-mono text-xs opacity-50">{['A', 'B', 'C', 'D'][oIdx]}</span>
                            <span>{opt}</span>
                            {isCorrectOption && <CheckCircle2 className="w-4 h-4 ml-auto text-emerald-500/50" />}
                            {isSelectedIncorrect && <XCircle className="w-4 h-4 ml-auto text-rose-500/50" />}
                          </div>
                        );
                      })}
                    </div>

                    {(!isCorrect || isUnanswered) && (
                      <div className="pl-9 mt-4">
                        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
                          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Explanation</p>
                          <p className="text-sm text-slate-300 leading-relaxed">{q.explanation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-5 border-t border-slate-800 bg-slate-950 flex justify-between">
              <button
                onClick={() => setStep("setup")}
                className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-300 font-medium hover:bg-slate-900 transition-colors"
              >
                Start New Exam
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
