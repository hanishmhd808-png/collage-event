"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  Calendar, MapPin, Users, Clock, Award, ChevronLeft, Share2, Heart,
  CheckCircle, AlertCircle, Ticket, User, Palette, Trophy, Sparkles
} from "lucide-react";
import { DEFAULT_ARTS_ACTIVITIES, DEFAULT_SPORTS_ACTIVITIES } from "@/lib/mockData";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}
function formatShortDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function daysUntil(d: string) {
  const diff = new Date(d).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const TABS = ["Overview", "Schedule", "Speakers", "Register"];
const CATEGORY_BADGE: Record<string, string> = {
  Technical:"badge-technical", Cultural:"badge-cultural", Workshop:"badge-workshop",
  Seminar:"badge-seminar", Conference:"badge-conference", Sports:"badge-sports",
  Placement:"badge-placement", Club:"badge-club", Arts:"badge-arts", Festivals:"badge-festivals",
};

function QRTicket({
  ticketId,
  eventTitle,
  date,
  activityName,
  groupName,
  participationType,
}: {
  ticketId: string;
  eventTitle: string;
  date: string;
  activityName?: string;
  groupName?: string;
  participationType?: "Single" | "Group";
}) {
  const cells = Array.from({ length: 100 }, (_, i) => ticketId.charCodeAt(i % ticketId.length) % 2 === 0);
  return (
    <div className="glass-dark border border-white/10 rounded-3xl p-6 text-center">
      <div className="flex items-center justify-center gap-2 mb-4 text-green-400">
        <CheckCircle className="w-5 h-5" />
        <span className="font-bold">Registration Confirmed</span>
      </div>
      <p className="text-white font-black text-xl mb-1">{eventTitle}</p>
      {activityName && (
        <p className="text-blue-400 font-semibold text-sm mb-1">
          Activity: {activityName} ({participationType || "Entry"})
        </p>
      )}
      {groupName && (
        <p className="text-violet-400 font-medium text-xs mb-1">
          Team: {groupName}
        </p>
      )}
      <p className="text-white/40 text-xs mb-6">{formatDate(date)}</p>
      {/* QR Grid */}
      <div className="inline-block p-3 bg-white rounded-2xl mb-4">
        <div className="grid gap-[2px]" style={{ gridTemplateColumns: "repeat(10, 1fr)", width: "120px" }}>
          {cells.map((filled, i) => <div key={i} className={`w-[10px] h-[10px] rounded-sm ${filled ? "bg-black" : "bg-white"}`} />)}
        </div>
      </div>
      <p className="text-white/40 text-xs mb-1">Ticket ID</p>
      <p className="text-white font-mono font-bold tracking-widest text-sm">{ticketId}</p>
      <div className="flex gap-3 mt-6 justify-center">
        <button onClick={() => navigator.clipboard?.writeText(ticketId)} className="btn-secondary text-sm py-2 px-4 text-white border-white/20 text-xs">Copy ID</button>
        <button onClick={() => window.print()} className="btn-primary text-xs py-2 px-4">Download Ticket</button>
      </div>
    </div>
  );
}

export default function EventDetailPage() {
  const { id } = useParams() as { id: string };
  const { events, groups, registerForEvent, myRegistrations, favorites, toggleFavorite, addCustomActivity } = useApp();
  const { user, studentProfile, loginAsMockStudent, updateStudentProfile } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Overview");
  const [registering, setRegistering] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [isEditingStudentName, setIsEditingStudentName] = useState(false);
  const [editedStudentName, setEditedStudentName] = useState("");

  useEffect(() => {
    if (studentProfile?.name) {
      setEditedStudentName(studentProfile.name);
    } else if (user?.displayName) {
      setEditedStudentName(user.displayName);
    }
  }, [studentProfile?.name, user?.displayName]);

  const event = events.find(e => e.id === id);

  // Participation & Activity Customization State
  const standardActivities = event?.category === "Arts"
    ? DEFAULT_ARTS_ACTIVITIES
    : event?.category === "Sports"
    ? DEFAULT_SPORTS_ACTIVITIES
    : [];

  const availableActivities = event?.activities && event.activities.length > 0
    ? event.activities
    : standardActivities;

  const [participationType, setParticipationType] = useState<"Single" | "Group">(
    event?.type === "Group" ? "Group" : "Single"
  );
  const [selectedActivity, setSelectedActivity] = useState<string>("");
  const [isCustomActivity, setIsCustomActivity] = useState<boolean>(false);
  const [customActivityName, setCustomActivityName] = useState<string>("");
  const [groupMode, setGroupMode] = useState<"create" | "join">("create");
  const [groupName, setGroupName] = useState<string>("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  if (!event) return (
    <div className="bg-[#0a0a0f] min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
      <div className="text-6xl mb-4">😕</div>
      <h2 className="text-white text-2xl font-bold mb-2">Event Not Found</h2>
      <p className="text-white/40 mb-6">This event doesn't exist or has been removed.</p>
      <Link href="/explore"><button className="btn-primary px-6 py-3">Browse Events</button></Link>
    </div>
  );

  const myReg = myRegistrations.find(r => r.eventId === id);
  const pct = event.maxSeats && event.registeredCount ? Math.min((event.registeredCount / event.maxSeats) * 100, 100) : 0;
  const isFull = pct >= 100;
  const isDeadlinePassed = event.registrationDeadline ? new Date(event.registrationDeadline) < new Date() : false;
  const isFav = favorites.includes(event.id);
  const relatedEvents = events.filter(e => e.category === event.category && e.id !== event.id).slice(0, 3);
  const eventGroups = groups.filter(g => g.eventId === event.id);

  const individualCount = myRegistrations.filter(r => {
    const ev = events.find(e => e.id === r.eventId);
    return r.participationType === "Single" || ev?.type === "Individual";
  }).length;

  const handleRegister = async () => {
    let currentUser = user;
    if (!currentUser) {
      loginAsMockStudent();
      showToast("Signed in as Alex Johnson (Demo Student)!", "success");
    }

    const currentActivities = availableActivities.filter(a => a.type === participationType);
    let activityToUse = isCustomActivity ? customActivityName.trim() : selectedActivity;
    if (!activityToUse && currentActivities.length > 0) {
      activityToUse = currentActivities[0].name;
      setSelectedActivity(activityToUse);
    }

    if (participationType === "Group") {
      if (groupMode === "create" && !groupName.trim()) {
        const defaultName = `${studentProfile?.name || "Campus"} Squad`;
        setGroupName(defaultName);
      }
    }

    if (participationType === "Single" && individualCount >= 3) {
      showToast("You can only participate in up to 3 individual events", "error");
      return;
    }

    setRegistering(true);

    if (isCustomActivity && customActivityName.trim()) {
      addCustomActivity(event.id, {
        id: `cust-${Date.now()}`,
        name: customActivityName.trim(),
        category: event.category,
        type: participationType,
        description: "Customized student-selected activity",
      });
    }

    const effectiveGroupName = groupName.trim() || `${studentProfile?.name || "Campus"} Squad`;

    const result = await registerForEvent(
      event.id,
      participationType === "Group" && groupMode === "join" ? selectedGroupId : undefined,
      participationType === "Group" && groupMode === "create" ? effectiveGroupName : undefined,
      activityToUse || undefined,
      participationType
    );

    setRegistering(false);
    if (result.success) {
      showToast(result.message, "success");
      setActiveTab("Register");
    } else {
      showToast(result.message, "error");
    }
  };

  return (
    <div className="bg-[#0a0a0f] min-h-screen">
      {/* Banner */}
      <div className="relative h-[50vh] overflow-hidden">
        {event.image ? (
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${event.id}/1200/600`; }} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-900 to-violet-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8">
          <div className="max-w-7xl mx-auto">
            <Link href="/explore" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4 transition-colors">
              <ChevronLeft className="w-4 h-4" />Back to Events
            </Link>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <div className="flex gap-2 mb-3">
                  <span className={`${CATEGORY_BADGE[event.category] || "badge-club"} px-3 py-1 rounded-full text-xs font-semibold`}>{event.category}</span>
                  <span className={`status-${event.status} px-3 py-1 rounded-full text-xs font-semibold capitalize`}>{event.status}</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-white">{event.title}</h1>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleFavorite(event.id)} className={`p-3 rounded-xl glass border border-white/10 transition-colors ${isFav ? "text-red-400" : "text-white/50 hover:text-white"}`}>
                  <Heart className={`w-5 h-5 ${isFav ? "fill-current" : ""}`} />
                </button>
                <button onClick={() => { navigator.clipboard?.writeText(window.location.href); showToast("Link copied!", "success"); }} className="p-3 rounded-xl glass border border-white/10 text-white/50 hover:text-white transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Tabs */}
            <div className="flex gap-1 p-1 glass rounded-2xl border border-white/10 mb-8 overflow-x-auto">
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 min-w-fit px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab ? "bg-blue-600 text-white" : "text-white/50 hover:text-white"}`}>{tab}</button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

                {/* Overview */}
                {activeTab === "Overview" && (
                  <div className="space-y-8">
                    <div className="glass-dark border border-white/8 rounded-3xl p-6">
                      <h2 className="text-white font-bold text-xl mb-4">About This Event</h2>
                      <p className="text-white/60 leading-relaxed">{event.longDescription || event.description}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { icon: Calendar, color: "text-blue-400", label: "Date", val: formatDate(event.date) },
                        { icon: Clock, color: "text-violet-400", label: "Time", val: event.time || "TBA" },
                        { icon: MapPin, color: "text-cyan-400", label: "Venue", val: event.venue || "TBA" },
                        { icon: Users, color: "text-emerald-400", label: "Organizer", val: event.organizer || "TBA" },
                        { icon: Ticket, color: "text-yellow-400", label: "Max Seats", val: event.maxSeats?.toString() || "Unlimited" },
                        { icon: Calendar, color: "text-red-400", label: "Deadline", val: event.registrationDeadline ? formatDate(event.registrationDeadline) : "Open" },
                      ].map(({ icon: Icon, color, label, val }) => (
                        <div key={label} className="glass-dark border border-white/8 rounded-2xl p-4 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><Icon className={`w-5 h-5 ${color}`} /></div>
                          <div><p className="text-white/40 text-xs">{label}</p><p className="text-white font-semibold text-sm">{val}</p></div>
                        </div>
                      ))}
                    </div>
                    {event.eligibility && <div className="glass-dark border border-white/8 rounded-2xl p-4"><p className="text-white/40 text-xs mb-1">Eligibility</p><p className="text-white text-sm">{event.eligibility}</p></div>}
                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map(tag => <span key={tag} className="px-3 py-1 glass border border-white/10 rounded-full text-xs text-white/50">#{tag}</span>)}
                      </div>
                    )}
                    {event.certificateAvailable && (
                      <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: "rgba(48,209,88,0.1)", border: "1px solid rgba(48,209,88,0.2)" }}>
                        <Award className="w-5 h-5 text-emerald-400" />
                        <div><p className="text-emerald-400 font-semibold text-sm">Certificate Available</p><p className="text-white/40 text-xs">Participation certificate issued after attendance verification</p></div>
                      </div>
                    )}
                  </div>
                )}

                {/* Schedule */}
                {activeTab === "Schedule" && (
                  <div className="space-y-4">
                    {event.agenda && event.agenda.length > 0 ? event.agenda.map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                          {i < (event.agenda?.length || 0) - 1 && <div className="w-0.5 flex-1 bg-white/10 mt-1" />}
                        </div>
                        <div className="glass-dark border border-white/8 rounded-2xl p-4 flex-1 mb-4">
                          <span className="text-blue-400 text-xs font-semibold">{item.time}</span>
                          <h3 className="text-white font-bold mt-1">{item.title}</h3>
                          {item.description && <p className="text-white/40 text-sm mt-1">{item.description}</p>}
                        </div>
                      </motion.div>
                    )) : (
                      <div className="text-center py-12 text-white/30"><Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>Schedule not available yet</p></div>
                    )}
                  </div>
                )}

                {/* Speakers */}
                {activeTab === "Speakers" && (
                  <div>
                    {event.speakers && event.speakers.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {event.speakers.map((s, i) => (
                          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-dark border border-white/8 rounded-2xl p-5 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">{s.name[0]}</div>
                            <div><p className="text-white font-bold">{s.name}</p><p className="text-white/40 text-sm">{s.title}</p></div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-white/30"><Users className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>Speaker information coming soon</p></div>
                    )}
                  </div>
                )}

                {/* Register */}
                {activeTab === "Register" && (
                  <div>
                    {myReg ? (
                      <QRTicket
                        ticketId={myReg.ticketId || myReg.id}
                        eventTitle={event.title}
                        date={event.date}
                        activityName={myReg.activityName}
                        groupName={myReg.groupName}
                        participationType={myReg.participationType}
                      />
                    ) : !user ? (
                      <div className="text-center py-12 glass-dark border border-white/10 rounded-3xl p-8">
                        <div className="text-5xl mb-4">🔐</div>
                        <h3 className="text-white font-bold text-xl mb-2">Sign In to Register</h3>
                        <p className="text-white/40 mb-6 text-sm max-w-md mx-auto">
                          Sign in to claim your QR ticket pass, select activity disciplines, and verify attendance.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                          <button
                            type="button"
                            onClick={() => {
                              loginAsMockStudent();
                              showToast("Signed in as Alex Johnson (Student)!", "success");
                            }}
                            className="btn-primary px-6 py-3 text-sm flex items-center gap-2"
                          >
                            <Sparkles className="w-4 h-4" /> 1-Click Demo Sign In
                          </button>
                          <Link href="/login">
                            <button className="btn-secondary text-white border-white/20 px-6 py-3 text-sm">
                              Account Sign In
                            </button>
                          </Link>
                        </div>
                      </div>
                    ) : isFull ? (
                      <div className="text-center py-12"><AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" /><h3 className="text-white font-bold text-xl mb-2">Event is Full</h3><p className="text-white/40">All seats have been taken for this event.</p></div>
                    ) : isDeadlinePassed ? (
                      <div className="text-center py-12"><AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" /><h3 className="text-white font-bold text-xl mb-2">Registration Closed</h3><p className="text-white/40">The registration deadline has passed.</p></div>
                    ) : (
                      <div className="glass-dark border border-white/8 rounded-3xl p-6 sm:p-8 space-y-6">
                        <div>
                          <h2 className="text-white font-black text-2xl mb-1">Event Registration</h2>
                          <p className="text-white/40 text-sm">Select your participation format and customized activity.</p>
                        </div>

                        {/* Participation Format: Single vs Group */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold text-white/70 uppercase tracking-wider">
                              1. Participation Format
                            </label>
                            {participationType === "Single" && (
                              <span className="text-xs text-blue-400 font-semibold">
                                Single Quota: {individualCount}/3 slots used
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setParticipationType("Single");
                                setSelectedActivity("");
                              }}
                              className={`p-3.5 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                                participationType === "Single"
                                  ? "bg-blue-600/30 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                                  : "glass border-white/10 text-white/50 hover:text-white"
                              }`}
                            >
                              <User className="w-4 h-4 text-blue-400" /> Single (Individual)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setParticipationType("Group");
                                setSelectedActivity("");
                              }}
                              className={`p-3.5 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                                participationType === "Group"
                                  ? "bg-violet-600/30 border-violet-500 text-white shadow-lg shadow-violet-500/20"
                                  : "glass border-white/10 text-white/50 hover:text-white"
                              }`}
                            >
                              <Users className="w-4 h-4 text-violet-400" /> Group / Team
                            </button>
                          </div>
                        </div>

                        {/* Activity Selection */}
                        {availableActivities.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-bold text-white/70 uppercase tracking-wider">
                                2. Customized Activity / Discipline
                              </label>
                              <button
                                type="button"
                                onClick={() => setIsCustomActivity(!isCustomActivity)}
                                className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                              >
                                {isCustomActivity ? "Pick From List" : "+ Add Custom Activity"}
                              </button>
                            </div>

                            {isCustomActivity ? (
                              <div>
                                <input
                                  type="text"
                                  value={customActivityName}
                                  onChange={e => setCustomActivityName(e.target.value)}
                                  placeholder="Enter your custom activity (e.g. Clay Modeling, Archery, Folk Flute)"
                                  className="w-full glass border border-white/15 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none focus:border-blue-400"
                                />
                                <p className="text-xs text-white/40 mt-1">Specify your exact discipline or event choice.</p>
                              </div>
                            ) : (
                              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {availableActivities
                                  .filter(a => a.type === participationType)
                                  .map(act => (
                                    <div
                                      key={act.id}
                                      onClick={() => setSelectedActivity(act.name)}
                                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                                        selectedActivity === act.name
                                          ? "bg-white/15 border-blue-400 text-white"
                                          : "glass border-white/8 text-white/70 hover:bg-white/5 hover:border-white/15"
                                      }`}
                                    >
                                      <div>
                                        <p className="text-sm font-semibold text-white">{act.name}</p>
                                        {act.description && (
                                          <p className="text-xs text-white/40 mt-0.5">{act.description}</p>
                                        )}
                                      </div>
                                      {selectedActivity === act.name && (
                                        <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                      )}
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Team Options (Group mode) */}
                        {participationType === "Group" && (
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setGroupMode("create")}
                                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                                  groupMode === "create" ? "bg-blue-600 text-white" : "glass text-white/50"
                                }`}
                              >
                                Create New Team
                              </button>
                              <button
                                type="button"
                                onClick={() => setGroupMode("join")}
                                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                                  groupMode === "join" ? "bg-blue-600 text-white" : "glass text-white/50"
                                }`}
                              >
                                Join Existing Team
                              </button>
                            </div>

                            {groupMode === "create" ? (
                              <div>
                                <label className="text-xs text-white/50 mb-1 block">Team / Group Name</label>
                                <input
                                  type="text"
                                  value={groupName}
                                  onChange={e => setGroupName(e.target.value)}
                                  placeholder="e.g. Phoenix Titans, Art Maestros"
                                  className="w-full glass border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 outline-none focus:border-blue-400"
                                />
                              </div>
                            ) : (
                              <div>
                                <label className="text-xs text-white/50 mb-1 block">Select Registered Team</label>
                                {eventGroups.length === 0 ? (
                                  <p className="text-xs text-amber-400/80 py-1">
                                    No teams created yet. Switch to "Create New Team" to start one!
                                  </p>
                                ) : (
                                  <select
                                    value={selectedGroupId}
                                    onChange={e => setSelectedGroupId(e.target.value)}
                                    className="w-full glass border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none bg-transparent"
                                  >
                                    <option value="" className="bg-[#0c0e1a]">Select a team...</option>
                                    {eventGroups.map(g => (
                                      <option key={g.id} value={g.id} className="bg-[#0c0e1a]">
                                        {g.name} ({g.members.length} members)
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Student Details Preview */}
                        <div className="space-y-3 pt-2">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-white/40 text-xs block">Student Name</label>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsEditingStudentName(!isEditingStudentName);
                                  if (!isEditingStudentName) {
                                    setEditedStudentName(studentProfile?.name || user?.displayName || "");
                                  }
                                }}
                                className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                              >
                                {isEditingStudentName ? "Cancel" : "Change Name"}
                              </button>
                            </div>
                            {isEditingStudentName ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={editedStudentName}
                                  onChange={e => setEditedStudentName(e.target.value)}
                                  placeholder="Enter your student name"
                                  className="w-full glass border border-blue-500/50 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-blue-400"
                                />
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!editedStudentName.trim()) {
                                      showToast("Name cannot be empty", "error");
                                      return;
                                    }
                                    try {
                                      await updateStudentProfile({ name: editedStudentName.trim() });
                                      setIsEditingStudentName(false);
                                      showToast("Student name updated!", "success");
                                    } catch (err: any) {
                                      showToast(err?.message || "Failed to update name", "error");
                                    }
                                  }}
                                  className="btn-primary px-4 py-2 text-xs font-bold whitespace-nowrap"
                                >
                                  Save Name
                                </button>
                              </div>
                            ) : (
                              <input
                                value={studentProfile?.name || user?.displayName || "Alex Johnson"}
                                readOnly
                                className="w-full glass border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm opacity-70"
                              />
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-white/40 text-xs mb-1 block">Register No.</label>
                              <input value={studentProfile?.registerNumber || "20CS101"} readOnly className="w-full glass border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm opacity-70" />
                            </div>
                            <div>
                              <label className="text-white/40 text-xs mb-1 block">Class / Dept</label>
                              <input value={studentProfile?.className || "CSE-A, 3rd Year"} readOnly className="w-full glass border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm opacity-70" />
                            </div>
                          </div>
                        </div>

                        <label className="flex items-start gap-3 cursor-pointer">
                          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 accent-blue-500" />
                          <span className="text-white/50 text-xs leading-relaxed">
                            I confirm participation for this {participationType.toLowerCase()} event and agree to follow all campus guidelines.
                          </span>
                        </label>

                        <motion.button
                          onClick={handleRegister}
                          disabled={registering || !agreed}
                          whileHover={!registering ? { scale: 1.02 } : {}}
                          whileTap={!registering ? { scale: 0.98 } : {}}
                          className={`btn-primary w-full py-4 text-base ${
                            registering || !agreed ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {registering ? "Confirming Registration..." : `Register as ${participationType}`}
                        </motion.button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-6">
            {/* Quick info */}
            <div className="glass-dark border border-white/8 rounded-3xl p-6">
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm"><span className="text-white/40">Date</span><span className="text-white font-semibold">{formatShortDate(event.date)}</span></div>
                {event.time && <div className="flex justify-between text-sm"><span className="text-white/40">Time</span><span className="text-white font-semibold">{event.time}</span></div>}
                {event.venue && <div className="flex justify-between text-sm"><span className="text-white/40">Venue</span><span className="text-white font-semibold text-right max-w-[140px]">{event.venue}</span></div>}
              </div>
              {event.maxSeats && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-white/40 mb-2">
                    <span>{event.registeredCount || 0} registered</span>
                    <span className={isFull ? "text-red-400" : "text-green-400"}>{isFull ? "Full" : `${event.maxSeats - (event.registeredCount || 0)} seats left`}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${isFull ? "bg-red-500" : pct > 80 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )}
              {myReg ? (
                <button onClick={() => setActiveTab("Register")} className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm">
                  <Ticket className="w-4 h-4" /> View My Ticket
                </button>
              ) : isFull || isDeadlinePassed ? (
                <button disabled className="w-full py-3 rounded-xl bg-white/5 text-white/30 text-sm cursor-not-allowed">
                  {isFull ? "Event Full" : "Registration Closed"}
                </button>
              ) : (
                <button onClick={() => setActiveTab("Register")} className="btn-primary w-full py-3 text-sm">Register Now →</button>
              )}
            </div>

            {/* Related events */}
            {relatedEvents.length > 0 && (
              <div>
                <h3 className="text-white font-bold mb-4 text-sm">Related Events</h3>
                <div className="space-y-3">
                  {relatedEvents.map(e => (
                    <Link key={e.id} href={`/events/${e.id}`} className="block glass-dark border border-white/8 rounded-2xl p-4 hover:border-white/20 transition-colors">
                      <p className="text-white font-semibold text-sm line-clamp-1">{e.title}</p>
                      <p className="text-white/40 text-xs mt-1">{formatShortDate(e.date)}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
