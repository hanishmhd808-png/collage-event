"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import EventCard from "@/components/EventCard";
import CreateEventModal from "@/components/CreateEventModal";
import {
  Building2, MapPin, Globe, ExternalLink, Mail, Phone,
  ShieldCheck, Calendar, Users, Award, ArrowLeft, Plus,
  Sparkles, CheckCircle2, ChevronRight, Share2
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function CollegeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const collegeId = resolvedParams.id;
  const router = useRouter();
  const { colleges, events } = useApp();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"events" | "about">("events");
  const [eventFilter, setEventFilter] = useState<"all" | "inter" | "intra">("all");
  const [createEventOpen, setCreateEventOpen] = useState(false);

  const college = useMemo(() => {
    return colleges.find(
      c => c.id === collegeId || c.code.toLowerCase() === collegeId.toLowerCase()
    );
  }, [colleges, collegeId]);

  const collegeEvents = useMemo(() => {
    if (!college) return [];
    return events.filter(
      e => e.collegeId === college.id || e.collegeCode === college.code || e.college === college.name
    );
  }, [events, college]);

  const filteredEvents = useMemo(() => {
    if (eventFilter === "inter") return collegeEvents.filter(e => e.isInterCollege);
    if (eventFilter === "intra") return collegeEvents.filter(e => !e.isInterCollege);
    return collegeEvents;
  }, [collegeEvents, eventFilter]);

  if (!college) {
    return (
      <div className="bg-[#0a0a0f] min-h-screen pt-36 px-6 text-center">
        <div className="max-w-md mx-auto glass-dark border border-white/10 rounded-3xl p-8">
          <Building2 className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-2">College Not Found</h2>
          <p className="text-white/40 text-sm mb-6">
            We couldn't locate this institution. It may have been renamed or removed.
          </p>
          <Link href="/colleges">
            <button className="btn-primary py-2.5 px-6 text-sm">Return to Directory</button>
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("College profile link copied to clipboard!", "success");
    }
  };

  return (
    <div className="bg-[#0a0a0f] min-h-screen pb-24">
      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={createEventOpen}
        onClose={() => setCreateEventOpen(false)}
        initialCollegeId={college.id}
        initialCollegeName={college.name}
        onSuccess={(eventId, title) => {
          showToast(`Event "${title}" published for ${college.name}!`, "success");
        }}
      />

      {/* ── COLLEGE HERO BANNER ── */}
      <div className="relative pt-20">
        {/* Banner Image */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-gradient-to-r from-blue-900/60 to-purple-900/60">
          {college.banner && (
            <img
              src={college.banner}
              alt={college.name}
              className="w-full h-full object-cover opacity-60"
              onError={e => {
                (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${college.id}/1200/400`;
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />

          {/* Navigation back */}
          <div className="absolute top-8 left-6 z-20">
            <Link
              href="/colleges"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl glass border border-white/10 text-white/80 hover:text-white text-xs font-semibold backdrop-blur-md transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> All Colleges
            </Link>
          </div>

          <div className="absolute top-8 right-6 z-20 flex gap-2">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl glass border border-white/10 text-white/80 hover:text-white transition-colors"
              title="Share College Hub"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Header Details */}
        <div className="max-w-7xl mx-auto px-6 relative z-10 -mt-20">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-8 border-b border-white/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              <img
                src={college.logo}
                alt={college.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-[#0a0a0f] bg-[#0a0a0f] shadow-2xl flex-shrink-0"
                onError={e => {
                  (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${college.id}/300/300`;
                }}
              />
              <div>
                <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                  <span className="text-xs font-black text-blue-400 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    {college.code}
                  </span>
                  {college.isVerified && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Institution
                    </span>
                  )}
                  <span className="text-xs text-white/50">{college.district}, {college.state}</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-white">
                  {college.name}
                </h1>

                <p className="text-white/60 text-xs sm:text-sm mt-1 max-w-2xl flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                  <span className="truncate">{college.address || `${college.district}, Kerala`}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setCreateEventOpen(true)}
                className="btn-primary py-3 px-5 text-xs sm:text-sm font-semibold flex items-center gap-2 flex-1 sm:flex-initial justify-center shadow-lg shadow-blue-600/30"
              >
                <Plus className="w-4 h-4" /> Publish Event
              </button>
              {college.website && (
                <a
                  href={college.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-2xl glass border border-white/10 text-white/80 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <Globe className="w-4 h-4 text-sky-400" />
                  Website
                </a>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-white/10">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-white/40 text-xs block">Active Campus Events</span>
              <span className="text-white font-black text-2xl">{collegeEvents.length}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-white/40 text-xs block">Inter-College Events</span>
              <span className="text-white font-black text-2xl">
                {collegeEvents.filter(e => e.isInterCollege).length}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-white/40 text-xs block">Enrolled Students</span>
              <span className="text-white font-black text-2xl">
                {college.studentCount ? college.studentCount.toLocaleString() : "3,200+"}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-white/40 text-xs block">Established</span>
              <span className="text-white font-black text-2xl">
                {college.establishedYear || 2001}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT (TABS) ── */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab("events")}
            className={`text-sm sm:text-base font-bold pb-2 transition-all relative ${
              activeTab === "events" ? "text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            Campus Events ({collegeEvents.length})
            {activeTab === "events" && (
              <motion.div layoutId="colTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`text-sm sm:text-base font-bold pb-2 transition-all relative ${
              activeTab === "about" ? "text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            About & Contact
            {activeTab === "about" && (
              <motion.div layoutId="colTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
            )}
          </button>
        </div>

        {activeTab === "events" && (
          <div>
            {/* Event Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-2">
                {[
                  { key: "all", label: `All Events (${collegeEvents.length})` },
                  { key: "inter", label: `🌐 Open Inter-College (${collegeEvents.filter(e => e.isInterCollege).length})` },
                  { key: "intra", label: `🏫 Intra-Campus (${collegeEvents.filter(e => !e.isInterCollege).length})` },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setEventFilter(f.key as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      eventFilter === f.key
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                        : "glass border border-white/10 text-white/50 hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCreateEventOpen(true)}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Event for {college.code}
              </button>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="text-center py-20 glass-dark border border-white/10 rounded-3xl p-8">
                <Calendar className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <h3 className="text-white font-bold text-lg mb-1">No events scheduled</h3>
                <p className="text-white/40 text-xs mb-6">
                  {college.name} hasn't published events in this category yet.
                </p>
                <button
                  onClick={() => setCreateEventOpen(true)}
                  className="btn-primary text-xs py-2.5 px-5 flex items-center gap-1.5 mx-auto"
                >
                  <Plus className="w-4 h-4" /> Create First Event
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((ev, i) => (
                  <EventCard key={ev.id} event={ev} index={i} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "about" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-dark border border-white/10 rounded-3xl p-6 sm:p-8">
                <h3 className="text-xl font-bold text-white mb-4">About the Institution</h3>
                <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
                  {college.description || "Leading collegiate institution committed to student excellence, cultural heritage, and sports achievement."}
                </p>
              </div>

              <div className="glass-dark border border-white/10 rounded-3xl p-6 sm:p-8">
                <h3 className="text-xl font-bold text-white mb-4">Inter-Collegiate Participation</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-4">
                  Students from {college.name} can participate in all open Inter-College tournaments across Malappuram district. Events hosted by this campus marked with the <strong className="text-sky-300">🌐 Inter-College</strong> badge welcome registrations from all participating institutions.
                </p>
                <Link href={`/explore?college=${college.id}&interCollege=true`}>
                  <button className="btn-secondary py-2.5 px-5 text-xs text-white border-white/20">
                    Explore Inter-College Competitions ↗
                  </button>
                </Link>
              </div>
            </div>

            {/* Sidebar contact info */}
            <div className="space-y-6">
              <div className="glass-dark border border-white/10 rounded-3xl p-6">
                <h3 className="text-base font-bold text-white mb-4">Institutional Contacts</h3>
                <div className="space-y-3.5 text-xs">
                  {college.address && (
                    <div className="flex items-start gap-3 text-white/60">
                      <MapPin className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                      <span>{college.address}</span>
                    </div>
                  )}
                  {college.email && (
                    <div className="flex items-center gap-3 text-white/60">
                      <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <a href={`mailto:${college.email}`} className="hover:text-blue-400 truncate">
                        {college.email}
                      </a>
                    </div>
                  )}
                  {college.phone && (
                    <div className="flex items-center gap-3 text-white/60">
                      <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{college.phone}</span>
                    </div>
                  )}
                  {college.website && (
                    <div className="flex items-center gap-3 text-white/60">
                      <Globe className="w-4 h-4 text-sky-400 flex-shrink-0" />
                      <a href={college.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 truncate">
                        {college.website.replace("https://", "")}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="glass-dark border border-white/10 rounded-3xl p-6">
                <h3 className="text-base font-bold text-white mb-2">College Coordinator?</h3>
                <p className="text-white/50 text-xs mb-4 leading-relaxed">
                  Are you a student representative or faculty coordinator for {college.name}? Log in with your institutional credentials to manage events.
                </p>
                <Link href="/login">
                  <button className="w-full btn-secondary py-2.5 text-xs text-white border-white/20">
                    Coordinator Sign In
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
