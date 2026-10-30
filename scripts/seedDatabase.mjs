// scripts/seedDatabase.mjs
// Seeds the Firebase Firestore database with initial events, activities, and campus data
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDocs, collection } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAOjgtIDX8K7EmjG1dYmaUt7GiYtjk7m78",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "collage-event-a47a9.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "collage-event-a47a9",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "collage-event-a47a9.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "603435622648",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:603435622648:web:517ef2ba7880f6374cdb0d",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-7CJ0DPBBEH",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const today = new Date();
const d = (offset) => {
  const dt = new Date(today);
  dt.setDate(dt.getDate() + offset);
  return dt.toISOString().split("T")[0];
};

const ARTS_ACTIVITIES = [
  { id: "art-s1", name: "Solo Classical Dance (Bharatanatyam / Kathak)", category: "Arts", type: "Single", description: "Individual classical solo performance (10 mins)" },
  { id: "art-s2", name: "Live Oil & Acrylic Canvas Painting", category: "Arts", type: "Single", description: "Individual live canvas painting competition" },
  { id: "art-s3", name: "Pencil Sketching & Charcoal Portrait", category: "Arts", type: "Single", description: "Individual monochrome portrait & nature sketching" },
  { id: "art-s4", name: "Digital Concept Art & Illustration", category: "Arts", type: "Single", description: "Solo digital concept art using graphic tablet or iPad" },
  { id: "art-s5", name: "Classical & Semi-Classical Vocal Solo", category: "Arts", type: "Single", description: "Carnatic / Hindustani vocal solo performance" },
  { id: "art-s6", name: "Creative Monologue / Solo Theatre", category: "Arts", type: "Single", description: "Individual dramatic performance & monologue acting" },
  { id: "art-g1", name: "Group Folk & Traditional Dance", category: "Arts", type: "Group", minTeam: 6, maxTeam: 12, description: "Synchronized group traditional or tribal folk dance" },
  { id: "art-g2", name: "Street Play (Nukkad Natak) / Mime Show", category: "Arts", type: "Group", minTeam: 5, maxTeam: 10, description: "Social awareness street drama or silent mime performance" },
  { id: "art-g3", name: "College Band / Acoustic Fusion", category: "Arts", type: "Group", minTeam: 3, maxTeam: 8, description: "Live multi-instrument band performance & cover battle" },
  { id: "art-g4", name: "Mural Wall Art & Creative Graffiti", category: "Arts", type: "Group", minTeam: 2, maxTeam: 4, description: "Large format creative wall mural collaboration" },
];

const SPORTS_ACTIVITIES = [
  { id: "sprt-s1", name: "100m Sprint Dash (Men & Women)", category: "Sports", type: "Single", description: "High-speed track sprint dash event" },
  { id: "sprt-s2", name: "200m Track Race", category: "Sports", type: "Single", description: "Individual track race" },
  { id: "sprt-s3", name: "Badminton Singles Tournament", category: "Sports", type: "Single", description: "Single elimination badminton championship" },
  { id: "sprt-s4", name: "Table Tennis Singles Knockout", category: "Sports", type: "Single", description: "Fast-paced individual table tennis matches" },
  { id: "sprt-s5", name: "Chess Blitz Championship", category: "Sports", type: "Single", description: "FIDE-rules timed rapid chess tournament" },
  { id: "sprt-s6", name: "Athletics: Long Jump & Shot Put", category: "Sports", type: "Single", description: "Field athletics jump and throw competition" },
  { id: "sprt-g1", name: "Football 7-a-side Championship", category: "Sports", type: "Group", minTeam: 7, maxTeam: 10, description: "Inter-department 7-a-side football tournament" },
  { id: "sprt-g2", name: "Cricket T10 Trophy", category: "Sports", type: "Group", minTeam: 11, maxTeam: 15, description: "10-over competitive cricket tournament" },
  { id: "sprt-g3", name: "Basketball 3x3 / 5v5 Tournament", category: "Sports", type: "Group", minTeam: 3, maxTeam: 5, description: "Full court competitive basketball tournament" },
  { id: "sprt-g4", name: "Volleyball Championship", category: "Sports", type: "Group", minTeam: 6, maxTeam: 9, description: "Standard 6-player rotation volleyball matches" },
  { id: "sprt-g5", name: "4x100m Relay Sprint", category: "Sports", type: "Group", minTeam: 4, maxTeam: 4, description: "4-member relay track race" },
  { id: "sprt-g6", name: "Badminton Doubles / Mixed Doubles", category: "Sports", type: "Group", minTeam: 2, maxTeam: 2, description: "Two-player partner doubles tournament" },
];

