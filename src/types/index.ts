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
  | "Festivals";

export type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled" | "draft";
export type EventType = "Individual" | "Group";
export type Role = "student" | "organizer" | "faculty" | "admin" | "teacher";

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
  organizer?: string;
  organizerId?: string;
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
  interests?: Category[];
}

export interface TeacherProfile {
  uid: string;
  name: string;
  role: "teacher";
  department?: string;
}

export interface OrganizerProfile {
  uid: string;
  name: string;
  role: "organizer";
  club?: string;
  department?: string;
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
  type: "registration" | "reminder" | "cancellation" | "certificate" | "announcement" | "update";
  read: boolean;
  createdAt: string;
  eventId?: string;
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
