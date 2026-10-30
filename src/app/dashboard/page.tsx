"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import EventCard from "@/components/EventCard";
import ActivityCustomizerModal from "@/components/ActivityCustomizerModal";
import {
  Calendar, Award, Heart, Bell, ArrowRight, Ticket, CheckCircle, Clock,
  Megaphone, BookOpen, Zap, Palette, Trophy, User, Users, Flame
} from "lucide-react";

function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  if (d < 60000) return "Just now";
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`;
  return `${Math.floor(d / 86400000)}d ago`;
}

const NOTIF_ICONS: Record<string, React.ReactNode> = {
  registration: <CheckCircle className="w-4 h-4 text-green-400" />,
  reminder: <Clock className="w-4 h-4 text-blue-400" />,
  certificate: <Award className="w-4 h-4 text-yellow-400" />,
  announcement: <Megaphone className="w-4 h-4 text-violet-400" />,
  cancellation: <Bell className="w-4 h-4 text-red-400" />,
  update: <Bell className="w-4 h-4 text-cyan-400" />,
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, studentProfile, updateStudentProfile, loading } = useAuth();
  const { events, myRegistrations, notifications, certificates, favorites, unreadCount } = useApp();
  const { showToast } = useToast();
  const [profileName, setProfileName] = useState("");
  const [profileReg, setProfileReg] = useState("");
  const [profileClass, setProfileClass] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [customizerCategory, setCustomizerCategory] = useState<"Arts" | "Sports">("Arts");

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  if (loading || !user) return (
    <div className="bg-[#0a0a0f] min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
    </div>
  );

  const myEventDetails = myRegistrations.map(reg => ({ reg, event: events.find(e => e.id === reg.eventId) })).filter(x => x.event);
  const upcomingCount = events.filter(e => e.status === "upcoming").length;
  const recommended = events.filter(e => !myRegistrations.some(r => r.eventId === e.id) && e.status === "upcoming").slice(0, 4);
  const recentNotifs = notifications.slice(0, 3);

  const individualCount = myRegistrations.filter(r => {
    const ev = events.find(e => e.id === r.eventId);
    return r.participationType === "Single" || ev?.type === "Individual";
  }).length;

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName || !profileReg || !profileClass) { showToast("Please fill all fields", "error"); return; }
    setSavingProfile(true);
    await updateStudentProfile({ name: profileName, registerNumber: profileReg, className: profileClass });
    setSavingProfile(false);
    showToast("Profile saved!", "success");
  };

  const stats = [
    { label: "Registered Events", value: myRegistrations.length, icon: Calendar, color: "#0a84ff", bg: "rgba(10,132,255,0.1)", href: "#my-events" },
    { label: "Upcoming Events", value: upcomingCount, icon: Clock, color: "#bf5af2", bg: "rgba(191,90,242,0.1)", href: "/explore?status=upcoming" },
    { label: "Certificates", value: certificates.length, icon: Award, color: "#30d158", bg: "rgba(48,209,88,0.1)", href: "/certificates" },
    { label: "Favorites", value: favorites.length, icon: Heart, color: "#ff453a", bg: "rgba(255,69,58,0.1)", href: "/explore" },
  ];

  return (
    <div className="bg-[#0a0a0f] min-h-screen">
      {/* Header */}
      <div className="pt-24 pb-12 px-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(10,132,255,0.1), rgba(191,90,242,0.08))" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-white/40 text-sm mb-1">Welcome back 👋</p>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
              {studentProfile?.name ? <span>{studentProfile.name}<span className="gradient-text">!</span></span> : <span className="gradient-text">My Dashboard</span>}
            </h1>
            <p className="text-white/40">{studentProfile?.className && `${studentProfile.className} · `}{studentProfile?.registerNumber}</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        {/* Profile setup */}
        {!studentProfile && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-dark border border-blue-500/20 rounded-3xl p-6" style={{ background: "rgba(10,132,255,0.05)" }}>
            <h2 className="text-white font-bold text-xl mb-2">Complete Your Profile</h2>
            <p className="text-white/40 text-sm mb-6">Set up your profile to register for events</p>
            <form onSubmit={handleProfileSave} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className="text-white/40 text-xs mb-1.5 block">Full Name</label>
                <input value={profileName} onChange={e => setProfileName(e.target.value)} placeholder="Alex Johnson" className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none focus:border-blue-500/50" />
              </div>
              <div><label className="text-white/40 text-xs mb-1.5 block">Register Number</label>
                <input value={profileReg} onChange={e => setProfileReg(e.target.value)} placeholder="20CS001" className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none focus:border-blue-500/50" />
              </div>
              <div><label className="text-white/40 text-xs mb-1.5 block">Class</label>
                <input value={profileClass} onChange={e => setProfileClass(e.target.value)} placeholder="CSE-A, 3rd Year" className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none focus:border-blue-500/50" />
              </div>
              <div className="sm:col-span-3">
                <button type="submit" disabled={savingProfile} className="btn-primary px-8 py-3 text-sm">{savingProfile ? "Saving..." : "Save Profile"}</button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Link href={s.href} className="block group">
                <div className="glass-card p-6 transition-all duration-300 group-hover:border-white/20 group-hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: s.bg }}>
                      <s.icon className="w-5 h-5" style={{ color: s.color }} />
                    </div>
                    <span className="text-white/30 text-xs font-semibold group-hover:text-white/70 transition-colors">
                      View →
                    </span>
                  </div>
                  <p className="text-3xl font-black text-white mb-1">{s.value}</p>
                  <p className="text-white/40 text-sm group-hover:text-white/70 transition-colors">{s.label}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-white font-bold text-xl mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { href: "/explore", label: "Explore Events", icon: BookOpen, color: "#0a84ff" },
              { href: "/ai-studio", label: "AI Studio", icon: Zap, color: "#bf5af2" },
              { href: "/certificates", label: "Certificates", icon: Award, color: "#30d158" },
              { href: "/notifications", label: "Notifications", icon: Bell, color: "#ff9f0a", badge: unreadCount },
            ].map(a => (
              <Link key={a.href} href={a.href}>
                <motion.div whileHover={{ y: -3, scale: 1.02 }} className="glass-card p-5 cursor-pointer">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 relative" style={{ background: `${a.color}20` }}>
                    <a.icon className="w-5 h-5" style={{ color: a.color }} />
                    {a.badge && a.badge > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center font-bold">{a.badge}</span>}
                  </div>
                  <p className="text-white font-semibold text-sm">{a.label}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* Customized Arts & Sports Quick Action Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark border border-violet-500/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(191,90,242,0.1), rgba(48,209,88,0.06))" }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  <Flame className="w-3.5 h-3.5 inline mr-1" /> Customized Activities
                </span>
                <span className="text-xs text-blue-400 font-semibold">
                  Individual Events Quota: {individualCount}/3 used
                </span>
              </div>
              <h3 className="text-2xl font-black text-white">Arts & Sports Disciplines</h3>
              <p className="text-white/50 text-sm max-w-xl">
                Choose to compete as a <strong>Single Soloist</strong> (Classical Dance, Live Painting, 100m Sprint) or unite in <strong>Group Teams</strong> (Football 7s, Cricket T10, Folk Dance).
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setCustomizerCategory("Arts");
                  setCustomizerOpen(true);
                }}
                className="btn-primary py-3 px-5 text-sm font-semibold flex items-center gap-2"
              >
                <Palette className="w-4 h-4" /> Arts (Single/Group)
              </button>

              <button
                onClick={() => {
                  setCustomizerCategory("Sports");
                  setCustomizerOpen(true);
                }}
                className="px-5 py-3 rounded-xl glass border border-emerald-500/30 text-emerald-300 hover:text-white hover:bg-emerald-500/20 text-sm font-semibold flex items-center gap-2 transition-all"
              >
                <Trophy className="w-4 h-4" /> Sports (Single/Group)
              </button>
            </div>
          </div>
        </motion.div>

        {/* My Events */}
        <div id="my-events" className="scroll-mt-28">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-bold text-xl">My Registered Events</h2>
            <span className="text-xs text-white/40">Total: {myEventDetails.length} registered</span>
          </div>
          {myEventDetails.length === 0 ? (
            <div className="glass-dark border border-white/8 rounded-3xl p-12 text-center">
              <div className="text-5xl mb-4">🎭</div>
              <h3 className="text-white font-bold text-xl mb-2">No Registrations Yet</h3>
              <p className="text-white/40 mb-6">Explore events or customize an Arts or Sports activity to register</p>
              <div className="flex justify-center gap-3">
                <Link href="/explore"><button className="btn-primary px-6 py-3 text-sm">Explore Events</button></Link>
                <button onClick={() => setCustomizerOpen(true)} className="btn-secondary text-white border-white/20 px-6 py-3 text-sm">Customize Activity</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {myEventDetails.map(({ reg, event }, i) => event && (
                <motion.div key={reg.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-dark border border-white/8 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  {event.image && <img src={event.image} alt={event.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${event.id}/64/64`; }} />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-bold text-base truncate">{event.title}</p>
                      {reg.participationType && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          reg.participationType === "Single"
                            ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                            : "bg-purple-500/15 text-purple-400 border border-purple-500/20"
                        }`}>
                          {reg.participationType}
                        </span>
                      )}
                    </div>
                    {reg.activityName && (
                      <p className="text-blue-300 text-xs font-semibold mt-1">
                        Discipline: {reg.activityName}
                      </p>
                    )}
                    {reg.groupName && (
                      <p className="text-violet-300 text-xs mt-0.5">
                        Team: <strong>{reg.groupName}</strong>
                      </p>
                    )}
                    <p className="text-white/40 text-xs mt-1">
                      {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {event.venue || "TBA"}
                    </p>
                    {reg.ticketId && <p className="text-white/50 text-[11px] mt-1 font-mono">Ticket: {reg.ticketId}</p>}
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className={`status-${reg.status || "confirmed"} px-3 py-1 rounded-full text-xs font-semibold capitalize`}>{reg.status || "confirmed"}</span>
                    <Link href={`/events/${event.id}`}>
                      <button className="px-4 py-2 glass border border-white/10 rounded-xl text-white/70 hover:text-white flex items-center gap-1.5 text-xs font-semibold transition-colors">
                        <Ticket className="w-4 h-4" /> View Ticket
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended */}
        {recommended.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-xl">Recommended For You</h2>
              <Link href="/explore" className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-colors">View All <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recommended.map((e, i) => <EventCard key={e.id} event={e} index={i} />)}
            </div>
          </div>
        )}

        {/* Notifications */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-bold text-xl">Recent Notifications</h2>
            <Link href="/notifications" className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-colors">View All <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="space-y-3">
            {recentNotifs.map((n, i) => (
              <motion.div key={n.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${!n.read ? "glass-dark border-blue-500/20" : "glass-dark border-white/5"}`}>
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {NOTIF_ICONS[n.type] || <Bell className="w-4 h-4 text-white/40" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${n.read ? "text-white/60" : "text-white"}`}>{n.title}</p>
                    <span className="text-white/30 text-xs flex-shrink-0">{timeAgo(n.createdAt)}</span>
                  </div>
                  <p className="text-white/40 text-xs mt-0.5 line-clamp-2">{n.message}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <ActivityCustomizerModal
        isOpen={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
        initialCategory={customizerCategory}
      />
    </div>
  );
}
