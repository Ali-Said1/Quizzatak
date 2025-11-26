# Quizzatak

> **Quiz. Compete. Dominate.** - A fast-paced, real-time quiz battle platform built with MERN.

<p align="center">
  <a href="#key-features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#security">Security</a> •
  <a href="#team">Team</a> •
  <a href="#roadmap">Roadmap</a> •
  <a href="#demo">Demo</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img alt="MERN" src="https://img.shields.io/badge/Stack-MERN-1f6feb"/>
</p>

---

## 📖 Overview

**Quizzatak** is a **Kahoot-style real-time quiz game** where players can **join rooms, answer questions, and race `against the clock** to climb the leaderboard.  
It’s designed for **classrooms, communities, and friends**, combining **fun, speed, and knowledge** in one place.

Whether used for **learning, competition, or entertainment**, Quizzatak adapts to different settings with features like **live leaderboards, randomization, and real-time updates** powered by WebSockets.

---

<a id="key-features"></a>

## 🚀 Key Features

### 🎮 Gameplay

- Create and host quizzes with **multiple choice questions**.
- Players join via **game PIN**.
- **Live leaderboard** updates after each question.
- Time-based scoring (faster = more points).

### 👥 Multiplayer

- Host can share a **room code** for others to join.
- Real-time sync using **Socket.IO**.
- Works across multiple devices.

### 🛠 Quiz Builder

- Create questions with options, correct answers, and timers.
- Randomization of questions and options to prevent cheating.

### 🏆 Gamification

- Score system based on speed + correctness.
- **Achievements & badges** planned.
- Leaderboards (room, global, friends).

### 🔔 Notifications

- In-game alerts (next round starting, times up, etc.).

### 🌍 Accessibility

- Mobile-responsive design.
- Multi-language ready (English + Arabic planned).

---

<a id="tech-stack"></a>

## 🧱 Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Redux
- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Real-time:** Socket.IO
- **Auth:** JWT (access/refresh) + bcrypt for hashing
- **Deployment:** TBD

---

<a id="security"></a>

## 🔐 Security & Privacy

- **Authentication:** JWT access & refresh tokens
- **Authorization:** role-based (admin, host, player)
- **Sensitive Data:** passwords hashed with bcrypt
- **Anti-Cheat Basics:** question randomization & time limits

<a id="team"></a>

## 👥 Team

- Ali Said Mohammed
- Emad Adham Mandouh
- Mahmoud Tarek Eid
- Marawan Abdulrahim Sayed
- Mohammed Atef Abdelwahab

---

<a id="roadmap"></a>

## 🗺️ Roadmap

- [x] Phase 0 - Setup (Week 1)

* Initialize GitHub repo & base React project
* Configure TailwindCSS, ESLint, and Prettier
* Create host/player UI

✅ [Figma Design](https://www.figma.com/design/5hQglns2vgszbaDVSPPXDe/Quizzatak?node-id=4-2&t=WjYQV1LD4OxUXbKQ-1)

- [x] Phase 1 - UI & Gameplay Flow (Weeks 2–3)

* Build quiz creation form (frontend only)
* Design host dashboard and player join screen
* Build quiz question/answer screens
* Add timer countdown and basic scoring logic (frontend simulation)

- [x] Phase 2 - Real-Time Simulation (Weeks 4–5)

* Mock real-time updates with local state
* Build leaderboard component (frontend-only demo)
* Add animations and accessibility improvements
* Prepare for integration with backend

- [x] Phase 3 - Backend & Database (Weeks 6–7)

* Set up Express.js server
* Implement MongoDB models for quizzes, users, scores
* Add JWT authentication and role-based access
* Integrate with frontend UI

- [x] Phase 4 - Final Polish & Deployment (Week 8)

* Implement real-time play with Socket.IO
* Optimize UI for mobile and Arabic (RTL support)
* Deploy app to cloud (Render/Heroku for backend, Vercel/Netlify for frontend)
* Final testing and documentation

---

<a id="roles"></a>

## 🧑‍💻 Roles & Responsibilities

### 1. Ali Said Mohammed

**Responsibilities:**

- Build host/player screens and dashboard UI.
- Lead Socket.IO integration for real-time gameplay (score updates, timers, leaderboards).
- Assist Marawan & Emad with backend API integration.
- Oversee live leaderboard logic and event testing.

### 2. Emad Adham Mandouh

**Responsibilities:**

- Assist Ali and Marawan with Socket.IO and real-time logic.
- Implement backend server logic (Node.js/Express) for scores, sessions, and timers.
- Connect MongoDB models to API endpoints.
- Test frontend-backend communication and help debug issues.

### 3. Mahmoud Tarek Eid

**Responsibilities:**

- Build MongoDB schemas (quizzes, questions, scores).
- Implement simple REST endpoints with Marawan & Emad.
- Assist with data validation, and storing game results.

### 4. Marawan Abdulrahim Sayed

**Responsibilities:**

- Build quiz builder and player screens.
- Lead backend API endpoints (quiz creation, join, submit answer).
- Integrate frontend with backend, including REST endpoints and Socket.IO events.
- Help implement JWT authentication and role-based access.

### 5. Mohammed Atef Abdelwahab

**Responsibilities:**

- Assist Ali & Emad with Socket.IO events.
- Support game session and timer logic.
- Help with deployment tasks and server setup.
- Test real-time synchronization across devices.

---

<a id="demo"></a>

## 🎥 Demo

A live demo will be available soon. Stay tuned! 🚀

## To run locally:
### 1. Installation
Clone the repository and enter the project directory:

```bash
git clone https://github.com/Ali-Said1/Quizzatak
cd Quizzatak
npm install
```
### 2. Open 3 terminals:
- Terminal 1:
  `npm run dev`
- Terminal 2:
  `mongod --dbpath server/data`
- Terminal 3:
  `node server/index.js`
---

<a id="license"></a>

## 📄 License

This project is licensed under the **MIT License**.  
See [LICENSE](LICENSE) for details.
