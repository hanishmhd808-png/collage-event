export type Category =
  | "Technical"
  | "Cultural"
  | "Workshop"
  | "Seminar"
  | "Conference"
  | "Sports"
  | "Placement"
  | "Club"
  | "Arts"
  | "Festivals"
  | "Arts & Cultural"
  | "Technology"
  | "Technical Fest"
  | "Workshops"
  | "Seminars"
  | "Conferences"
  | "Competitions"
  | "College Festivals";

export type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled" | "draft";
export type EventType = "Individual" | "Group";
export type Role = "student" | "organizer" | "faculty" | "admin" | "teacher" | "college_admin";

export interface College {
  id: string;
  name: string;
  code: string;
  district: string;
  state: string;
  address: string;
  logo?: string;
  banner?: string;
  website?: string;
  email?: string;
  phone?: string;
  isVerified: boolean;
  establishedYear?: number;
  eventCount?: number;
  studentCount?: number;
  description?: string;
  featured?: boolean;
}

export interface Speaker {
  name: string;
  title: string;
  avatar?: string;
}

export interface AgendaItem {
  time: string;
  title: string;
  description?: string;
}

export interface ActivityOption {
  id: string;
  name: string;
  category: Category;
  type: "Single" | "Group";
  minTeam?: number;
  maxTeam?: number;
  description?: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  category: Category;
  type: EventType;
  status: EventStatus;
  date: string;
  endDate?: string;
  time?: string;
  venue?: string;
  location?: string;
  description: string;
  longDescription?: string;
  image?: string;
  coverImage?: string;
  organizer?: string;
  organizerId?: string;
  facultyOrganizer?: string;
  facultyDepartment?: string;
  facultyDesignation?: string;
  maxSeats?: number;
  registeredCount?: number;
  registrationDeadline?: string;
  eligibility?: string;
  tags?: string[];
  speakers?: Speaker[];
  agenda?: AgendaItem[];
  activities?: ActivityOption[];
  allowCustomActivity?: boolean;
  certificateAvailable?: boolean;
  isFeatured?: boolean;
  price?: number;
  college?: string;
  collegeId?: string;
  collegeCode?: string;
  collegeLogo?: string;
  isInterCollege?: boolean;
  district?: string;
}

// Legacy alias
export type ProgramEvent = CampusEvent;

export interface StudentProfile {
  uid: string;
  name: string;
  registerNumber: string;
  className: string;
  role: "student";
  email?: string;
  avatar?: string;
  department?: string;
  year?: string;
  course?: string;
  semester?: string;
  collegeId?: string;
  collegeName?: string;
  district?: string;
  studentIdCard?: string;
  interests?: Category[];
}

export interface TeacherProfile {
  uid: string;
  name: string;
  role: "teacher" | "faculty";
  department?: string;
  collegeId?: string;
  collegeName?: string;
}

export interface OrganizerProfile {
  uid: string;
  name: string;
  role: "organizer" | "college_admin";
  club?: string;
  department?: string;
  collegeId?: string;
  collegeName?: string;
}

export interface AdminProfile {
  uid: string;
  name: string;
  role: "admin";
}

export interface Registration {
  id: string;
  eventId: string;
  studentId: string;
  studentName: string;
  registerNumber?: string;
  className?: string;
  collegeId?: string;
  collegeName?: string;
  groupId?: string;
  groupName?: string;
  activityName?: string;
  participationType?: "Single" | "Group";
  status?: "pending" | "confirmed" | "attended" | "cancelled";
  registeredAt?: string;
  ticketId?: string;
  attended?: boolean;
}

export interface Group {
  id: string;
  eventId: string;
  name: string;
  members: string[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "registration" | "reminder" | "cancellation" | "certificate" | "announcement" | "update" | "inter_college" | "college_announcement";
  read: boolean;
  createdAt: string;
  eventId?: string;
  collegeId?: string;
  collegeName?: string;
  priority?: "normal" | "high";
  actionUrl?: string;
}

export interface Certificate {
  id: string;
  studentId: string;
  studentName: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  issuedAt: string;
  verificationCode: string;
  organizerName?: string;
  collegeName?: string;
}

export interface AITool {
  id: string;
  name: string;
  description: string;
  icon: string;
  inputLabel: string;
  inputPlaceholder: string;
  outputLabel: string;
}
