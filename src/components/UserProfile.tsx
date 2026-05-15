import React, { useState } from "react";
import { ArrowLeft, Save, User as UserIcon, Mail, Phone, BookOpen, MapPin, Activity, CheckCircle2 } from "lucide-react";
import { UserProfileData } from "../types";
import { motion } from "motion/react";
import { useAuth } from "../hooks/useTracker";

interface UserProfileProps {
  profile: UserProfileData;
  onSave: (data: UserProfileData) => Promise<void>;
  onBack: () => void;
}

export function UserProfile({ profile, onSave, onBack }: UserProfileProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<UserProfileData>({ ...profile, email: profile.email || user?.email || "" });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 mb-4 mt-8 pb-2 border-b border-slate-800">
      <Icon className="w-5 h-5 text-indigo-400" />
      <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
    </div>
  );

  const InputField = ({ label, name, type = "text", placeholder = "-" }: { label: string, name: string, type?: string, placeholder?: string }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-400">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={(formData as any)[name] || ""}
        onChange={handleChange}
        className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
      />
    </div>
  );

  const SelectField = ({ label, name, options }: { label: string, name: string, options: string[] }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-400">{label}</label>
      <select
        name={name}
        value={(formData as any)[name] || ""}
        onChange={handleChange}
        className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
      >
        <option value="">- Select -</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-slate-950 pb-20"
    >
      <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Dashboard</span>
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-95"
        >
          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved!" : "Save Profile"}
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        <h1 className="text-3xl font-black text-white mb-2">Student Profile</h1>
        <p className="text-slate-400 mb-8">Update your personal and academic information below.</p>

        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900/40 p-6 md:p-8 rounded-3xl border border-slate-800/60 shadow-xl">
          
          <SectionTitle icon={MapPin} title="Login Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InputField label="Email Address" name="email" type="email" placeholder="Email" />
            <InputField label="Mobile Number" name="mobile" placeholder="Mobile" />
            <InputField label="Emergency Contact" name="emergencyContact" placeholder="Emergency Contact" />
          </div>

          <SectionTitle icon={UserIcon} title="Personal Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InputField label="Full Name" name="name" placeholder="Name" />
            <InputField label="Date of Birth" name="dob" type="date" />
            <SelectField label="Religion" name="religion" options={["Islam", "Hinduism", "Christianity", "Buddhism", "Other"]} />
            <SelectField label="Gender" name="gender" options={["Male", "Female", "Other"]} />
            <SelectField label="Blood Group" name="bloodGroup" options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} />
            <SelectField label="Group" name="group" options={["Science", "Arts", "Commerce"]} />
          </div>

          <SectionTitle icon={BookOpen} title="College Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="College Name" name="collegeName" />
            <InputField label="College Address" name="collegeAddress" />
            <InputField label="College Session" name="collegeSession" placeholder="e.g. 2025-2026" />
            <SelectField label="University Chance" name="universityChance" options={["Yes", "No"]} />
          </div>

          <SectionTitle icon={UserIcon} title="Father's Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InputField label="Father's Name" name="fatherName" />
            <InputField label="Father NID" name="fatherNid" />
            <InputField label="Profession" name="fatherProfession" />
            <SelectField label="Profession Type" name="fatherProfessionType" options={["Govt.", "Private", "Business", "Other"]} />
            <InputField label="Yearly Income" name="fatherYearlyIncome" />
          </div>

          <SectionTitle icon={UserIcon} title="Mother's Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InputField label="Mother's Name" name="motherName" />
            <InputField label="Mother NID" name="motherNid" />
            <InputField label="Profession" name="motherProfession" />
            <SelectField label="Profession Type" name="motherProfessionType" options={["Govt.", "Private", "Business", "Housewife", "Other"]} />
            <InputField label="Yearly Income" name="motherYearlyIncome" />
          </div>

          <SectionTitle icon={Activity} title="Additional Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InputField label="Previous School Name" name="previousSchool" />
            <SelectField label="Disability" name="disability" options={["Yes", "No"]} />
            <InputField label="Guardian Mobile" name="guardianMobile" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <SectionTitle icon={MapPin} title="Present Address" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Division" name="presentDivision" />
                <InputField label="District" name="presentDistrict" />
                <InputField label="Upazila" name="presentUpazila" />
                <InputField label="Union" name="presentUnion" />
                <InputField label="Post Office" name="presentPostOffice" />
                <InputField label="Village" name="presentVillage" />
                <InputField label="House" name="presentHouse" />
              </div>
            </div>
            <div>
              <SectionTitle icon={MapPin} title="Permanent Address" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Division" name="permanentDivision" />
                <InputField label="District" name="permanentDistrict" />
                <InputField label="Upazila" name="permanentUpazila" />
                <InputField label="Union" name="permanentUnion" />
                <InputField label="Post Office" name="permanentPostOffice" />
                <InputField label="Village" name="permanentVillage" />
                <InputField label="House" name="permanentHouse" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div>
              <SectionTitle icon={BookOpen} title="JSC Information" />
              <div className="space-y-4">
                <InputField label="Roll No" name="jscRoll" />
                <InputField label="Reg No" name="jscReg" />
                <InputField label="Board" name="jscBoard" />
                <InputField label="GPA" name="jscGpa" />
                <InputField label="Year" name="jscYear" />
              </div>
            </div>
            <div>
              <SectionTitle icon={BookOpen} title="SSC Information" />
              <div className="space-y-4">
                <InputField label="Roll No" name="sscRoll" />
                <InputField label="Reg No" name="sscReg" />
                <InputField label="Board" name="sscBoard" />
                <InputField label="GPA" name="sscGpa" />
                <InputField label="Year" name="sscYear" />
              </div>
            </div>
            <div>
              <SectionTitle icon={BookOpen} title="HSC Information" />
              <div className="space-y-4">
                <InputField label="Roll No" name="hscRoll" />
                <InputField label="Reg No" name="hscReg" />
                <InputField label="Board" name="hscBoard" />
                <InputField label="GPA" name="hscGpa" />
                <InputField label="Year" name="hscYear" />
              </div>
            </div>
          </div>

        </form>
      </div>
    </motion.div>
  );
}
