"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, MapPin, Users, Clock, Heart } from "lucide-react";
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
  const { favorites, toggleFavorite } = useApp();
  const isFav = favorites.includes(event.id);
  const pct = seatsPercent(event);
  const isFull = pct >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="glass-card overflow-hidden group cursor-pointer relative"
    >
      {/* Image */}
      {event.image && !compact && (
        <div className="relative h-44 overflow-hidden">
          <motion.img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
            onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${event.id}/400/200`; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`${CATEGORY_BADGE[event.category] || "badge-club"} px-2.5 py-1 rounded-full text-xs font-semibold`}>
              {event.category}
            </span>
            {event.isFeatured && (
              <span className="bg-yellow-400/20 text-yellow-400 px-2.5 py-1 rounded-full text-xs font-semibold">
                ⭐ Featured
              </span>
            )}
          </div>
          {/* Favorite */}
          <button
            onClick={(e) => { e.preventDefault(); toggleFavorite(event.id); }}
            className="absolute top-3 right-3 p-2 rounded-xl bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all"
          >
            <Heart className={`w-4 h-4 ${isFav ? "fill-red-500 text-red-500" : "text-white/70"}`} />
          </button>
        </div>
      )}

      <Link href={`/events/${event.id}`} className="block p-5">
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
        <p className="text-white/50 text-sm mb-4 line-clamp-2">{event.description}</p>

        <div className="flex flex-col gap-1.5 mb-4">
          <div className="flex items-center gap-2 text-white/50 text-xs">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>{formatDate(event.date)}{event.time && ` · ${event.time}`}</span>
          </div>
          {event.venue && (
            <div className="flex items-center gap-2 text-white/50 text-xs">
              <MapPin className="w-3.5 h-3.5 text-violet-400" />
              <span className="truncate">{event.venue}</span>
            </div>
          )}
          {event.organizer && (
            <div className="flex items-center gap-2 text-white/50 text-xs">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>{event.organizer}</span>
            </div>
          )}
        </div>

        {/* Seats bar */}
        {event.maxSeats && (
          <div className="mt-auto">
            <div className="flex justify-between text-xs text-white/40 mb-1.5">
              <span>{event.registeredCount || 0} registered</span>
              <span className={isFull ? "text-red-400" : "text-green-400"}>
                {isFull ? "Full" : `${event.maxSeats - (event.registeredCount || 0)} seats left`}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${isFull ? "bg-red-500" : pct > 80 ? "bg-yellow-500" : "bg-green-500"}`}
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        )}
      </Link>
    </motion.div>
  );
}
