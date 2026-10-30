"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { CheckCircle, XCircle, Eye, Users, Calendar, BarChart3, Shield, Activity, Database, RefreshCw, Server, Plus } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, setDoc, collection, onSnapshot } from "firebase/firestore";
import { initialEvents, DEFAULT_ARTS_ACTIVITIES, DEFAULT_SPORTS_ACTIVITIES, initialGroups, mockCertificates } from "@/lib/mockData";
import { useToast } from "@/context/ToastContext";
import CreateEventModal from "@/components/CreateEventModal";

const TABS = ["Overview", "Events", "Users", "Analytics", "Database", "Audit Log"];

const MOCK_USERS = [
  { name: "Alex Johnson", email: "alex@college.edu", role: "student", date: "2026-09-01", status: "active" },
  { name: "Priya Sharma", email: "priya@college.edu", role: "student", date: "2026-09-05", status: "active" },
  { name: "Dr. Kumar", email: "kumar@college.edu", role: "faculty", date: "2026-08-15", status: "active" },
  { name: "Tech Club Admin", email: "tech@college.edu", role: "organizer", date: "2026-08-20", status: "active" },
  { name: "Rahul Menon", email: "rahul@college.edu", role: "student", date: "2026-09-10", status: "active" },
  { name: "Sports Secretary", email: "sports@college.edu", role: "organizer", date: "2026-08-25", status: "active" },
  { name: "Prof. Nair", email: "nair@college.edu", role: "faculty", date: "2026-08-10", status: "inactive" },
  { name: "Ananya K", email: "ananya@college.edu", role: "student", date: "2026-09-15", status: "active" },
];

const AUDIT_LOG = [
  { ts: "2026-10-29 20:30", admin: "Admin", action: "Approved Event", target: "TechNova 2026", result: "success" },
  { ts: "2026-10-29 19:15", admin: "Admin", action: "Rejected Event", target: "Duplicate Workshop", result: "success" },
  { ts: "2026-10-29 18:00", admin: "Admin", action: "Issued Certificates", target: "Debate Championship", result: "success" },
  { ts: "2026-10-28 14:30", admin: "Admin", action: "Suspended User", target: "test@college.edu", result: "success" },
  { ts: "2026-10-28 12:00", admin: "Admin", action: "Updated Category", target: "Technical", result: "success" },
];

