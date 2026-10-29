"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { Bell, CheckCircle, Clock, Award, Megaphone, XCircle, Check } from "lucide-react";
import { Notification } from "@/types";

const ICONS: Record<string, React.ReactNode> = {
  registration: <CheckCircle className="w-4 h-4 text-green-400" />,
  reminder: <Clock className="w-4 h-4 text-blue-400" />,
  certificate: <Award className="w-4 h-4 text-yellow-400" />,
  announcement: <Megaphone className="w-4 h-4 text-violet-400" />,
  cancellation: <XCircle className="w-4 h-4 text-red-400" />,
  update: <Bell className="w-4 h-4 text-cyan-400" />,
};

const FILTERS = ["All","Unread","registration","reminder","certificate","announcement","cancellation"];

function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  if (d < 60000) return "Just now";
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`;
  if (d < 172800000) return "Yesterday";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllRead, unreadCount } = useApp();
  const [filter, setFilter] = useState("All");

  const filtered = notifications.filter(n => {
    if (filter === "All") return true;
    if (filter === "Unread") return !n.read;
    return n.type === filter;
  });

  return (
    <div className="bg-[#0a0a0f] min-h-screen">
      <div className="pt-24 pb-12 px-6" style={{ background: "linear-gradient(135deg, rgba(10,132,255,0.06), rgba(191,90,242,0.04))" }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-blue-400 text-sm font-semibold mb-2 uppercase tracking-widest">Updates</motion.p>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-black text-white flex items-center gap-3">
                Notifications
                {unreadCount > 0 && <span className="w-8 h-8 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">{unreadCount}</span>}
              </motion.h1>
            </div>
            {unreadCount > 0 && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={markAllRead} className="flex items-center gap-2 text-sm text-white/50 hover:text-white glass border border-white/10 rounded-xl px-4 py-2 transition-all">
                <Check className="w-4 h-4" />Mark all read
              </motion.button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all capitalize ${filter === f ? "bg-blue-600 text-white" : "glass border border-white/10 text-white/50 hover:text-white"}`}>
              {f}
              {f === "Unread" && unreadCount > 0 && <span className="ml-1.5 w-4 h-4 rounded-full bg-blue-500 text-white text-xs inline-flex items-center justify-center">{unreadCount}</span>}
            </button>
          ))}
        </div>

        {/* List */}
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-20">
              <Bell className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/40 font-semibold">No notifications here</p>
              <p className="text-white/20 text-sm mt-1">They'll show up when events update</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filtered.map((n, i) => (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => !n.read && markNotificationRead(n.id)}
                  className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                    !n.read
                      ? "glass-dark border-blue-500/15 hover:border-blue-500/30"
                      : "glass-dark border-white/5 hover:border-white/10 opacity-70"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${!n.read ? "bg-white/10" : "bg-white/5"}`}>
                    {ICONS[n.type] || <Bell className="w-4 h-4 text-white/40" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${n.read ? "text-white/50" : "text-white"}`}>{n.title}</p>
                      <span className="text-white/30 text-xs flex-shrink-0 mt-0.5">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className="text-white/40 text-xs mt-1 leading-relaxed">{n.message}</p>
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                      n.type === "registration" ? "bg-green-500/10 text-green-400" :
                      n.type === "certificate" ? "bg-yellow-500/10 text-yellow-400" :
                      n.type === "reminder" ? "bg-blue-500/10 text-blue-400" :
                      n.type === "cancellation" ? "bg-red-500/10 text-red-400" :
                      "bg-violet-500/10 text-violet-400"
                    }`}>{n.type}</span>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
