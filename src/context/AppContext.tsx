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
  const [events, setEvents] = useState<CampusEvent[]>(initialEvents);
  const [registrations, setRegistrations] = useState<Registration[]>(initialRegistrations);
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [certificates, setCertificates] = useState<Certificate[]>(mockCertificates);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (!db) return;
    const unsubEvents = onSnapshot(
      collection(db, "events"),
      (snapshot) => {
        if (snapshot.docs.length > 0) {
          setEvents(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as CampusEvent)));
        }
      },
      (err) => {
        // Fallback to local mock data gracefully
      }
    );
    const unsubRegs = onSnapshot(
      collection(db, "registrations"),
      (snapshot) => {
        setRegistrations(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Registration)));
      },
      (err) => {
        // Fallback to local mock data gracefully
      }
    );
    const unsubGroups = onSnapshot(
      collection(db, "groups"),
      (snapshot) => {
        setGroups(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Group)));
      },
      (err) => {
        // Fallback to local mock data gracefully
      }
    );
    return () => {
      unsubEvents();
      unsubRegs();
      unsubGroups();
    };
  }, []);

  const addEvent = async (e: CampusEvent) => {
    if (!db) { setEvents(prev => [...prev, e]); return; }
    try { await setDoc(doc(db, "events", e.id), e); } catch {}
  };

  const updateEvent = async (id: string, updatedEvent: Partial<CampusEvent>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updatedEvent } : e));
    if (!db) return;
    try { await updateDoc(doc(db, "events", id), updatedEvent as Record<string, unknown>); } catch {}
  };

  const myRegistrations = registrations.filter(r => r.studentId === user?.uid);

  const addCustomActivity = (eventId: string, activity: ActivityOption) => {
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        return {
          ...e,
          activities: [...(e.activities || []), activity],
        };
      }
      return e;
    }));
  };

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
        setGroups(prev => [...prev, newG]);
        if (db) {
          try { await setDoc(doc(db, "groups", newGId), newG); } catch {}
        }
      } else if (groupId) {
        const existingGroup = groups.find(g => g.id === groupId);
        if (existingGroup) {
          finalGroupName = existingGroup.name;
          setGroups(prev => prev.map(g => g.id === groupId ? { ...g, members: [...g.members, user.uid] } : g));
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

    setRegistrations(prev => [...prev, newReg]);
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, registeredCount: (e.registeredCount || 0) + 1 } : e));
    
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
    setNotifications(prev => [notif, ...prev]);

    if (db) {
      try {
        await setDoc(doc(db, "registrations", newRegId), newReg);
      } catch {}
    }

    return {
      success: true,
      message: `Successfully registered for ${event.title}${activityName ? ` (${activityName})` : ""} as ${isSingle ? "Individual" : `Team "${finalGroupName || "Group"}"`}!`
    };
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleFavorite = (eventId: string) => {
    setFavorites(prev =>
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
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



