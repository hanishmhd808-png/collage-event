"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { Plus, Users, BarChart3, FileText, Eye, Calendar, MapPin, CheckCircle, XCircle, Palette, Trophy } from "lucide-react";
import { CampusEvent } from "@/types";
import { DEFAULT_ARTS_ACTIVITIES, DEFAULT_SPORTS_ACTIVITIES } from "@/lib/mockData";

const CATEGORIES = ["Technical","Cultural","Workshop","Seminar","Conference","Sports","Placement","Club","Arts","Festivals"] as const;

const TABS = ["My Events", "Create Event", "Analytics", "Participants"];

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
      <p className="text-3xl font-black mb-1" style={{ color }}>{value}</p>
      <p className="text-white/40 text-sm">{label}</p>
    </motion.div>
  );
}

export default function OrganizerPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { events, addEvent, myRegistrations, registrations } = useApp();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("My Events");
  const [selectedEvent, setSelectedEvent] = useState("");

  // Form state
  const [form, setForm] = useState({ title:"", category:"Technical" as typeof CATEGORIES[number], type:"Individual" as "Individual"|"Group", date:"", time:"", venue:"", location:"", description:"", longDescription:"", maxSeats:"100", registrationDeadline:"", eligibility:"All students", certificateAvailable:true, image:"", tags:"" });
  const [creating, setCreating] = useState(false);

  useEffect(() => { if (!loading && !user) router.push("/"); }, [user, loading, router]);
  if (loading || !user) return <div className="bg-[#0a0a0f] min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" /></div>;

  const myEvents = events.slice(0, 8);
  const totalRegs = registrations.length;
  const totalSeats = events.reduce((sum, e) => sum + (e.maxSeats || 0), 0);
  const fillRate = totalSeats > 0 ? Math.round((totalRegs / totalSeats) * 100) : 0;

  const eventParticipants = registrations.filter(r => r.eventId === selectedEvent);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date) { showToast("Title and date are required", "error"); return; }
    setCreating(true);

    const activities = form.category === "Arts"
      ? DEFAULT_ARTS_ACTIVITIES
      : form.category === "Sports"
      ? DEFAULT_SPORTS_ACTIVITIES
      : undefined;

    const newEvent: CampusEvent = {
      id: `e${Date.now()}`,
      title: form.title,
      category: form.category,
      type: form.type,
      status: "upcoming",
      date: form.date,
      time: form.time,
      venue: form.venue,
      location: form.location,
      description: form.description,
      longDescription: form.longDescription,
      maxSeats: parseInt(form.maxSeats) || 100,
      registeredCount: 0,
      registrationDeadline: form.registrationDeadline,
      eligibility: form.eligibility,
      certificateAvailable: form.certificateAvailable,
      image: form.image,
      tags: form.tags ? form.tags.split(",").map(t => t.trim()) : [],
      isFeatured: false,
      organizer: "Campus Event Organizer",
      activities,
      allowCustomActivity: form.category === "Arts" || form.category === "Sports" || form.type === "Group",
    };
    await addEvent(newEvent);
    setCreating(false);
    showToast("Event created successfully!", "success");
    setForm({ title:"", category:"Technical", type:"Individual", date:"", time:"", venue:"", location:"", description:"", longDescription:"", maxSeats:"100", registrationDeadline:"", eligibility:"All students", certificateAvailable:true, image:"", tags:"" });
    setActiveTab("My Events");
  };

  const exportCSV = () => {
    const rows = [
      ["Name", "Register No", "Class", "Format", "Activity Discipline", "Team Name", "Status", "Registered At"],
      ...eventParticipants.map(r => [
        r.studentName,
        r.registerNumber || "",
        r.className || "",
        r.participationType || "Single",
        r.activityName || "Standard",
        r.groupName || "",
        r.status || "confirmed",
        r.registeredAt || "",
      ]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = "data:text/csv," + encodeURIComponent(csv); a.download = "participants.csv"; a.click();
  };

  return (
    <div className="bg-[#0a0a0f] min-h-screen">
      <div className="pt-24 pb-12 px-6" style={{ background: "linear-gradient(135deg, rgba(191,90,242,0.08), rgba(10,132,255,0.06))" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-violet-400 text-sm font-semibold mb-2 uppercase tracking-widest">Organizer</p>
            <h1 className="text-4xl font-black text-white mb-2">Event Dashboard</h1>
            <p className="text-white/40">Manage, publish, and track your campus events</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard label="My Events" value={myEvents.length} color="#0a84ff" />
          <StatCard label="Total Registrations" value={totalRegs} color="#bf5af2" />
          <StatCard label="Fill Rate" value={`${fillRate}%`} color="#30d158" />
          <StatCard label="Certificates Issued" value="12" color="#ff9f0a" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 glass rounded-2xl border border-white/10 mb-8 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 min-w-fit px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab ? "bg-violet-600 text-white" : "text-white/50 hover:text-white"}`}>{tab}</button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

            {/* My Events */}
            {activeTab === "My Events" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-white font-bold text-xl">Your Events</h2>
                  <button onClick={() => setActiveTab("Create Event")} className="btn-primary py-2 px-5 text-sm flex items-center gap-2"><Plus className="w-4 h-4" />Create Event</button>
                </div>
                <div className="space-y-3">
                  {myEvents.map((event, i) => (
                    <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-dark border border-white/8 rounded-2xl p-4 flex items-center gap-4">
                      {event.image && <img src={event.image} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${event.id}/56/56`; }} />}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">{event.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(event.date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>
                          {event.venue && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.venue}</span>}
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{event.registeredCount||0}/{event.maxSeats||0}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`status-${event.status} px-2.5 py-1 rounded-full text-xs font-semibold capitalize`}>{event.status}</span>
                        <Link href={`/events/${event.id}`}><button className="p-2 glass border border-white/10 rounded-xl text-white/40 hover:text-white transition-colors"><Eye className="w-4 h-4" /></button></Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Create Event */}
            {activeTab === "Create Event" && (
              <div className="glass-dark border border-white/8 rounded-3xl p-8">
                <h2 className="text-white font-bold text-2xl mb-8">Create New Event</h2>
                <form onSubmit={handleCreate} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2"><label className="text-white/40 text-xs mb-1.5 block">Event Title *</label>
                      <input value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="e.g., Annual Tech Hackathon 2026" className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none focus:border-blue-500/50" required />
                    </div>
                    <div><label className="text-white/40 text-xs mb-1.5 block">Category</label>
                      <select value={form.category} onChange={e => setForm({...form,category:e.target.value as typeof CATEGORIES[number]})} className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none bg-transparent">
                        {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0a0a0f]">{c}</option>)}
                      </select>
                    </div>
                    <div><label className="text-white/40 text-xs mb-1.5 block">Type</label>
                      <select value={form.type} onChange={e => setForm({...form,type:e.target.value as "Individual"|"Group"})} className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none bg-transparent">
                        <option value="Individual" className="bg-[#0a0a0f]">Individual</option>
                        <option value="Group" className="bg-[#0a0a0f]">Group</option>
                      </select>
                    </div>
                    <div><label className="text-white/40 text-xs mb-1.5 block">Date *</label>
                      <input type="date" value={form.date} onChange={e => setForm({...form,date:e.target.value})} className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 bg-transparent" required />
                    </div>
                    <div><label className="text-white/40 text-xs mb-1.5 block">Time</label>
                      <input type="time" value={form.time} onChange={e => setForm({...form,time:e.target.value})} className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 bg-transparent" />
                    </div>
                    <div><label className="text-white/40 text-xs mb-1.5 block">Venue</label>
                      <input value={form.venue} onChange={e => setForm({...form,venue:e.target.value})} placeholder="Main Auditorium" className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none focus:border-blue-500/50" />
                    </div>
                    <div><label className="text-white/40 text-xs mb-1.5 block">Max Seats</label>
                      <input type="number" value={form.maxSeats} onChange={e => setForm({...form,maxSeats:e.target.value})} className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50" />
                    </div>
                    <div><label className="text-white/40 text-xs mb-1.5 block">Registration Deadline</label>
                      <input type="date" value={form.registrationDeadline} onChange={e => setForm({...form,registrationDeadline:e.target.value})} className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 bg-transparent" />
                    </div>
                    <div><label className="text-white/40 text-xs mb-1.5 block">Eligibility</label>
                      <input value={form.eligibility} onChange={e => setForm({...form,eligibility:e.target.value})} className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50" />
                    </div>
                    <div><label className="text-white/40 text-xs mb-1.5 block">Image URL</label>
                      <input value={form.image} onChange={e => setForm({...form,image:e.target.value})} placeholder="https://..." className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none focus:border-blue-500/50" />
                    </div>
                    <div><label className="text-white/40 text-xs mb-1.5 block">Tags (comma-separated)</label>
                      <input value={form.tags} onChange={e => setForm({...form,tags:e.target.value})} placeholder="coding, hackathon, AI" className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none focus:border-blue-500/50" />
                    </div>
                    <div className="sm:col-span-2"><label className="text-white/40 text-xs mb-1.5 block">Short Description</label>
                      <textarea value={form.description} onChange={e => setForm({...form,description:e.target.value})} rows={2} placeholder="Brief overview of the event" className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none focus:border-blue-500/50 resize-none" />
                    </div>
                    <div className="sm:col-span-2"><label className="text-white/40 text-xs mb-1.5 block">Full Description</label>
                      <textarea value={form.longDescription} onChange={e => setForm({...form,longDescription:e.target.value})} rows={4} placeholder="Detailed event description..." className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none focus:border-blue-500/50 resize-none" />
                    </div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.certificateAvailable} onChange={e => setForm({...form,certificateAvailable:e.target.checked})} className="accent-blue-500" />
                    <span className="text-white/60 text-sm">Issue participation certificates</span>
                  </label>
                  <motion.button type="submit" disabled={creating} whileHover={!creating ? {scale:1.02} : {}} whileTap={!creating ? {scale:0.98} : {}} className={`btn-primary px-10 py-4 text-base ${creating ? "opacity-50" : ""}`}>
                    {creating ? "Creating..." : "Publish Event"}
                  </motion.button>
                </form>
              </div>
            )}

            {/* Analytics */}
            {activeTab === "Analytics" && (
              <div className="space-y-6">
                <h2 className="text-white font-bold text-xl">Registration Analytics</h2>
                <div className="glass-dark border border-white/8 rounded-3xl p-6">
                  <h3 className="text-white font-semibold mb-6">Registrations per Event</h3>
                  <div className="space-y-4">
                    {myEvents.slice(0,6).map(e => {
                      const pct = e.maxSeats ? Math.min(((e.registeredCount||0)/e.maxSeats)*100, 100) : 0;
                      return (
                        <div key={e.id}>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-white/70 truncate max-w-[200px]">{e.title}</span>
                            <span className="text-white/40">{e.registeredCount||0}/{e.maxSeats||0}</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                            <motion.div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-600" initial={{width:0}} whileInView={{width:`${pct}%`}} viewport={{once:true}} transition={{duration:0.8}} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[{label:"Most Popular",val:"TechNova 2026"},{label:"Peak Day",val:"Saturday"},{label:"Avg Fill Rate",val:`${fillRate}%`}].map(s => (
                    <div key={s.label} className="glass-dark border border-white/8 rounded-2xl p-5">
                      <p className="text-white/40 text-xs mb-2">{s.label}</p>
                      <p className="text-white font-bold text-lg">{s.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Participants */}
            {activeTab === "Participants" && (
              <div>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
                  <h2 className="text-white font-bold text-xl">Participants</h2>
                  <div className="flex gap-3">
                    <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} className="glass border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none bg-transparent">
                      <option value="" className="bg-[#0a0a0f]">Select Event</option>
                      {myEvents.map(e => <option key={e.id} value={e.id} className="bg-[#0a0a0f]">{e.title}</option>)}
                    </select>
                    {selectedEvent && <button onClick={exportCSV} className="btn-primary py-2 px-4 text-sm flex items-center gap-2"><FileText className="w-4 h-4" />Export CSV</button>}
                  </div>
                </div>
                {!selectedEvent ? (
                  <div className="text-center py-16 text-white/30"><Users className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>Select an event to view participants</p></div>
                ) : eventParticipants.length === 0 ? (
                  <div className="text-center py-16 text-white/30"><Users className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No participants yet</p></div>
                ) : (
                  <div className="glass-dark border border-white/8 rounded-3xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-white/8">
                        {["Name", "Register No", "Class", "Format / Activity", "Team", "Status", "Registered"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-white/40 text-xs font-semibold">{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>{eventParticipants.map(r => (
                        <tr key={r.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                          <td className="px-4 py-3 text-white font-medium">{r.studentName}</td>
                          <td className="px-4 py-3 text-white/50">{r.registerNumber || "-"}</td>
                          <td className="px-4 py-3 text-white/50">{r.className || "-"}</td>
                          <td className="px-4 py-3 text-white">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mr-1.5 ${
                              r.participationType === "Group" ? "bg-violet-500/20 text-violet-300" : "bg-blue-500/20 text-blue-300"
                            }`}>
                              {r.participationType || "Single"}
                            </span>
                            <span className="text-xs text-white/70">{r.activityName || "Standard Entry"}</span>
                          </td>
                          <td className="px-4 py-3 text-white/60 text-xs">{r.groupName || "-"}</td>
                          <td className="px-4 py-3"><span className={`status-${r.status || "confirmed"} px-2 py-0.5 rounded-full text-xs capitalize`}>{r.status || "confirmed"}</span></td>
                          <td className="px-4 py-3 text-white/40">{r.registeredAt ? new Date(r.registeredAt).toLocaleDateString() : "-"}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
