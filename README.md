# EVENTORA AI — Intelligent Campus Event Platform

> Every Campus Moment, Perfectly Organized. Discover, organize, and participate in college events powered by AI.

---

## 🗄️ Database Architecture (Google Cloud Firestore)

The platform is backed by **Google Cloud Firestore NoSQL Database** connected to Firebase project **`collage-event-a47a9`**.

### 1. Collections & Data Schema
- **`events`**: Campus events (TechNova, Rhythmica, Sports Olympiad, Hackathons, Workshops) with capacities, schedules, speakers, deadlines, and activity tracks.
- **`activities`**: Curated single and group tracks for Arts (classical dance, painting, sketching, street plays, bands) and Sports (sprints, football, cricket, badminton, relay).
- **`registrations`**: Real-time student registrations with unique ticket IDs, QR passes, and quota tracking (up to 3 individual events).
- **`groups`**: Student squads and team formations.
- **`users`**: Role-based user profiles (Student, Faculty, Organizer, Administrator).
- **`certificates`**: Verifiable digital credentials with SHA verification codes.
- **`notifications`**: Real-time broadcast and event reminder alerts.

### 2. Database Files in Repository
- 📄 [`data/database.json`](./data/database.json): Complete offline database snapshot and export.
- 🛡️ [`firestore.rules`](./firestore.rules): Production-grade Firestore security rules.
- ⚙️ [`firebase.json`](./firebase.json): Firebase project deployment configuration.
- 🔑 [`.env.example`](./.env.example): Firebase environment variables reference.
- 🚀 [`scripts/seedDatabase.mjs`](./scripts/seedDatabase.mjs): Automated Firestore database seeder.

### 3. Database Commands
```bash
# Seed or reset the live Cloud Firestore database:
npm run db:seed

# Re-export the database to data/database.json:
npm run db:export
```

---

## 🚀 Getting Started

### 1. Environment Setup
Create a `.env.local` file based on `.env.example`:
```bash
cp .env.example .env.local
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 🌟 Key Features
- **Cinematic Landing Page**: Dark theme with Apple-inspired frosted glass aesthetic.
- **Explore & Filter**: Filter by category (Technical, Cultural, Sports, Arts, Workshops) or status (Upcoming, Ongoing, Completed).
- **Interactive Event Details & QR Passes**: Real-time registration with instant ticket generation.
- **Context-Aware AI Chatbot**: Real-time assistant powered by `aiBotEngine` aware of live events, rules, and student tickets.
- **Customized Activities**: Single vs Group participation options with 3-event quota enforcement.
- **Admin Control Center**: Live platform monitoring, user management, and 1-click Cloud Firestore database synchronization.
