"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "firebase/auth";
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, updateProfile } from "firebase/auth";
import { auth, db } from "../lib/firebase"; 
import { doc, getDoc, setDoc } from "firebase/firestore";
import { StudentProfile, TeacherProfile } from "@/types";

export type Role = "student" | "teacher" | "organizer" | "faculty" | "admin" | null;

interface AuthContextType {
  user: User | null;
  role: Role;
  studentProfile: StudentProfile | null;
  teacherProfile: TeacherProfile | null;
  loading: boolean;
  loginAsMockStudent: () => void;
  loginAsMockTeacher: () => void;
  loginAsMockOrganizer: () => void;
  loginAsMockAdmin: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  updateStudentProfile: (profile: Partial<Omit<StudentProfile, "uid" | "role">> & { name: string }) => Promise<void>;
  updateTeacherProfile: (name: string) => Promise<void>;
  logout: () => void;
}

const SESSION_STORAGE_KEY = "eventora_auth_session";

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  studentProfile: null,
  teacherProfile: null,
  loading: true,
  loginAsMockStudent: () => {},
  loginAsMockTeacher: () => {},
  loginAsMockOrganizer: () => {},
  loginAsMockAdmin: () => {},
  loginWithGoogle: async () => {},
  loginWithEmail: async () => {},
  updateStudentProfile: async () => {},
  updateTeacherProfile: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Synchronous initialization from localStorage to prevent logout/flicker on page refresh
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(SESSION_STORAGE_KEY);
        if (saved) return JSON.parse(saved).user;
      } catch {}
    }
    return null;
  });

  const [role, setRole] = useState<Role>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(SESSION_STORAGE_KEY);
        if (saved) return JSON.parse(saved).role;
      } catch {}
    }
    return null;
  });

  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(SESSION_STORAGE_KEY);
        if (saved) return JSON.parse(saved).studentProfile;
      } catch {}
    }
    return null;
  });

  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(SESSION_STORAGE_KEY);
        if (saved) return JSON.parse(saved).teacherProfile;
      } catch {}
    }
    return null;
  });

  const [loading, setLoading] = useState(true);

  // Helper to persist auth session to localStorage and state
  const saveSession = (
    u: any,
    r: Role,
    sp: StudentProfile | null = null,
    tp: TeacherProfile | null = null
  ) => {
    const effectiveDisplayName = sp?.name || tp?.name || u?.displayName || "";
    const effectiveUser = u ? { ...u, displayName: effectiveDisplayName } : null;

    setUser(effectiveUser);
    setRole(r);
    setStudentProfile(sp);
    setTeacherProfile(tp);

    if (typeof window !== "undefined") {
      try {
        if (effectiveUser) {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
            user: {
              uid: effectiveUser.uid,
              email: effectiveUser.email || "",
              displayName: effectiveDisplayName,
            },
            role: r,
            studentProfile: sp,
            teacherProfile: tp,
            savedAt: Date.now(),
          }));
        } else {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      } catch (err) {
        console.warn("Could not write session to localStorage:", err);
      }
    }
  };

  // Store user profile and record login event in Firestore database
  const recordLoginInDb = async (
    uid: string,
    email: string,
    name: string,
    targetRole: Role,
    loginMethod: string,
    additionalData?: Partial<StudentProfile | TeacherProfile>
  ) => {
    if (!db) return;
    try {
      const userRef = doc(db, "users", uid);
      const existing = await getDoc(userRef);
      const now = new Date().toISOString();

      const profilePayload: any = {
        uid,
        email: email || "",
        name: name || email.split("@")[0] || "Campus User",
        role: targetRole || "student",
        lastLoginAt: now,
        updatedAt: now,
        status: "active",
        ...additionalData,
      };

      if (!existing.exists()) {
        profilePayload.createdAt = now;
        if ((targetRole === "student" || !targetRole) && !profilePayload.registerNumber) {
          profilePayload.registerNumber = "20CS" + Math.floor(100 + Math.random() * 900);
          profilePayload.className = "CSE-A, 3rd Year";
        }
      }

      await setDoc(userRef, profilePayload, { merge: true });

      // Record in logins audit collection
      const loginId = "login-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
      await setDoc(doc(db, "logins", loginId), {
        id: loginId,
        uid,
        email: email || "",
        name: profilePayload.name,
        role: targetRole || "student",
        loginMethod,
        timestamp: now,
        status: "success",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Web Client",
      });
      console.log(`✓ Stored login data in Firestore for ${email || uid} (${loginMethod})`);
    } catch (err) {
      console.warn("Failed to store login data in Firestore:", err);
    }
  };

  // Listen to Auth State
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        let currentRole: Role = "student";
        let activeStudentProf: StudentProfile | null = studentProfile;
        let activeTeacherProf: TeacherProfile | null = teacherProfile;

        if (db) {
          try {
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              currentRole = (data.role as Role) || "student";
              if (currentRole === "student") {
                activeStudentProf = data as StudentProfile;
              } else if (currentRole === "teacher" || currentRole === "faculty") {
                activeTeacherProf = data as TeacherProfile;
              }
            } else {
              // New user without DB profile yet: auto-create in Firestore
              const defaultName = currentUser.displayName || currentUser.email?.split("@")[0] || "Student";
              const defaultReg = "20CS" + Math.floor(100 + Math.random() * 900);
              const defaultClass = "CSE-A, 3rd Year";
              activeStudentProf = {
                uid: currentUser.uid,
                name: defaultName,
                registerNumber: defaultReg,
                className: defaultClass,
                role: "student",
              };
              await recordLoginInDb(
                currentUser.uid,
                currentUser.email || "",
                defaultName,
                "student",
                "new_user_init",
                activeStudentProf
              );
            }
          } catch (error) {
            console.error("Error fetching user profile:", error);
          }
        }

        saveSession(currentUser, currentRole, activeStudentProf, activeTeacherProf);
      } else {
        // If Firebase Auth currentUser is null, check if a local session was saved in localStorage
        if (typeof window !== "undefined") {
          try {
            const saved = localStorage.getItem(SESSION_STORAGE_KEY);
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed && parsed.user) {
                // Preserve local/mock session across refresh
                setUser(parsed.user as User);
                setRole(parsed.role || "student");
                if (parsed.studentProfile) setStudentProfile(parsed.studentProfile);
                if (parsed.teacherProfile) setTeacherProfile(parsed.teacherProfile);
                setLoading(false);
                return;
              }
            }
          } catch {}
        }
        // No local session found either
        saveSession(null, null, null, null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginAsMockStudent = () => {
    const studentData: StudentProfile = {
      uid: "mock-student-123",
      name: "Alex Johnson",
      registerNumber: "20CS042",
      className: "CSE-A, 3rd Year",
      role: "student",
    };
    const mockUser = { uid: "mock-student-123", email: "alex.johnson@campus.edu", displayName: "Alex Johnson" } as User;
    saveSession(mockUser, "student", studentData, null);
    recordLoginInDb("mock-student-123", "alex.johnson@campus.edu", "Alex Johnson", "student", "mock_student", studentData);
  };

  const loginAsMockTeacher = () => {
    const teacherData: TeacherProfile = {
      uid: "mock-teacher-456",
      name: "Prof. Sharma",
      role: "teacher",
    };
    const mockUser = { uid: "mock-teacher-456", email: "prof.sharma@campus.edu", displayName: "Prof. Sharma" } as User;
    saveSession(mockUser, "teacher", null, teacherData);
    recordLoginInDb("mock-teacher-456", "prof.sharma@campus.edu", "Prof. Sharma", "teacher", "mock_teacher", teacherData);
  };

  const loginAsMockOrganizer = () => {
    const mockUser = { uid: "mock-organizer-789", email: "tech.club@campus.edu", displayName: "Tech Club Organizer" } as User;
    saveSession(mockUser, "organizer", null, null);
    recordLoginInDb("mock-organizer-789", "tech.club@campus.edu", "Tech Club Organizer", "organizer", "mock_organizer");
  };

  const loginAsMockAdmin = () => {
    const mockUser = { uid: "mock-admin-999", email: "admin@campus.edu", displayName: "Campus Admin" } as User;
    saveSession(mockUser, "admin", null, null);
    recordLoginInDb("mock-admin-999", "admin@campus.edu", "Campus Admin", "admin", "mock_admin");
  };

  const loginWithGoogle = async () => {
    if (auth && process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      const provider = new GoogleAuthProvider();
      try {
        const userCred = await signInWithPopup(auth, provider);
        if (userCred.user) {
          const u = userCred.user;
          const uName = u.displayName || u.email?.split("@")[0] || "Student";
          saveSession(u, "student", studentProfile, null);
          await recordLoginInDb(u.uid, u.email || "", uName, "student", "google_oauth");
        }
      } catch (error: any) {
        console.error("Google Sign-in Error:", error);
        if (
          error.code === 'auth/configuration-not-found' ||
          error.code === 'auth/operation-not-allowed' ||
          error.code === 'auth/unauthorized-domain' ||
          error.code === 'auth/internal-error'
        ) {
          console.warn("Firebase Google provider not active in console. Activating local student session with DB sync.");
          const mockUid = "google-mock-" + Date.now();
          const studentData: StudentProfile = {
            uid: mockUid,
            name: "Campus Student",
            registerNumber: "20CS042",
            className: "CSE-A, 3rd Year",
            role: "student",
          };
          const mockUser = { uid: mockUid, email: "student@campus.edu", displayName: "Campus Student" } as User;
          saveSession(mockUser, "student", studentData, null);
          await recordLoginInDb(mockUid, "student@campus.edu", "Campus Student", "student", "google_fallback", studentData);
          return;
        }
        alert("Google Sign-in: " + (error.message || "Please check your Firebase configuration."));
      }
    } else {
      const mockUid = "google-mock-" + Date.now();
      const studentData: StudentProfile = {
        uid: mockUid,
        name: "Student",
        registerNumber: "20CS042",
        className: "CSE-A, 3rd Year",
        role: "student",
      };
      const mockUser = { uid: mockUid, email: "student@gmail.com", displayName: "Student" } as User;
      saveSession(mockUser, "student", studentData, null);
      await recordLoginInDb(mockUid, "student@gmail.com", "Student", "student", "google_mock", studentData);
    }
  };

  const loginWithEmail = async (email: string, pass: string, name?: string) => {
    const displayName = name || email.split("@")[0] || "Student";
    if (auth && process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, email, pass);
        if (userCred.user) {
          saveSession(userCred.user, "student", studentProfile, null);
          await recordLoginInDb(userCred.user.uid, email, displayName, "student", "email_signin");
        }
      } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          try {
            const userCred = await createUserWithEmailAndPassword(auth, email, pass);
            if (userCred.user) {
              const studentData: StudentProfile = {
                uid: userCred.user.uid,
                name: displayName,
                registerNumber: "20CS" + Math.floor(100 + Math.random() * 900),
                className: "CSE-A, 3rd Year",
                role: "student",
              };
              saveSession(userCred.user, "student", studentData, null);
              await recordLoginInDb(userCred.user.uid, email, displayName, "student", "email_signup", studentData);
            }
          } catch (createErr: any) {
            console.error("Email signup error:", createErr);
            if (
              createErr.code === 'auth/operation-not-allowed' ||
              createErr.code === 'auth/configuration-not-found' ||
              createErr.code === 'auth/internal-error'
            ) {
              console.warn("Firebase Email provider not enabled in console. Falling back to local session with DB sync.");
              const mockUid = "email-" + Date.now();
              const studentData: StudentProfile = {
                uid: mockUid,
                name: displayName,
                registerNumber: "20CS" + Math.floor(100 + Math.random() * 900),
                className: "CSE-A, 3rd Year",
                role: "student",
              };
              const mockUser = { uid: mockUid, email, displayName } as User;
              saveSession(mockUser, "student", studentData, null);
              await recordLoginInDb(mockUid, email, displayName, "student", "email_signup_fallback", studentData);
              return;
            }
            throw createErr;
          }
        } else if (
          error.code === 'auth/operation-not-allowed' ||
          error.code === 'auth/configuration-not-found' ||
          error.code === 'auth/internal-error'
        ) {
          console.warn("Firebase Email provider not configured. Falling back to local session with DB sync.");
          const mockUid = "email-" + Date.now();
          const studentData: StudentProfile = {
            uid: mockUid,
            name: displayName,
            registerNumber: "20CS" + Math.floor(100 + Math.random() * 900),
            className: "CSE-A, 3rd Year",
            role: "student",
          };
          const mockUser = { uid: mockUid, email, displayName } as User;
          saveSession(mockUser, "student", studentData, null);
          await recordLoginInDb(mockUid, email, displayName, "student", "email_signin_fallback", studentData);
        } else {
          console.error("Email auth error:", error);
          throw error;
        }
      }
    } else {
      const mockUid = "email-mock-" + Date.now();
      const studentData: StudentProfile = {
        uid: mockUid,
        name: displayName,
        registerNumber: "20CS" + Math.floor(100 + Math.random() * 900),
        className: "CSE-A, 3rd Year",
        role: "student",
      };
      const mockUser = { uid: mockUid, email, displayName } as User;
      saveSession(mockUser, "student", studentData, null);
      await recordLoginInDb(mockUid, email, displayName, "student", "email_mock", studentData);
    }
  };

  const updateStudentProfile = async (data: Partial<Omit<StudentProfile, "uid" | "role">> & { name: string }) => {
    try {
      const activeUid = user?.uid || studentProfile?.uid || "mock-student-123";
      const existingProfile = studentProfile || {
        uid: activeUid,
        name: user?.displayName || "Alex Johnson",
        registerNumber: "20CS101",
        className: "CSE-A, 3rd Year",
        role: "student" as const,
      };

      const finalName = data.name ? data.name.trim() : existingProfile.name;
      const finalReg = data.registerNumber?.trim() ? data.registerNumber.trim() : existingProfile.registerNumber;
      const finalClass = data.className?.trim() ? data.className.trim() : existingProfile.className;

      const newProfile: StudentProfile = {
        ...existingProfile,
        uid: activeUid,
        role: "student",
        name: finalName,
        registerNumber: finalReg,
        className: finalClass,
      };

      const updatedUser = user
        ? ({ ...user, displayName: finalName } as User)
        : ({ uid: activeUid, displayName: finalName, email: "student@campus.edu" } as unknown as User);

      // 1. Immediately persist to state & localStorage
      saveSession(updatedUser, "student", newProfile, teacherProfile);

      // 2. Update Firebase Auth displayName if currentUser exists
      if (auth?.currentUser) {
        try {
          await updateProfile(auth.currentUser, { displayName: finalName });
        } catch (authErr) {
          console.warn("Could not update Firebase Auth profile:", authErr);
        }
      }

      // 3. Persist to Firestore database
      if (db) {
        try {
          await setDoc(doc(db, "users", activeUid), {
            ...newProfile,
            displayName: finalName,
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        } catch (error) {
          console.error("Failed to save student profile to DB:", error);
        }
      }
    } catch (err) {
      console.error("Error in updateStudentProfile:", err);
      throw err;
    }
  };

  const updateTeacherProfile = async (name: string) => {
    if (user) {
      const newProfile: TeacherProfile = { uid: user.uid, name, role: "teacher" };
      saveSession(user, "teacher", studentProfile, newProfile);
      if (db) {
        try {
          await setDoc(doc(db, "users", user.uid), newProfile, { merge: true });
        } catch (error) {
          console.error("Failed to save teacher profile to DB:", error);
        }
      }
    }
  };

  const logout = () => {
    if (auth && process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      auth.signOut().catch(() => {});
    }
    saveSession(null, null, null, null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      role,
      studentProfile,
      teacherProfile,
      loading,
      loginAsMockStudent,
      loginAsMockTeacher,
      loginAsMockOrganizer,
      loginAsMockAdmin,
      loginWithGoogle,
      loginWithEmail,
      updateStudentProfile,
      updateTeacherProfile,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