const EVENTS = [
  {
    id: "e1",
    title: "TechNova 2026",
    category: "Technical",
    type: "Individual",
    status: "upcoming",
    date: d(5),
    time: "09:00 AM",
    venue: "Main Auditorium",
    location: "Block A, Ground Floor",
    description: "The annual flagship technical festival featuring hackathons, coding challenges, and tech talks.",
    longDescription: "TechNova 2026 is the most anticipated technical festival of the year. Featuring a 24-hour hackathon, competitive programming rounds, paper presentations, and inspiring talks from industry leaders in AI, robotics, and cloud computing. This is your chance to showcase your technical prowess and win prizes worth ₹2 Lakhs.",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format",
    organizer: "Tech Club",
    organizerId: "org1",
    maxSeats: 500,
    registeredCount: 342,
    registrationDeadline: d(3),
    eligibility: "All students",
    tags: ["hackathon", "coding", "AI", "robotics"],
    certificateAvailable: true,
    isFeatured: true,
    college: "Engineering Department",
    speakers: [
      { name: "Dr. Arjun Sharma", title: "AI Researcher, IIT Bombay" },
      { name: "Priya Nair", title: "Engineering Lead, Google India" },
    ],
    agenda: [
      { time: "09:00 AM", title: "Opening Ceremony", description: "Welcome address and keynote" },
      { time: "10:00 AM", title: "Hackathon Kickoff", description: "24-hour hacking begins" },
      { time: "02:00 PM", title: "Tech Talks Session 1", description: "AI and the Future" },
      { time: "06:00 PM", title: "Paper Presentations", description: "Student research showcase" },
      { time: "10:00 AM+1", title: "Final Presentations", description: "Hackathon submissions" },
    ],
  },
  {
    id: "e2",
    title: "Rhythmica Cultural Fest",
    category: "Cultural",
    type: "Group",
    status: "upcoming",
    date: d(12),
    time: "10:00 AM",
    venue: "Open Air Theatre",
    location: "Campus Ground",
    description: "A vibrant celebration of art, music, dance, and culture from across India.",
    longDescription: "Rhythmica is our college's biggest cultural extravaganza, bringing together talents from across the state. Enjoy classical and contemporary dance performances, music competitions, drama, fashion shows, and art exhibitions. Prizes worth ₹5 Lakhs await the best performers.",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format",
    organizer: "Cultural Committee",
    maxSeats: 1000,
    registeredCount: 687,
    registrationDeadline: d(10),
    eligibility: "All students",
    tags: ["dance", "music", "drama", "art"],
    certificateAvailable: true,
    isFeatured: true,
    college: "Fine Arts Department",
  },
  {
    id: "e3",
    title: "AI & ML Workshop",
    category: "Workshop",
    type: "Individual",
    status: "upcoming",
    date: d(3),
    time: "11:00 AM",
    venue: "Computer Lab 3",
    location: "Block C, 2nd Floor",
    description: "Hands-on workshop on Machine Learning fundamentals with Python and TensorFlow.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format",
    organizer: "AI Research Club",
    maxSeats: 60,
    registeredCount: 58,
    registrationDeadline: d(1),
    eligibility: "2nd year and above",
    tags: ["AI", "Python", "ML", "TensorFlow"],
    certificateAvailable: true,
    isFeatured: false,
    speakers: [{ name: "Prof. Deepak Menon", title: "Assistant Prof., CS Department" }],
    agenda: [
      { time: "11:00 AM", title: "Introduction to ML", description: "Core concepts overview" },
      { time: "12:30 PM", title: "Hands-on Session", description: "Build your first model" },
      { time: "02:00 PM", title: "Project Showcase", description: "Present your work" },
    ],
  },
  {
    id: "e4",
    title: "National Level Seminar on Cybersecurity",
    category: "Seminar",
    type: "Individual",
    status: "upcoming",
    date: d(8),
    time: "09:30 AM",
    venue: "Seminar Hall",
    location: "Admin Block, 1st Floor",
    description: "Expert talks on ethical hacking, data privacy, and modern cybersecurity threats.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format",
    organizer: "InfoSec Club",
    maxSeats: 200,
    registeredCount: 145,
    registrationDeadline: d(6),
    eligibility: "All students and faculty",
    tags: ["cybersecurity", "hacking", "privacy"],
    certificateAvailable: true,
    isFeatured: true,
    college: "IT Department",
  },
  {
    id: "e5",
    title: "Inter-College Football Tournament",
    category: "Sports",
    type: "Group",
    status: "upcoming",
    date: d(15),
    time: "08:00 AM",
    venue: "College Football Ground",
    location: "Sports Complex",
    description: "7-a-side football tournament with 16 teams competing for the championship trophy.",
    image: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&auto=format",
    organizer: "Sports Committee",
    maxSeats: 112,
    registeredCount: 98,
    registrationDeadline: d(12),
    eligibility: "Teams of 7-10 players",
    tags: ["football", "sports", "tournament"],
    certificateAvailable: true,
    isFeatured: false,
    activities: SPORTS_ACTIVITIES,
    allowCustomActivity: true,
  },
  {
    id: "e6",
    title: "Campus Placement Drive — Infosys",
    category: "Placement",
    type: "Individual",
    status: "upcoming",
    date: d(7),
    time: "08:30 AM",
    venue: "Placement Hall",
    location: "Admin Block",
    description: "Infosys campus recruitment for final year students. Aptitude test, technical and HR rounds.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format",
    organizer: "Placement Cell",
    maxSeats: 300,
    registeredCount: 267,
    registrationDeadline: d(5),
    eligibility: "Final year B.Tech / MCA",
    tags: ["placement", "Infosys", "recruitment"],
    certificateAvailable: false,
    isFeatured: true,
  },
  {
    id: "e7",
    title: "Photography Club Exhibition",
    category: "Club",
    type: "Individual",
    status: "upcoming",
    date: d(20),
    time: "04:00 PM",
    venue: "Art Gallery",
    location: "Block B, Ground Floor",
    description: "Annual photography exhibition showcasing student work on the theme 'Urban Reflections'.",
    image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&auto=format",
    organizer: "Photography Club",
    maxSeats: 150,
    registeredCount: 89,
    registrationDeadline: d(18),
    eligibility: "All students",
    tags: ["photography", "art", "exhibition"],
    certificateAvailable: false,
    isFeatured: false,
  },
  {
    id: "e8",
    title: "International Conference on Green Energy",
    category: "Conference",
    type: "Individual",
    status: "upcoming",
    date: d(25),
    time: "09:00 AM",
    venue: "Conference Centre",
    location: "Block D, 3rd Floor",
    description: "Global research symposium featuring papers on solar, wind, and sustainable power technologies.",
    image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&auto=format",
    organizer: "Electrical Engineering Dept",
    maxSeats: 250,
    registeredCount: 180,
    registrationDeadline: d(20),
    eligibility: "Researchers, PG & UG students",
    tags: ["energy", "green tech", "sustainability", "research"],
    certificateAvailable: true,
    isFeatured: false,
  },
  {
    id: "e16",
    title: "Kala Rang: Annual Campus Arts Carnival",
    category: "Arts",
    type: "Individual",
    status: "upcoming",
    date: d(11),
    time: "10:00 AM",
    venue: "Creative Arts Courtyard",
    location: "Block B & Open Grounds",
    description: "The grandest celebration of visual and performing arts on campus. Participate in single or group competitions with customized activity tracks.",
    longDescription: "Kala Rang brings together over 500 creative talents across music, classical & folk dance, painting, sketching, digital design, and street theatre. Students can choose to compete individually or represent their department in exciting group events.",
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format",
    organizer: "Fine Arts & Cultural Council",
    maxSeats: 350,
    registeredCount: 162,
    registrationDeadline: d(9),
    eligibility: "All college students (Individual or Group)",
    tags: ["arts", "painting", "dance", "theatre", "music"],
    certificateAvailable: true,
    isFeatured: true,
    activities: ARTS_ACTIVITIES,
    allowCustomActivity: true,
  },
  {
    id: "e17",
    title: "Campus Sports Olympiad 2026",
    category: "Sports",
    type: "Group",
    status: "upcoming",
    date: d(16),
    time: "07:30 AM",
    venue: "Main Stadium & Indoor Complex",
    location: "Campus Sports Arena",
    description: "Comprehensive multi-sport olympiad featuring track sprints, football, cricket, basketball, and racquet sports in both single and group formats.",
    longDescription: "The annual Campus Sports Olympiad is the ultimate athletic proving ground. Whether you are sprinting in the 100m solo dash or defending the trophy with your 7-a-side football team, this tournament has dedicated tracks for single and team entries.",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format",
    organizer: "Department of Physical Education",
    maxSeats: 450,
    registeredCount: 290,
    registrationDeadline: d(14),
    eligibility: "All undergraduate & postgraduate students",
    tags: ["sports", "olympiad", "athletics", "football", "cricket"],
    certificateAvailable: true,
    isFeatured: true,
    activities: SPORTS_ACTIVITIES,
    allowCustomActivity: true,
  },
];

