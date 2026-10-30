"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "firebase/auth";
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
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
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  updateStudentProfile: (profile: Omit<StudentProfile, "uid" | "role">) => Promise<void>;
  updateTeacherProfile: (name: string) => Promise<void>;
  logout: () => void;
}

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
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to Auth State
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && db) {
        setUser(currentUser);
        // Try to fetch profile from DB
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setRole(data.role as Role);
            if (data.role === "student") {
              setStudentProfile(data as StudentProfile);
            } else if (data.role === "teacher") {
              setTeacherProfile(data as TeacherProfile);
            }
          } else {
            // Default to student if no profile exists
            setRole("student");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setRole("student");
        }
      } else {
        setUser(null);
        setRole(null);
        setStudentProfile(null);
        setTeacherProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginAsMockStudent = () => {
    setUser({ uid: "mock-student-123", email: "alex.johnson@campus.edu", displayName: "Alex Johnson" } as User);
    setRole("student");
    setStudentProfile({
      uid: "mock-student-123",
      name: "Alex Johnson",
      registerNumber: "20CS042",
      className: "CSE-A, 3rd Year",
      role: "student",
    });
  };

  const loginAsMockTeacher = () => {
    setUser({ uid: "mock-teacher-456", email: "prof.sharma@campus.edu", displayName: "Prof. Sharma" } as User);
    setRole("teacher");
    setTeacherProfile({
      uid: "mock-teacher-456",
      name: "Prof. Sharma",
      role: "teacher",
    });
  };

  const loginAsMockOrganizer = () => {
    setUser({ uid: "mock-organizer-789", email: "tech.club@campus.edu", displayName: "Tech Club Organizer" } as User);
    setRole("organizer");
  };

  const loginAsMockAdmin = () => {
    setUser({ uid: "mock-admin-999", email: "admin@campus.edu", displayName: "Campus Admin" } as User);
    setRole("admin");
  };

  const loginWithGoogle = async () => {
    if (auth && process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
      } catch (error: any) {
        console.error("Google Sign-in Error:", error);
        if (
          error.code === 'auth/configuration-not-found' ||
          error.code === 'auth/operation-not-allowed' ||
          error.code === 'auth/unauthorized-domain' ||
          error.code === 'auth/internal-error'
        ) {
          console.warn("Firebase Google provider not active in console. Activating local student session.");
          setUser({ uid: "google-mock-" + Date.now(), email: "student@campus.edu", displayName: "Campus Student" } as User);
          setRole("student");
          setStudentProfile({
            uid: "google-mock-" + Date.now(),
            name: "Campus Student",
            registerNumber: "20CS042",
            className: "CSE-A, 3rd Year",
            role: "student",
          });
          return;
        }
        alert("Google Sign-in: " + (error.message || "Please check your Firebase configuration."));
      }
    } else {
      setUser({ uid: "google-mock-" + Date.now(), email: "student@gmail.com", displayName: "Student" } as User);
      setRole("student");
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    if (auth && process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      try {
        await signInWithEmailAndPassword(auth, email, pass);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          try {
            await createUserWithEmailAndPassword(auth, email, pass);
          } catch (createErr: any) {
            console.error("Email signup error:", createErr);
            if (
              createErr.code === 'auth/operation-not-allowed' ||
              createErr.code === 'auth/configuration-not-found' ||
              createErr.code === 'auth/internal-error'
            ) {
              console.warn("Firebase Email provider not enabled in console. Falling back to local session.");
              const mockUid = "email-" + Date.now();
              const displayName = email.split("@")[0] || "Student";
              setUser({ uid: mockUid, email, displayName } as User);
              setRole("student");
              setStudentProfile({
                uid: mockUid,
                name: displayName,
                registerNumber: "20CS" + Math.floor(100 + Math.random() * 900),
                className: "CSE-A, 3rd Year",
                role: "student",
              });
              return;
            }
            throw createErr;
          }
        } else if (
          error.code === 'auth/operation-not-allowed' ||
          error.code === 'auth/configuration-not-found' ||
          error.code === 'auth/internal-error'
        ) {
          console.warn("Firebase Email provider not configured. Falling back to local session.");
          const mockUid = "email-" + Date.now();
          const displayName = email.split("@")[0] || "Student";
          setUser({ uid: mockUid, email, displayName } as User);
          setRole("student");
          setStudentProfile({
            uid: mockUid,
            name: displayName,
            registerNumber: "20CS" + Math.floor(100 + Math.random() * 900),
            className: "CSE-A, 3rd Year",
            role: "student",
          });
        } else {
          console.error("Email auth error:", error);
          throw error;
        }
      }
    } else {
      setUser({ uid: "email-mock-" + Date.now(), email, displayName: email.split("@")[0] } as User);
      setRole("student");
    }
  };

  const updateStudentProfile = async (data: Omit<StudentProfile, "uid" | "role">) => {
    if (user) {
      const newProfile: StudentProfile = { ...data, uid: user.uid, role: "student" };
      setStudentProfile(newProfile);
      setRole("student");
      if (db) {
        try {
          await setDoc(doc(db, "users", user.uid), newProfile);
        } catch (error) {
          console.error("Failed to save student profile to DB:", error);
        }
      }
    }
  };

  const updateTeacherProfile = async (name: string) => {
    if (user) {
      const newProfile: TeacherProfile = { uid: user.uid, name, role: "teacher" };
      setTeacherProfile(newProfile);
      setRole("teacher");
      if (db) {
        try {
          await setDoc(doc(db, "users", user.uid), newProfile);
        } catch (error) {
          console.error("Failed to save teacher profile to DB:", error);
        }
      }
    }
  };

  const logout = () => {
    if (auth && process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      auth.signOut();
    } else {
      setUser(null);
      setRole(null);
      setStudentProfile(null);
      setTeacherProfile(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, studentProfile, teacherProfile, loading, loginAsMockStudent, loginAsMockTeacher, loginAsMockOrganizer, loginAsMockAdmin, loginWithGoogle, loginWithEmail, updateStudentProfile, updateTeacherProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
