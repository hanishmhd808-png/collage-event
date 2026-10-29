"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { DEFAULT_ARTS_ACTIVITIES, DEFAULT_SPORTS_ACTIVITIES } from "@/lib/mockData";
import {
  Palette,
  Trophy,
  User,
  Users,
  CheckCircle2,
  X,
  Sparkles,
  PlusCircle,
  ShieldAlert,
} from "lucide-react";
import { ActivityOption } from "@/types";

interface ActivityCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: "Arts" | "Sports";
  initialEventId?: string;
  onSuccess?: (ticketId: string, eventTitle: string) => void;
}

export default function ActivityCustomizerModal({
  isOpen,
  onClose,
  initialCategory = "Arts",
  initialEventId,
  onSuccess,
}: ActivityCustomizerModalProps) {
  const { events, groups, registerForEvent, myRegistrations, addCustomActivity } = useApp();
  const { user, studentProfile, loginAsMockStudent } = useAuth();
  const { showToast } = useToast();

  const [category, setCategory] = useState<"Arts" | "Sports">(initialCategory);
  const [participationType, setParticipationType] = useState<"Single" | "Group">("Single");
  const [selectedActivity, setSelectedActivity] = useState<string>("");
  const [customActivityName, setCustomActivityName] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [groupMode, setGroupMode] = useState<"create" | "join">("create");
  const [groupName, setGroupName] = useState<string>("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Find relevant events for Arts and Sports
  const relevantEvents = events.filter(e => e.category === category);
  const targetEvent = initialEventId
    ? events.find(e => e.id === initialEventId) || relevantEvents[0]
    : relevantEvents[0] || events[0];

  const standardActivities: ActivityOption[] =
    category === "Arts" ? DEFAULT_ARTS_ACTIVITIES : DEFAULT_SPORTS_ACTIVITIES;

  const filteredActivities = standardActivities.filter(a => a.type === participationType);

  const existingGroupsForEvent = groups.filter(g => g.eventId === targetEvent?.id);

  // Individual events count
  const individualCount = myRegistrations.filter(r => {
    const ev = events.find(e => e.id === r.eventId);
    return r.participationType === "Single" || ev?.type === "Individual";
  }).length;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showToast("Signed in as student automatically for demo!", "success");
      loginAsMockStudent();
    }

    const activityToUse = isCustom ? customActivityName.trim() : selectedActivity;
    if (!activityToUse) {
      showToast("Please choose or specify an activity discipline", "error");
      return;
    }

    if (participationType === "Group") {
      if (groupMode === "create" && !groupName.trim()) {
        showToast("Please provide your team / group name", "error");
        return;
      }
      if (groupMode === "join" && !selectedGroupId) {
        showToast("Please select an existing team to join", "error");
        return;
      }
    }

    if (participationType === "Single" && individualCount >= 3) {
      showToast("You can only participate in up to 3 individual events", "error");
      return;
    }

    if (!targetEvent) {
      showToast("No target event found", "error");
      return;
    }

    setSubmitting(true);

    // If custom activity was specified, register it dynamically
    if (isCustom && customActivityName.trim()) {
      addCustomActivity(targetEvent.id, {
        id: `custom-${Date.now()}`,
        name: customActivityName.trim(),
        category,
        type: participationType,
        description: `Customized student-selected ${category} activity`,
      });
    }

    const res = await registerForEvent(
      targetEvent.id,
      participationType === "Group" && groupMode === "join" ? selectedGroupId : undefined,
      participationType === "Group" && groupMode === "create" ? groupName.trim() : undefined,
      activityToUse,
      participationType
    );

    setSubmitting(false);

    if (res.success) {
      showToast(res.message, "success");
      if (onSuccess) {
        onSuccess(targetEvent.id, targetEvent.title);
      }
      onClose();
    } else {
      showToast(res.message, "error");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[320] flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative z-10 w-full max-w-xl glass-dark border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 overflow-hidden"
            style={{
              background: "rgba(12, 14, 26, 0.98)",
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 50px rgba(191, 90, 242, 0.15)",
            }}
          >
            {/* Top Glow Bar */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{
                background:
                  category === "Arts"
                    ? "linear-gradient(90deg, #bf5af2, #32d2e8)"
                    : "linear-gradient(90deg, #30d158, #0a84ff)",
              }}
            />

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10"
                  style={{
                    background:
                      category === "Arts" ? "rgba(191, 90, 242, 0.15)" : "rgba(48, 209, 88, 0.15)",
                  }}
                >
                  {category === "Arts" ? (
                    <Palette className="w-6 h-6 text-violet-400" />
                  ) : (
                    <Trophy className="w-6 h-6 text-emerald-400" />
                  )}
                </div>
                <div>
                  <span className="text-xs uppercase tracking-widest font-bold text-white/50">
                    Activity Customizer
                  </span>
                  <h3 className="text-2xl font-black text-white">
                    {category} Activity Selection
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              {/* Category Selector */}
              <div>
                <label className="text-xs font-semibold text-white/60 mb-2 block uppercase tracking-wider">
                  1. Choose Domain
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCategory("Arts");
                      setSelectedActivity("");
                    }}
                    className={`p-3.5 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      category === "Arts"
                        ? "bg-violet-600/30 border-violet-500 text-white shadow-lg shadow-violet-500/20"
                        : "glass border-white/10 text-white/50 hover:text-white"
                    }`}
                  >
                    <Palette className="w-4 h-4 text-violet-400" /> Arts & Creative
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCategory("Sports");
                      setSelectedActivity("");
                    }}
                    className={`p-3.5 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      category === "Sports"
                        ? "bg-emerald-600/30 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                        : "glass border-white/10 text-white/50 hover:text-white"
                    }`}
                  >
                    <Trophy className="w-4 h-4 text-emerald-400" /> Sports & Athletics
                  </button>
                </div>
              </div>

              {/* Participation Mode: Single vs Group */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                    2. Participation Format
                  </label>
                  {participationType === "Single" && (
                    <span className="text-xs text-blue-400 font-medium">
                      Single Quota: {individualCount}/3 slots
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
                        ? "bg-cyan-600/30 border-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                        : "glass border-white/10 text-white/50 hover:text-white"
                    }`}
                  >
                    <Users className="w-4 h-4 text-cyan-400" /> Group / Team
                  </button>
                </div>
              </div>

              {/* Activity Discipline Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                    3. Select Activity / Discipline
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustom(!isCustom)}
                    className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1"
                  >
                    {isCustom ? "Pick Standard" : "+ Custom Activity"}
                  </button>
                </div>

                {isCustom ? (
                  <div>
                    <input
                      type="text"
                      value={customActivityName}
                      onChange={e => setCustomActivityName(e.target.value)}
                      placeholder={`Enter custom ${category.toLowerCase()} activity (e.g. ${
                        category === "Arts" ? "Calligraphy, Clay Sculpting" : "Kho-Kho, Archery"
                      })`}
                      className="w-full glass border border-white/15 rounded-2xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none focus:border-violet-500"
                      autoFocus
                    />
                    <p className="text-xs text-white/40 mt-1.5">
                      Type any custom event name; it will be officially registered to your campus profile.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {filteredActivities.map(act => (
                      <div
                        key={act.id}
                        onClick={() => setSelectedActivity(act.name)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          selectedActivity === act.name
                            ? "bg-white/15 border-blue-400 text-white"
                            : "glass border-white/8 text-white/70 hover:bg-white/5 hover:border-white/15"
                        }`}
                      >
                        <div className="pr-3">
                          <p className="text-sm font-semibold text-white">{act.name}</p>
                          {act.description && (
                            <p className="text-xs text-white/40 mt-0.5 line-clamp-1">
                              {act.description}
                            </p>
                          )}
                        </div>
                        {selectedActivity === act.name && (
                          <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Group Team Options (Only if Group mode selected) */}
              {participationType === "Group" && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setGroupMode("create")}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        groupMode === "create"
                          ? "bg-blue-600 text-white"
                          : "glass text-white/50 hover:text-white"
                      }`}
                    >
                      Create New Team
                    </button>
                    <button
                      type="button"
                      onClick={() => setGroupMode("join")}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        groupMode === "join"
                          ? "bg-blue-600 text-white"
                          : "glass text-white/50 hover:text-white"
                      }`}
                    >
                      Join Existing Team
                    </button>
                  </div>

                  {groupMode === "create" ? (
                    <div>
                      <label className="text-xs text-white/50 mb-1.5 block">Team / Group Name</label>
                      <input
                        type="text"
                        value={groupName}
                        onChange={e => setGroupName(e.target.value)}
                        placeholder="e.g. Phoenix Strikers, Symphony Guild"
                        className="w-full glass border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 outline-none focus:border-blue-400"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs text-white/50 mb-1.5 block">Select Registered Team</label>
                      {existingGroupsForEvent.length === 0 ? (
                        <p className="text-xs text-amber-400/80 py-2">
                          No teams formed yet for this event. Switch to "Create New Team" to lead your own!
                        </p>
                      ) : (
                        <select
                          value={selectedGroupId}
                          onChange={e => setSelectedGroupId(e.target.value)}
                          className="w-full glass border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none bg-transparent"
                        >
                          <option value="" className="bg-[#0c0e1a]">
                            Select a team...
                          </option>
                          {existingGroupsForEvent.map(g => (
                            <option key={g.id} value={g.id} className="bg-[#0c0e1a]">
                              {g.name} ({g.members.length} member{g.members.length > 1 ? "s" : ""})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Event Target Notice */}
              {targetEvent && (
                <div className="flex items-center gap-2.5 text-xs text-white/50 px-1">
                  <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <span>
                    Linked to: <strong className="text-white/80">{targetEvent.title}</strong> (
                    {targetEvent.date})
                  </span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl glass border border-white/10 text-white/60 hover:text-white text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 btn-primary py-3 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  {submitting ? "Registering..." : `Confirm ${participationType} Registration`}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