const GROUPS = [
  { id: "g-arts-1", eventId: "e16", name: "Rhythm Troupe", members: ["mock-student-123", "student-2"] },
  { id: "g-arts-2", eventId: "e16", name: "Canvas Creators", members: ["student-3", "student-4"] },
  { id: "g-sports-1", eventId: "e17", name: "Titans FC", members: ["mock-student-123", "student-5"] },
  { id: "g-sports-2", eventId: "e17", name: "Red Strikers", members: ["student-6", "student-7"] },
  { id: "g-foot-1", eventId: "e5", name: "CS Strikers", members: ["student-8", "student-9"] },
];

const CERTIFICATES = [
  {
    id: "cert1",
    studentId: "mock-student-123",
    studentName: "Alex Johnson",
    eventId: "e13",
    eventTitle: "Debate Championship",
    eventDate: d(-5),
    issuedAt: d(-3),
    verificationCode: "EVNT-2026-CERT-A7K9",
    organizerName: "Debate Society",
  },
];

const USERS = [
  {
    uid: "mock-student-123",
    name: "Alex Johnson",
    email: "alex.johnson@campus.edu",
    registerNumber: "20CS042",
    className: "CSE-A, 3rd Year",
    role: "student",
  },
  {
    uid: "mock-teacher-456",
    name: "Prof. Sharma",
    email: "prof.sharma@campus.edu",
    role: "teacher",
  },
  {
    uid: "mock-organizer-789",
    name: "Tech Club Organizer",
    email: "tech.club@campus.edu",
    role: "organizer",
  },
  {
    uid: "mock-admin-999",
    name: "Campus Admin",
    email: "admin@campus.edu",
    role: "admin",
  },
];

