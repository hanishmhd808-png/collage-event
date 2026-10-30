"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import EventCard from "@/components/EventCard";
import PopupAlert, { PopupAlertProps } from "@/components/PopupAlert";
import ActivityCustomizerModal from "@/components/ActivityCustomizerModal";
import CreateEventModal from "@/components/CreateEventModal";
import {
  Sparkles, ArrowRight, ChevronDown, Zap, Shield, Award,
  Users, Calendar, Star, Mail, Key, Lock, UserCircle, ShieldCheck,
  Cpu, Music, Dumbbell, BookOpen, Briefcase, Camera, Trophy, X,
  Palette, User, CheckCircle2, Flame, HelpCircle, Info, Plus
} from "lucide-react";
import { useRouter } from "next/navigation";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const CATEGORIES = [
  { name: "Technical", icon: Cpu, color: "#0a84ff", bg: "rgba(10,132,255,0.1)", desc: "Hackathons, competitive programming, and robotics showcases." },
  { name: "Cultural", icon: Music, color: "#bf5af2", bg: "rgba(191,90,242,0.1)", desc: "Dance battles, live bands, stage theater, and fashion shows." },
  { name: "Sports", icon: Dumbbell, color: "#30d158", bg: "rgba(48,209,88,0.1)", desc: "Track sprints, football, cricket, and racquet tournaments." },
  { name: "Workshop", icon: BookOpen, color: "#32d2e8", bg: "rgba(50,210,232,0.1)", desc: "Hands-on tech bootcamps, AI masterclasses, and labs." },
  { name: "Seminar", icon: Users, color: "#ff9f0a", bg: "rgba(255,159,10,0.1)", desc: "Keynotes from industry luminaries, researchers, and alumni." },
  { name: "Placement", icon: Briefcase, color: "#64d2ff", bg: "rgba(100,210,255,0.1)", desc: "Campus recruitment drives, resume reviews, and mock interviews." },
  { name: "Club", icon: Camera, color: "#ffd60a", bg: "rgba(255,214,10,0.1)", desc: "Student societies, debating, photography, and social drives." },
  { name: "Arts", icon: Palette, color: "#bf5af2", bg: "rgba(191,90,242,0.1)", desc: "Canvas painting, classical solo/group dance, and sketching." },
];

const TESTIMONIALS = [
  { name: "Priya Sharma", dept: "Computer Science, 3rd Year", quote: "EVENTORA AI transformed how I discover events. The AI recommendations are spot-on!", avatar: "P" },
  { name: "Rahul Menon", dept: "Mechanical Engineering, Final Year", quote: "Organizing TechFest was a breeze. The AI tools saved me 10+ hours of planning.", avatar: "R" },
  { name: "Ananya Nair", dept: "Fine Arts, 2nd Year", quote: "Got my participation certificate instantly. The platform is incredibly well-designed!", avatar: "A" },
];

