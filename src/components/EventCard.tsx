"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Users, Heart, ArrowRight } from "lucide-react";
import { CampusEvent } from "@/types";
import { useApp } from "@/context/AppContext";

const CATEGORY_BADGE: Record<string, string> = {
  Technical: "badge-technical",
  Cultural: "badge-cultural",
  Workshop: "badge-workshop",
  Seminar: "badge-seminar",
  Conference: "badge-conference",
  Sports: "badge-sports",
  Placement: "badge-placement",
  Club: "badge-club",
  Arts: "badge-arts",
  Festivals: "badge-festivals",
};

function seatsPercent(event: CampusEvent) {
  if (!event.maxSeats || !event.registeredCount) return 0;
  return Math.min((event.registeredCount / event.maxSeats) * 100, 100);
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface EventCardProps {
  event: CampusEvent;
  index?: number;
  compact?: boolean;
}

export default function EventCard({ event, index = 0, compact = false }: EventCardProps) {
  const router = useRouter();
  const { favorites, toggleFavorite } = useApp();
  const isFav = favorites.includes(event.id);
  const pct = seatsPercent(event);
  const isFull = pct >= 100;

  const handleClick = () => {
    router.push(`/events/${event.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      whileHover={{ y: -5 }}
      onClick={handleClick}
      className="glass-card overflow-hidden group cursor-pointer relative flex flex-col h-full hover:border-blue-500/40 transition-all shadow-lg hover:shadow-2xl hover:shadow-blue-500/10"
    >
      {/* Image Header */}
      {event.image && !compact && (
        <div className="relative h-48 overflow-hidden bg-white/5">
          <motion.img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${event.id}/600/300`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f1d] via-transparent to-transparent" />

          {/* Category & Status Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <span className={`${CATEGORY_BADGE[event.category] || "badge-club"} px-2.5 py-1 rounded-full text-xs font-semibold shadow-md`}>
              {event.category}
            </span>
            {event.isFeatured && (
              <span className="bg-amber-400/20 border border-amber-400/40 text-amber-300 px-2.5 py-1 rounded-full text-xs font-semibold shadow-md">
                ⭐ Featured
              </span>
            )}
            {event.status === "upcoming" && (
              <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                Upcoming
              </span>
            )}
          </div>

          {/* Favorite Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              toggleFavorite(event.id);
            }}
            className="absolute top-3 right-3 p-2.5 rounded-xl bg-black/40 backdrop-blur-md hover:bg-black/60 transition-all z-20"
            title={isFav ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`w-4 h-4 transition-colors ${isFav ? "fill-red-500 text-red-500" : "text-white/80"}`} />
          </button>
        </div>
      )}

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {compact && (
            <div className="flex gap-2 mb-3">
              <span className={`${CATEGORY_BADGE[event.category] || "badge-club"} px-2.5 py-1 rounded-full text-xs font-semibold`}>
                {event.category}
              </span>
            </div>
          )}

          <h3 className="font-bold text-base text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
            {event.title}
          </h3>
          <p className="text-white/50 text-xs sm:text-sm mb-4 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          <div className="flex flex-col gap-1.5 mb-4">
            <div className="flex items-center gap-2 text-white/60 text-xs">
              <Calendar className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span>{formatDate(event.date)}{event.time ? ` · ${event.time}` : ""}</span>
            </div>
            {event.venue && (
              <div className="flex items-center gap-2 text-white/60 text-xs">
                <MapPin className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                <span className="truncate">{event.venue}</span>
              </div>
            )}
            {event.organizer && (
              <div className="flex items-center gap-2 text-white/60 text-xs">
                <Users className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span className="truncate">{event.organizer}</span>
              </div>
            )}
          </div>
        </div>

        <div>
          {/* Seats Bar */}
          {event.maxSeats && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-white/40 mb-1.5 font-medium">
                <span>{event.registeredCount || 0} registered</span>
                <span className={isFull ? "text-red-400" : "text-green-400"}>
                  {isFull ? "Full" : `${event.maxSeats - (event.registeredCount || 0)} seats left`}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${isFull ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-emerald-500"}`}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-400 group-hover:text-blue-300 flex items-center gap-1 transition-colors">
              {isFull ? "View Details" : "Register Now"} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="text-[11px] text-white/40 font-medium">
              {event.type || "Individual"}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
