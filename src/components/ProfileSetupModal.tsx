"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { ArrowLeft } from "lucide-react";

export default function ProfileSetupModal() {
  const { user, role, studentProfile, updateStudentProfile, logout } = useAuth();
  const { showToast } = useToast();
  
  const [name, setName] = useState(user?.displayName || "");
  const [regNo, setRegNo] = useState("");
  const [className, setClassName] = useState("");

  useEffect(() => {
    if (studentProfile?.name) {
      setName(studentProfile.name);
      setRegNo(studentProfile.registerNumber || "");
      setClassName(studentProfile.className || "");
    } else if (user?.displayName) {
      setName(user.displayName);
    }
  }, [studentProfile, user]);

  if (role !== "student" || studentProfile) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Please enter your full name", "error");
      return;
    }
    const finalReg = regNo.trim() || "20CS" + Math.floor(100 + Math.random() * 900);
    const finalClass = className.trim() || "CSE-A, 3rd Year";
    updateStudentProfile({ name: name.trim(), registerNumber: finalReg, className: finalClass });
    showToast("Profile completed successfully!", "success");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
        >
          <button 
            onClick={logout}
            className="absolute top-6 right-6 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-200 flex items-center gap-1 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <h3 className="text-2xl font-bold mb-2 pr-12">Complete Your Profile</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-6">Please provide your details before registering for events.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Full Name</label>
              <input 
                required 
                type="text" 
                className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Register Number</label>
              <input 
                required 
                type="text" 
                className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                value={regNo} 
                onChange={e => setRegNo(e.target.value)} 
                placeholder="e.g. S123456"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Class / Department Option</label>
              <input 
                required 
                type="text" 
                className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                value={className} 
                onChange={e => setClassName(e.target.value)} 
                placeholder="e.g. BSc Computer Science"
              />
            </div>
            <button 
              type="submit" 
              className="w-full mt-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700"
            >
              Save Profile
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
