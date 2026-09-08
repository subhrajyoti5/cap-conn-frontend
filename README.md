# CAPACITY CONNECT — Frontend

<p align="center">
  <strong>A product-first learning experience for institutional capacity building.</strong><br/>
  Built for structured training, measurable outcomes, and competency-led growth.
</p>

---

## ✨ Product Snapshot

**CAPACITY CONNECT** is the frontend for a digital Learning Management and Capacity Building platform designed for organizational ecosystems like IMD/MoES.

It connects:
- **People** (Trainees, Trainers, Admins)
- **Learning** (Courses, resources, assessments)
- **Outcomes** (Performance, certifications, feedback)
- **Intelligence** (Competency mapping and trainer discovery)

---

## 🎯 Design Thinking

The product is shaped around a design-thinking lens:

1. **Empathize**  
   Understand workflow gaps for trainees, trainers, and administrators in institutional training.

2. **Define**  
   Frame the core challenge: fragmented tools make learning difficult to manage, measure, and scale.

3. **Ideate**  
   Conceptualize a single role-based platform combining enrollment, learning, assessments, and competency insights.

4. **Prototype**  
   Build role-specific dashboard journeys and reusable UI modules with a feature-based frontend architecture.

5. **Test & Iterate**  
   Improve usability and responsiveness through modular components and continuous feedback cycles.

---

## 🧭 Design Process

### 1) Product Vision
Create one unified digital ecosystem for training operations and learning outcomes.

### 2) User Journey Design
Design around three primary personas:
- **Trainee:** Discover → Enroll → Learn → Attempt → Improve  
- **Trainer:** Create → Publish → Assess → Monitor  
- **Admin:** Approve → Govern → Analyze → Communicate

### 3) Information Architecture
Organize the app into clear domains:
- Auth and user state
- Courses and subjects
- Learning resources
- Assessments and feedback
- Messaging and announcements

### 4) Interface System
Use reusable components and motion-driven UI interactions to keep experience modern, clean, and consistent.

### 5) Outcome Orientation
Prioritize measurable learning impact through performance tracking, certifications, and competency mapping.

---

## 🏗️ Frontend Architecture

This app uses **Next.js** with a feature-oriented structure:

```text
app/
├── (marketing)
├── admin/
├── trainee/
├── trainer/
├── courses/
└── ...

features/
├── auth/
├── courses/
├── resources/
├── assessments/
├── feedback/
└── ...

components/
├── marketing-navbar.js
├── landing-hero.js
├── sidebar.js
└── ...
```

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15
- **UI:** React 18 + Tailwind CSS
- **Animation/Visuals:** Framer Motion + Three.js
- **Icons:** Lucide React
- **Linting:** ESLint (Next.js config)

---

## 🚀 Getting Started

### Prerequisites
- Node.js **20+**
- npm

### 1) Install dependencies
```bash
npm install
```

### 2) Configure environment
Create `.env.local` from `.env.example`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

### 3) Run development server
```bash
npm run dev
```

Open: `http://localhost:3000`

---

## 📜 Available Scripts

- `npm run dev` — Start local dev server
- `npm run build` — Create production build
- `npm run start` — Run production server
- `npm run lint` — Run ESLint checks

---

## 🌍 Why This Product Matters

CAPACITY CONNECT is not just a UI project—it is a **capacity transformation platform** that helps institutions:
- Scale training operations
- Track competency development
- Improve learning quality with data
- Build a future-ready workforce

---

## 📄 Documentation

Detailed product and technical documentation is available in:
- `/docs/prd.md`
- `/docs/srs.md`
- `/docs/trd.md`

