# TECHMANIA 2.0 – Official College Technical Event Registration Website

**Department of Master of Computer Applications (MCA)**  
**ANKURAM ASSOCIATION**  
**Vivekananda College of Engineering and Technology (VCET), Puttur**  
*(Unit of Vivekananda Vidyavardhaka Sangha, Puttur • Nehru Nagar, Puttur – 574203)*  

- **Date:** November 16, 2026  
- **Time:** 2:00 PM IST  
- **Venue:** APJ Hall  
- **Tagline:** CODE • INNOVATE • COMPETE  
- **Official Brochure:** Integrated in high-definition viewer & downloadable  

---

## 🚀 Live Demo & Access

- **Frontend URL:** [http://127.0.0.1:5173/](http://127.0.0.1:5173/)
- **Backend API URL:** [http://127.0.0.1:5000/api](http://127.0.0.1:5000/api)
- **Admin Portal Access:** Click the Shield icon in the top right navbar or navigate via Admin button.
  - **Username:** `admin`
  - **Password:** `TechMania@2026`

---

## 🎨 Visual Identity & Brochure Design Fidelity

Faithfully designed using the official **TECHMANIA 2.0** brochure:
- **Futuristic Dark Palette:**
  - Primary Background: `#020817`
  - Secondary Background: `#061426`
  - Card Background: `#0A1930`
  - Electric Blue: `#006BFF`
  - Neon Blue: `#00A6FF`
  - Cyan Glow: `#00E5FF`
  - Secondary Text: `#94A3B8`
- **Cyber Aesthetic Elements:**
  - Metallic 3D stylized text effect matching the brochure
  - Central glowing digital brain circuit visual with floating tech icons: `</>` Code, Trophy, Cog, and Microchip
  - Subtle interactive 60fps canvas circuit board network
  - Glassmorphic navigation and cards with neon cyan borders
  - Leadership recognition: **Dr. Jothimani K** (Director of MCA) and **Prof. Neema H** (Staff Co-ordinator)
  - Official "ALL ARE CORDIALLY INVITED" hexagonal badge

---

## 🏆 4 Configurable Competitions

All competition details, rules, capacities, and venues are fully configurable via the database and Admin Portal:

1. **CODE STROM** *(Coding & Debugging Challenge)*
   - Capacity: 25 participants
   - Venue: MCA Lab 1 / APJ Hall
   - Tagline: *Unleash Your Algorithmic Power*
2. **WEB CRAFT** *(Web Design & UI/UX Sprint)*
   - Capacity: 30 participants
   - Venue: MCA Lab 2 / APJ Hall
   - Tagline: *Design the Future of the Web*
3. **TECH TRIVIA** *(Cyber Quiz & Technical Aptitude)*
   - Capacity: 35 participants
   - Venue: APJ Hall Stage
   - Tagline: *Battle of the Brightest Tech Minds*
4. **INNOVATE-X** *(AI & Software Project Presentation)*
   - Capacity: 20 participants
   - Venue: APJ Hall Seminar Suite
   - Tagline: *Pitch Your Revolutionary Tech Solution*

---

## 🔒 Strict Registration Rules & Concurrency Architecture

### RULE 1: Event Participant Capacity Restriction
- Each event enforces its configured maximum limit (`maximumParticipants`).
- As registrations reach capacity, the status changes to `FULL` automatically.
- Buttons are disabled and display `"Registration Closed – All Slots Filled."`

### RULE 2: One Participant = Strictly ONE Event
- A participant is barred from registering for multiple competitions.
- If a registered USN or Gmail attempts to register for a second event:
  > *"You have already registered for [Event Name]. Each participant is allowed to register for only one event."*

### RULE 3: Duplicate Registration Prevention
- Submitting repeatedly for the same event is caught and blocked:
  > *"You have already registered for this event. Duplicate registrations are not allowed."*

### RULE 4: Backend Confirmed Registration Screen
- Registrations are finalized only upon atomic backend commitment.
- Upon success, displays a clean, focused confirmation screen with confetti:
  - Participant Full Name & USN
  - Registered Event Name & Code
  - Registration Reference ID (e.g., `TM2-CSTM-8492A`)
  - APJ Hall venue & schedule details (Nov 16, 2026 at 2:00 PM)
  - Clear message: *"Congratulations! Your registration for [Event Name] has been confirmed."*
  - Single-click **Done** button to return to the events view.

### RULE 5: Concurrency Safety & Simultaneous Registrations
- Handles race conditions (e.g., when 1 slot remains and multiple students click submit simultaneously).
- Utilizes MongoDB atomic find-and-modify queries:
  ```javascript
  Event.findOneAndUpdate(
    { _id: eventId, status: { $ne: 'CLOSED' }, $expr: { $lt: ['$registeredCount', '$maximumParticipants'] } },
    { $inc: { registeredCount: 1 } },
    { new: true }
  );
  ```
- Combined with database-level unique indexes on `email` and `usn` and rollback logic on duplicate key violations.

---

## 🛡️ Admin Portal Features

1. **Live Dashboard & Stats:** Total registrations, total seats, remaining slots, and fill ratio.
2. **Event Configuration:** Edit event names, descriptions, rules, maximum capacity, or manually toggle registration status (`OPEN` / `CLOSED`).
3. **Participant Management:** Full searchable and filterable database by student name, USN, Gmail, or Registration ID.
4. **Cancellation / Slot Rollback:** Deleting or canceling a registration automatically decrements the event count and restores event status to `OPEN`.
5. **CSV Export:** Download single-click full registration lists or event-specific participant sheets.
6. **Dynamic Validation Settings:** Edit USN regex pattern and toggle strict `@gmail.com` enforcement on the fly.

---

## 🧪 Automated Test Suite Verification

Run the verification suite:
```powershell
node test_all_requirements.js
```
**Results: 20 / 20 Tests Passed (100% Success Rate):**
- [x] Backend Health Check responds `ONLINE`
- [x] Returns exactly 4 configured events with dynamic remaining slots
- [x] Admin Login succeeds with JWT authentication
- [x] Blank/Invalid Name rejected
- [x] Non-Gmail address rejected
- [x] Invalid USN format rejected
- [x] First-time registration creates confirmed pass
- [x] Duplicate registration for same event rejected
- [x] Cross-event registration with same USN rejected
- [x] Cross-event registration with same Gmail rejected
- [x] Pass lookup finds confirmed registrations
- [x] Admin updates event capacity
- [x] Concurrency check: exactly 1 slot awarded among 5 simultaneous requests
- [x] Event status changes to `FULL` automatically
- [x] Admin dashboard stats accurately synchronized
- [x] CSV export generated with valid headers and data
- [x] Admin deletion safely frees event slot and reopens event

---

## 💻 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide React, Canvas Confetti, QRCode SVG
- **Backend:** Node.js, Express.js, Mongoose, Helmet, CORS, Express-Rate-Limit, JWT, Bcrypt
- **Database:** MongoDB 8.x
- **Host Institution:** Department of MCA, VCET Puttur
