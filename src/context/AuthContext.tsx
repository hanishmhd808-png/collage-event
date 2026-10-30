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
  loginWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
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
      if (currentUser && db) {
        setUser(currentUser);
        // Try to fetch profile from DB or initialize
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const currentRole = (data.role as Role) || "student";
            setRole(currentRole);
            if (currentRole === "student") {
              setStudentProfile(data as StudentProfile);
            } else if (currentRole === "teacher" || currentRole === "faculty") {
              setTeacherProfile(data as TeacherProfile);
            }
            await recordLoginInDb(
              currentUser.uid,
              currentUser.email || "",
              data.name || currentUser.displayName || "",
              currentRole,
              "auth_session_restore"
            );
          } else {
            // New user without DB profile yet: auto-create in Firestore
            const defaultName = currentUser.displayName || currentUser.email?.split("@")[0] || "Student";
            const defaultReg = "20CS" + Math.floor(100 + Math.random() * 900);
            const defaultClass = "CSE-A, 3rd Year";
            setRole("student");
            const newStudentProf: StudentProfile = {
              uid: currentUser.uid,
              name: defaultName,
              registerNumber: defaultReg,
              className: defaultClass,
              role: "student",
            };
            setStudentProfile(newStudentProf);
            await recordLoginInDb(
              currentUser.uid,
              currentUser.email || "",
              defaultName,
              "student",
              "new_user_init",
              newStudentProf
            );
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
    const studentData: StudentProfile = {
      uid: "mock-student-123",
      name: "Alex Johnson",
      registerNumber: "20CS042",
      className: "CSE-A, 3rd Year",
      role: "student",
    };
    setUser({ uid: "mock-student-123", email: "alex.johnson@campus.edu", displayName: "Alex Johnson" } as User);
    setRole("student");
    setStudentProfile(studentData);
    recordLoginInDb("mock-student-123", "alex.johnson@campus.edu", "Alex Johnson", "student", "mock_student", studentData);
  };

  const loginAsMockTeacher = () => {
    const teacherData: TeacherProfile = {
      uid: "mock-teacher-456",
      name: "Prof. Sharma",
      role: "teacher",
    };
    setUser({ uid: "mock-teacher-456", email: "prof.sharma@campus.edu", displayName: "Prof. Sharma" } as User);
    setRole("teacher");
    setTeacherProfile(teacherData);
    recordLoginInDb("mock-teacher-456", "prof.sharma@campus.edu", "Prof. Sharma", "teacher", "mock_teacher", teacherData);
  };

  const loginAsMockOrganizer = () => {
    setUser({ uid: "mock-organizer-789", email: "tech.club@campus.edu", displayName: "Tech Club Organizer" } as User);
    setRole("organizer");
    recordLoginInDb("mock-organizer-789", "tech.club@campus.edu", "Tech Club Organizer", "organizer", "mock_organizer");
  };

  const loginAsMockAdmin = () => {
    setUser({ uid: "mock-admin-999", email: "admin@campus.edu", displayName: "Campus Admin" } as User);
    setRole("admin");
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
          setUser({ uid: mockUid, email: "student@campus.edu", displayName: "Campus Student" } as User);
          setRole("student");
          setStudentProfile(studentData);
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
      setUser({ uid: mockUid, email: "student@gmail.com", displayName: "Student" } as User);
      setRole("student");
      setStudentProfile(studentData);
      await recordLoginInDb(mockUid, "student@gmail.com", "Student", "student", "google_mock", studentData);
    }
  };

  const loginWithEmail = async (email: string, pass: string, name?: string) => {
    const displayName = name || email.split("@")[0] || "Student";
    if (auth && process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, email, pass);
        if (userCred.user) {
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
              setStudentProfile(studentData);
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
              setUser({ uid: mockUid, email, displayName } as User);
              setRole("student");
              setStudentProfile(studentData);
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
          setUser({ uid: mockUid, email, displayName } as User);
          setRole("student");
          setStudentProfile(studentData);
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
      setUser({ uid: mockUid, email, displayName } as User);
      setRole("student");
      setStudentProfile(studentData);
      await recordLoginInDb(mockUid, email, displayName, "student", "email_mock", studentData);
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
