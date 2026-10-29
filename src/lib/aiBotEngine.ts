import { CampusEvent, Registration, Group, StudentProfile } from "@/types";

export interface BotContext {
  events: CampusEvent[];
  myRegistrations: Registration[];
  groups: Group[];
  user: any;
  studentProfile: StudentProfile | null;
}

export interface BotAction {
  label: string;
  url?: string;
  actionKey?: string;
}

export interface BotResponse {
  text: string;
  actions?: BotAction[];
}

export function generateSmartReply(query: string, context: BotContext): BotResponse {
  const q = query.trim().toLowerCase();
  const { events, myRegistrations, studentProfile } = context;

  // 1. GREETINGS & CASUAL INTROS
  if (
    q === "hi" ||
    q === "hello" ||
    q === "hey" ||
    q.startsWith("hi ") ||
    q.startsWith("hello ") ||
    q === "greetings"
  ) {
    const studentName = studentProfile?.name ? `, ${studentProfile.name.split(" ")[0]}` : "";
    return {
      text: `Hello${studentName}! 👋 I'm your **EVENTORA AI Campus Concierge**.\n\nI can help you discover upcoming festivals, check registration deadlines, explain Single vs Group rules for Arts & Sports, check your tickets, or guide you through certificates.\n\nWhat would you like to explore today?`,
      actions: [
        { label: "📅 Upcoming Events", url: "/explore" },
        { label: "🎨 Arts & Sports Customizer", url: "/#activities" },
        { label: "🎫 My Tickets", url: "/dashboard" },
      ],
    };
  }

  // 2. USER'S OWN REGISTRATIONS & TICKETS
  if (
    q.includes("my ticket") ||
    q.includes("my event") ||
    q.includes("my registration") ||
    q.includes("am i registered") ||
    q.includes("registered for")
  ) {
    if (myRegistrations.length === 0) {
      return {
        text: `You haven't registered for any events yet! 🎟️\n\nThere are **${events.filter(e => e.status === "upcoming").length} upcoming events** across Tech, Arts, Cultural, and Sports waiting for you.`,
        actions: [
          { label: "🔍 Browse All Events", url: "/explore" },
          { label: "🎨 Arts Carnival", url: "/events/e16" },
          { label: "🏆 Sports Olympiad", url: "/events/e17" },
        ],
      };
    }

    const regDetails = myRegistrations
      .map(r => {
        const ev = events.find(e => e.id === r.eventId);
        const format = r.participationType ? ` (${r.participationType})` : "";
        const activity = r.activityName ? ` — ${r.activityName}` : "";
        const team = r.groupName ? ` [Team: ${r.groupName}]` : "";
        return `• **${ev?.title || "Event"}**${format}${activity}${team}\n  Ticket: \`${r.ticketId || r.id}\` | Date: ${ev?.date || "TBA"}`;
      })
      .join("\n\n");

    return {
      text: `Here are your confirmed event registrations (${myRegistrations.length} total):\n\n${regDetails}\n\nYou can present your QR-code passes at the venue entrance directly from your Dashboard!`,
      actions: [{ label: "📱 Open My Dashboard", url: "/dashboard" }],
    };
  }

  // 3. ARTS & CREATIVE ACTIVITIES (SINGLE VS GROUP)
  if (
    q.includes("art") ||
    q.includes("dance") ||
    q.includes("paint") ||
    q.includes("sketch") ||
    q.includes("drama") ||
    q.includes("music") ||
    q.includes("band") ||
    q.includes("singing")
  ) {
    const artsEvent = events.find(e => e.category === "Arts" || e.id === "e16" || e.id === "e8");
    return {
      text: `🎨 **Arts & Creative Activities on Campus**:\n\nYou can compete as a **Single Soloist** or in a **Group Troupe**:\n\n• **Single (Solo) Tracks**: Classical Dance (Bharatanatyam / Kathak), Live Canvas Oil & Acrylic Painting, Pencil & Charcoal Sketching, Digital Concept Art, Vocal Solo, Creative Monologue.\n\n• **Group (Team) Tracks**: Synchronized Group Folk Dance (6–12 members), Street Theatre (Nukkad Natak), College Music Band & Acoustic Battle, Large Format Mural Wall Art.\n\n💡 *Tip: You can also specify any custom discipline when registering!*`,
      actions: [
        { label: "🎨 Register for Kala Rang Arts", url: "/events/e16" },
        { label: "💃 Classical Dance Solo", url: "/events/e8" },
      ],
    };
  }

  // 4. SPORTS & ATHLETICS (SINGLE VS GROUP)
  if (
    q.includes("sport") ||
    q.includes("football") ||
    q.includes("cricket") ||
    q.includes("sprint") ||
    q.includes("badminton") ||
    q.includes("basketball") ||
    q.includes("chess") ||
    q.includes("athletic")
  ) {
    const sportsEvents = events.filter(e => e.category === "Sports");
    return {
      text: `🏆 **Sports & Athletics Olympiad 2026**:\n\nWe feature both individual athletics and inter-department team tournaments:\n\n• **Single (Individual) Tracks**: 100m Sprint Dash, 200m Track Race, Badminton Singles Knockout, Table Tennis, FIDE-rules Blitz Chess, Long Jump & Shot Put.\n\n• **Group (Team) Tracks**: Football 7-a-side Tournament, Cricket T10 Trophy, Basketball 3x3 / 5v5, Volleyball 6-player rotation, 4x100m Relay Sprint, Badminton Mixed Doubles.\n\n👟 *Singles count toward your 3-event limit. Team events have unlimited entry!*`,
      actions: [
        { label: "🏆 Campus Sports Olympiad", url: "/events/e17" },
        { label: "⚽ Football 7s Tournament", url: "/events/e5" },
        { label: "🏏 Cricket T10 League", url: "/events/e12" },
      ],
    };
  }

  // 5. INDIVIDUAL LIMIT & QUOTA RULES
  if (
    q.includes("limit") ||
    q.includes("quota") ||
    q.includes("how many event") ||
    q.includes("max event") ||
    q.includes("rules") ||
    q.includes("single vs group")
  ) {
    const singleCount = myRegistrations.filter(r => {
      const ev = events.find(e => e.id === r.eventId);
      return r.participationType === "Single" || ev?.type === "Individual";
    }).length;

    return {
      text: `📋 **Official Campus Participation Rules**:\n\n1. **Individual (Single) Events Limit**: Students can register for a maximum of **3 individual events** per semester. This ensures students balance academics with co-curriculars.\n   • *Your status: ${singleCount} of 3 individual slots used.*\n\n2. **Group (Team) Events**: **Unlimited!** You can participate in as many team sports, group dances, or bands as you wish.\n\n3. **Team Creation**: You can either create your own squad (as team captain) or join your friends' existing squad from the dropdown list.`,
      actions: [
        { label: "📱 Check Quota in Dashboard", url: "/dashboard" },
        { label: "🔍 Browse All Events", url: "/explore" },
      ],
    };
  }

  // 6. TECHNICAL & HACKATHONS
  if (
    q.includes("tech") ||
    q.includes("hackathon") ||
    q.includes("coding") ||
    q.includes("ai") ||
    q.includes("robotics") ||
    q.includes("python")
  ) {
    const techEvents = events.filter(
      e => e.category === "Technical" || e.category === "Workshop"
    );
    const list = techEvents
      .slice(0, 3)
      .map(e => `• **${e.title}** (${e.date}) — ${e.description.slice(0, 80)}...`)
      .join("\n");

    return {
      text: `💻 **Top Technical Events & Hackathons**:\n\n${list}\n\n• **TechNova 2026**: Flagship 24-hour hackathon with ₹2 Lakhs in prizes.\n• **AI & ML Workshop**: Hands-on TensorFlow & Python lab.`,
      actions: [
        { label: "🚀 Register for TechNova", url: "/events/e1" },
        { label: "🤖 AI & ML Workshop", url: "/events/e3" },
        { label: "🔬 All Tech Events", url: "/explore?category=Technical" },
      ],
    };
  }

  // 7. CERTIFICATES & VERIFICATION
  if (
    q.includes("certif") ||
    q.includes("verify") ||
    q.includes("credential") ||
    q.includes("download")
  ) {
    return {
      text: `🏆 **Certificates & Verification System**:\n\n• **Issuance**: Official digital certificates are generated automatically once your QR-code ticket is checked in at the event.\n• **Download & Print**: Access your gold-bordered certificates anytime in the Certificates Vault.\n• **Public Verification**: Every certificate carries a cryptographic ID (e.g. \`CERT-TN2026-042\`) that employers and colleges can verify at \`/certificates/verify/[id]\`.`,
      actions: [
        { label: "📜 View My Certificates", url: "/certificates" },
        { label: "🔍 Verify a Certificate", url: "/certificates" },
      ],
    };
  }

  // 8. HOW TO ORGANIZE AN EVENT
  if (
    q.includes("organize") ||
    q.includes("create event") ||
    q.includes("host event") ||
    q.includes("publish")
  ) {
    return {
      text: `📋 **Organizing an Event on Campus**:\n\n1. **Sign in as an Organizer**: Use your club credentials or instant demo access.\n2. **Open the Organizer Hub**: Click "Create Event" to enter venue, seats, deadlines, and activity tracks.\n3. **Use AI Studio**: Use our AI tools to draft event descriptions, schedules, promotional captions, and itemized budgets in seconds.\n4. **Manage Roster**: View registered students and export attendance CSVs with single/group and discipline breakdowns.`,
      actions: [
        { label: "🛠️ Organizer Hub", url: "/organizer" },
        { label: "✨ AI Event Studio", url: "/ai-studio" },
      ],
    };
  }

  // 9. SCHEDULE / WHAT'S HAPPENING / TODAY / THIS WEEK
  if (
    q.includes("schedule") ||
    q.includes("upcoming") ||
    q.includes("this week") ||
    q.includes("today") ||
    q.includes("tomorrow") ||
    q.includes("calendar") ||
    q.includes("when")
  ) {
    const upcoming = events.filter(e => e.status === "upcoming").slice(0, 4);
    const list = upcoming
      .map(e => `• **${e.title}** (${e.category})\n  📅 ${e.date} at ${e.time || "10:00 AM"} | 📍 ${e.venue || "Campus"}`)
      .join("\n\n");

    return {
      text: `📅 **Upcoming Events on Campus Calendar**:\n\n${list}\n\nSeats fill quickly — make sure to register before deadlines close!`,
      actions: [
        { label: "🔍 View Full Event Schedule", url: "/explore" },
        { label: "✨ AI Schedule Planner", url: "/ai-studio" },
      ],
    };
  }

  // 10. PLACEMENTS & CAREERS
  if (
    q.includes("placement") ||
    q.includes("job") ||
    q.includes("interview") ||
    q.includes("infosys") ||
    q.includes("career")
  ) {
    const placement = events.find(e => e.category === "Placement");
    return {
      text: `💼 **Campus Placement Drives**:\n\n• **${placement?.title || "Infosys Campus Recruitment Drive"}**\n  Date: ${placement?.date || "Upcoming"} | Venue: ${placement?.venue || "Placement Hall"}\n  Eligibility: Final Year B.Tech / MCA\n\nMake sure your student profile is up to date with your register number and department before applying!`,
      actions: [
        { label: "💼 View Placement Event", url: `/events/${placement?.id || "e6"}` },
        { label: "👤 Update Student Profile", url: "/dashboard" },
      ],
    };
  }

  // 11. GENERAL SMART SEARCH FALLBACK
  const matchingEvents = events.filter(
    e =>
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.tags?.some(t => t.toLowerCase().includes(q))
  );

  if (matchingEvents.length > 0) {
    const ev = matchingEvents[0];
    const seatsLeft = ev.maxSeats ? ev.maxSeats - (ev.registeredCount || 0) : "Unlimited";
    return {
      text: `I found **${matchingEvents.length} event(s)** matching "${query}":\n\n• **${ev.title}** (${ev.category})\n  Date: ${ev.date} | Venue: ${ev.venue || "Campus"}\n  Available Seats: ${seatsLeft}\n\n${ev.description}`,
      actions: [
        { label: `View ${ev.title}`, url: `/events/${ev.id}` },
        { label: "Explore All Matching", url: `/explore?category=${ev.category}` },
      ],
    };
  }

  // 12. INTELLIGENT DEFAULT ASSISTANT RESPONSE
  return {
    text: `I'm here to help with all campus events, activities, and rules! Here are some common things you can ask me:\n\n• *"What are the Arts disciplines (Single vs Group)?"*\n• *"Show me sports tournaments and football rules"*\n• *"How does the 3 individual events quota work?"*\n• *"What events are scheduled this week?"*\n• *"Where are my tickets and QR passes?"*\n• *"How do I verify or download my certificate?"*`,
    actions: [
      { label: "📅 Explore Events", url: "/explore" },
      { label: "🎨 Arts & Sports", url: "/#activities" },
      { label: "📱 My Dashboard", url: "/dashboard" },
    ],
  };
}
