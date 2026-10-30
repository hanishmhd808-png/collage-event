"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CampusEvent, Registration, Group, Notification, Certificate, ActivityOption } from "@/types";
import { useAuth } from "./AuthContext";
import { db } from "../lib/firebase";
import { collection, doc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import {
  initialEvents,
  initialRegistrations,
  initialGroups,
  mockNotifications,
  mockCertificates,
} from "@/lib/mockData";

const STORAGE_KEYS = {
  EVENTS: "eventora_events",
  REGISTRATIONS: "eventora_registrations",
  GROUPS: "eventora_groups",
  NOTIFICATIONS: "eventora_notifications",
  CERTIFICATES: "eventora_certificates",
  FAVORITES: "eventora_favorites",
};

interface AppContextType {
  events: CampusEvent[];
  registrations: Registration[];
  groups: Group[];
  notifications: Notification[];
  certificates: Certificate[];
  favorites: string[];
  addEvent: (e: CampusEvent) => Promise<void>;
  updateEvent: (id: string, updatedEvent: Partial<CampusEvent>) => Promise<void>;
  registerForEvent: (
    eventId: string,
    groupId?: string,
    groupName?: string,
    activityName?: string,
    participationType?: "Single" | "Group"
  ) => Promise<{ success: boolean; message: string }>;
  addCustomActivity: (eventId: string, activity: ActivityOption) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  toggleFavorite: (eventId: string) => void;
  myRegistrations: Registration[];
  unreadCount: number;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, studentProfile } = useAuth();

  // 1. Synchronously restore state from localStorage on page refresh
  const [events, setEvents] = useState<CampusEvent[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return initialEvents;
  });

  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }
    return initialRegistrations;
  });

  const [groups, setGroups] = useState<Group[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.GROUPS);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }
    return initialGroups;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }
    return mockNotifications;
  });

  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }
    return mockCertificates;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }
    return [];
  });

  // 2. Real-time Cloud Firestore synchronization with smart local caching
  useEffect(() => {
    if (!db) return;

    const unsubEvents = onSnapshot(
      collection(db, "events"),
      (snapshot) => {
        if (snapshot.docs.length > 0) {
          const dbEvts = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as CampusEvent));
          setEvents(dbEvts);
          if (typeof window !== "undefined") {
            try { localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(dbEvts)); } catch {}
          }
        }
      },
      () => {}
    );

    const unsubRegs = onSnapshot(
      collection(db, "registrations"),
      (snapshot) => {
        if (!snapshot.empty) {
          const dbRegs = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              ...data,
              id: doc.id,
              studentId: data.studentId || data.studentUid,
            } as Registration;
          });

          setRegistrations(prev => {
            // Merge Firestore records with any active local records
            const mergedMap = new Map<string, Registration>();
            prev.forEach(r => mergedMap.set(r.id, r));
            dbRegs.forEach(r => mergedMap.set(r.id, r));
            const merged = Array.from(mergedMap.values());
            if (typeof window !== "undefined") {
              try { localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(merged)); } catch {}
            }
            return merged;
          });
        }
      },
      () => {}
    );

    const unsubGroups = onSnapshot(
      collection(db, "groups"),
      (snapshot) => {
        if (!snapshot.empty) {
          const dbGroups = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Group));
          setGroups(dbGroups);
          if (typeof window !== "undefined") {
            try { localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(dbGroups)); } catch {}
          }
        }
      },
      () => {}
    );

    return () => {
      unsubEvents();
      unsubRegs();
      unsubGroups();
    };
  }, []);

  // Save favorites to localStorage whenever changed
  const toggleFavorite = (eventId: string) => {
    setFavorites(prev => {
      const next = prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId];
      if (typeof window !== "undefined") {
        try { localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(next)); } catch {}
      }
      return next;
    });
  };

  const addEvent = async (e: CampusEvent) => {
    const updated = [...events, e];
    setEvents(updated);
    if (typeof window !== "undefined") {
      try { localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updated)); } catch {}
    }
    if (db) {
      try { await setDoc(doc(db, "events", e.id), e); } catch {}
    }
  };

  const updateEvent = async (id: string, updatedEvent: Partial<CampusEvent>) => {
    const updated = events.map(e => e.id === id ? { ...e, ...updatedEvent } : e);
    setEvents(updated);
    if (typeof window !== "undefined") {
      try { localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updated)); } catch {}
    }
    if (db) {
      try { await updateDoc(doc(db, "events", id), updatedEvent as Record<string, unknown>); } catch {}
    }
  };

  const addCustomActivity = (eventId: string, activity: ActivityOption) => {
    setEvents(prev => {
      const updated = prev.map(e => {
        if (e.id === eventId) {
          const acts = [...(e.activities || []), activity];
          if (db) {
            updateDoc(doc(db, "events", eventId), { activities: acts }).catch(() => {});
          }
          return { ...e, activities: acts };
        }
        return e;
      });
      if (typeof window !== "undefined") {
        try { localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updated)); } catch {}
      }
      return updated;
    });
  };

  // Synchronize student name across registrations and certificates if studentProfile is updated
  useEffect(() => {
    if (!user?.uid || !studentProfile?.name) return;
    const currentName = studentProfile.name.trim();
    const currentReg = studentProfile.registerNumber?.trim();
    const currentClass = studentProfile.className?.trim();

    setRegistrations(prev => {
      let changed = false;
      const updated = prev.map(r => {
        if (r.studentId === user.uid || (r as any).studentUid === user.uid) {
          if (
            r.studentName !== currentName ||
            (currentReg && r.registerNumber !== currentReg) ||
            (currentClass && r.className !== currentClass)
          ) {
            changed = true;
            return {
              ...r,
              studentName: currentName,
              ...(currentReg ? { registerNumber: currentReg } : {}),
              ...(currentClass ? { className: currentClass } : {}),
            };
          }
        }
        return r;
      });
      if (changed) {
        if (typeof window !== "undefined") {
          try { localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(updated)); } catch {}
        }
        return updated;
      }
      return prev;
    });

    setCertificates(prev => {
      let changed = false;
      const updated = prev.map(c => {
        if (c.studentId === user.uid && c.studentName !== currentName) {
          changed = true;
          return { ...c, studentName: currentName };
        }
        return c;
      });
      if (changed) {
        if (typeof window !== "undefined") {
          try { localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(updated)); } catch {}
        }
        return updated;
      }
      return prev;
    });
  }, [user?.uid, studentProfile?.name, studentProfile?.registerNumber, studentProfile?.className]);

  // Robust matching for student's registrations
  const myRegistrations = registrations.filter(r => {
    if (!user) return false;
    return r.studentId === user.uid || (r as any).studentUid === user.uid;
  });

  const registerForEvent = async (
    eventId: string,
    groupId?: string,
    groupName?: string,
    activityName?: string,
    participationType?: "Single" | "Group"
  ) => {
    if (!user) return { success: false, message: "Please sign in to register for this event." };

    const activeProfile = studentProfile || {
      uid: user.uid,
      name: user.displayName || user.email?.split("@")[0] || "Alex Johnson",
      registerNumber: "20CS042",
      className: "CSE-A, 3rd Year",
      role: "student" as const,
    };

    const event = events.find(e => e.id === eventId);
    if (!event) return { success: false, message: "Event not found" };

    if (myRegistrations.some(r => r.eventId === eventId)) {
      return { success: false, message: "You are already registered for this event." };
    }
    if (event.maxSeats && event.registeredCount && event.registeredCount >= event.maxSeats) {
      return { success: false, message: "Event is full." };
    }

    const isSingle = participationType === "Single" || (!participationType && event.type === "Individual");
    if (isSingle) {
      const individualCount = myRegistrations.filter(r => {
        const ev = events.find(e => e.id === r.eventId);
        return r.participationType === "Single" || ev?.type === "Individual";
      }).length;

      if (individualCount >= 3) {
        return { success: false, message: "You can only participate in up to 3 individual events." };
      }
    }

    let finalGroupId = groupId;
    let finalGroupName = groupName;

    if (!isSingle) {
      if (groupName && !groupId) {
        const newGId = `g${Date.now()}`;
        const newG: Group = {
          id: newGId,
          eventId,
          name: groupName,
          members: [user.uid]
        };
        finalGroupId = newGId;
        finalGroupName = groupName;
        setGroups(prev => {
          const next = [...prev, newG];
          if (typeof window !== "undefined") {
            try { localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(next)); } catch {}
          }
          return next;
        });
        if (db) {
          try { await setDoc(doc(db, "groups", newGId), newG); } catch {}
        }
      } else if (groupId) {
        const existingGroup = groups.find(g => g.id === groupId);
        if (existingGroup) {
          finalGroupName = existingGroup.name;
          setGroups(prev => {
            const next = prev.map(g => g.id === groupId ? { ...g, members: [...g.members, user.uid] } : g);
            if (typeof window !== "undefined") {
              try { localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(next)); } catch {}
            }
            return next;
          });
          if (db) {
            try { await updateDoc(doc(db, "groups", groupId), { members: [...existingGroup.members, user.uid] }); } catch {}
          }
        }
      }
    }

    const newRegId = `r${Date.now()}`;
    const ticketId = `TKT-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    const newReg: Registration = {
      id: newRegId,
      eventId,
      studentId: user.uid,
      studentName: activeProfile.name,
      registerNumber: activeProfile.registerNumber,
      className: activeProfile.className,
      groupId: finalGroupId,
      groupName: finalGroupName,
      activityName,
      participationType: isSingle ? "Single" : "Group",
      status: "confirmed",
      registeredAt: new Date().toISOString(),
      ticketId,
    };

    // Update registrations state & localStorage
    setRegistrations(prev => {
      const next = [...prev, newReg];
      if (typeof window !== "undefined") {
        try { localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(next)); } catch {}
      }
      return next;
    });

    // Update event seat count in state, localStorage, and Firestore
    const newCount = (event.registeredCount || 0) + 1;
    setEvents(prev => {
      const next = prev.map(e => e.id === eventId ? { ...e, registeredCount: newCount } : e);
      if (typeof window !== "undefined") {
        try { localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(next)); } catch {}
      }
      return next;
    });

    if (db) {
      try {
        await updateDoc(doc(db, "events", eventId), { registeredCount: newCount });
      } catch {}
    }

    // Create notification
    const notif: Notification = {
      id: `n${Date.now()}`,
      userId: user.uid,
      title: "Registration Confirmed!",
      message: `You're registered for ${event.title}${activityName ? ` (${activityName})` : ""}${finalGroupName ? ` with team "${finalGroupName}"` : ""}! Ticket: ${ticketId}`,
      type: "registration",
      read: false,
      createdAt: new Date().toISOString(),
      eventId,
    };

    setNotifications(prev => {
      const next = [notif, ...prev];
      if (typeof window !== "undefined") {
        try { localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(next)); } catch {}
      }
      return next;
    });

    // Persist registration to Cloud Firestore
    if (db) {
      try {
        await setDoc(doc(db, "registrations", newRegId), {
          ...newReg,
          studentUid: user.uid,
        });
      } catch (err) {
        console.warn("Could not write registration to Firestore:", err);
      }
    }

    return {
      success: true,
      message: `Successfully registered for ${event.title}${activityName ? ` (${activityName})` : ""} as ${isSingle ? "Individual" : `Team "${finalGroupName || "Group"}"`}!`
    };
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: true } : n);
      if (typeof window !== "undefined") {
        try { localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(next)); } catch {}
      }
      return next;
    });
  };

  const markAllRead = () => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }));
      if (typeof window !== "undefined") {
        try { localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(next)); } catch {}
      }
      return next;
    });
  };

  const unreadCount = notifications.filter(n => n.read === false).length;

  return (
    <AppContext.Provider value={{
      events, registrations, groups, notifications, certificates, favorites,
      addEvent, updateEvent, registerForEvent, addCustomActivity,
      markNotificationRead, markAllRead, toggleFavorite,
      myRegistrations, unreadCount,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
