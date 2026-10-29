"use client";

import { useState, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import EventCard from "@/components/EventCard";
import { Search, Grid3X3, List, SlidersHorizontal, Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CampusEvent } from "@/types";

const CATEGORIES = ["All", "Technical", "Cultural", "Workshop", "Seminar", "Conference", "Sports", "Placement", "Club", "Arts", "Festivals"];
const STATUSES = ["All", "upcoming", "ongoing", "completed", "cancelled"];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ListCard({ event }: { event: CampusEvent }) {
  const pct = event.maxSeats && event.registeredCount ? Math.min((event.registeredCount / event.maxSeats) * 100, 100) : 0;
  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} whileHover={{ y: -2 }} className="glass-card overflow-hidden">
      <Link href={`/events/${event.id}`} className="flex gap-4 p-4">
        {event.image && <img src={event.image} alt={event.title} className="w-24 h-24 rounded-xl object-cover flex-shrink-0" onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${event.id}/96/96`; }} />}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className={`badge-${event.category.toLowerCase()} px-2 py-0.5 rounded-full text-xs font-semibold`}>{event.category}</span>
              <h3 className="text-white font-bold mt-1.5 mb-1 line-clamp-1">{event.title}</h3>
              <p className="text-white/40 text-xs line-clamp-2">{event.description}</p>
            </div>
            <span className={`status-${event.status} px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 capitalize`}>{event.status}</span>
          </div>
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-white/40">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-blue-400" />{formatDate(event.date)}</span>
            {event.venue && <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-violet-400" />{event.venue}</span>}
            {event.organizer && <span className="flex items-center gap-1"><Users className="w-3 h-3 text-cyan-400" />{event.organizer}</span>}
          </div>
          {event.maxSeats && (
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                <div className={`h-full rounded-full ${pct >= 100 ? "bg-red-500" : pct > 80 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${pct}%` }} />
              </div>
              <span className={`text-xs ${pct >= 100 ? "text-red-400" : "text-green-400"}`}>{pct >= 100 ? "Full" : `${event.maxSeats - (event.registeredCount || 0)} left`}</span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

function ExploreContent() {
  const { events } = useApp();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState<"date" | "popular">("date");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    let result = [...events];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.organizer?.toLowerCase().includes(q) ||
        e.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    if (category !== "All") result = result.filter(e => e.category === category);
    if (status !== "All") result = result.filter(e => e.status === status);
    if (sort === "date") result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (sort === "popular") result.sort((a, b) => (b.registeredCount || 0) - (a.registeredCount || 0));
    return result;
  }, [events, search, category, status, sort]);

  const getCategoryCount = (cat: string) => cat === "All" ? events.length : events.filter(e => e.category === cat).length;

  return (
    <div className="bg-[#0a0a0f] min-h-screen">
      {/* Header */}
      <div className="bg-hero pt-28 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="max-w-7xl mx-auto relative">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-blue-400 text-sm font-semibold mb-2 uppercase tracking-widest">Discover</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-6xl font-black text-white mb-4">Explore <span className="gradient-text">Events</span></motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-white/40 mb-8">{events.length} events across your campus</motion.p>
          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search events, categories, organizers..."
              className="w-full glass border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white text-sm placeholder-white/30 outline-none focus:border-blue-500/30 transition-colors"
            />
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Category pills */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${category === cat ? "bg-blue-600 text-white" : "glass border border-white/10 text-white/50 hover:text-white hover:border-white/20"}`}
                >
                  {cat} <span className="ml-1 opacity-60">{getCategoryCount(cat)}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Controls */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <select value={status} onChange={e => setStatus(e.target.value)} className="glass border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none bg-transparent capitalize">
              {STATUSES.map(s => <option key={s} value={s} className="bg-[#0a0a0f] capitalize">{s}</option>)}
            </select>
            <select value={sort} onChange={e => setSort(e.target.value as "date" | "popular")} className="glass border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none bg-transparent">
              <option value="date" className="bg-[#0a0a0f]">By Date</option>
              <option value="popular" className="bg-[#0a0a0f]">Most Popular</option>
            </select>
            <button onClick={() => setView("grid")} className={`p-2 rounded-xl transition-all ${view === "grid" ? "bg-blue-600 text-white" : "glass border border-white/10 text-white/50"}`}><Grid3X3 className="w-4 h-4" /></button>
            <button onClick={() => setView("list")} className={`p-2 rounded-xl transition-all ${view === "list" ? "bg-blue-600 text-white" : "glass border border-white/10 text-white/50"}`}><List className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Results count */}
        <p className="text-white/40 text-sm mb-6">{filtered.length} event{filtered.length !== 1 ? "s" : ""} found</p>

        {/* Events */}
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-24">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-white font-bold text-xl mb-2">No events found</h3>
              <p className="text-white/40 mb-6">Try adjusting your filters or search terms</p>
              <button onClick={() => { setSearch(""); setCategory("All"); setStatus("All"); }} className="btn-primary px-6 py-3 text-sm">Clear Filters</button>
            </motion.div>
          ) : view === "grid" ? (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filtered.map((event, i) => <EventCard key={event.id} event={event} index={i} />)}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div layout className="flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {filtered.map(event => <ListCard key={event.id} event={event} />)}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="bg-[#0a0a0f] min-h-screen flex items-center justify-center pt-28">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}