const ROLE_COLORS: Record<string, string> = {
  student: "badge-technical", faculty: "badge-seminar", organizer: "badge-cultural", admin: "badge-conference",
};

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { events, registrations } = useApp();
  const [activeTab, setActiveTab] = useState("Overview");
  const [userRoleFilter, setUserRoleFilter] = useState("All");
  const [eventSearch, setEventSearch] = useState("");
  const [syncingDb, setSyncingDb] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const { showToast } = useToast();

  const handleSyncFirestore = async () => {
    if (!db) {
      showToast("Firebase database is not initialized", "error");
      return;
    }
    setSyncingDb(true);
    setSyncSuccess(false);
    try {
      for (const ev of initialEvents) {
        await setDoc(doc(db, "events", ev.id), ev);
      }
      for (const act of [...DEFAULT_ARTS_ACTIVITIES, ...DEFAULT_SPORTS_ACTIVITIES]) {
        await setDoc(doc(db, "activities", act.id), act);
      }
      for (const grp of initialGroups) {
        await setDoc(doc(db, "groups", grp.id), grp);
      }
      for (const cert of mockCertificates) {
        await setDoc(doc(db, "certificates", cert.id), cert);
      }
      setSyncSuccess(true);
      showToast("Cloud Firestore database synced successfully!", "success");
    } catch (err: any) {
      console.error("Database sync error:", err);
      showToast("Database sync: " + (err.message || "Failed to update Firestore"), "error");
    } finally {
      setSyncingDb(false);
    }
  };

  useEffect(() => { if (!loading && !user) router.push("/"); }, [user, loading, router]);
  if (loading || !user) return <div className="bg-[#0a0a0f] min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" /></div>;

  const [dbUsers, setDbUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(
      collection(db, "users"),
      (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(doc => {
            const d = doc.data();
            return {
              name: d.name || d.displayName || d.email?.split("@")[0] || "User",
              email: d.email || "—",
              role: d.role || "student",
              date: d.lastLoginAt ? new Date(d.lastLoginAt).toLocaleDateString() : (d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "2026-09-01"),
              status: d.status || "active",
            };
          });
          setDbUsers(list);
        }
      },
      (err) => {
        console.warn("Could not load users collection:", err);
      }
    );
    return () => unsub();
  }, []);

  const allUsersList = dbUsers.length > 0 ? dbUsers : MOCK_USERS;
  const filteredEvents = events.filter(e => !eventSearch || e.title.toLowerCase().includes(eventSearch.toLowerCase()));
  const filteredUsers = userRoleFilter === "All" ? allUsersList : allUsersList.filter(u => u.role === userRoleFilter.toLowerCase());
  const categoryStats = ["Technical","Cultural","Sports","Workshop","Seminar","Conference","Placement","Club"].map(cat => ({ cat, count: events.filter(e => e.category === cat).length })).sort((a,b)=>b.count-a.count);

  const kpis = [
    { label: "Total Students", value: allUsersList.filter(u=>u.role==="student").length.toString(), color: "#0a84ff", icon: Users },
    { label: "Active Events", value: events.filter(e=>e.status==="upcoming").length.toString(), color: "#bf5af2", icon: Calendar },
    { label: "Total Registrations", value: registrations.length > 0 ? registrations.length.toString() : "4,821", color: "#30d158", icon: Activity },
    { label: "Platform Health", value: "99.9%", color: "#ff9f0a", icon: Shield },
  ];

  return (
    <div className="bg-[#0a0a0f] min-h-screen">
      <div className="pt-24 pb-12 px-6" style={{ background: "linear-gradient(135deg, rgba(255,69,58,0.06), rgba(10,132,255,0.06))" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-2">
                <p className="text-red-400 text-sm font-semibold uppercase tracking-widest">Admin</p>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">CONTROL CENTER</span>
              </div>
              <h1 className="text-4xl font-black text-white">Admin Dashboard</h1>
              <p className="text-white/40 mt-1">Full platform oversight and management</p>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCreateEventOpen(true)}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 border border-red-400/30 transition-all cursor-pointer w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" /> Add Campus Event
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {kpis.map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${k.color}20` }}>
                  <k.icon className="w-5 h-5" style={{ color: k.color }} />
                </div>
              </div>
              <p className="text-3xl font-black text-white mb-1">{k.value}</p>
              <p className="text-white/40 text-sm">{k.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 glass rounded-2xl border border-white/10 mb-8 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 min-w-fit px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab ? "bg-red-600 text-white" : "text-white/50 hover:text-white"}`}>{tab}</button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

            {/* Overview */}
            {activeTab === "Overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="glass-dark border border-white/8 rounded-3xl p-6">
                    <h3 className="text-white font-bold mb-4">Pending Approvals</h3>
                    {[{ title: "Photography Workshop", cat: "Workshop" }, { title: "Drama Night 2026", cat: "Cultural" }, { title: "ML Conference", cat: "Conference" }].map((ev, i) => (
                      <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                        <div>
                          <p className="text-white font-medium text-sm">{ev.title}</p>
                          <span className={`badge-${ev.cat.toLowerCase()} text-xs px-2 py-0.5 rounded-full font-semibold mt-1 inline-block`}>{ev.cat}</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-1.5 rounded-lg text-green-400 hover:bg-green-400/10 transition-colors"><CheckCircle className="w-4 h-4" /></button>
                          <button className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"><XCircle className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="glass-dark border border-white/8 rounded-3xl p-6">
                    <h3 className="text-white font-bold mb-4">Recent Activity</h3>
                    {AUDIT_LOG.slice(0,5).map((log, i) => (
                      <div key={i} className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
                        <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-white text-sm">{log.action}: <span className="text-white/60">{log.target}</span></p>
                          <p className="text-white/30 text-xs mt-0.5">{log.ts}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Events */}
            {activeTab === "Events" && (
              <div>
                <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-stretch sm:items-center">
                  <input
                    value={eventSearch}
                    onChange={e => setEventSearch(e.target.value)}
                    placeholder="Search events by title or category..."
                    className="flex-1 glass border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 outline-none focus:border-red-500/40"
                  />
                  <button
                    onClick={() => setCreateEventOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 border border-red-400/30 whitespace-nowrap cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add New Event
                  </button>
                </div>
                <div className="glass-dark border border-white/8 rounded-3xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-white/8">{["Event","Category","Date","Registrations","Status","Actions"].map(h=><th key={h} className="px-4 py-3 text-left text-white/40 text-xs font-semibold">{h}</th>)}</tr></thead>
                    <tbody>{filteredEvents.map(e=>(
                      <tr key={e.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                        <td className="px-4 py-3 text-white font-medium max-w-[200px] truncate">{e.title}</td>
                        <td className="px-4 py-3"><span className={`badge-${e.category.toLowerCase()} px-2 py-0.5 rounded-full text-xs font-semibold`}>{e.category}</span></td>
                        <td className="px-4 py-3 text-white/50">{new Date(e.date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</td>
                        <td className="px-4 py-3 text-white/50">{e.registeredCount||0}/{e.maxSeats||"∞"}</td>
                        <td className="px-4 py-3"><span className={`status-${e.status} px-2 py-0.5 rounded-full text-xs capitalize font-semibold`}>{e.status}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Link href={`/events/${e.id}`}><button className="p-1.5 glass border border-white/10 rounded-lg text-white/40 hover:text-white"><Eye className="w-3.5 h-3.5"/></button></Link>
                            <button className="p-1.5 rounded-lg text-green-400 hover:bg-green-400/10"><CheckCircle className="w-3.5 h-3.5"/></button>
                            <button className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10"><XCircle className="w-3.5 h-3.5"/></button>
                          </div>
                        </td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Users */}
            {activeTab === "Users" && (
              <div>
                <div className="flex gap-3 mb-6">
                  {["All","Student","Faculty","Organizer"].map(r=>(
                    <button key={r} onClick={()=>setUserRoleFilter(r)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${userRoleFilter===r?"bg-blue-600 text-white":"glass border border-white/10 text-white/50 hover:text-white"}`}>{r}</button>
                  ))}
                </div>
                <div className="glass-dark border border-white/8 rounded-3xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-white/8">{["Name","Email","Role","Joined","Status","Actions"].map(h=><th key={h} className="px-4 py-3 text-left text-white/40 text-xs font-semibold">{h}</th>)}</tr></thead>
                    <tbody>{filteredUsers.map((u,i)=>(
                      <tr key={i} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                        <td className="px-4 py-3 text-white font-medium">{u.name}</td>
                        <td className="px-4 py-3 text-white/50 text-xs">{u.email}</td>
                        <td className="px-4 py-3"><span className={`${ROLE_COLORS[u.role]} px-2 py-0.5 rounded-full text-xs font-semibold capitalize`}>{u.role}</span></td>
                        <td className="px-4 py-3 text-white/50">{u.date}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.status==="active"?"status-upcoming":"status-completed"}`}>{u.status}</span></td>
                        <td className="px-4 py-3"><button className="text-xs text-white/40 hover:text-red-400 transition-colors">Manage</button></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Analytics */}
            {activeTab === "Analytics" && (
              <div className="space-y-6">
                <div className="glass-dark border border-white/8 rounded-3xl p-6">
                  <h3 className="text-white font-bold mb-6">Events by Category</h3>
                  <div className="space-y-4">
                    {categoryStats.map(s => (
                      <div key={s.cat}>
                        <div className="flex justify-between text-sm mb-1.5"><span className="text-white/70">{s.cat}</span><span className="text-white/40">{s.count} events</span></div>
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                          <motion.div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-600" initial={{width:0}} whileInView={{width:`${Math.max(s.count/Math.max(...categoryStats.map(x=>x.count))*100,5)}%`}} viewport={{once:true}} transition={{duration:0.8}} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[{l:"Peak Registration Day",v:"Saturday"},{l:"Most Popular Category",v:"Technical"},{l:"Total Revenue Generated",v:"₹0 (Free Platform)"}].map(s=>(
                    <div key={s.l} className="glass-dark border border-white/8 rounded-2xl p-5">
                      <p className="text-white/40 text-xs mb-2">{s.l}</p><p className="text-white font-bold">{s.v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Database Tab */}
            {activeTab === "Database" && (
              <div className="space-y-6">
                <div className="glass-dark border border-white/8 rounded-3xl p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <Database className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">Google Cloud Firestore</h3>
                        <p className="text-white/40 text-sm">Project: <span className="font-mono text-blue-400">collage-event-a47a9</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live & Connected
                      </span>
                      <button
                        onClick={handleSyncFirestore}
                        disabled={syncingDb}
                        className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2"
                      >
                        <RefreshCw className={`w-4 h-4 ${syncingDb ? "animate-spin" : ""}`} />
                        {syncingDb ? "Syncing..." : "Sync to Firestore"}
                      </button>
                    </div>
                  </div>

                  {syncSuccess && (
                    <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-300 text-sm">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      All campus events, arts/sports tracks, groups, and certificates are synced with Firestore!
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                    <div className="p-4 rounded-2xl glass border border-white/5">
                      <p className="text-white/40 text-xs mb-1">Firestore Collections</p>
                      <p className="text-white font-mono font-bold text-sm">events, activities, groups, users</p>
                    </div>
                    <div className="p-4 rounded-2xl glass border border-white/5">
                      <p className="text-white/40 text-xs mb-1">Security Rules</p>
                      <p className="text-white font-semibold flex items-center gap-1.5 text-sm">
                        <Shield className="w-4 h-4 text-emerald-400" /> firestore.rules (Active)
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl glass border border-white/5">
                      <p className="text-white/40 text-xs mb-1">Repository Export</p>
                      <p className="text-blue-400 font-mono text-sm">data/database.json</p>
                    </div>
                  </div>
                </div>

                <div className="glass-dark border border-white/8 rounded-3xl p-6">
                  <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Server className="w-4 h-4 text-violet-400" /> CLI Database Tooling
                  </h4>
                  <div className="bg-[#050508] p-4 rounded-2xl border border-white/10 font-mono text-xs text-white/80 space-y-2">
                    <p className="text-white/40"># Run automated Firestore database seeder from terminal:</p>
                    <p className="text-green-400">npm run db:seed</p>
                    <p className="text-white/40 mt-3"># Re-export current database schema to JSON:</p>
                    <p className="text-green-400">npm run db:export</p>
                  </div>
                </div>
              </div>
            )}

            {/* Audit Log */}
            {activeTab === "Audit Log" && (
              <div>
                <div className="glass-dark border border-white/8 rounded-3xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-white/8">{["Timestamp","Admin","Action","Target","Result"].map(h=><th key={h} className="px-4 py-3 text-left text-white/40 text-xs font-semibold">{h}</th>)}</tr></thead>
                    <tbody>{AUDIT_LOG.map((log,i)=>(
                      <tr key={i} className="border-b border-white/5">
                        <td className="px-4 py-3 text-white/40 text-xs font-mono">{log.ts}</td>
                        <td className="px-4 py-3 text-white/60">{log.admin}</td>
                        <td className="px-4 py-3 text-white">{log.action}</td>
                        <td className="px-4 py-3 text-white/50">{log.target}</td>
                        <td className="px-4 py-3"><span className="status-upcoming px-2 py-0.5 rounded-full text-xs font-semibold">{log.result}</span></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Admin Create Event Modal */}
      <CreateEventModal
        isOpen={createEventOpen}
        onClose={() => setCreateEventOpen(false)}
        onSuccess={(id, title) => {
          showToast(`Event "${title}" published by Admin!`, "success");
        }}
      />
    </div>
  );
}
