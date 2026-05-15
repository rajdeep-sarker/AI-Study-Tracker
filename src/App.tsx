import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  CircleDashed,
  Clock,
  Download,
  Upload,
  RotateCcw,
  BookOpen,
  GraduationCap,
  Target,
  LogOut,
  Bot
} from "lucide-react";
import { cn } from "./lib/utils";
import { SYLLABUS, TASKS } from "./data";
import { useTracker, useAuth } from "./hooks/useTracker";
import { TaskStatus } from "./types";
import { Login } from "./components/Login";
import { logoutUser } from "./lib/firebase";
import { ChatBox } from "./components/ChatBox";
import { ExamModal } from "./components/ExamModal";

import { ProfileModal } from "./components/ProfileModal";

const TaskIcon = ({ status }: { status: TaskStatus }) => {
  switch (status) {
    case 0:
      return <CircleDashed className="w-5 h-5 text-slate-600" />;
    case 1:
      return <Clock className="w-5 h-5 text-warning animate-pulse" />;
    case 2:
      return <CheckCircle2 className="w-5 h-5 text-success" />;
  }
};

const ProgressBar = ({
  progress,
  className,
  colorClass = "bg-success",
}: {
  progress: number;
  className?: string;
  colorClass?: string;
}) => (
  <div className={cn("w-full bg-slate-800 rounded-full h-2.5 overflow-hidden", className)}>
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn("h-full rounded-full", colorClass)}
    />
  </div>
);

