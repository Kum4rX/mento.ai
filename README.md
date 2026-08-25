# mento.ai — AI-Powered Teacher & Doubt Clarifier

> **Interactive conversational AI tutor that transforms learning through real-time video conversations, step-by-step doubt clarification, and personalized subject guidance.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248.svg)](https://www.mongodb.com/)

---

## 📖 Project Overview

**mento.ai** is an AI-powered educational web platform designed to act as a personal, interactive tutor. By bridging the gap between passive video lectures and high-cost private tutoring, mento.ai offers students a conversational, engaging, and personalized environment to ask questions, clarify doubts, and master difficult academic concepts in real time.

Unlike static text-based chatbots or pre-recorded video playlists, mento.ai connects learners directly with an interactive conversational AI video tutor powered by Tavus and Daily.co. Students can speak naturally, receive dynamic verbal and visual responses, explore curated subject modules, and track their learning progress seamlessly.

---

## 🚩 Problem Statement

Students frequently encounter significant hurdles when learning independently:

* **Passive Learning Overload:** Traditional online education relies heavily on static videos and text notes where students cannot interrupt to ask immediate questions.
* **Limited Classroom Attention:** Teachers often manage dozens of students at once, leaving little time for individualized pacing and doubt clarification.
* **Prohibitive Tutoring Costs:** Private 1-on-1 human tutoring is expensive and unavailable on-demand outside scheduled hours.
* **Impersonal AI Chat Interfaces:** Standard text-only AI chatbots dump walls of text without providing a true teaching or interactive classroom dialogue experience.
* **Context Fragmentation:** Finding dependable, step-by-step explanations across scattered websites causes frustration and wasted study time.

---

## 💡 The mento.ai Solution

**mento.ai** solves these challenges by combining interactive conversational AI avatars with a structured educational ecosystem:

1. **Interactive Conversational Video Tutor:** Live, two-way conversational video sessions powered by Tavus Phoenix-3 replicas and Daily.co WebRTC streaming.
2. **Step-by-Step Doubt Clarification:** The AI mentor breaks down complex concepts into digestible, easy-to-follow explanations.
3. **Structured Subject Library:** A categorized learning library spanning Mathematics, Science, Computer Science, and Humanities.
4. **Interactive 3D Visuals:** Three.js-powered 3D avatar animations on the landing page for enhanced student engagement.
5. **Secure Authentication & Data Persistence:** Built-in MongoDB session-based authentication protecting user accounts and personal learning sessions.
6. **Backend Security Proxy:** Sensitive AI vendor API keys are strictly guarded behind Express backend proxy endpoints.

---

## 🚀 Key Features (Currently Implemented)

### 🤖 Conversational AI Video Tutor
* Direct video and voice interaction with an AI tutor replica (Tavus Phoenix-3 model).
* Real-time WebRTC audio/video streaming embedded via Daily.co iframe architecture.
* Full session lifecycle controls (Start Session, Live Stream, End Session with backend cleanup).

### 🔐 Authentication & Session Security (Phase 2)
* **User Registration & Login:** Full bcrypt password hashing and email verification.
* **Session Persistence:** Persistent login state managed through `express-session` backed by MongoDB (`connect-mongo`).
* **Route Protection:** Frontend `<ProtectedRoute>` wrappers that prevent unauthenticated access to the Dashboard, Library, Profile, Settings, and Session views.
* **Graceful Auth State Handling:** Axios interceptors that distinguish between initial unauthenticated visits and actual authorization errors without polluting the console.

### 🛡️ Backend Security Architecture (Phase 1)
* Zero frontend exposure of sensitive API keys (`TAVUS_API_KEY`).
* Server-side proxy endpoints (`/api/tavus/replica`, `/api/tavus/conversation`, `/api/tavus/conversation/:id/end`) that validate user sessions before forwarding requests to third-party AI APIs.

### 📚 Learning Library & Subject Modules
* Subject catalog covering Mathematics, Physics, Chemistry, Biology, Computer Science, and World History.
* Quick-launch buttons to initiate targeted AI tutor sessions tailored to specific academic topics.

### 📊 Student Dashboard
* Centralized hub displaying active learning stats, upcoming sessions, recent activity, and recommended topics.
* Quick-access navigation to resume tutor conversations with a single click.

### 🎨 Modern UI/UX Design System
* Responsive layout designed with Tailwind CSS and Radix UI / shadcn component primitives.
* Interactive 3D avatar hero canvas rendered with Three.js.
* Dark/light responsive theme tokens, toasts (`sonner` / `toaster`), and accessible navigation menus.

---

## 🔄 User Journey & Flow

```text
               ┌────────────────────────┐
               │      Landing Page      │
               │ (Interactive 3D Avatar)│
               └───────────┬────────────┘
                           │
                 [ Sign Up / Log In ]
                           │
                           ▼
               ┌────────────────────────┐
               │    User Dashboard      │
               │ (Learning Hub & Stats) │
               └───────────┬────────────┘
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
  ┌───────────────────┐         ┌───────────────────┐
  │  Subject Library  │         │  AI Video Session │
  │ (Topic Selection) │         │ (Tavus / Daily.co)│
  └─────────┬─────────┘         └─────────┬─────────┘
            │                             │
            └────────► [ Start ] ◄────────┘
                           │
                           ▼
               ┌────────────────────────┐
               │  Live Interactive Chat │
               │  & Doubt Clarification │
               └───────────┬────────────┘
                           │
                    [ End Session ]
                           │
                           ▼
               ┌────────────────────────┐
               │   Return to Dashboard  │
               └────────────────────────┘
```

---

## 🛠️ Technical Stack

### Frontend
* **Framework:** [React 18](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
* **Build Tool:** [Vite 5](https://vitejs.dev/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [PostCSS](https://postcss.org/)
* **UI Primitives:** [Radix UI](https://www.radix-ui.com/) / [shadcn/ui](https://ui.shadcn.com/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **3D Graphics:** [Three.js](https://threejs.org/)
* **Routing:** [React Router v6](https://reactrouter.com/) (with v7 transition flags)
* **Data Fetching:** [Axios](https://axios-http.com/) & [TanStack Query](https://tanstack.com/query)

### Backend
* **Runtime:** [Node.js](https://nodejs.org/) (v18+)
* **Framework:** [Express.js](https://expressjs.com/)
* **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
* **Session Store:** [express-session](https://www.npmjs.com/package/express-session) + [connect-mongo](https://www.npmjs.com/package/connect-mongo)
* **Password Hashing:** [bcryptjs](https://www.npmjs.com/package/bcryptjs)
* **Security & Middleware:** [cors](https://www.npmjs.com/package/cors), [dotenv](https://www.npmjs.com/package/dotenv)

### AI & Video Infrastructure
* **AI Replica Platform:** [Tavus](https://www.tavus.io/) (Phoenix-3 conversational model)
* **Video Streaming:** [Daily.co](https://www.daily.co/) WebRTC video rooms

---

## 📁 Project Structure

```text
mento.ai/
├── client/                     # React + TypeScript Frontend
│   ├── public/                 # Static assets, branding logos, icons
│   ├── src/
│   │   ├── assets/             # Images and local graphic assets
│   │   ├── components/         # Navigation, 3D Avatar, ProtectedRoute, ErrorBoundary
│   │   │   └── ui/             # Radix & shadcn/ui components (Buttons, Dialogs, Cards)
│   │   ├── config/             # Client configuration & Tavus constants
│   │   ├── contexts/           # React Contexts (AuthContext, TavusContext)
│   │   ├── hooks/              # Custom React hooks (useToast, useMobile)
│   │   ├── lib/                # Utility helpers (cn class merging)
│   │   ├── pages/              # Landing, Dashboard, Library, Session, Login, Signup
│   │   ├── services/           # Tavus client services and API connectors
│   │   ├── utils/              # Axios instance with credentials & silent error handlers
│   │   ├── App.tsx             # Root component with BrowserRouter & Protected Routes
│   │   ├── index.css           # Global Tailwind CSS and design tokens
│   │   └── main.tsx            # Application entry point
│   ├── index.html              # HTML shell
│   ├── package.json            # Frontend dependencies
│   ├── tailwind.config.ts      # Tailwind theme configuration
│   └── vite.config.ts          # Vite build configuration
│
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── config/             # MongoDB connection configuration (db.js)
│   │   ├── controllers/        # Route controllers (authController.js)
│   │   ├── middlewares/        # Authentication middleware (authMiddleware.js)
│   │   ├── models/             # Mongoose models (User.js)
│   │   └── routes/             # Express API routes (authRoutes.js)
│   ├── .env.example            # Backend environment template
│   ├── package.json            # Backend dependencies
│   └── server.js               # Express server entry point & Tavus proxy routes
│
├── DEPLOYMENT_GUIDE.md         # Full deployment runbook for Render / Cloud
├── TROUBLESHOOTING_GUIDE.md    # Common operational issues and fixes
├── render.yaml                 # Infrastructure-as-Code for Render deployment
└── package.json                # Root monorepo script coordinator
```

---

## ⚡ Quick Start & Installation

### Prerequisites
* **Node.js**: `v18.x` or higher
* **npm**: `v9.x` or higher
* **MongoDB**: Running locally on `mongodb://127.0.0.1:27017/mento_ai` (or MongoDB Atlas URI)
* **Tavus Account & API Key**: [tavus.io](https://www.tavus.io/)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Kum4rX/mento.ai.git
cd mento.ai
```

---

### Step 2: Install Dependencies
Install dependencies across the monorepo root, client, and server:

```bash
# Install root dependencies (concurrently)
npm install

# Install client dependencies
cd client
npm install
cd ..

# Install server dependencies
cd server
npm install
cd ..
```

---

### Step 3: Configure Environment Variables

#### Backend (`server/.env`)
Create a `.env` file in the `server` directory:

```env
PORT=3001
NODE_ENV=development

# MongoDB Connection
MONGO_URI=mongodb://127.0.0.1:27017/mento_ai

# Session Security
SESSION_SECRET=your_super_secret_session_key_here

# Tavus Conversational AI API
TAVUS_API_KEY=your_actual_tavus_api_key
TAVUS_API_URL=https://tavusapi.com/v2
TAVUS_REPLICA_ID=r6ae5b6efc9d
```

#### Frontend (`client/.env`)
Create a `.env` file in the `client` directory:

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_TAVUS_REPLICA_ID=r6ae5b6efc9d
VITE_ENABLE_TAVUS=true
VITE_ENABLE_AUTH=true
```

---

### Step 4: Run the Application Locally
Run both the frontend and backend concurrently from the root directory:

```bash
npm run dev
```

* **Frontend:** [http://localhost:8080](http://localhost:8080)
* **Backend API:** [http://localhost:3001/api](http://localhost:3001/api)
* **API Health Check:** [http://localhost:3001/api/health](http://localhost:3001/api/health)

---

## 🔒 Security Best Practices Implemented

* **API Key Protection:** The client never imports or bundles `TAVUS_API_KEY`. All session generation and replica inquiries route strictly through the authenticated backend.
* **HttpOnly Session Cookies:** Browser tokens are stored in secure cookies (`withCredentials: true`) to mitigate XSS vulnerabilities.
* **Password Hashing:** Passwords are salted and hashed using `bcryptjs` with 10 salt rounds prior to MongoDB storage.
* **CORS Whitelisting:** Express CORS configuration strictly restricts origin access between port `8080` (client) and `3001` (server).

---

## 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.
