import React, { useState } from "react";
import { LogIn, GraduationCap, Mail, Lock, CheckCircle2 } from "lucide-react";
import { loginWithGoogle, loginWithEmail, resetPassword } from "../lib/firebase";
import { motion } from "motion/react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Please enter your email address first");
      return;
    }
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await resetPassword(email);
      setMessage("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-teal-500/10 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl max-w-md w-full shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col items-center text-center relative z-10"
      >
        <motion.div 
          initial={{ rotate: -10, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30"
        >
          <GraduationCap className="w-10 h-10 text-white" />
        </motion.div>
        
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">HSC Tracker Pro</h1>
        <p className="text-slate-400 mb-8 font-medium">Your universal academic progress manager and AI study assistant.</p>
        
        <form onSubmit={handleEmailLogin} className="w-full flex flex-col gap-4 mb-6">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="email" 
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
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
              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
            />
          </div>
          <div className="flex justify-end -mt-2">
            <button 
              type="button" 
              onClick={handleResetPassword}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
            >
              Forgot password? Set/Reset here
            </button>
          </div>
          {error && <p className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20">{error}</p>}
          {message && <p className="text-emerald-400 text-sm text-center flex items-center justify-center gap-2 bg-emerald-400/10 py-2 rounded-lg border border-emerald-400/20"><CheckCircle2 className="w-4 h-4" /> {message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] active:scale-[0.98]"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Sign in with Email"}
          </button>
        </form>

        <div className="w-full flex items-center gap-4 mb-6">
          <div className="h-px bg-slate-800 flex-1"></div>
          <span className="text-slate-500 text-sm font-medium">OR</span>
          <div className="h-px bg-slate-800 flex-1"></div>
        </div>

        <button
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 text-white font-medium py-3.5 px-4 rounded-xl transition-all shadow-sm active:scale-[0.98] mb-6 backdrop-blur-sm"
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
