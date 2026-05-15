import React from "react";
import { LogIn, GraduationCap } from "lucide-react";
import { loginWithGoogle } from "../lib/firebase";
import { motion } from "motion/react";

export function Login() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full shadow-[rgba(0,0,0,0.5)_0px_30px_60px] flex flex-col items-center text-center"
      >
        <motion.div 
          initial={{ rotate: -10, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20"
        >
          <GraduationCap className="w-8 h-8 text-indigo-400" />
        </motion.div>
        
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">HSC Tracker Pro</h1>
        <p className="text-slate-400 mb-8">Sign in to track your progress and access the AI study assistant.</p>
        
        <button
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 hover:bg-slate-200 font-bold py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-[0.98]"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>
      </motion.div>
    </div>
  );
}
