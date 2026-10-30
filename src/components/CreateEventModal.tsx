"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { CampusEvent, Category, EventType } from "@/types";
import { DEFAULT_ARTS_ACTIVITIES, DEFAULT_SPORTS_ACTIVITIES } from "@/lib/mockData";
import {
  X,
  Sparkles,
  Upload,
  Link as LinkIcon,
  Palette,
  Image as ImageIcon,
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  CheckCircle2,
  RefreshCw,
  FileImage,
  Layers,
  ChevronRight,
  Eye,
} from "lucide-react";

const CATEGORIES: Category[] = [
  "Technical",
  "Cultural",
  "Sports",
  "Arts",
  "Workshop",
  "Seminar",
  "Placement",
  "Conference",
  "Club",
  "Festivals",
];

// Curated high-resolution image presets organized by category
const CURATED_IMAGE_PRESETS: Record<Category, { title: string; url: string }[]> = {
  Technical: [
    { title: "Hackathon & Coding", url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format" },
    { title: "AI & Neural Tech", url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format" },
    { title: "Cybersecurity & Matrix", url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format" },
    { title: "Robotics & Hardware", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format" },
  ],
  Cultural: [
    { title: "Live Band & Concert", url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format" },
    { title: "Stage Dance Lights", url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format" },
    { title: "DJ Night & Crowd", url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format" },
    { title: "Musical Symphony", url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format" },
  ],
  Sports: [
    { title: "Football Arena", url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format" },
    { title: "Track & Field Dash", url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format" },
    { title: "Basketball Court", url: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format" },
    { title: "Cricket Championship", url: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format" },
  ],
  Arts: [
    { title: "Canvas & Oil Painting", url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format" },
    { title: "Fine Art Studio", url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format" },
    { title: "Creative Exhibition", url: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format" },
    { title: "Mural & Colors", url: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format" },
  ],
  Workshop: [
    { title: "Interactive Workshop", url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format" },
    { title: "Design Sprint Lab", url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format" },
    { title: "Maker Lab Engineering", url: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800&auto=format" },
    { title: "Hands-on Computing", url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format" },
  ],
  Seminar: [
    { title: "Keynote Auditorium", url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format" },
    { title: "Speaker Podium", url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format" },
    { title: "Global Summit", url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format" },
    { title: "Academic Lecture", url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format" },
  ],
  Placement: [
    { title: "Corporate Interview", url: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format" },
    { title: "Campus Career Drive", url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format" },
    { title: "Business Networking", url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format" },
    { title: "Professional Suite", url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format" },
  ],
  Conference: [
    { title: "Conference Summit", url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format" },
    { title: "Auditorium Hall", url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format" },
    { title: "Academic Delegates", url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format" },
    { title: "Global Assembly", url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format" },
  ],
  Club: [
    { title: "Campus Social Gathering", url: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format" },
    { title: "Student Club Hub", url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format" },
    { title: "Photography & Arts", url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format" },
    { title: "Campus Celebration", url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format" },
  ],
  Festivals: [
    { title: "Grand Campus Fest", url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format" },
    { title: "Light & Music Show", url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format" },
    { title: "College Carnival", url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format" },
    { title: "Celebration Fireworks", url: "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=800&auto=format" },
  ],
};

// AI Styled Gradient Themes
const AI_GRADIENTS = [
  {
    name: "Cyberpunk Neon",
    css: "linear-gradient(135deg, #0a84ff 0%, #bf5af2 50%, #ff2d55 100%)",
    svg: (title: string, cat: string) =>
      `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230a84ff"/><stop offset="50%" stop-color="%23bf5af2"/><stop offset="100%" stop-color="%23ff2d55"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)"/><circle cx="700" cy="80" r="140" fill="%23ffffff" opacity="0.1"/><path d="M0,350 Q200,300 400,380 T800,320 L800,450 L0,450 Z" fill="%23000000" opacity="0.3"/><text x="40" y="380" font-family="system-ui, sans-serif" font-weight="900" font-size="34" fill="%23ffffff">${encodeURIComponent(
        title || "Campus Event"
      )}</text><text x="40" y="420" font-family="system-ui, sans-serif" font-weight="600" font-size="18" fill="%23ffffff" opacity="0.8">EVENTORA AI • ${cat}</text></svg>`,
  },
  {
    name: "Emerald Pulse",
    css: "linear-gradient(135deg, #30d158 0%, #32d2e8 50%, #0a84ff 100%)",
    svg: (title: string, cat: string) =>
      `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2330d158"/><stop offset="50%" stop-color="%2332d2e8"/><stop offset="100%" stop-color="%230a84ff"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)"/><circle cx="100" cy="100" r="180" fill="%23ffffff" opacity="0.15"/><path d="M0,370 Q300,280 600,390 T800,340 L800,450 L0,450 Z" fill="%23000000" opacity="0.25"/><text x="40" y="380" font-family="system-ui, sans-serif" font-weight="900" font-size="34" fill="%23ffffff">${encodeURIComponent(
        title || "Campus Event"
      )}</text><text x="40" y="420" font-family="system-ui, sans-serif" font-weight="600" font-size="18" fill="%23ffffff" opacity="0.8">EVENTORA AI • ${cat}</text></svg>`,
  },
  {
    name: "Sunset Amber",
    css: "linear-gradient(135deg, #ff9f0a 0%, #ff375f 50%, #bf5af2 100%)",
    svg: (title: string, cat: string) =>
      `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23ff9f0a"/><stop offset="50%" stop-color="%23ff375f"/><stop offset="100%" stop-color="%23bf5af2"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)"/><circle cx="650" cy="200" r="220" fill="%23ffffff" opacity="0.1"/><text x="40" y="380" font-family="system-ui, sans-serif" font-weight="900" font-size="34" fill="%23ffffff">${encodeURIComponent(
        title || "Campus Event"
      )}</text><text x="40" y="420" font-family="system-ui, sans-serif" font-weight="600" font-size="18" fill="%23ffffff" opacity="0.8">EVENTORA AI • ${cat}</text></svg>`,
  },
  {
    name: "Obsidian Gold",
    css: "linear-gradient(135deg, #1c1c1e 0%, #ffd60a 70%, #ff9f0a 100%)",
    svg: (title: string, cat: string) =>
      `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231a1a24"/><stop offset="50%" stop-color="%233a3050"/><stop offset="100%" stop-color="%23ffd60a"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)"/><circle cx="400" cy="100" r="160" fill="%23ffd60a" opacity="0.18"/><text x="40" y="380" font-family="system-ui, sans-serif" font-weight="900" font-size="34" fill="%23ffffff">${encodeURIComponent(
        title || "Campus Event"
      )}</text><text x="40" y="420" font-family="system-ui, sans-serif" font-weight="600" font-size="18" fill="%23ffd60a">EVENTORA AI • ${cat}</text></svg>`,
  },
];

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (eventId: string, title: string) => void;
}

export default function CreateEventModal({ isOpen, onClose, onSuccess }: CreateEventModalProps) {
  const { addEvent } = useApp();
  const { user, studentProfile } = useAuth();
  const { showToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Technical");
  const [type, setType] = useState<EventType>("Individual");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00 AM");
  const [venue, setVenue] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [maxSeats, setMaxSeats] = useState("100");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [eligibility, setEligibility] = useState("Open to all students");
  const [tags, setTags] = useState("");
  const [certificateAvailable, setCertificateAvailable] = useState(true);

  // Customized Image Options State
  type ImageMode = "presets" | "upload" | "url" | "gradient";
  const [imageMode, setImageMode] = useState<ImageMode>("presets");
  const [selectedImage, setSelectedImage] = useState<string>(
    CURATED_IMAGE_PRESETS.Technical[0].url
  );
  const [customUrl, setCustomUrl] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [selectedGradientIndex, setSelectedGradientIndex] = useState(0);

  const [submitting, setSubmitting] = useState(false);

  // Whenever category changes, automatically update the default preset banner if currently in preset mode
  useEffect(() => {
    if (imageMode === "presets") {
      const presets = CURATED_IMAGE_PRESETS[category] || CURATED_IMAGE_PRESETS.Technical;
      setSelectedImage(presets[0].url);
    }
  }, [category, imageMode]);

  // Handle Local File Upload with offscreen canvas compression (keeps under 250KB for snappy storage)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please choose a valid image file (PNG, JPG, WebP)", "error");
      return;
    }

    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Target 16:9 banner resolution max 1200 x 675
        let width = img.width;
        let height = img.height;
        const maxW = 1200;
        const maxH = 675;

        if (width > maxW || height > maxH) {
          const ratio = Math.min(maxW / width, maxH / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.82);
          setSelectedImage(compressedDataUrl);
          showToast(`Image "${file.name}" loaded successfully!`, "success");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle Custom URL
  const handleUrlApply = () => {
    if (!customUrl.trim()) return;
    try {
      new URL(customUrl);
      setSelectedImage(customUrl.trim());
      showToast("Custom banner URL applied!", "success");
    } catch {
      showToast("Please enter a valid HTTP or HTTPS image URL", "error");
    }
  };

  // Handle Gradient Selection
  const handleGradientSelect = (idx: number) => {
    setSelectedGradientIndex(idx);
    const grad = AI_GRADIENTS[idx];
    const svgData = grad.svg(title, category);
    setSelectedImage(svgData);
  };

  // Pick a random curated image
  const handleSurprisePreset = () => {
    const presets = CURATED_IMAGE_PRESETS[category] || CURATED_IMAGE_PRESETS.Technical;
    const randomPreset = presets[Math.floor(Math.random() * presets.length)];
    setSelectedImage(randomPreset.url);
    showToast(`Selected "${randomPreset.title}"`, "info");
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast("Event title is required", "error");
      return;
    }

    if (!date) {
      showToast("Please choose an event date", "error");
      return;
    }

    setSubmitting(true);

    try {
      // Determine activities for Arts or Sports
      const activities =
        category === "Arts"
          ? DEFAULT_ARTS_ACTIVITIES
          : category === "Sports"
          ? DEFAULT_SPORTS_ACTIVITIES
          : undefined;

      const organizerName =
        studentProfile?.name ||
        user?.displayName ||
        (user?.email ? user.email.split("@")[0] : "Campus Student Organizer");

      const newEvent: CampusEvent = {
        id: `e${Date.now()}`,
        title: title.trim(),
        category,
        type,
        status: "upcoming",
        date,
        time: time || "10:00 AM",
        venue: venue.trim() || "Campus Main Hall",
        location: location.trim() || "University Campus",
        description:
          description.trim() ||
          `Join us for ${title.trim()}, organized by ${organizerName}. Open to all college students.`,
        longDescription:
          longDescription.trim() ||
          `${title.trim()} is an official campus event under the ${category} domain. Participants can register individually or with teams to showcase their skills and earn verified certificates.`,
        maxSeats: parseInt(maxSeats, 10) || 100,
        registeredCount: 0,
        registrationDeadline: registrationDeadline || date,
        eligibility: eligibility.trim() || "All College Students",
        certificateAvailable,
        image: selectedImage || CURATED_IMAGE_PRESETS.Technical[0].url,
        tags: tags
          ? tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [category.toLowerCase(), type.toLowerCase(), "campus"],
        isFeatured: true,
        organizer: organizerName,
        organizerId: user?.uid || "campus_lead",
        activities,
        allowCustomActivity: category === "Arts" || category === "Sports" || type === "Group",
      };

      await addEvent(newEvent);

      showToast(`Event "${newEvent.title}" published to Home!`, "success");
      if (onSuccess) {
        onSuccess(newEvent.id, newEvent.title);
      }

      // Reset and close
      setTitle("");
      setDate("");
      setVenue("");
      setDescription("");
      onClose();
    } catch (err) {
      console.error(err);
      showToast("Failed to create event. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-4xl glass-dark border border-white/15 rounded-3xl p-5 sm:p-8 shadow-2xl z-10 my-8 max-h-[92vh] overflow-y-auto"
            style={{
              background:
                "linear-gradient(135deg, rgba(16, 18, 35, 0.96) 0%, rgba(10, 10, 20, 0.98) 100%)",
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full glass border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Instant Campus Publishing
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
                Add Campus Event
                <span className="text-xs px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-semibold">
                  Customized Posters
                </span>
              </h2>
              <p className="text-white/50 text-sm mt-1">
                Create and publish your event directly to the Home feed with custom poster banners, dates, and categories.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ── SECTION: CUSTOMIZED IMAGE OPTION (FLAGSHIP) ── */}
              <div className="p-5 rounded-2xl glass border border-blue-500/20 bg-blue-950/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="text-sm font-bold text-white flex items-center gap-2">
                      <Palette className="w-4 h-4 text-blue-400" /> Customized Event Banner Poster *
                    </label>
                    <p className="text-white/40 text-xs mt-0.5">
                      Choose from curated high-res presets, upload from your Mac, paste a URL, or generate an AI gradient.
                    </p>
                  </div>

                  {/* Image Mode Selector Tabs */}
                  <div className="flex p-1 rounded-xl glass border border-white/10 bg-black/40 self-start sm:self-auto">
                    {[
                      { id: "presets", label: "Presets", icon: Layers },
                      { id: "upload", label: "Upload Mac", icon: Upload },
                      { id: "url", label: "Image URL", icon: LinkIcon },
                      { id: "gradient", label: "AI Gradient", icon: Sparkles },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const active = imageMode === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setImageMode(tab.id as ImageMode)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            active
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                              : "text-white/50 hover:text-white"
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Banner Preview Card */}
                <div className="relative rounded-2xl overflow-hidden border border-white/10 h-44 sm:h-52 bg-white/5 group shadow-inner">
                  <img
                    src={selectedImage}
                    alt="Event Banner Preview"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-black/30 to-transparent" />

                  {/* Overlaid preview badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-600/90 text-white shadow-md backdrop-blur-md">
                      {category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-violet-600/80 text-white backdrop-blur-md">
                      {type}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Live Card Preview
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4">
                    <h4 className="text-white font-extrabold text-base sm:text-lg line-clamp-1 drop-shadow-md">
                      {title.trim() || "Your Event Title"}
                    </h4>
                    <p className="text-white/70 text-xs flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-blue-400" />
                        {date || "Event Date"}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        {venue || "Campus Venue"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Sub-Panel: Mode 1 - Curated Presets */}
                {imageMode === "presets" && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <span>Curated posters for category: <strong className="text-blue-300">{category}</strong></span>
                      <button
                        type="button"
                        onClick={handleSurprisePreset}
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" /> Randomize
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {(CURATED_IMAGE_PRESETS[category] || CURATED_IMAGE_PRESETS.Technical).map((preset) => {
                        const isSelected = selectedImage === preset.url;
                        return (
                          <div
                            key={preset.title}
                            onClick={() => setSelectedImage(preset.url)}
                            className={`relative rounded-xl overflow-hidden cursor-pointer h-20 border transition-all group ${
                              isSelected
                                ? "border-blue-500 ring-2 ring-blue-500/50 scale-102"
                                : "border-white/10 hover:border-white/30 opacity-70 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={preset.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <span className="absolute bottom-1.5 left-2 right-2 text-[10px] font-bold text-white truncate">
                              {preset.title}
                            </span>
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white">
                                <CheckCircle2 className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sub-Panel: Mode 2 - Local Upload from Mac */}
                {imageMode === "upload" && (
                  <div className="space-y-3 pt-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/20 hover:border-blue-500/60 rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-white/5 flex flex-col items-center justify-center gap-2 group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-blue-400" />
                      </div>
                      <p className="text-sm font-semibold text-white">
                        {uploadedFileName ? `Replace: ${uploadedFileName}` : "Click to browse image from your Mac"}
                      </p>
                      <p className="text-white/40 text-xs">
                        Supports PNG, JPG, WebP. High resolution posters will be automatically optimized.
                      </p>
                    </div>
                  </div>
                )}

                {/* Sub-Panel: Mode 3 - Custom URL */}
                {imageMode === "url" && (
                  <div className="space-y-3 pt-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                          type="url"
                          value={customUrl}
                          onChange={(e) => setCustomUrl(e.target.value)}
                          placeholder="Paste image URL (https://images.unsplash.com/...)"
                          className="w-full glass border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs outline-none focus:border-blue-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleUrlApply}
                        className="btn-primary px-4 py-2 text-xs font-semibold"
                      >
                        Apply
                      </button>
                    </div>
                    <p className="text-[11px] text-white/40">
                      Tip: You can use any direct image link from Unsplash, Pexels, or your college server.
                    </p>
                  </div>
                )}

                {/* Sub-Panel: Mode 4 - AI Gradient */}
                {imageMode === "gradient" && (
                  <div className="space-y-3 pt-2">
                    <p className="text-xs text-white/50">
                      Select a dynamic procedural gradient poster with built-in EVENTORA AI typography:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {AI_GRADIENTS.map((grad, i) => {
                        const isSelected = selectedGradientIndex === i && selectedImage.startsWith("data:image/svg");
                        return (
                          <div
                            key={grad.name}
                            onClick={() => handleGradientSelect(i)}
                            className={`p-3 rounded-xl cursor-pointer border transition-all text-center ${
                              isSelected
                                ? "border-violet-500 ring-2 ring-violet-500/50 scale-102"
                                : "border-white/10 hover:border-white/30"
                            }`}
                            style={{ background: grad.css }}
                          >
                            <p className="text-xs font-bold text-white drop-shadow-md">{grad.name}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ── SECTION: CORE DETAILS ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Event Title */}
                <div className="sm:col-span-2">
                  <label className="text-white/60 text-xs mb-1.5 block font-semibold">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., CodeSprint Hackathon 2026 or Inter-Collegiate Arts Expo"
                    className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 placeholder-white/30"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-white/60 text-xs mb-1.5 block font-semibold">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 bg-[#0e1022]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-[#0a0a0f] text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Format / Type */}
                <div>
                  <label className="text-white/60 text-xs mb-1.5 block font-semibold">
                    Participation Format *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as EventType)}
                    className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 bg-[#0e1022]"
                  >
                    <option value="Individual" className="bg-[#0a0a0f] text-white">
                      Individual (Single)
                    </option>
                    <option value="Group" className="bg-[#0a0a0f] text-white">
                      Group (Team / Squad)
                    </option>
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="text-white/60 text-xs mb-1.5 block font-semibold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" /> Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 bg-[#0e1022]"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="text-white/60 text-xs mb-1.5 block font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" /> Start Time
                  </label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 10:00 AM"
                    className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 placeholder-white/30"
                  />
                </div>

                {/* Venue */}
                <div>
                  <label className="text-white/60 text-xs mb-1.5 block font-semibold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" /> Venue
                  </label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Main Auditorium, Tech Block 2"
                    className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 placeholder-white/30"
                  />
                </div>

                {/* Max Seats */}
                <div>
                  <label className="text-white/60 text-xs mb-1.5 block font-semibold flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" /> Capacity (Max Seats)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    value={maxSeats}
                    onChange={(e) => setMaxSeats(e.target.value)}
                    className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500"
                  />
                </div>

                {/* Short Description */}
                <div className="sm:col-span-2">
                  <label className="text-white/60 text-xs mb-1.5 block font-semibold">
                    Short Overview
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A catchy summary displayed in event preview cards..."
                    className="w-full glass border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500 placeholder-white/30 resize-none"
                  />
                </div>

                {/* Tags */}
                <div className="sm:col-span-2">
                  <label className="text-white/60 text-xs mb-1.5 block font-semibold">
                    Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="hackathon, robotics, ai, web3"
                    className="w-full glass border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500 placeholder-white/30"
                  />
                </div>
              </div>

              {/* Certificate & Verification Toggle */}
              <div className="p-4 rounded-xl glass border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Award className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Issue Verified Certificates</p>
                    <p className="text-xs text-white/40">
                      Attendees receive verifiable QR digital certificates upon event completion.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={certificateAvailable}
                  onChange={(e) => setCertificateAvailable(e.target.checked)}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
                <p className="text-xs text-white/40 text-center sm:text-left">
                  Saved immediately to Cloud Firestore and shown on Home & Explore.
                </p>

                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 rounded-xl glass border border-white/10 text-white/70 hover:text-white text-sm font-semibold transition-colors flex-1 sm:flex-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`btn-primary px-8 py-3 text-sm font-bold flex items-center justify-center gap-2 flex-1 sm:flex-none ${
                      submitting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Publish Event
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