const ChapterRow = React.memo(({ 
  subject, 
  chap, 
  tasksArray, 
  chapProgress, 
  toggleStatus 
}: { 
  subject: string; 
  chap: string; 
  tasksArray: TaskStatus[]; 
  chapProgress: number; 
  toggleStatus: (subject: string, chapter: string, taskIndex: number) => void 
}) => {
  const isComplete = chapProgress === 100;

  return (
    <tr className="bg-slate-900/30 rounded-xl group hover:bg-slate-800/40 transition-colors">
      <td className="p-3 text-slate-300 font-medium whitespace-nowrap sticky left-0 z-10 bg-slate-950/90 group-hover:bg-slate-900 rounded-l-xl shadow-[4px_0_12px_rgba(0,0,0,0.5)]">
        <span className={cn(isComplete && "text-success bg-success/10 px-2 py-1 rounded-md transition-colors")}>
          {chap}
        </span>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-3">
          <ProgressBar progress={chapProgress} colorClass={isComplete ? "bg-success" : "bg-primary"} className="bg-slate-800/50" />
          <span className={cn(
            "text-xs font-mono w-10 text-right",
            isComplete ? "text-success font-bold" : "text-slate-500 text-[10px]"
          )}>
            {Math.round(chapProgress)}%
          </span>
        </div>
      </td>
      {tasksArray.map((status, idx) => (
        <td key={idx} className="p-0 border-r border-transparent">
          <button
            onClick={() => toggleStatus(subject, chap, idx)}
            className={cn(
              "w-full h-full min-h-[44px] flex items-center justify-center transition-all rounded-lg m-0.5",
              status === 0 && "hover:bg-slate-800",
              status === 1 && "bg-warning/10 hover:bg-warning/20 border border-warning/30",
              status === 2 && "bg-success/10 hover:bg-success/20 border border-success/30"
            )}
          >
            <motion.div
              initial={false}
              animate={{ scale: [0.8, 1.2, 1] }}
              transition={{ duration: 0.2 }}
              key={status}
            >
              <TaskIcon status={status} />
            </motion.div>
          </button>
        </td>
      ))}
    </tr>
  );
});

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const {
    data,
    profile,
    loadingData,
    toggleStatus,
    getChapterProgress,
    getSubjectProgress,
    getOverallProgress,
    resetData,
    exportData,
    importData,
    updateProfile,
  } = useTracker(user);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showChat, setShowChat] = useState(false);
  const [showExam, setShowExam] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Clock className="w-10 h-10 text-primary animate-spin" /></div>;
  }

  if (!user) {
    return <Login />;
  }

  if (loadingData || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 gap-4">
        <Clock className="w-10 h-10 text-primary animate-spin" />
        <p className="text-slate-400">Loading your progress...</p>
      </div>
    );
  }

  const { percent, done, total } = getOverallProgress();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans pb-20 relative">
      <header className="pt-8 pb-6 px-4 md:px-8 border-b-0">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-primary">
                HSC Tracker Pro <span className="text-slate-500 font-normal text-xl ml-2">/ Study Dashboard</span>
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Your syllabus overview and live progress tracking {user.email && `(${user.email})`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowExam(true)}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-500/20"
              >
                📝 Take Exam
              </button>
              <button
                onClick={() => setShowChat(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-400 rounded-xl text-sm font-semibold transition-all shadow-sm"
              >
                <Bot className="w-4 h-4" /> AI Assistant
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold transition-all shadow-sm hidden md:flex"
              >
                <Upload className="w-4 h-4" /> Import
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) importData(e.target.files[0]);
                }}
              />
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold transition-all shadow-sm hidden md:flex"
              >
                <Download className="w-4 h-4" /> Export
              </button>
              <button
                onClick={() => {
                  if (confirm("Are you sure? All progress will be lost!")) resetData();
                }}
                className="flex items-center gap-2 px-5 py-2 bg-primary-dark hover:bg-primary-hover text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-primary/20 hidden md:flex"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              <button
                onClick={() => document.body.classList.toggle('light-mode')}
                className="text-slate-400 hover:text-white px-3 py-2 flex items-center justify-center transition-all bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl"
                title="Toggle Theme"
              >
                🌓 Theme
              </button>
              <button
                onClick={() => setShowProfile(true)}
                className="text-slate-400 hover:text-white px-3 py-2 flex items-center justify-center transition-all bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl"
                title="Edit Profile"
              >
                🎓 Profile
              </button>
              <button
                onClick={logoutUser}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold transition-all shadow-sm"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>

          {/* Stats Grid - Styled as mini Bento pieces */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex flex-col justify-center">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Overall Progress</h3>
                  <div className="text-4xl font-black text-white">{percent.toFixed(1)}%</div>
                </div>
                <div className="p-3 bg-indigo-500/10 text-primary rounded-xl">
                  <Target className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4">
                <ProgressBar
                  progress={percent}
                  colorClass="bg-gradient-to-r from-primary to-success"
                  className="h-3 bg-slate-800"
                />
              </div>
            </div>
            
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex flex-col justify-center">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Tasks Completed</h3>
                  <div className="flex items-baseline gap-1">
                    <div className="text-4xl font-black text-white">{done}</div>
                    <div className="text-slate-500 font-medium">/ {total}</div>
                  </div>
                </div>
                <div className="p-3 bg-emerald-500/10 text-success rounded-xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900/30 to-slate-900/50 border border-indigo-500/20 rounded-3xl p-6 flex flex-col justify-center">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Subjects</h3>
                  <div className="text-4xl font-black text-white">{SYLLABUS.length}</div>
                </div>
                <div className="p-3 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/20">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 md:px-8 mt-6 space-y-8 w-full">
        {SYLLABUS.map((sub) => {
          const subProgress = getSubjectProgress(sub.subject);
          return (
            <motion.section 
              key={sub.subject} 
              className="scroll-mt-32"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              {/* Data Table Container - Bento Styled */}
              <div className="bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
                <div className="p-5 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900/40 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-indigo-500/20 text-primary rounded-xl border border-indigo-500/20">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg text-white">
                        {sub.subject}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {sub.chapters.length} Chapters • {TASKS.length} Tasks per chapter
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-64">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2 text-slate-400">
                      <span>Subject Progress</span>
                      <span className="text-primary">{subProgress.toFixed(1)}%</span>
                    </div>
                    <ProgressBar
                      progress={subProgress}
                      colorClass="bg-gradient-to-r from-primary to-blue-400"
                      className="h-2 bg-slate-800"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto p-4 flex-grow">
                  <table className="w-full border-separate border-spacing-y-2 text-sm">
                    <thead className="text-left text-slate-500 text-[10px] uppercase tracking-widest">
                      <tr>
                        <th className="pb-2 px-3 font-medium whitespace-nowrap sticky left-0 z-20 bg-slate-950/80 backdrop-blur">
                          Chapter Name
                        </th>
                        <th className="pb-2 px-4 font-medium text-center whitespace-nowrap min-w-[120px]">
                          Progress
                        </th>
                        {TASKS.map((task) => (
                          <th
                            key={task}
                            className="pb-2 px-4 font-medium text-center whitespace-nowrap group relative"
                          >
                            <span className="inline-block cursor-help">
                              {task}
                            </span>
                            <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-xs rounded border border-slate-700 z-50 whitespace-nowrap text-white">
                              {task}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sub.chapters.map((chap) => {
                        const chapProgress = getChapterProgress(sub.subject, chap);
                        return (
                          <ChapterRow
                            key={chap}
                            subject={sub.subject}
                            chap={chap}
                            tasksArray={data[sub.subject][chap]}
                            chapProgress={chapProgress}
                            toggleStatus={toggleStatus}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.section>
          );
        })}
      </main>

      {/* Footer System Bar */}
      <footer className="mt-auto border-t border-slate-800/50 pt-3 pb-2 px-4 md:px-8 bg-slate-950/80 backdrop-blur sticky bottom-0 z-40">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-500 gap-2">
          <div className="flex gap-4">
            <span>Version 3.2.0 (Stable)</span>
            <span>Data Storage: Firestore Sync</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="uppercase font-bold tracking-widest text-slate-400">All Systems Operational</span>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showChat && (
          <ChatBox trackerData={data} profile={profile} onClose={() => setShowChat(false)} />
        )}
        {showExam && (
          <ExamModal profile={profile} onClose={() => setShowExam(false)} />
        )}
        {showProfile && (
          <ProfileModal profile={profile} onSave={updateProfile} onClose={() => setShowProfile(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
