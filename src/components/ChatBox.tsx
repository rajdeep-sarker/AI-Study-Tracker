import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot, Paperclip, FileText, Trash2, Plus, MessageSquare } from "lucide-react";
import { cn } from "../lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "motion/react";

type ChatMessage = { role: "user" | "ai"; text: string };
type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
};

export function ChatBox({ trackerData, profile, onClose }: { trackerData: any; profile: any; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"advisor" | "doubt">("advisor");
  
  const [sessions, setSessions] = useState<Record<"advisor" | "doubt", ChatSession[]>>(() => {
    const saved = localStorage.getItem("ai_chat_sessions");
    if (saved) return JSON.parse(saved);
    return {
      advisor: [{ id: "adv-1", title: "New Advisor Session", messages: [{ role: "ai", text: "Hello! I am your AI Study Assistant. Let me know if you have any questions about your syllabus and progress." }], updatedAt: Date.now() }],
      doubt: [{ id: "dbt-1", title: "New Doubt Session", messages: [{ role: "ai", text: "If you have any doubts or need help understanding a topic, feel free to ask. You can also upload your class slides or PDFs!" }], updatedAt: Date.now() }]
    };
  });

  const [currentSessionIds, setCurrentSessionIds] = useState<{ advisor: string, doubt: string }>({
    advisor: sessions.advisor[0]?.id || "adv-1",
    doubt: sessions.doubt[0]?.id || "dbt-1"
  });

  useEffect(() => {
    localStorage.setItem("ai_chat_sessions", JSON.stringify(sessions));
  }, [sessions]);

  const activeSessions = sessions[activeTab];
  const currentSessionId = currentSessionIds[activeTab];
  const currentSession = activeSessions.find(s => s.id === currentSessionId) || activeSessions[0];
  const currentMessages = currentSession?.messages || [];

  const updateCurrentSession = (updater: (prev: ChatMessage[]) => ChatMessage[]) => {
    setSessions(prev => {
      const activeArr = prev[activeTab];
      const sIndex = activeArr.findIndex(s => s.id === currentSessionId);
      if (sIndex === -1) return prev;
      
      const session = activeArr[sIndex];
      const newMessages = updater(session.messages);
      
      let title = session.title;
      if (session.title.startsWith("New") && newMessages.length > 2) {
        const firstUserMsg = newMessages.find(m => m.role === "user");
        if (firstUserMsg) {
          title = firstUserMsg.text.substring(0, 20) + "...";
        }
      }

      const updatedSess = { ...session, title, messages: newMessages, updatedAt: Date.now() };
      const newActiveArr = [updatedSess, ...activeArr.filter((_, i) => i !== sIndex)];
      
      return { ...prev, [activeTab]: newActiveArr };
    });
  };

  const handleNewSession = () => {
    const newId = `${activeTab}-${Date.now()}`;
    const initialMsg = activeTab === "advisor" 
      ? "Hello! I am your AI action Planner. How can I help today?" 
      : "Hello! What doubt do you have today?";
    
    setSessions(prev => ({
      ...prev,
      [activeTab]: [{ id: newId, title: "New Session", messages: [{ role: "ai", text: initialMsg }], updatedAt: Date.now() }, ...prev[activeTab]]
    }));
    setCurrentSessionIds(prev => ({ ...prev, [activeTab]: newId }));
  };

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string, data: string, mimeType: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size should be less than 10MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64String = (ev.target?.result as string).split(',')[1];
      setAttachedFiles(prev => [...prev, {
        name: file.name,
        data: base64String,
        mimeType: file.type
      }]);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || loading) return;

    const userMsg = input;
    const filesToSend = [...attachedFiles];
    
    let displayMsg = userMsg;
    if (filesToSend.length > 0) {
      if (displayMsg.length > 0) displayMsg += "\n\n";
      displayMsg += `[Attached: ${filesToSend.map(f => f.name).join(", ")}]`;
    }

    updateCurrentSession((prev) => [...prev, { role: "user", text: displayMsg }]);
    setInput("");
    setAttachedFiles([]);
    setLoading(true);

    try {
      const historyToSend = currentMessages.slice(1).map(m => ({ role: m.role, text: m.text }));
      
      const { GoogleGenAI } = await import("@google/genai");
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API key is not configured. Please add it to your environment variables on Netlify.");

      const ai = new GoogleGenAI({ apiKey });
      
      let systemInstruction = "";
      const profileString = profile ? `User Profile: Name: ${profile.name || "N/A"}, Group: ${profile.group || "N/A"}, College: ${profile.college || "N/A"}, HSC Year: ${profile.hscYear || "N/A"}` : "";
      
      if (activeTab === "advisor") {
        systemInstruction = `You are an expert academic advisor for HSC students. ${profileString}. Analyze the student's progress data if provided:
${trackerData ? JSON.stringify(trackerData) : "No data provided."}
Focus on guiding them on what to do next, highlight backlogs, and suggest a strategy. Keep it concise, engaging, and in Markdown format.
IMPORTANT: Reply in the same language the user uses. If they speak Bengali, respond in Bengali. If they speak English, respond in English. Default to English if unclear.`;
      } else if (activeTab === "doubt") {
        systemInstruction = `You are a friendly and clear tutor for HSC students. ${profileString}. The user has a doubt.
You may receive class slides, main book extracts, or practice sheets as file attachments. Use them contextually.
Explain their doubt simply, referencing the provided materials/context where applicable. Use examples. Provide response in Markdown.
IMPORTANT: Reply in the same language the user uses. If they speak Bengali, respond in Bengali. If they speak English, respond in English. Default to English if unclear.`;
      }

      const contents: any[] = [];
      if (historyToSend && Array.isArray(historyToSend)) {
        historyToSend.forEach((msg) => {
          contents.push({
            role: msg.role === "ai" ? "model" : "user",
            parts: [{ text: msg.text }]
          });
        });
      }

      const currentParts: any[] = [];
      if (filesToSend && Array.isArray(filesToSend)) {
        filesToSend.forEach((f: any) => {
          currentParts.push({
            inlineData: {
              data: f.data,
              mimeType: f.mimeType
            }
          });
        });
      }
      
      currentParts.push({ text: userMsg });
      
      contents.push({
        role: "user",
        parts: currentParts
      });

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });
      
      updateCurrentSession((prev) => [...prev, { role: "ai", text: response.text || "No response generated." }]);
    } catch (error: any) {
      console.error("Client-side Gemini Error:", error);
      updateCurrentSession((prev) => [...prev, { role: "ai", text: `Sorry, something went wrong. ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-[#0b0e14] border-l border-slate-800 shadow-[rgba(0,0,0,0.5)_0px_0px_50px] flex flex-col z-50 overflow-hidden"
    >
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg text-primary">
            <Bot className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-white">AI Assistant</h2>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex border-b border-slate-800 bg-slate-950/50">
        <button
          onClick={() => setActiveTab("advisor")}
          className={cn("flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors", activeTab === "advisor" ? "border-primary text-primary bg-indigo-500/5" : "border-transparent text-slate-500 hover:text-slate-300")}
        >
          Advisor
        </button>
        <button
          onClick={() => setActiveTab("doubt")}
          className={cn("flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors", activeTab === "doubt" ? "border-emerald-500 text-emerald-400 bg-emerald-500/5" : "border-transparent text-slate-500 hover:text-slate-300")}
        >
          Doubt Focus
        </button>
      </div>

      <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <MessageSquare className="w-4 h-4 text-slate-500 shrink-0" />
          <select 
            className="flex-1 bg-transparent text-slate-300 text-xs font-medium focus:outline-none appearance-none truncate"
            value={currentSessionId}
            onChange={(e) => setCurrentSessionIds(prev => ({ ...prev, [activeTab]: e.target.value }))}
          >
            {activeSessions.map(s => (
              <option key={s.id} value={s.id} className="bg-slate-900">{s.title}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={handleNewSession}
          className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-md transition-colors"
          title="New Session"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentMessages.map((msg, idx) => (
          <div key={idx} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed overflow-hidden", 
              msg.role === "user" 
                ? "bg-primary text-white rounded-tr-sm whitespace-pre-wrap" 
                : "bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm prose prose-invert prose-sm"
              )}
            >
              {msg.role === "ai" ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-slate-400 border border-slate-700 rounded-2xl rounded-tl-sm p-3 text-sm flex gap-1 items-center">
              <span className="animate-bounce">.</span><span className="animate-bounce" style={{animationDelay: "0.2s"}}>.</span><span className="animate-bounce" style={{animationDelay: "0.4s"}}>.</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col gap-2">
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attachedFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-1 bg-slate-800 border border-slate-700 px-2 py-1 rounded text-xs text-slate-300">
                <FileText className="w-3 h-3 text-indigo-400" />
                <span className="truncate max-w-[150px]">{f.name}</span>
                <button type="button" onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-500 hover:text-red-400">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          {activeTab === "doubt" && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl p-3 flex items-center justify-center transition-colors"
              title="Attach File (PDF/Image)"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={activeTab === "advisor" ? "Ask for study advice..." : "Ask your doubt (attach PDF/image for context)..."}
            className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all min-w-0"
          />
          <button
            type="submit"
            disabled={(!input.trim() && attachedFiles.length === 0) || loading}
            className="bg-primary hover:bg-primary-hover text-white rounded-xl p-3 flex items-center justify-center disabled:opacity-50 transition-colors shadow-lg shadow-primary/20 shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