async function seed() {
  console.log("🌱 Starting Firestore database seed for project:", firebaseConfig.projectId);

  // 1. Seed Events
  console.log(`Writing ${EVENTS.length} events...`);
  for (const ev of EVENTS) {
    await setDoc(doc(db, "events", ev.id), ev);
    console.log(`  ✓ Event: ${ev.title} (${ev.id})`);
  }

  // 2. Seed Activities
  console.log("Writing Arts & Sports Activities...");
  for (const act of [...ARTS_ACTIVITIES, ...SPORTS_ACTIVITIES]) {
    await setDoc(doc(db, "activities", act.id), act);
  }
  console.log(`  ✓ ${ARTS_ACTIVITIES.length + SPORTS_ACTIVITIES.length} activities seeded.`);

  // 3. Seed Groups
  console.log("Writing initial groups...");
  for (const grp of GROUPS) {
    await setDoc(doc(db, "groups", grp.id), grp);
  }
  console.log(`  ✓ ${GROUPS.length} groups seeded.`);

  // 4. Seed Certificates
  console.log("Writing certificates...");
  for (const cert of CERTIFICATES) {
    await setDoc(doc(db, "certificates", cert.id), cert);
  }
  console.log(`  ✓ ${CERTIFICATES.length} certificates seeded.`);

  // 5. Seed Users
  console.log("Writing sample user profiles...");
  for (const u of USERS) {
    await setDoc(doc(db, "users", u.uid), u);
  }
  console.log(`  ✓ ${USERS.length} user profiles seeded.`);

  console.log("\n✅ Firestore database successfully seeded!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