export default function Home() {
  const { user, role, loginAsMockStudent, loginAsMockTeacher, loginAsMockOrganizer, loginAsMockAdmin, loginWithGoogle, loginWithEmail } = useAuth();
  const { showToast } = useToast();
  const { events, myRegistrations } = useApp();
  const router = useRouter();

  const [showLogin, setShowLogin] = useState(false);
  const [showTeacherLock, setShowTeacherLock] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passcode, setPasscode] = useState("");
  const [loaded, setLoaded] = useState(false);

  // Customized Arts/Sports Modal State
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [customizerCategory, setCustomizerCategory] = useState<"Arts" | "Sports">("Arts");

  // Create Event Modal State (Customized Image Option)
  const [createEventOpen, setCreateEventOpen] = useState(false);

  // Universal Pop-up Alert State
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    badge?: string;
    type?: "info" | "success" | "warning" | "alert" | "action";
    primaryAction?: { label: string; onClick: () => void };
    secondaryAction?: { label: string; onClick?: () => void };
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  useEffect(() => { setLoaded(true); }, []);

  const showAlert = (config: {
    title: string;
    message: string;
    badge?: string;
    type?: "info" | "success" | "warning" | "alert" | "action";
    primaryAction?: { label: string; onClick: () => void };
    secondaryAction?: { label: string; onClick?: () => void };
  }) => {
    setAlertConfig({ ...config, isOpen: true });
  };

  const closeAlert = () => {
    setAlertConfig(prev => ({ ...prev, isOpen: false }));
  };

  const individualCount = myRegistrations.filter(r => {
    const ev = events.find(e => e.id === r.eventId);
    return r.participationType === "Single" || ev?.type === "Individual";
  }).length;

  const [upcomingCategory, setUpcomingCategory] = useState("All");

  const featuredEvents = events.filter(e => {
    const isUpcoming = e.status === "upcoming" || e.isFeatured;
    if (!isUpcoming) return false;
    if (upcomingCategory === "All") return true;
    return e.category.toLowerCase() === upcomingCategory.toLowerCase();
  }).slice(0, 6);

  const categoryCounts = CATEGORIES.map(c => ({
    ...c,
    count: events.filter(e => e.category === c.name).length,
  }));

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginWithEmail(email, password);
      showToast("Welcome back!", "success");
      setShowLogin(false);
    } catch {
      showToast("Login failed. Check your credentials.", "error");
    }
  };

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "1234") {
      loginAsMockTeacher();
      showToast("Teacher access granted", "success");
      setShowTeacherLock(false);
    } else {
      showToast("Invalid passcode (use 1234)", "error");
      setPasscode("");
    }
  };

  return (
    <div className="bg-[#0a0a0f] min-h-screen">

      {/* Universal Pop-up Alert Modal */}
      <PopupAlert
        isOpen={alertConfig.isOpen}
        onClose={closeAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        badge={alertConfig.badge}
        type={alertConfig.type}
        primaryAction={alertConfig.primaryAction}
        secondaryAction={alertConfig.secondaryAction}
      />

      {/* Customized Arts & Sports Modal */}
      <ActivityCustomizerModal
        isOpen={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
        initialCategory={customizerCategory}
        onSuccess={(eventId, title) => {
          showAlert({
            title: "Activity Confirmed!",
            message: `Your participation for "${title}" has been registered. You can view your QR ticket and certificate in your Dashboard.`,
            badge: "Registration Complete",
            type: "success",
            primaryAction: {
              label: "View in Dashboard",
              onClick: () => router.push("/dashboard"),
            },
          });
        }}
      />

      {/* Create Event with Customized Image Option Modal */}
      <CreateEventModal
        isOpen={createEventOpen}
        onClose={() => setCreateEventOpen(false)}
        onSuccess={(eventId, title) => {
          showAlert({
            title: "Event Published to Home!",
            message: `"${title}" has been successfully created with your customized image poster and synced to Cloud Firestore. It is now live in Upcoming Events.`,
            badge: "Event Live",
            type: "success",
            primaryAction: {
              label: "View Event Details",
              onClick: () => router.push(`/events/${eventId}`),
            },
            secondaryAction: {
              label: "Manage in Dashboard",
              onClick: () => router.push("/organizer"),
            },
          });
        }}
      />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
        {/* Animated gradient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-float" style={{ background: "radial-gradient(circle, #0a84ff, transparent)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15 animate-float-delayed" style={{ background: "radial-gradient(circle, #bf5af2, transparent)" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[100px] opacity-10" style={{ background: "radial-gradient(circle, #32d2e8, transparent)" }} />
        </div>
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }}
            transition={{ duration: 0.6 }}
            onClick={() => {
              showAlert({
                title: "EVENTORA AI Intelligence",
                message: "EVENTORA AI is an integrated campus event platform featuring 10 AI Studio tools, QR ticket verification, automated certification, and custom Single vs Group activities.",
                badge: "Campus AI Platform",
                type: "info",
                primaryAction: {
                  label: "Open AI Studio",
                  onClick: () => router.push("/ai-studio"),
                },
              });
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-sm text-white/60 mb-8 cursor-pointer hover:border-blue-500/40 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            Powered by EVENTORA AI
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </motion.div>

          {/* Headline */}
          {["Your Campus.", "Your Events.", "One Intelligent Platform."].map((line, i) => (
            <motion.h1
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 40 }}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className={`font-black tracking-tight leading-none mb-2 ${i < 2 ? "text-white text-5xl sm:text-7xl lg:text-8xl" : "gradient-text text-5xl sm:text-7xl lg:text-8xl"}`}
            >
              {line}
            </motion.h1>
          ))}

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 30 }} transition={{ duration: 0.8, delay: 0.7 }} className="text-white/50 text-lg sm:text-xl mt-8 mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover unforgettable experiences, customize arts & sports activities in single or group formats, and bring your entire campus together.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }} transition={{ duration: 0.6, delay: 0.9 }} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/explore">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="btn-primary px-8 py-4 text-base flex items-center justify-center gap-2 w-full sm:w-auto">
                Explore Events <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setCreateEventOpen(true)}
              className="px-8 py-4 text-base text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 border border-violet-500/40 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all cursor-pointer w-full sm:w-auto"
            >
              <Plus className="w-5 h-5 text-white" />
              <span>Add Event</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              onClick={() => {
                showAlert({
                  title: "Campus Event Organization",
                  message: "Are you planning an event? You can publish it directly to the college schedule with a customized poster banner, or use the AI Studio to generate timetables, posters, and itemized budgets.",
                  badge: "Organizer Hub",
                  type: "action",
                  primaryAction: {
                    label: "+ Create Event Now",
                    onClick: () => setCreateEventOpen(true),
                  },
                  secondaryAction: {
                    label: "Go to Organizer Dashboard",
                    onClick: () => {
                      if (!user) loginAsMockOrganizer();
                      router.push("/organizer");
                    },
                  },
                });
              }}
              className="btn-secondary px-8 py-4 text-base text-white border-white/20 hover:border-white/40 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              Organize an Event
            </motion.button>
          </motion.div>
        </div>

        {/* Floating event mini-cards (Interactive with Pop-up Alert) */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: loaded ? 0.9 : 0, x: loaded ? 0 : -60 }}
          transition={{ duration: 1, delay: 1.1 }}
          onClick={() => {
            showAlert({
              title: "TechNova 2026",
              message: "Annual flagship 24-hour hackathon with AI, robotics, and cloud tracks. Over ₹2 Lakhs in prizes. 342 seats currently filled out of 500.",
              badge: "Technical Hackathon",
              type: "alert",
              primaryAction: {
                label: "View Event & Register",
                onClick: () => router.push("/events/e1"),
              },
            });
          }}
          className="absolute left-8 top-1/3 hidden xl:block animate-float cursor-pointer hover:scale-105 transition-transform"
        >
          <div className="glass-dark p-4 rounded-2xl border border-white/10 w-52 hover:border-blue-500/50">
            <span className="badge-technical px-2 py-0.5 rounded-full text-xs font-semibold">Technical</span>
            <p className="text-white font-semibold text-sm mt-2">TechNova 2026</p>
            <p className="text-white/40 text-xs mt-1">342 / 500 registered</p>
            <p className="text-blue-400 text-[10px] mt-2 font-bold flex items-center gap-1">Click to view ↗</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: loaded ? 0.9 : 0, x: loaded ? 0 : 60 }}
          transition={{ duration: 1, delay: 1.3 }}
          onClick={() => {
            showAlert({
              title: "Rhythmica Cultural Fest",
              message: "The biggest music, dance, and cultural spectacle on campus! Includes battle of the bands, classical dance, and celebrity performances.",
              badge: "Cultural Festival",
              type: "alert",
              primaryAction: {
                label: "View Event & Register",
                onClick: () => router.push("/events/e2"),
              },
            });
          }}
          className="absolute right-8 top-1/4 hidden xl:block animate-float-delayed cursor-pointer hover:scale-105 transition-transform"
        >
          <div className="glass-dark p-4 rounded-2xl border border-white/10 w-52 hover:border-violet-500/50">
            <span className="badge-cultural px-2 py-0.5 rounded-full text-xs font-semibold">Cultural</span>
            <p className="text-white font-semibold text-sm mt-2">Rhythmica Fest</p>
            <p className="text-white/40 text-xs mt-1">687 / 1000 registered</p>
            <p className="text-violet-400 text-[10px] mt-2 font-bold flex items-center gap-1">Click to view ↗</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: loaded ? 0.8 : 0, x: loaded ? 0 : 60 }}
          transition={{ duration: 1, delay: 1.5 }}
          onClick={() => {
            showAlert({
              title: "Football 7s & Sports Olympiad",
              message: "Compete in inter-department football, cricket, basketball, or solo 100m sprint. Support for single athletes and team captains.",
              badge: "Sports Tournament",
              type: "alert",
              primaryAction: {
                label: "Customize Sports Entry",
                onClick: () => {
                  setCustomizerCategory("Sports");
                  setCustomizerOpen(true);
                },
              },
            });
          }}
          className="absolute right-12 bottom-1/3 hidden xl:block animate-float cursor-pointer hover:scale-105 transition-transform"
        >
          <div className="glass-dark p-4 rounded-2xl border border-white/10 w-52 hover:border-emerald-500/50">
            <span className="badge-sports px-2 py-0.5 rounded-full text-xs font-semibold">Sports</span>
            <p className="text-white font-semibold text-sm mt-2">Football Tournament</p>
            <p className="text-white/40 text-xs mt-1">98 / 112 registered</p>
            <p className="text-emerald-400 text-[10px] mt-2 font-bold flex items-center gap-1">Single or Group ↗</p>
          </div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: loaded ? 1 : 0 }} transition={{ delay: 1.8 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="flex flex-col items-center gap-2 text-white/30 text-xs">
            <span>Scroll to explore</span>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS (Interactive with Pop-up Alert) ── */}
      <section className="py-20 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Students", value: 12000, suffix: "+", desc: "12,000+ active undergraduate and postgraduate students using EVENTORA AI." },
            { label: "Events Hosted", value: 500, suffix: "+", desc: "Over 500 academic, sports, cultural, and technical events successfully concluded." },
            { label: "Partner Colleges", value: 48, suffix: "", desc: "Connected across 48 universities and colleges in the regional network." },
            { label: "Satisfaction Rate", value: 98, suffix: "%", desc: "98% positive participant rating based on post-event feedback." },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => {
                showAlert({
                  title: `${s.label}: ${s.value}${s.suffix}`,
                  message: s.desc,
                  badge: "Campus Metric",
                  type: "info",
                  primaryAction: {
                    label: "Explore Events",
                    onClick: () => router.push("/explore"),
                  },
                });
              }}
              className="text-center cursor-pointer p-4 rounded-2xl hover:bg-white/5 transition-all group"
            >
              <div className="text-4xl sm:text-5xl font-black gradient-text mb-2 group-hover:scale-105 transition-transform">
                <AnimatedCounter target={s.value} suffix={s.suffix} />
              </div>
              <p className="text-white/40 text-sm group-hover:text-white/70">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CUSTOMIZED ARTS & SPORTS ACTIVITIES SHOWCASE (FLAGSHIP FEATURE) ── */}
      <section className="py-24 px-6 relative overflow-hidden bg-gradient-to-b from-[#0a0a0f] via-[#0d0e1c] to-[#0a0a0f]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold mb-3 uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5" /> Customized Participation Options
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white">
                Arts & Sports <span className="gradient-text">Activities</span>
              </h2>
              <p className="text-white/50 text-base mt-2 max-w-xl">
                Compete as a <strong>Single Soloist</strong> or unite with your department in <strong>Group Teams</strong>. Tailor your activity disciplines directly.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  showAlert({
                    title: "Event Limits & Rules",
                    message: "• Individual (Single) Events: Maximum of 3 events per student to maintain academic balance.\n• Group / Team Events: Unlimited participation. You can create your own team or join a teammate's existing squad.\n• Verified Certificates: Issued automatically upon attendance confirmation.",
                    badge: "Official Regulations",
                    type: "alert",
                    primaryAction: {
                      label: "Open Activity Customizer",
                      onClick: () => setCustomizerOpen(true),
                    },
                  });
                }}
                className="px-5 py-3 rounded-2xl glass border border-white/10 text-white/70 hover:text-white text-sm font-semibold flex items-center gap-2 hover:bg-white/10 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-blue-400" /> Rules & Quota Info
              </button>

              <button
                onClick={() => {
                  setCustomizerCategory("Arts");
                  setCustomizerOpen(true);
                }}
                className="btn-primary px-6 py-3 text-sm font-semibold flex items-center gap-2"
              >
                <Palette className="w-4 h-4" /> Customize Activity Now
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Arts Card */}
            <motion.div
              whileHover={{ y: -6 }}
              className="glass-dark border border-violet-500/20 rounded-3xl p-8 relative overflow-hidden group shadow-xl"
              style={{ background: "rgba(19, 16, 36, 0.7)" }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center">
                    <Palette className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">Arts & Creative Domain</h3>
                    <p className="text-white/40 text-xs">Visual arts, classical dance, music & street theatre</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  Single or Group
                </span>
              </div>

              <div className="space-y-4 mb-8">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/8">
                  <p className="text-xs font-bold text-violet-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Single (Individual) Disciplines
                  </p>
                  <p className="text-sm text-white/70 leading-relaxed">
                    Solo Classical Dance (Bharatanatyam / Kathak), Live Oil Canvas Painting, Pencil & Charcoal Sketching, Digital Art, Classical Vocal Solo.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/8">
                  <p className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> Group / Team Disciplines
                  </p>
                  <p className="text-sm text-white/70 leading-relaxed">
                    Group Folk Dance (6-12 members), Street Play (Nukkad Natak), College Music Band, Mural & Graffiti Wall Art.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCustomizerCategory("Arts");
                    setCustomizerOpen(true);
                  }}
                  className="btn-primary flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <Palette className="w-4 h-4" /> Register Arts Activity
                </button>
                <Link href="/events/e16">
                  <button className="px-5 py-3 rounded-xl glass border border-white/10 text-white/60 hover:text-white text-sm font-semibold transition-colors">
                    Arts Carnival ↗
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Sports Card */}
            <motion.div
              whileHover={{ y: -6 }}
              className="glass-dark border border-emerald-500/20 rounded-3xl p-8 relative overflow-hidden group shadow-xl"
              style={{ background: "rgba(14, 28, 22, 0.7)" }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">Sports & Athletics Domain</h3>
                    <p className="text-white/40 text-xs">Track sprints, field athletics, football & cricket</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Single or Group
                </span>
              </div>

              <div className="space-y-4 mb-8">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/8">
                  <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Single (Individual) Disciplines
                  </p>
                  <p className="text-sm text-white/70 leading-relaxed">
                    100m Sprint Dash, 200m Track Race, Badminton Men/Women Singles, Table Tennis Knockout, Chess Blitz, Long Jump & Shot Put.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/8">
                  <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> Group / Team Disciplines
                  </p>
                  <p className="text-sm text-white/70 leading-relaxed">
                    Football 7-a-side Championship, Cricket T10 Trophy, Basketball 3x3/5v5, Volleyball 6s, 4x100m Relay Sprint.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCustomizerCategory("Sports");
                    setCustomizerOpen(true);
                  }}
                  className="btn-primary flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <Trophy className="w-4 h-4" /> Register Sports Activity
                </button>
                <Link href="/events/e17">
                  <button className="px-5 py-3 rounded-xl glass border border-white/10 text-white/60 hover:text-white text-sm font-semibold transition-colors">
                    Sports Olympiad ↗
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FEATURED EVENTS ── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
            <div>
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-blue-400 text-sm font-semibold mb-2 uppercase tracking-widest">Don't Miss Out</motion.p>
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl sm:text-5xl font-black text-white">Upcoming Events</motion.h2>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setCreateEventOpen(true)}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all border border-blue-400/30 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Event
              </motion.button>
              <Link href="/explore?status=upcoming" className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors text-xs sm:text-sm font-semibold ml-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {["All", "Technical", "Cultural", "Sports", "Workshop", "Arts"].map((cat) => (
              <button
                key={cat}
                onClick={() => setUpcomingCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  upcomingCategory.toLowerCase() === cat.toLowerCase()
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105"
                    : "glass border border-white/10 text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {featuredEvents.length === 0 ? (
            <div className="text-center py-16 glass-dark border border-white/10 rounded-3xl p-8">
              <p className="text-white/40 text-sm mb-4">No upcoming events currently in {upcomingCategory}.</p>
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => setUpcomingCategory("All")} className="btn-secondary text-xs py-2 px-5">
                  View All Upcoming Events
                </button>
                <button onClick={() => setCreateEventOpen(true)} className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Add New Event
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event, i) => <EventCard key={event.id} event={event} index={i} />)}
            </div>
          )}

          <div className="text-center mt-10 sm:hidden">
            <Link href="/explore?status=upcoming"><button className="btn-secondary text-white border-white/20 px-8 py-3">View All Upcoming Events</button></Link>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES (Interactive with Pop-up Alert) ── */}
      <section className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-violet-400 text-sm font-semibold mb-2 uppercase tracking-widest">Browse</motion.p>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl sm:text-5xl font-black text-white">Explore by Category</motion.h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categoryCounts.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                onClick={() => {
                  showAlert({
                    title: `${cat.name} Events (${cat.count})`,
                    message: cat.desc,
                    badge: "Category Discovery",
                    type: "info",
                    primaryAction: {
                      label: `Explore ${cat.name} Events`,
                      onClick: () => router.push(`/explore?category=${cat.name}`),
                    },
                    secondaryAction:
                      cat.name === "Arts" || cat.name === "Sports"
                        ? {
                            label: "Customize Activity",
                            onClick: () => {
                              setCustomizerCategory(cat.name as "Arts" | "Sports");
                              setCustomizerOpen(true);
                            },
                          }
                        : undefined,
                  });
                }}
              >
                <motion.div whileHover={{ scale: 1.04, y: -4 }} className="glass-card p-6 text-center cursor-pointer group">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110" style={{ background: cat.bg }}>
                    <cat.icon className="w-6 h-6" style={{ color: cat.color }} />
                  </div>
                  <p className="text-white font-semibold text-sm mb-1">{cat.name}</p>
                  <p className="text-white/40 text-xs">{cat.count} events</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI FEATURES (Interactive with Pop-up Alert) ── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-cyan-400 text-sm font-semibold mb-2 uppercase tracking-widest">Intelligence</motion.p>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl sm:text-5xl font-black text-white mb-4">Powered by EVENTORA AI</motion.h2>
            <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-white/40 max-w-xl mx-auto">Ten intelligent tools that transform how events are discovered, organized, and experienced.</motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "🔍",
                title: "AI Event Discovery",
                desc: "Smart recommendations based on your interests, participation history, and campus trends.",
                color: "#0a84ff",
                fullDesc: "Analyzes student preferences, department schedules, and team registrations to recommend customized academic, cultural, arts, and athletic activities.",
              },
              {
                icon: "✍️",
                title: "AI Content Generator",
                desc: "Generate event descriptions, schedules, promotional captions, and budget plans in seconds.",
                color: "#bf5af2",
                fullDesc: "Creates production-ready descriptions, multi-platform social media posts (Instagram, WhatsApp, Email, Twitter), and itemized budget spreadsheets.",
              },
              {
                icon: "📊",
                title: "AI Attendance Insights",
                desc: "Real-time analytics, participation trends, and actionable insights for every event.",
                color: "#32d2e8",
                fullDesc: "Predicts turnout rates, detects venue schedule conflicts, and tracks seat capacities with visual real-time fill progress.",
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                onClick={() => {
                  showAlert({
                    title: f.title,
                    message: f.fullDesc,
                    badge: "AI Studio Feature",
                    type: "alert",
                    primaryAction: {
                      label: "Try in AI Studio",
                      onClick: () => router.push("/ai-studio"),
                    },
                  });
                }}
              >
                <motion.div whileHover={{ y: -6 }} className="glass-dark border border-white/8 rounded-3xl p-8 cursor-pointer group h-full hover:border-blue-500/40 transition-colors">
                  <div className="text-4xl mb-6">{f.icon}</div>
                  <h3 className="text-white font-bold text-xl mb-3 group-hover:text-blue-400 transition-colors">{f.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
                  <div className="flex items-center gap-2 mt-6 text-sm font-semibold" style={{ color: f.color }}>
                    Try it free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS (Interactive with Pop-up Alert) ── */}
      <section className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-emerald-400 text-sm font-semibold mb-2 uppercase tracking-widest">Simple Process</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl sm:text-5xl font-black text-white mb-16">How It Works</motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              {
                step: "01",
                title: "Sign Up & Profile",
                desc: "Create your account and complete your student profile with register number and department.",
                alertDetail: "Your profile stores your student registration number, department, and track records so you can sign up for events in 1 click without re-typing details.",
              },
              {
                step: "02",
                title: "Discover & Register",
                desc: "Browse AI-curated events, customize Arts or Sports activities (Single vs Group), and confirm.",
                alertDetail: "Filter by category, pick your specific activity discipline (e.g. Solo Classical Dance or Football 7s), and form new squads or join teammate squads.",
              },
              {
                step: "03",
                title: "Participate & Earn",
                desc: "Attend events, get your QR-code ticket scanned, and download your verified certificate.",
                alertDetail: "Every confirmed registration provides an authentic QR-code pass. Following event attendance, verifiable digital certificates are issued to your vault.",
              },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                onClick={() => {
                  showAlert({
                    title: `Step ${s.step}: ${s.title}`,
                    message: s.alertDetail,
                    badge: "Workflow Guide",
                    type: "info",
                    primaryAction: {
                      label: "Get Started",
                      onClick: () => setShowLogin(true),
                    },
                  });
                }}
                className="relative cursor-pointer"
              >
                <div className="glass-dark border border-white/8 rounded-3xl p-8 hover:border-emerald-500/40 transition-colors">
                  <span className="text-6xl font-black text-white/10 block mb-4">{s.step}</span>
                  <h3 className="text-white font-bold text-xl mb-3">{s.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-blue-400 text-sm font-semibold mb-2 uppercase tracking-widest">Community</motion.p>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl sm:text-5xl font-black text-white">What Students Say</motion.h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => {
                  showAlert({
                    title: `${t.name} (${t.dept})`,
                    message: `"${t.quote}" — Verified campus student review on EVENTORA AI.`,
                    badge: "Student Review",
                    type: "info",
                  });
                }}
                className="glass-card p-8 cursor-pointer"
              >
                <div className="flex gap-1 mb-6">{Array(5).fill(0).map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}</div>
                <p className="text-white/70 text-sm leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold">{t.avatar}</div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-white/40 text-xs">{t.dept}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,132,255,0.15), rgba(191,90,242,0.15), rgba(50,210,232,0.1))" }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight">
            Ready to Transform Your<br /><span className="gradient-text">Campus Experience?</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-white/50 text-lg mb-10">
            Join 12,000+ students discovering events, competing in customized arts and sports tracks, and excelling.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/explore"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="btn-primary px-10 py-4 text-base">Explore Events</motion.button></Link>
            <motion.button onClick={() => setShowLogin(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="btn-secondary px-10 py-4 text-base text-white border-white/20">Get Started Free</motion.button>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-16 px-6 bg-[#050508]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div>
                <span className="font-black text-lg gradient-text">EVENTORA AI</span>
              </div>
              <p className="text-white/30 text-sm leading-relaxed">Every Campus Moment, Perfectly Organized.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              {[
                { title: "Platform", links: [{ href: "/explore", label: "Explore Events" }, { href: "/ai-studio", label: "AI Studio" }, { href: "/dashboard", label: "Dashboard" }] },
                { title: "Resources", links: [{ href: "/certificates", label: "Certificates" }, { href: "/notifications", label: "Notifications" }, { href: "/organizer", label: "Organizer" }] },
                { title: "Access", links: [{ href: "/login", label: "Sign In / Register" }, { href: "/admin", label: "Admin Suite" }, { href: "/faculty", label: "Faculty Portal" }] },
              ].map(col => (
                <div key={col.title}>
                  <p className="text-white/60 font-semibold text-sm mb-4">{col.title}</p>
                  <div className="flex flex-col gap-2">
                    {col.links.map(l => <Link key={l.href} href={l.href} className="text-white/30 hover:text-white/60 text-sm transition-colors">{l.label}</Link>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 text-center text-white/20 text-sm">
            © 2026 EVENTORA AI. All rights reserved. Built with ❤️ for campus communities.
          </div>
        </div>
      </footer>

      {/* ── LOGIN MODAL ── */}
      <AnimatePresence>
        {showLogin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center p-4" onClick={() => setShowLogin(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="glass-dark border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-white">Welcome Back</h2>
                  <p className="text-white/40 text-sm mt-1">Sign in to access your campus hub</p>
                </div>
                <button onClick={() => setShowLogin(false)} className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleEmailLogin} className="space-y-4 mb-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/30 outline-none focus:border-blue-500/50 transition-colors" />
                </div>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/30 outline-none focus:border-blue-500/50 transition-colors" />
                </div>
                <button type="submit" className="btn-primary w-full py-3">Sign In</button>
              </form>
              <div className="relative flex items-center gap-4 my-4">
                <div className="flex-1 h-px bg-white/10" /><span className="text-white/30 text-xs">OR</span><div className="flex-1 h-px bg-white/10" />
              </div>
              <button onClick={async () => { await loginWithGoogle(); setShowLogin(false); showToast("Signed in!", "success"); }} className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-xl py-3 text-white text-sm hover:bg-white/10 transition-all mb-4">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </button>
              <div className="pt-2 border-t border-white/10">
                <p className="text-white/30 text-xs text-center mb-3">Instant Demo Access</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button onClick={() => { loginAsMockStudent(); setShowLogin(false); showToast("Logged in as Student", "success"); }} className="py-2 px-1 rounded-xl glass border border-white/10 text-white/70 hover:text-white hover:border-blue-500/40 text-center transition-all">
                    🎓 Student
                  </button>
                  <button onClick={() => { loginAsMockOrganizer(); setShowLogin(false); showToast("Logged in as Organizer", "success"); }} className="py-2 px-1 rounded-xl glass border border-white/10 text-white/70 hover:text-white hover:border-violet-500/40 text-center transition-all">
                    📋 Organizer
                  </button>
                  <button onClick={() => { setShowLogin(false); setShowTeacherLock(true); }} className="py-2 px-1 rounded-xl glass border border-white/10 text-white/70 hover:text-white hover:border-red-500/40 text-center transition-all">
                    🛡️ Admin
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Teacher Lock Modal */}
      <AnimatePresence>
        {showTeacherLock && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-dark border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
              <div className="flex justify-center mb-4"><div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center"><Lock className="w-6 h-6 text-white" /></div></div>
              <h3 className="text-2xl font-bold text-white text-center mb-2">Teacher Login</h3>
              <p className="text-white/40 text-sm text-center mb-6">Enter administrative passcode (1234)</p>
              <form onSubmit={handleTeacherLogin} className="space-y-4">
                <input type="password" placeholder="Enter passcode (1234)" value={passcode} onChange={e => setPasscode(e.target.value)} autoFocus className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm text-center tracking-widest placeholder-white/20 outline-none focus:border-violet-500/50 transition-colors" />
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setShowTeacherLock(false); setPasscode(""); }} className="flex-1 py-3 bg-white/5 text-white/60 rounded-xl hover:bg-white/10 transition-all text-sm">Cancel</button>
                  <button type="submit" className="flex-1 btn-primary py-3 text-sm">Unlock</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
