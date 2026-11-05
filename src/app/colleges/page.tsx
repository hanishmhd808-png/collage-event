"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  Building2, Search, ShieldCheck, MapPin, Globe, ExternalLink,
  Users, Calendar, Plus, X, Phone, Mail, Award, CheckCircle2, ArrowRight
} from "lucide-react";
import { College } from "@/types";

export default function CollegesDirectoryPage() {
  const { colleges, events, addCollege } = useApp();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("All");
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  // New College Form State
  const [collegeName, setCollegeName] = useState("");
  const [collegeCode, setCollegeCode] = useState("");
  const [district, setDistrict] = useState("Malappuram");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const districts = useMemo(() => {
    const list = Array.from(new Set(colleges.map(c => c.district))).filter(Boolean);
    return ["All", ...list];
  }, [colleges]);

  const filteredColleges = useMemo(() => {
    let result = [...colleges];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.district.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      );
    }
    if (districtFilter !== "All") {
      result = result.filter(c => c.district.toLowerCase() === districtFilter.toLowerCase());
    }
    return result;
  }, [colleges, search, districtFilter]);

  const totalInterCollegeEvents = events.filter(e => e.isInterCollege).length;

  const handleRegisterCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collegeName.trim() || !collegeCode.trim()) {
      showToast("Please provide college name and code", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const newId = `col-${collegeCode.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Date.now().toString(36).substr(0, 4)}`;
      const newCol: College = {
        id: newId,
        name: collegeName.trim(),
        code: collegeCode.trim().toUpperCase(),
        district: district.trim() || "Malappuram",
        state: "Kerala",
        address: address.trim() || `${district}, Kerala`,
        logo: "https://images.unsplash.com/photo-1562774053-701939374585?w=200&auto=format",
        banner: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format",
        website: website.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        isVerified: true, // Auto-verified in prototype
        eventCount: 0,
        studentCount: 2500,
        description: description.trim() || "Premier higher education institution participating in EVENTORA AI multi-college event network.",
      };

      await addCollege(newCol);
      showToast(`${newCol.name} registered successfully!`, "success");
      setRegisterModalOpen(false);

      // Reset form
      setCollegeName("");
      setCollegeCode("");
      setAddress("");
      setWebsite("");
      setEmail("");
      setPhone("");
      setDescription("");
    } catch {
      showToast("Could not register college. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#0a0a0f] min-h-screen pb-24">
      {/* ── HERO BANNER ── */}
      <div className="bg-hero pt-28 pb-16 px-6 relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-3 uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5" /> Collegiate Directory • Malappuram & Kerala
              </div>
              <h1 className="text-4xl sm:text-6xl font-black text-white">
                Participating <span className="gradient-text">Colleges</span>
              </h1>
              <p className="text-white/50 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                Explore affiliated institutions across Malappuram district. Browse campus profiles, discover inter-collegiate flagship festivals, and follow college event schedules.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setRegisterModalOpen(true)}
              className="btn-primary py-3.5 px-6 rounded-2xl text-sm font-semibold flex items-center gap-2 shadow-xl shadow-blue-600/30 whitespace-nowrap self-start md:self-auto"
            >
              <Plus className="w-4 h-4" /> Register Institution
            </motion.button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Partner Colleges", val: colleges.length, icon: Building2, color: "text-blue-400" },
              { label: "Inter-College Events", val: totalInterCollegeEvents, icon: Globe, color: "text-sky-400" },
              { label: "Verified Campuses", val: colleges.filter(c => c.isVerified).length, icon: ShieldCheck, color: "text-emerald-400" },
              { label: "Students Connected", val: "24,000+", icon: Users, color: "text-purple-400" },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-black text-white">{stat.val}</div>
                  <div className="text-white/40 text-[11px]">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by college name, code (KMCT, MES, FAROOK...), or location..."
              className="w-full glass border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white text-sm placeholder-white/30 outline-none focus:border-blue-500/40 transition-colors shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* ── DIRECTORY CONTENT ── */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* District Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-white/40 mr-1 flex-shrink-0">District:</span>
            {districts.map(dist => (
              <button
                key={dist}
                onClick={() => setDistrictFilter(dist)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  districtFilter.toLowerCase() === dist.toLowerCase()
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "glass border border-white/10 text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {dist}
              </button>
            ))}
          </div>

          <p className="text-white/40 text-xs">
            Showing {filteredColleges.length} of {colleges.length} institutions
          </p>
        </div>

        {/* Colleges Grid */}
        {filteredColleges.length === 0 ? (
          <div className="text-center py-24 glass-dark border border-white/10 rounded-3xl p-8">
            <Building2 className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">No colleges found</h3>
            <p className="text-white/40 text-xs mb-6">Try adjusting your search criteria</p>
            <button
              onClick={() => { setSearch(""); setDistrictFilter("All"); }}
              className="btn-primary text-xs py-2 px-5"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredColleges.map((col, i) => {
              const collegeEvents = events.filter(e => e.collegeId === col.id || e.collegeCode === col.code);
              return (
                <motion.div
                  key={col.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-dark border border-white/10 rounded-3xl overflow-hidden hover:border-blue-500/40 transition-all shadow-xl group flex flex-col justify-between"
                >
                  <div>
                    {/* Header Banner */}
                    <div className="relative h-36 bg-gradient-to-r from-blue-900/40 to-violet-900/40 overflow-hidden">
                      {col.banner && (
                        <img
                          src={col.banner}
                          alt={col.name}
                          className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${col.id}/600/200`;
                          }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f1a] via-[#0d0f1a]/40 to-transparent" />

                      {/* Verified Badge */}
                      {col.isVerified && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-md">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>

                    {/* Content Section with overlapping Logo */}
                    <div className="p-6 pt-0 relative">
                      <div className="-mt-10 mb-4 flex items-end justify-between">
                        <img
                          src={col.logo}
                          alt={col.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 bg-[#0a0a0f] shadow-xl group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${col.id}/200/200`;
                          }}
                        />
                        <span className="text-xs font-bold text-blue-400 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          {col.code}
                        </span>
                      </div>

                      <h3 className="font-bold text-lg text-white mb-1.5 group-hover:text-blue-400 transition-colors line-clamp-1">
                        {col.name}
                      </h3>

                      <div className="flex items-center gap-1.5 text-xs text-white/50 mb-3">
                        <MapPin className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                        <span className="truncate">{col.address || `${col.district}, Kerala`}</span>
                      </div>

                      <p className="text-white/50 text-xs line-clamp-2 leading-relaxed mb-4">
                        {col.description}
                      </p>

                      <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-white/5 border border-white/5 text-xs mb-4">
                        <div>
                          <span className="text-white/40 block text-[10px]">Hosted Events</span>
                          <span className="text-white font-bold text-sm">
                            {collegeEvents.length || col.eventCount}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[10px]">Students</span>
                          <span className="text-white font-bold text-sm">
                            {col.studentCount ? col.studentCount.toLocaleString() : "2,500+"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-6 pt-0 border-t border-white/5 flex items-center justify-between gap-3 mt-auto">
                    <Link href={`/colleges/${col.id}`} className="flex-1">
                      <button className="w-full btn-primary py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-1.5">
                        View Campus Hub <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                    {col.website && (
                      <a
                        href={col.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl glass border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                        title="Official Website"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── REGISTER INSTITUTION MODAL ── */}
      <AnimatePresence>
        {registerModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4"
            onClick={() => setRegisterModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="glass-dark border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-white">Register Institution</h2>
                  <p className="text-white/40 text-xs mt-1">Connect your campus to the EVENTORA AI network</p>
                </div>
                <button
                  onClick={() => setRegisterModalOpen(false)}
                  className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRegisterCollege} className="space-y-4">
                <div>
                  <label className="text-xs text-white/60 mb-1.5 block font-semibold">College Full Name *</label>
                  <input
                    type="text"
                    required
                    value={collegeName}
                    onChange={e => setCollegeName(e.target.value)}
                    placeholder="e.g. Malabar College of Advanced Studies"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/60 mb-1.5 block font-semibold">Short Code *</label>
                    <input
                      type="text"
                      required
                      value={collegeCode}
                      onChange={e => setCollegeCode(e.target.value)}
                      placeholder="e.g. MCAS"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500/50 uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/60 mb-1.5 block font-semibold">District *</label>
                    <select
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      className="w-full bg-[#0d0f1d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500/50"
                    >
                      <option value="Malappuram">Malappuram</option>
                      <option value="Kozhikode">Kozhikode</option>
                      <option value="Palakkad">Palakkad</option>
                      <option value="Thrissur">Thrissur</option>
                      <option value="Ernakulam">Ernakulam</option>
                      <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/60 mb-1.5 block font-semibold">Campus Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="e.g. Vengara, Malappuram, Kerala - 676519"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/60 mb-1.5 block font-semibold">Official Website</label>
                    <input
                      type="url"
                      value={website}
                      onChange={e => setWebsite(e.target.value)}
                      placeholder="https://collegename.edu.in"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1.5 block font-semibold">Contact Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="events@collegename.edu.in"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/60 mb-1.5 block font-semibold">Brief Campus Overview</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe key departments, annual festivals, and student clubs..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500/50 resize-none"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRegisterModalOpen(false)}
                    className="flex-1 py-3 rounded-xl glass border border-white/10 text-white/60 hover:text-white text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 btn-primary py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? "Registering..." : "Confirm & Onboard"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
