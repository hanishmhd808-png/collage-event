"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { generateSmartReply, BotAction } from "@/lib/aiBotEngine";
import { Sparkles, Copy, RefreshCw, Send, CheckCircle, Bot, ArrowRight } from "lucide-react";

function DemoBadge() {
  return <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Demo Mode</span>;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <button onClick={copy} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1.5 glass rounded-lg border border-white/10">
      {copied ? <><CheckCircle className="w-3.5 h-3.5 text-green-400" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Copy</>}
    </button>
  );
}

function ToolCard({ title, icon, description, children }: { title: string; icon: string; description: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-dark border border-white/8 rounded-3xl p-6 relative">
      <DemoBadge />
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
      <p className="text-white/40 text-sm mb-6">{description}</p>
      {children}
    </motion.div>
  );
}

function GenerateButton({ onClick, loading, label = "Generate" }: { onClick: () => void; loading: boolean; label?: string }) {
  return (
    <motion.button onClick={onClick} disabled={loading} whileHover={!loading ? { scale: 1.03 } : {}} whileTap={!loading ? { scale: 0.97 } : {}}
      className={`btn-primary px-6 py-2.5 text-sm flex items-center gap-2 ${loading ? "opacity-70" : ""}`}>
      {loading ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />{label}ing...</> : <><Sparkles className="w-4 h-4" />{label}</>}
    </motion.button>
  );
}

