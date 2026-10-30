"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import {
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  Plus,
  Award,
  Sparkles,
  Download,
  Search,
  Filter,
  GraduationCap,
  ShieldCheck,
  Clock,
  MapPin,
  Flame,
  CheckSquare,
} from "lucide-react";
import CreateEventModal from "@/components/CreateEventModal";

const TABS = ["Department Events", "Student Evaluations", "Certificates", "Academic Guidelines"] as const;

export default function FacultyPage() {
  const router = useRouter();
  const { user, role, teacherProfile, loginAsMockTeacher } = useAuth();
  const { events, registrations, certificates } = useApp();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Department Events");
  const [eventSearch, setEventSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [studentSearch, setStudentSearch] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState<"all" | "confirmed" | "attended">("all");
  const [createEventOpen, setCreateEventOpen] = useState(false);

  // Local state to track attended status updates in the session
  const [localAttendance, setLocalAttendance] = useState<Record<string, boolean>>({});

  const facultyName = teacherProfile?.name || user?.displayName || "Prof. Sharma";
  const facultyDept = teacherProfile?.department || "Computer Science & Engineering";

  const isFacultyOrAdmin = role === "teacher" || role === "faculty" || role === "admin";

  // Filtered Events
  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
      e.category.toLowerCase().includes(eventSearch.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || e.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Filtered Students/Registrations
  const filteredRegistrations = registrations.filter((r) => {
    const isAttended = localAttendance[r.id] ?? (r.attended || r.status === "attended");
    if (attendanceFilter === "attended" && !isAttended) return false;
    if (attendanceFilter === "confirmed" && isAttended) return false;

    const term = studentSearch.toLowerCase();
    return (
      r.studentName.toLowerCase().includes(term) ||
      (r.registerNumber && r.registerNumber.toLowerCase().includes(term)) ||
      (r.className && r.className.toLowerCase().includes(term)) ||
      (r.activityName && r.activityName.toLowerCase().includes(term))
    );
  });

  // Toggle Attendance
  const toggleAttendance = (regId: string, studentName: string) => {
    const current = localAttendance[regId] ?? false;
    const nextState = !current;
    setLocalAttendance((prev) => ({ ...prev, [regId]: nextState }));
    showToast(
      `Marked ${studentName} as ${nextState ? "ATTENDED / VERIFIED" : "PENDING"}`,
      nextState ? "success" : "info"
    );
  };

  // Export Attendance CSV
  const exportAttendanceCSV = () => {
    const rows = [
      ["Student Name", "Register No", "Class / Dept", "Event ID", "Format", "Discipline", "Attendance Status"],
      ...filteredRegistrations.map((r) => [
        r.studentName,
        r.registerNumber || "N/A",
        r.className || "N/A",
        r.eventId,
        r.participationType || "Single",
        r.activityName || "Standard",
        (localAttendance[r.id] ?? r.attended) ? "Attended" : "Confirmed",
      ]),
    ];
    const csvContent = rows.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Faculty_Attendance_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Attendance CSV report downloaded!", "success");
  };

  return (
    <div className="bg-[#0a0a0f] min-h-screen text-white">
      {/* Header Banner */}
      <div
        className="pt-24 pb-12 px-6"
        style={{
          background: "linear-gradient(135deg, rgba(255, 159, 10, 0.08) 0%, rgba(10, 132, 255, 0.08) 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" /> FACULTY EVALUATOR PORTAL
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {facultyDept}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-2">
                Welcome, {facultyName}
              </h1>
              <p className="text-white/40 mt-1 text-sm">
                Supervise campus competitions, evaluate student attendance, and publish departmental events.
              </p>
            </motion.div>

            {/* Header Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              {!isFacultyOrAdmin ? (
                <button
                  onClick={loginAsMockTeacher}
                  className="px-5 py-3 rounded-2xl glass border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all"
                >
                  <ShieldCheck className="w-4 h-4" /> Authorize as Faculty
                </button>
              ) : null}

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCreateEventOpen(true)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 border border-amber-400/30 transition-all cursor-pointer w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> Add Campus Event
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">Supervised Events</span>
              <Calendar className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-3xl font-black text-white">{events.length}</p>
            <p className="text-xs text-amber-400 mt-1 font-medium">Department schedule active</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">Total Enrolled</span>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-black text-white">{registrations.length}</p>
            <p className="text-xs text-blue-400 mt-1 font-medium">Students registered</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">Evaluated / Attended</span>
              <CheckSquare className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-white">
              {Object.values(localAttendance).filter(Boolean).length || registrations.filter((r) => r.attended).length}
            </p>
            <p className="text-xs text-emerald-400 mt-1 font-medium">Attendance verified</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">Certificates</span>
              <Award className="w-5 h-5 text-violet-400" />
            </div>
            <p className="text-3xl font-black text-white">{certificates.length || 1}</p>
            <p className="text-xs text-violet-400 mt-1 font-medium">Tamper-proof verifiable</p>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1.5 glass rounded-2xl border border-white/10 mb-8 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-fit px-5 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── TAB CONTENT ── */}
        <AnimatePresence mode="wait">
          {/* TAB 1: Department Events */}
          {activeTab === "Department Events" && (
            <motion.div
              key="events"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Filter & Actions Bar */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                    placeholder="Search department events by title or category..."
                    className="w-full glass border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-white/30 outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="glass border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm outline-none bg-[#0a0a0f]"
                  >
                    {["All", "Technical", "Cultural", "Sports", "Arts", "Workshop", "Seminar", "Placement"].map((c) => (
                      <option key={c} value={c} className="bg-[#0a0a0f]">
                        {c}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setCreateEventOpen(true)}
                    className="btn-primary py-2.5 px-5 text-xs sm:text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold border-amber-400/40 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" /> Add Event
                  </button>
                </div>
              </div>

              {/* Events Table */}
              <div className="glass-dark border border-white/8 rounded-3xl overflow-hidden shadow-2xl">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8 bg-white/[0.02]">
                      {["Event Details", "Category", "Format", "Date & Venue", "Enrollment", "Status", "Actions"].map((h) => (
                        <th key={h} className="px-4 py-3.5 text-left text-white/40 text-xs font-bold uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map((e) => (
                      <tr key={e.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            {e.image && (
                              <img
                                src={e.image}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-white/10"
                                onError={(err) => {
                                  (err.target as HTMLImageElement).src = `https://picsum.photos/seed/${e.id}/40/40`;
                                }}
                              />
                            )}
                            <div>
                              <p className="text-white font-bold max-w-[200px] truncate">{e.title}</p>
                              <p className="text-white/40 text-[11px] truncate">{e.organizer || "Campus Lead"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`badge-${e.category.toLowerCase()} px-2.5 py-0.5 rounded-full text-xs font-semibold`}>
                            {e.category}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-white/5 border border-white/10 text-white/70">
                            {e.type}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-white/60 text-xs">
                          <div className="flex flex-col gap-0.5">
                            <span className="flex items-center gap-1 text-white font-medium">
                              <Calendar className="w-3 h-3 text-amber-400" />
                              {new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                            <span className="flex items-center gap-1 text-white/40 text-[11px]">
                              <MapPin className="w-3 h-3 text-blue-400" />
                              {e.venue || "Campus Hall"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-white/70 text-xs">
                          <span className="font-semibold text-white">{e.registeredCount || 0}</span> / {e.maxSeats || 100}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`status-${e.status} px-2.5 py-0.5 rounded-full text-xs capitalize font-semibold`}>
                            {e.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <Link href={`/events/${e.id}`}>
                              <button
                                title="View Event"
                                className="p-1.5 glass border border-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </Link>
                            <button
                              onClick={() => {
                                setActiveTab("Student Evaluations");
                                showToast(`Viewing participants for ${e.title}`, "info");
                              }}
                              title="Evaluate Students"
                              className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold flex items-center gap-1 transition-colors"
                            >
                              Evaluate
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 2: Student Evaluations & Attendance */}
          {activeTab === "Student Evaluations" && (
            <motion.div
              key="evaluations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search by student name, register number (e.g. 20CS042), or class..."
                    className="w-full glass border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-white/30 outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {(["all", "confirmed", "attended"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setAttendanceFilter(filter)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                        attendanceFilter === filter
                          ? "bg-amber-500 text-black shadow-md font-bold"
                          : "glass border border-white/10 text-white/50 hover:text-white"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}

                  <button
                    onClick={exportAttendanceCSV}
                    className="px-4 py-2 rounded-xl glass border border-white/15 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-white/10 transition-colors whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5" /> Export CSV
                  </button>
                </div>
              </div>

              {/* Student Attendance List */}
              <div className="glass-dark border border-white/8 rounded-3xl overflow-hidden shadow-2xl">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8 bg-white/[0.02]">
                      {["Student Name", "Register No.", "Class / Dept", "Event / Discipline", "Format", "Attendance Status", "Action"].map((h) => (
                        <th key={h} className="px-4 py-3.5 text-left text-white/40 text-xs font-bold uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-white/40 text-sm">
                          No student registrations found matching your query.
                        </td>
                      </tr>
                    ) : (
                      filteredRegistrations.map((r) => {
                        const isAttended = localAttendance[r.id] ?? (r.attended || r.status === "attended");
                        return (
                          <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                            <td className="px-4 py-3.5">
                              <p className="text-white font-bold">{r.studentName}</p>
                              {r.ticketId && <p className="text-[10px] text-white/40 font-mono">#{r.ticketId}</p>}
                            </td>
                            <td className="px-4 py-3.5 font-mono text-xs text-amber-300">
                              {r.registerNumber || "20CS042"}
                            </td>
                            <td className="px-4 py-3.5 text-white/70 text-xs">
                              {r.className || "CSE-A, 3rd Year"}
                            </td>
                            <td className="px-4 py-3.5 text-xs text-white/80">
                              <p className="font-semibold text-white truncate max-w-[180px]">
                                {r.activityName || "Standard Entry"}
                              </p>
                              <p className="text-[10px] text-white/40">Event #{r.eventId}</p>
                            </td>
                            <td className="px-4 py-3.5 text-xs">
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/5 border border-white/10 text-white/70">
                                {r.participationType || "Single"}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              {isAttended ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  <CheckCircle className="w-3.5 h-3.5" /> Attended
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/5 text-white/50 border border-white/10">
                                  <Clock className="w-3.5 h-3.5" /> Confirmed
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              <button
                                onClick={() => toggleAttendance(r.id, r.studentName)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                  isAttended
                                    ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/50"
                                    : "bg-amber-500 text-black hover:bg-amber-400 shadow-md"
                                }`}
                              >
                                {isAttended ? "Revoke Attendance" : "Mark Attended"}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 3: Certificates */}
          {activeTab === "Certificates" && (
            <motion.div
              key="certificates"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="glass-dark border border-white/8 rounded-3xl p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-400" /> Digital Certificate Authority
                    </h3>
                    <p className="text-white/40 text-xs mt-1">
                      Faculty evaluation automatically triggers verified certificate generation with QR validation codes.
                    </p>
                  </div>
                  <Link href="/certificates">
                    <button className="btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-1.5">
                      View Certificate Registry ↗
                    </button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <p className="text-sm font-bold text-amber-300">Automated Criteria</p>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Certificates are issued only to students whose attendance is marked as <strong>Attended</strong> by faculty evaluators or event organizers.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <p className="text-sm font-bold text-emerald-300">Instant Verification</p>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Every certificate carries a unique tamper-proof certificate ID and QR code verifiable by future employers and academic bodies.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: Academic Guidelines */}
          {activeTab === "Academic Guidelines" && (
            <motion.div
              key="guidelines"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="glass-dark border border-white/8 rounded-3xl p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Campus Regulations & Event Quotas</h3>
                    <p className="text-white/40 text-xs">Official academic rules for student activity participation</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <h4 className="text-sm font-bold text-amber-300 mb-1">1. Individual (Single) Event Limit</h4>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Each student can enroll in a maximum of <strong>3 Individual (Single)</strong> events across the semester to safeguard core lecture and laboratory hours.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <h4 className="text-sm font-bold text-blue-300 mb-1">2. Group & Squad Team Participation</h4>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Group activities (Football, Cricket, Group Folk Dance, Street Play) feature <strong>unlimited participation</strong>, encouraging inter-department collaboration.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <h4 className="text-sm font-bold text-emerald-300 mb-1">3. Faculty Attendance Endorsement</h4>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Faculty members retain authority to mark attendance, approve customized discipline entries, and cancel duplicate bookings.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Faculty Create Event Modal with Customized Image Option */}
      <CreateEventModal
        isOpen={createEventOpen}
        onClose={() => setCreateEventOpen(false)}
        onSuccess={(id, title) => {
          showToast(`Faculty Event "${title}" published to campus schedule!`, "success");
        }}
      />
    </div>
  );
}
