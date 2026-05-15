import React, { useState } from "react";
import { X, Save, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { auth } from "../lib/firebase";

export function ProfileModal({
  profile,
  onSave,
  onClose
}: {
  profile: { name: string, mobile: string, group: string, college: string, hscYear: string };
  onSave: (data: { name: string, mobile: string, group: string, college: string, hscYear: string }) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState(profile);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#0b0e14] border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-800/50 sticky top-0 bg-[#0b0e14] z-10">
          <h2 className="text-xl font-medium text-slate-100 flex items-center gap-2">
            🎓 Student Profile
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-6 md:p-8">
          <form id="profile-form" onSubmit={handleSubmit} className="flex flex-col gap-8">
            
            {/* Login Information */}
            <div>
              <h3 className="text-lg font-medium text-slate-200 mb-4">Login Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#1c2230] rounded-xl p-4 flex justify-between items-center group border border-transparent hover:border-slate-700 transition-colors">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                    <div className="text-sm text-slate-200">{auth.currentUser?.email || "-"}</div>
                  </div>
                </div>
                <div className="bg-[#1c2230] rounded-xl p-0 flex justify-between items-center border border-transparent focus-within:border-indigo-500 transition-colors relative overflow-hidden">
                  <div className="p-4 flex-1">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Mobile</label>
                    <input 
                      type="text" 
                      name="mobile" 
                      value={formData.mobile} 
                      onChange={handleChange} 
                      className="w-full bg-transparent text-sm text-slate-200 focus:outline-none" 
                      placeholder="e.g. 017XXXXXXXX"
                    />
                  </div>
                  <Pencil className="w-4 h-4 text-slate-500 absolute right-4 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-slate-200 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-[#1c2230] rounded-xl p-0 flex justify-between items-center border border-transparent focus-within:border-indigo-500 transition-colors relative overflow-hidden">
                  <div className="p-4 flex-1">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      className="w-full bg-transparent text-sm text-slate-200 focus:outline-none uppercase" 
                      placeholder="Your Full Name"
                    />
                  </div>
                  <Pencil className="w-4 h-4 text-slate-500 absolute right-4 pointer-events-none" />
                </div>
                <div className="bg-[#1c2230] rounded-xl p-0 flex justify-between items-center border border-transparent focus-within:border-indigo-500 transition-colors relative overflow-hidden">
                  <div className="p-4 flex-1 w-full">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Group</label>
                    <select 
                      name="group" 
                      value={formData.group} 
                      onChange={handleChange} 
                      className="w-full bg-transparent text-sm text-slate-200 focus:outline-none appearance-none"
                    >
                      <option value="" className="bg-[#1c2230]">Select Group</option>
                      <option value="Science" className="bg-[#1c2230]">Science</option>
                      <option value="Arts" className="bg-[#1c2230]">Arts / Humanities</option>
                      <option value="Commerce" className="bg-[#1c2230]">Commerce / Business Studies</option>
                    </select>
                  </div>
                  <Pencil className="w-4 h-4 text-slate-500 absolute right-4 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* College Information */}
            <div>
              <h3 className="text-lg font-medium text-slate-200 mb-4">College Information</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-[#1c2230] rounded-xl p-0 flex justify-between items-center border border-transparent focus-within:border-indigo-500 transition-colors relative overflow-hidden">
                  <div className="p-4 flex-1">
                    <label className="block text-xs font-medium text-slate-400 mb-1">College Name</label>
                    <input 
                      type="text" 
                      name="college" 
                      value={formData.college} 
                      onChange={handleChange} 
                      className="w-full bg-transparent text-sm text-slate-200 focus:outline-none" 
                      placeholder="e.g. Notre Dame College"
                    />
                  </div>
                  <Pencil className="w-4 h-4 text-slate-500 absolute right-4 pointer-events-none" />
                </div>
                <div className="bg-[#1c2230] rounded-xl p-0 flex justify-between items-center border border-transparent focus-within:border-indigo-500 transition-colors relative overflow-hidden">
                  <div className="p-4 flex-1">
                    <label className="block text-xs font-medium text-slate-400 mb-1">College Session (HSC Year)</label>
                    <input 
                      type="text" 
                      name="hscYear" 
                      value={formData.hscYear} 
                      onChange={handleChange} 
                      className="w-full bg-transparent text-sm text-slate-200 focus:outline-none" 
                      placeholder="e.g. 2025-2026"
                    />
                  </div>
                  <Pencil className="w-4 h-4 text-slate-500 absolute right-4 pointer-events-none" />
                </div>
              </div>
            </div>
            
          </form>
        </div>

        <div className="p-6 border-t border-slate-800/50 bg-[#0b0e14] sticky bottom-0 hidden md:flex justify-end">
          <button
            type="submit"
            form="profile-form"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
        {/* Mobile submit */}
        <div className="p-4 border-t border-slate-800/50 bg-[#0b0e14] sticky bottom-0 md:hidden">
          <button
            type="submit"
            form="profile-form"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