function OutputBox({ text }: { text: string }) {
  if (!text) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 glass rounded-2xl border border-white/8">
      <div className="flex justify-between items-start mb-3"><p className="text-white/40 text-xs font-semibold uppercase tracking-wider">AI Output</p><CopyButton text={text} /></div>
      <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
    </motion.div>
  );
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export default function AIStudioPage() {
  const router = useRouter();
  const { events, myRegistrations, groups } = useApp();
  const { user, studentProfile } = useAuth();

  // Tool 1 — Description Generator
  const [t1Name, setT1Name] = useState(""); const [t1Type, setT1Type] = useState("Technical"); const [t1Out, setT1Out] = useState(""); const [t1Load, setT1Load] = useState(false);
  // Tool 2 — Schedule Planner
  const [t2Type, setT2Type] = useState("Hackathon"); const [t2Hours, setT2Hours] = useState("8"); const [t2Sessions, setT2Sessions] = useState("4"); const [t2Out, setT2Out] = useState(""); const [t2Load, setT2Load] = useState(false);
  // Tool 3 — Poster Prompt
  const [t3Name, setT3Name] = useState(""); const [t3Cat, setT3Cat] = useState("Technical"); const [t3Theme, setT3Theme] = useState("Futuristic"); const [t3Out, setT3Out] = useState(""); const [t3Load, setT3Load] = useState(false);
  // Tool 4 — Budget Planner
  const [t4Type, setT4Type] = useState("Workshop"); const [t4Att, setT4Att] = useState("100"); const [t4Out, setT4Out] = useState(""); const [t4Load, setT4Load] = useState(false);
  // Tool 5 — Promo Writer
  const [t5Name, setT5Name] = useState(""); const [t5Aud, setT5Aud] = useState("Engineering Students"); const [t5Out, setT5Out] = useState(""); const [t5Tab, setT5Tab] = useState("Instagram"); const [t5Load, setT5Load] = useState(false);
  // Tool 6 — Attendance Insights
  const [t6Event, setT6Event] = useState(""); const [t6Out, setT6Out] = useState(""); const [t6Load, setT6Load] = useState(false);
  // Tool 7 — Conflict Detector
  const [t7Date, setT7Date] = useState(""); const [t7Venue, setT7Venue] = useState(""); const [t7Out, setT7Out] = useState(""); const [t7Load, setT7Load] = useState(false);
  // Tool 8 — Recommendations
  const [t8Interests, setT8Interests] = useState<string[]>([]); const [t8Out, setT8Out] = useState(""); const [t8Load, setT8Load] = useState(false);
  // Tool 9 — Report Generator
  const [t9Event, setT9Event] = useState(""); const [t9Out, setT9Out] = useState(""); const [t9Load, setT9Load] = useState(false);
  // Tool 10 — Chat
  const [chatMsg, setChatMsg] = useState("");
  const [chatLog, setChatLog] = useState<{ role: "user" | "ai"; text: string; actions?: BotAction[] }[]>([
    {
      role: "ai",
      text: "Hi! I'm EVENTORA AI, your campus assistant. Ask me about **Arts (Single vs Group)**, **Sports Olympiad**, **3-event quota limit**, your confirmed tickets, or upcoming hackathons! 🎓",
      actions: [
        { label: "Browse Events", url: "/explore" },
        { label: "My Dashboard", url: "/dashboard" },
      ],
    },
  ]);
  const [chatLoad, setChatLoad] = useState(false);

  const gen = async (setLoad: (v: boolean) => void, setOut: (v: string) => void, text: string) => {
    setLoad(true); await delay(1500); setOut(text); setLoad(false);
  };

  const sendChat = async (overridePrompt?: string) => {
    const rawMsg = overridePrompt !== undefined ? overridePrompt : chatMsg;
    if (!rawMsg.trim()) return;
    const msg = rawMsg.trim();
    if (overridePrompt === undefined) setChatMsg("");
    setChatLog((prev) => [...prev, { role: "user", text: msg }]);
    setChatLoad(true);
    await delay(600);
    const reply = generateSmartReply(msg, {
      events,
      myRegistrations,
      groups,
      user,
      studentProfile,
    });
    setChatLog((prev) => [
      ...prev,
      { role: "ai", text: reply.text, actions: reply.actions },
    ]);
    setChatLoad(false);
  };

  return (
    <div className="bg-[#0a0a0f] min-h-screen">
      {/* Header */}
      <div className="bg-hero pt-28 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-amber-500/30 text-amber-400 text-sm mb-6">
            <Sparkles className="w-4 h-4" />Demo Mode — Add a Gemini API key to enable live AI responses
          </div>
          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-cyan-400 text-sm font-semibold mb-2 uppercase tracking-widest">Intelligence</motion.p>
          <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-4xl sm:text-6xl font-black text-white mb-4">AI Event <span className="gradient-text">Studio</span></motion.h1>
          <motion.p initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="text-white/40 max-w-2xl">Ten intelligent tools to supercharge your campus events — all running locally in demo mode.</motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Tool 1 */}
        <ToolCard title="Event Description Generator" icon="✍️" description="Generate a professional event description instantly.">
          <div className="space-y-3">
            <input value={t1Name} onChange={e=>setT1Name(e.target.value)} placeholder="Event name (e.g. Annual Tech Fest)" className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none focus:border-blue-500/30" />
            <select value={t1Type} onChange={e=>setT1Type(e.target.value)} className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none bg-transparent">
              {["Technical","Cultural","Sports","Workshop","Seminar","Conference"].map(c=><option key={c} value={c} className="bg-[#0a0a0f]">{c}</option>)}
            </select>
            <GenerateButton loading={t1Load} onClick={()=>gen(setT1Load,setT1Out,`${t1Name||"The Event"} is a prestigious ${t1Type.toLowerCase()} event that brings together the brightest minds on campus. \n\nParticipants will engage in cutting-edge challenges, collaborative workshops, and networking opportunities that bridge academia and industry. This event is designed to inspire innovation, foster teamwork, and celebrate excellence in ${t1Type.toLowerCase()} fields.\n\nDon't miss this opportunity to showcase your skills, learn from peers and mentors, and create memories that last a lifetime. Register now and be part of something extraordinary!`)} />
            <OutputBox text={t1Out} />
          </div>
        </ToolCard>

        {/* Tool 2 */}
        <ToolCard title="Schedule Planner" icon="📅" description="Generate a structured event timetable automatically.">
          <div className="space-y-3">
            <input value={t2Type} onChange={e=>setT2Type(e.target.value)} placeholder="Event type (e.g. Hackathon)" className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none focus:border-blue-500/30" />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" value={t2Hours} onChange={e=>setT2Hours(e.target.value)} placeholder="Duration (hours)" className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none" />
              <input type="number" value={t2Sessions} onChange={e=>setT2Sessions(e.target.value)} placeholder="Sessions" className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none" />
            </div>
            <GenerateButton loading={t2Load} onClick={()=>gen(setT2Load,setT2Out,`📋 ${t2Type} Schedule (${t2Hours} hours, ${t2Sessions} sessions)\n\n09:00 AM — Registration & Welcome Kit Distribution\n09:30 AM — Inauguration Ceremony & Keynote Address\n10:00 AM — Session 1: Problem Statement Briefing\n11:30 AM — Networking Break & Team Formation\n12:00 PM — Session 2: Intensive Work Phase\n01:30 PM — Lunch Break\n02:30 PM — Session 3: Mid-Point Review & Mentoring\n04:00 PM — Session 4: Final Sprint & Submission\n05:30 PM — Panel Evaluation\n06:30 PM — Results & Prize Distribution\n07:00 PM — Closing Ceremony`)} />
            <OutputBox text={t2Out} />
          </div>
        </ToolCard>

        {/* Tool 3 */}
        <ToolCard title="Poster Prompt Generator" icon="🎨" description="Create AI image generation prompts for event posters.">
          <div className="space-y-3">
            <input value={t3Name} onChange={e=>setT3Name(e.target.value)} placeholder="Event name" className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none" />
            <div className="grid grid-cols-2 gap-3">
              <select value={t3Cat} onChange={e=>setT3Cat(e.target.value)} className="glass border border-white/10 rounded-xl px-3 py-3 text-white text-sm outline-none bg-transparent">
                {["Technical","Cultural","Sports","Workshop"].map(c=><option key={c} className="bg-[#0a0a0f]">{c}</option>)}
              </select>
              <input value={t3Theme} onChange={e=>setT3Theme(e.target.value)} placeholder="Theme (e.g. Futuristic)" className="glass border border-white/10 rounded-xl px-3 py-3 text-white text-sm placeholder-white/30 outline-none" />
            </div>
            <GenerateButton loading={t3Load} onClick={()=>gen(setT3Load,setT3Out,`🎨 Poster Prompt for "${t3Name||"Event"}":\n\nA stunning ${t3Theme.toLowerCase()} poster for "${t3Name||"a campus event"}" — a ${t3Cat.toLowerCase()} college event. \n\nStyle: ${t3Theme}, vibrant neon colors, dark background, glowing light effects, cinematic composition. Include abstract geometric shapes, circuit patterns (if tech), or flowing artistic elements (if cultural). Bold sans-serif typography for the event name. High contrast, poster-quality, 4K resolution, dramatic lighting, --ar 3:4 --style vivid`)} />
            <OutputBox text={t3Out} />
          </div>
        </ToolCard>

        {/* Tool 4 */}
        <ToolCard title="Budget Planner" icon="💰" description="Generate an itemized event budget estimate.">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <select value={t4Type} onChange={e=>setT4Type(e.target.value)} className="glass border border-white/10 rounded-xl px-3 py-3 text-white text-sm outline-none bg-transparent">
                {["Workshop","Conference","Cultural Fest","Sports Day","Hackathon"].map(c=><option key={c} className="bg-[#0a0a0f]">{c}</option>)}
              </select>
              <input type="number" value={t4Att} onChange={e=>setT4Att(e.target.value)} placeholder="Expected attendance" className="glass border border-white/10 rounded-xl px-3 py-3 text-white text-sm placeholder-white/30 outline-none" />
            </div>
            <GenerateButton loading={t4Load} onClick={()=>{
              const att = parseInt(t4Att)||100;
              gen(setT4Load,setT4Out,`💰 Budget Estimate — ${t4Type} (${att} attendees)\n\nVenue & Setup:        ₹${(att*15).toLocaleString()}\nAudio/Visual:         ₹${(att*10).toLocaleString()}\nPrizes & Certificates: ₹${(att*20).toLocaleString()}\nF&B / Refreshments:   ₹${(att*25).toLocaleString()}\nMarketing & Printing: ₹${(att*5).toLocaleString()}\nLogistics & Misc:     ₹${(att*8).toLocaleString()}\n─────────────────────────────\nTotal Estimated Cost:  ₹${(att*83).toLocaleString()}\nPer Head Cost:         ₹83\n\n💡 Tip: Apply for college sponsorship to cover 40-60% of costs.`);
            }} />
            <OutputBox text={t4Out} />
          </div>
        </ToolCard>

        {/* Tool 5 */}
        <ToolCard title="Promotion Writer" icon="📣" description="Generate platform-specific promotional content.">
          <div className="space-y-3">
            <input value={t5Name} onChange={e=>setT5Name(e.target.value)} placeholder="Event name" className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none" />
            <input value={t5Aud} onChange={e=>setT5Aud(e.target.value)} placeholder="Target audience" className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none" />
            <div className="flex gap-2">
              {["Instagram","Email","WhatsApp","Twitter"].map(p=><button key={p} onClick={()=>setT5Tab(p)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${t5Tab===p?"bg-blue-600 text-white":"glass border border-white/10 text-white/50"}`}>{p}</button>)}
            </div>
            <GenerateButton loading={t5Load} onClick={()=>{
              const name = t5Name || "Our Event"; const aud = t5Aud || "students";
              const outs: Record<string,string> = {
                Instagram: `✨ ${name} is HERE! 🎉\n\nThe moment we've all been waiting for — don't miss the most exciting event of the semester! Whether you're a creator, coder, or curious mind, this is YOUR stage. 🚀\n\n📅 Date: Coming Soon\n📍 Location: Main Campus\n🎯 For: ${aud}\n\nDrop a 🔥 if you're IN!\n.\n#${name.replace(/\s+/g,"")} #CampusLife #EVENTORA`,
                Email: `Subject: 🎯 You're invited to ${name}!\n\nDear ${aud},\n\nWe are thrilled to announce ${name}, a landmark event on our campus calendar. This event promises hands-on learning, exciting competitions, and incredible networking opportunities.\n\n🗓️ Date: Announced Soon\n🏆 Prizes Worth: ₹50,000+\n📝 Registration: eventora.ai/explore\n\nRegister now — seats are limited!\n\nWarm regards,\nEvents Team`,
                WhatsApp: `🎉 *${name}* is coming!\n\nHey ${aud}! 👋\n\nBig news — ${name} registrations are now OPEN! 🚀\n\n✅ Free entry\n✅ Certificates for all\n✅ Amazing prizes\n\nRegister here 👉 eventora.ai/explore\n\nShare this with your friends! 📲`,
                Twitter: `🔥 ${name} is officially announced! \n\n${aud} — this one's for you. Innovation meets inspiration on campus.\n\n📅 Date TBA | 🎫 Free\n\nRetweet to spread the word! 🔁\n#${name.replace(/\s+/g,"")} #Campus`,
              };
              gen(setT5Load,setT5Out,outs[t5Tab]);
            }} />
            <OutputBox text={t5Out} />
          </div>
        </ToolCard>

        {/* Tool 6 */}
        <ToolCard title="Attendance Insights" icon="📊" description="Analyze participation patterns for your event.">
          <div className="space-y-3">
            <select value={t6Event} onChange={e=>setT6Event(e.target.value)} className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none bg-transparent">
              <option value="" className="bg-[#0a0a0f]">Select Event</option>
              {events.map(e=><option key={e.id} value={e.id} className="bg-[#0a0a0f]">{e.title}</option>)}
            </select>
            <GenerateButton loading={t6Load} onClick={()=>{
              const ev = events.find(e=>e.id===t6Event);
              if (!ev) { setT6Out("Please select an event first."); return; }
              const pct = ev.maxSeats ? Math.round(((ev.registeredCount||0)/ev.maxSeats)*100) : 0;
              gen(setT6Load,setT6Out,`📊 Attendance Insights: ${ev.title}\n\nRegistrations: ${ev.registeredCount||0} / ${ev.maxSeats||"N/A"}\nFill Rate: ${pct}%\nStatus: ${pct>90?"🔴 Critical — Almost Full!":pct>70?"🟡 Good Progress":pct>40?"🟢 Healthy":"🔵 Just Started"}\n\nPeak Registration Window: Weekdays 4–7 PM\nTop Referral Source: WhatsApp Groups (62%)\nDrop-off Rate: ~8% (industry average: 12%)\n\n💡 Recommendations:\n• Send reminder 48h before deadline\n• Post social media at 5 PM Thursday for max reach\n• ${pct<50?"Consider extending deadline":"Keep current momentum!"}`);
            }} />
            <OutputBox text={t6Out} />
          </div>
        </ToolCard>

        {/* Tool 7 */}
        <ToolCard title="Conflict Detector" icon="⚠️" description="Check for scheduling conflicts with existing events.">
          <div className="space-y-3">
            <input type="date" value={t7Date} onChange={e=>setT7Date(e.target.value)} className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none bg-transparent focus:border-blue-500/30" />
            <input value={t7Venue} onChange={e=>setT7Venue(e.target.value)} placeholder="Venue (e.g. Main Auditorium)" className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none" />
            <GenerateButton loading={t7Load} onClick={()=>{
              if (!t7Date) { setT7Out("Please select a date."); return; }
              const conflicts = events.filter(e=>e.date===t7Date);
              const venueConflicts = t7Venue ? events.filter(e=>e.venue?.toLowerCase().includes(t7Venue.toLowerCase()) && e.date===t7Date) : [];
              gen(setT7Load,setT7Out,`⚠️ Conflict Analysis for ${t7Date}${t7Venue?` @ ${t7Venue}`:""}\n\n${conflicts.length===0&&venueConflicts.length===0?"✅ No conflicts detected! This slot is available.\n\n💡 This is a great date choice — campus calendar is clear." : `⚠️ Found ${conflicts.length} event(s) on this date:\n${conflicts.map(e=>`• ${e.title} (${e.venue||"TBA"})`).join("\n")}\n${venueConflicts.length>0?`\n🏛️ Venue conflicts at "${t7Venue}":\n${venueConflicts.map(e=>`• ${e.title}`).join("\n")}\n`:""}\n💡 Consider moving to a nearby date or alternate venue.`}`);
            }} />
            <OutputBox text={t7Out} />
          </div>
        </ToolCard>

        {/* Tool 8 */}
        <ToolCard title="Event Recommendations" icon="🎯" description="Get personalized event suggestions based on interests.">
          <div className="space-y-3">
            <p className="text-white/40 text-xs">Select your interests:</p>
            <div className="flex flex-wrap gap-2">
              {["Technical","Cultural","Sports","Workshop","Seminar","Placement"].map(cat=>(
                <button key={cat} onClick={()=>setT8Interests(prev=>prev.includes(cat)?prev.filter(x=>x!==cat):[...prev,cat])} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${t8Interests.includes(cat)?"bg-blue-600 text-white":"glass border border-white/10 text-white/50 hover:text-white"}`}>{cat}</button>
              ))}
            </div>
            <GenerateButton loading={t8Load} onClick={()=>{
              const recs = events.filter(e=>t8Interests.length===0||t8Interests.includes(e.category)).filter(e=>e.status==="upcoming").slice(0,4);
              gen(setT8Load,setT8Out,recs.length>0?`🎯 Recommended Events for You:\n\n${recs.map((e,i)=>`${i+1}. ${e.title}\n   Category: ${e.category} | Date: ${e.date}\n   Seats: ${e.maxSeats?`${e.maxSeats-(e.registeredCount||0)} remaining`:"Unlimited"}`).join("\n\n")}\n\n💡 Register early — popular events fill up fast!`:"No upcoming events match your interests. Try selecting more categories!");
            }} />
            <OutputBox text={t8Out} />
          </div>
        </ToolCard>

        {/* Tool 9 */}
        <ToolCard title="Event Report Generator" icon="📋" description="Generate a comprehensive event summary report.">
          <div className="space-y-3">
            <select value={t9Event} onChange={e=>setT9Event(e.target.value)} className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none bg-transparent">
              <option value="" className="bg-[#0a0a0f]">Select Event</option>
              {events.map(e=><option key={e.id} value={e.id} className="bg-[#0a0a0f]">{e.title}</option>)}
            </select>
            <GenerateButton loading={t9Load} label="Generate Report" onClick={()=>{
              const ev = events.find(e=>e.id===t9Event);
              if (!ev) { setT9Out("Please select an event."); return; }
              gen(setT9Load,setT9Out,`📋 Event Summary Report\n━━━━━━━━━━━━━━━━━━━━━━━━\nEvent: ${ev.title}\nCategory: ${ev.category}\nDate: ${ev.date}${ev.time?` at ${ev.time}`:""}\nVenue: ${ev.venue||"TBA"}\nOrganizer: ${ev.organizer||"TBA"}\nStatus: ${ev.status.toUpperCase()}\n\nRegistration Summary:\n• Total Registrations: ${ev.registeredCount||0}\n• Capacity: ${ev.maxSeats||"Unlimited"}\n• Fill Rate: ${ev.maxSeats?`${Math.round(((ev.registeredCount||0)/ev.maxSeats)*100)}%`:"N/A"}\n\nCertificates: ${ev.certificateAvailable?"Will be issued":"Not applicable"}\n\nDescription:\n${ev.description}\n\nReport generated by EVENTORA AI on ${new Date().toLocaleDateString()}`);
            }} />
            <OutputBox text={t9Out} />
          </div>
        </ToolCard>

        {/* Tool 10 — Chat */}
        <ToolCard title="AI Chat Assistant" icon="🤖" description="Ask anything about campus events, single/group activities, or your registered tickets in natural language.">
          {/* Quick prompt suggestions */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {[
              "🎨 Arts: Single vs Group",
              "🏆 Sports Olympiad",
              "⚖️ 3-Event Limit Rules",
              "🎟️ My Registered Events",
              "🔬 TechNova 2026",
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => sendChat(chip)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="h-64 overflow-y-auto flex flex-col gap-2.5 mb-3 pr-1 text-sm">
            {chatLog.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[90%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white/8 text-white/90 border border-white/5 rounded-bl-sm"
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    {m.text.split(/(\*\*.*?\*\*)/g).map((chunk, cIdx) => {
                      if (chunk.startsWith("**") && chunk.endsWith("**")) {
                        return <strong key={cIdx} className="text-white font-semibold">{chunk.slice(2, -2)}</strong>;
                      }
                      return chunk;
                    })}
                  </div>
                </div>

                {/* Interactive Action Buttons */}
                {m.actions && m.actions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 ml-1">
                    {m.actions.map((act, actIdx) => (
                      <button
                        key={actIdx}
                        onClick={() => act.url && router.push(act.url)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-semibold transition-all hover:scale-[1.02]"
                      >
                        <span>{act.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {chatLoad && (
              <div className="flex justify-start">
                <div className="bg-white/8 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
                  <span className="text-xs text-white/50 mr-1">EVENTORA thinking</span>
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-blue-400"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              value={chatMsg}
              onChange={(e) => setChatMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder="Ask about events, arts/sports rules, tickets..."
              className="flex-1 glass border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm placeholder-white/30 outline-none focus:border-blue-500/30"
            />
            <motion.button
              onClick={() => sendChat()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </motion.button>
          </div>
        </ToolCard>

      </div>
    </div>
  );
}
