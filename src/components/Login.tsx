import React, { useState } from "react";
import { LogIn, GraduationCap, Mail, Lock } from "lucide-react";
import { loginWithGoogle, loginWithEmail } from "../lib/firebase";
import { motion } from "motion/react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

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
        
        <form onSubmit={handleEmailLogin} className="w-full flex flex-col gap-4 mb-6">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="email" 
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 outline-none focus:border-indigo-500 transition-colors"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 outline-none focus:border-indigo-500 transition-colors"
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm text-left">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-[0.98]"
          >
            {loading ? "Signing in..." : "Sign in with Email"}
          </button>
        </form>

        <div className="w-full flex items-center gap-4 mb-6">
          <div className="h-px bg-slate-800 flex-1"></div>
          <span className="text-slate-500 text-sm">OR</span>
          <div className="h-px bg-slate-800 flex-1"></div>
        </div>

        <button
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 hover:bg-slate-200 font-bold py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-[0.98] mb-6"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <p className="text-sm text-slate-500">
          Don't have an account? <br />
          Contact <a href="mailto:sarkerrajdeep8@gmail.com" className="text-indigo-400 hover:text-indigo-300">sarkerrajdeep8@gmail.com</a> to sign up.
        </p>
      </motion.div>
    </div>
  );
}
