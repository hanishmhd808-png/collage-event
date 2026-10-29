"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  Sparkles,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Shield,
  KeyRound,
  GraduationCap,
  Calendar,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

type AuthTab = "student" | "organizer" | "teacher_admin";

export default function LoginPage() {
  const router = useRouter();
  const {
    user,
    role,
    loginWithEmail,
    loginWithGoogle,
    loginAsMockStudent,
    loginAsMockOrganizer,
    loginAsMockTeacher,
    loginAsMockAdmin,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>("student");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [passcode, setPasscode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect based on role
  useEffect(() => {
    if (user && role) {
      if (role === "student") router.push("/dashboard");
      else if (role === "organizer") router.push("/organizer");
      else if (role === "teacher") router.push("/teacher");
      else if (role === "admin") router.push("/admin");
      else router.push("/dashboard");
    }
  }, [user, role, router]);

  const handleStudentAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    if (!email || !password) {
      setErrorMsg("Please fill in both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      await loginWithEmail(email, password);
      setSuccessMsg(isSignUp ? "Account created successfully! Redirecting..." : "Welcome back! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 700);
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);
    try {
      await loginWithGoogle();
      setSuccessMsg("Signed in with Google! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 700);
    } catch (err: any) {
      setErrorMsg("Google sign in was cancelled or failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasscodeLogin = (e: React.FormEvent, targetRole: "teacher" | "admin") => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    if (passcode.trim() === "1234" || passcode.trim() === "admin") {
      setIsLoading(true);
      if (targetRole === "teacher") {
        loginAsMockTeacher();
        setSuccessMsg("Authorized as Faculty Evaluator. Redirecting...");
        setTimeout(() => router.push("/teacher"), 600);
      } else {
        loginAsMockAdmin();
        setSuccessMsg("Authorized as Campus Administrator. Redirecting...");
        setTimeout(() => router.push("/admin"), 600);
      }
    } else {
      setErrorMsg("Invalid authorization passcode. Hint: use 1234 for demo access.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col justify-between relative overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* Background Glows */}
      <div className="absolute top-[-15%] left-[20%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[15%] w-[450px] h-[450px] bg-violet-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Bar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 pt-8 flex items-center justify-between">
        <a
          href="/"
          className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </a>

        <a href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-lg tracking-tight gradient-text">EVENTORA AI</span>
        </a>
      </header>

      {/* Main Form Container */}
      <main className="relative z-10 max-w-md w-full mx-auto px-6 py-10 my-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-dark border border-white/10 rounded-3xl p-7 sm:p-8 shadow-2xl relative"
        >
          {/* Header text */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
              Welcome to <span className="gradient-text">EVENTORA</span>
            </h1>
            <p className="text-sm text-white/50">
              Sign in to manage activities, track scores, and discover campus events.
            </p>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-white/5 rounded-2xl border border-white/5 mb-6 text-xs font-semibold">
            <button
              onClick={() => { setActiveTab("student"); setErrorMsg(""); }}
              className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "student"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>
            <button
              onClick={() => { setActiveTab("organizer"); setErrorMsg(""); }}
              className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "organizer"
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Organizer</span>
            </button>
            <button
              onClick={() => { setActiveTab("teacher_admin"); setErrorMsg(""); }}
              className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "teacher_admin"
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Faculty</span>
            </button>
          </div>

          {/* Alerts */}
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TAB 1: STUDENT LOGIN */}
          {activeTab === "student" && (
            <div>
              <form onSubmit={handleStudentAuth} className="space-y-3.5 mb-5">
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Johnson"
                        className="w-full glass border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-blue-500/50 transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Campus Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@campus.edu"
                      required
                      className="w-full glass border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-white/60">Password</label>
                    {!isSignUp && (
                      <span className="text-[11px] text-blue-400 cursor-pointer hover:underline">
                        Forgot?
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full glass border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-blue-500/50 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full btn-primary py-3 text-sm font-semibold flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{isSignUp ? "Create Student Account" : "Sign In to Dashboard"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Sign up toggle */}
              <div className="text-center text-xs text-white/50 mb-5">
                {isSignUp ? "Already have an account?" : "New to EVENTORA?"}{" "}
                <button
                  onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(""); }}
                  className="text-blue-400 hover:text-blue-300 font-semibold ml-1 underline underline-offset-2"
                >
                  {isSignUp ? "Sign In" : "Sign Up Free"}
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center mb-5">
                <div className="border-t border-white/10 w-full" />
                <span className="bg-[#12121a] px-3 text-[11px] text-white/40 uppercase tracking-widest font-semibold absolute">
                  Or Instant Access
                </span>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2.5 text-xs font-semibold text-white transition-all mb-3"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Instant Student Demo */}
              <button
                type="button"
                onClick={() => {
                  loginAsMockStudent();
                  setSuccessMsg("Logged in as Alex Johnson (Student). Redirecting...");
                  setTimeout(() => router.push("/dashboard"), 500);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/25 hover:border-blue-500/50 text-blue-300 text-xs font-medium transition-all group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600/30 flex items-center justify-center font-bold text-[11px] text-blue-200">
                    AJ
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white text-xs">Demo Student: Alex Johnson</p>
                    <p className="text-[10px] text-blue-300/70">CSE-A, 3rd Year • 20CS042</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-blue-400 group-hover:translate-x-0.5 transition-transform">
                  1-Click Sign In →
                </span>
              </button>
            </div>
          )}

          {/* TAB 2: ORGANIZER LOGIN */}
          {activeTab === "organizer" && (
            <div>
              <div className="p-3.5 rounded-2xl bg-violet-500/10 border border-violet-500/20 mb-4 text-xs text-violet-200">
                <p className="font-semibold mb-1 flex items-center gap-1.5 text-violet-300">
                  <Calendar className="w-3.5 h-3.5" />
                  Organizer Portal Access
                </p>
                <p className="text-white/60 text-[11px] leading-relaxed">
                  Publish events, configure Single vs Group activity rules, generate QR passes, and export attendance.
                </p>
              </div>

              <form onSubmit={handleStudentAuth} className="space-y-3.5 mb-5">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Organizer Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tech.club@campus.edu"
                      required
                      className="w-full glass border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-violet-500/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full glass border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-violet-500/50 transition-colors"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 transition-all"
                >
                  <span>Sign In as Organizer</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </form>

              <div className="relative flex items-center justify-center mb-4">
                <div className="border-t border-white/10 w-full" />
                <span className="bg-[#12121a] px-3 text-[11px] text-white/40 uppercase tracking-widest font-semibold absolute">
                  Demo Organizer
                </span>
              </div>

              {/* Instant Organizer Demo */}
              <button
                type="button"
                onClick={() => {
                  loginAsMockOrganizer();
                  setSuccessMsg("Logged in as Tech Club Organizer. Redirecting...");
                  setTimeout(() => router.push("/organizer"), 500);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/25 hover:border-violet-500/50 text-violet-300 text-xs font-medium transition-all group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-violet-600/30 flex items-center justify-center font-bold text-[11px] text-violet-200">
                    TC
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white text-xs">Campus Club Organizer</p>
                    <p className="text-[10px] text-violet-300/70">Full event creation & control suite</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-violet-400 group-hover:translate-x-0.5 transition-transform">
                  Instant Access →
                </span>
              </button>
            </div>
          )}

          {/* TAB 3: TEACHER & ADMIN PASSCODE LOGIN */}
          {activeTab === "teacher_admin" && (
            <div>
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-5 text-xs text-amber-200">
                <p className="font-semibold mb-1 flex items-center gap-1.5 text-amber-300">
                  <Shield className="w-3.5 h-3.5" />
                  Staff & Coordinator Security Passcode
                </p>
                <p className="text-white/60 text-[11px] leading-relaxed">
                  Enter official departmental passcode (<code className="text-amber-300 bg-amber-500/20 px-1 py-0.5 rounded font-mono font-bold">1234</code>) to access scoring and governance tools.
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Passcode</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="Enter 1234"
                      className="w-full glass border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-amber-500/50 transition-colors tracking-widest font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={(e) => handlePasscodeLogin(e, "teacher")}
                    className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Faculty Portal</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handlePasscodeLogin(e, "admin")}
                    className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin Suite</span>
                  </button>
                </div>
              </div>

              <div className="relative flex items-center justify-center mb-3">
                <div className="border-t border-white/10 w-full" />
                <span className="bg-[#12121a] px-3 text-[11px] text-white/40 uppercase tracking-widest font-semibold absolute">
                  Instant Quick Logins
                </span>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    loginAsMockTeacher();
                    setSuccessMsg("Logged in as Prof. Sharma (Faculty Evaluator). Redirecting...");
                    setTimeout(() => router.push("/teacher"), 500);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/40 text-left text-xs transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px]">
                      PS
                    </div>
                    <div>
                      <p className="text-white font-medium text-xs">Prof. Sharma (Faculty)</p>
                      <p className="text-[10px] text-white/40">Event evaluator & attendance auditor</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-400 group-hover:translate-x-0.5 transition-transform">
                    Enter →
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    loginAsMockAdmin();
                    setSuccessMsg("Logged in as Campus Admin. Redirecting...");
                    setTimeout(() => router.push("/admin"), 500);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-red-500/40 text-left text-xs transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-300 flex items-center justify-center font-bold text-[10px]">
                      AD
                    </div>
                    <div>
                      <p className="text-white font-medium text-xs">Campus Administrator</p>
                      <p className="text-[10px] text-white/40">Institution-wide settings & limits</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-red-400 group-hover:translate-x-0.5 transition-transform">
                    Enter →
                  </span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 text-center text-xs text-white/30 border-t border-white/5">
        EVENTORA AI &copy; 2026. Every Campus Moment, Perfectly Organized.
      </footer>
    </div>
  );
}
