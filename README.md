# 🌌 Virtual Cosmos

> A real-time 2D virtual office where users move around, meet, and chat based on physical proximity — just like in real life.

---

## 🔗 Links

| | |
|---|---|
| 🌐 **Live Demo** | [tute-dude-assignment-ashen.vercel.app](https://tute-dude-assignment-ashen.vercel.app) |
| 🎥 **Demo Video** | [Watch on Google Drive](https://drive.google.com/file/d/14zIRH8UedED53j5Fq1R7Xt1r_G-YfIof/view?usp=sharing) |
| 💻 **GitHub** | [github.com/balajiraonadipalli/TuteDude_Assignment](https://github.com/balajiraonadipalli/TuteDude_Assignment) |

---

## 📸 Preview

> Open two browser tabs → join as different users → move close to each other → chat opens automatically!

---

## ✨ Features

### 🗺️ 2D Interactive Map
- Custom-built **tiled office map** rendered on HTML5 Canvas 2D
- Rooms include: Open Space, Meeting Rooms, Lounge, Desk Areas
- Walkable paths with **collision detection** against walls and furniture
- Smooth camera follows your avatar around the world

### 🕹️ Avatar Movement
- Move using **WASD** or **Arrow Keys**
- Smooth per-frame movement with collision-aware bounds checking
- Camera interpolation for fluid scrolling experience
- Each user sees other users' avatars moving in real time

### 🎨 Custom Avatars
- Choose your **emoji avatar** from a set of characters (🧑 👩 🧙 🦸 🤖 and more)
- Pick a **highlight color** from a curated palette
- See your avatar previewed live on the join screen and settings panel

### 📡 Real-Time Proximity Detection
- Server checks **Euclidean distance** between all users on every move event
- **Proximity radius: 200px** — when two users come within range, chat connects automatically
- Position heartbeat fires every **1.5 seconds** so static users are still checked
- **Dual safety** — client-side guard also checks distances every 2 seconds and disconnects locally if server event is missed

### 💬 Proximity Chat
- Chat panel **opens automatically** when another user enters your radius
- Chat **closes automatically** when users move apart
- Supports multiple simultaneous nearby users with **tab switching**
- Messages show as styled **speech bubbles** — gradient for sent, glass-card for received
- Timestamps shown per message
- Press **Enter** to send, **Shift+Enter** for new line

### 👥 Portrait Cards
- Left sidebar shows **live cards** for you and all nearby users
- Cards show: avatar emoji, name, status dot (green = you, amber = nearby)
- Click a nearby user's card to **open chat** with them directly
- Active chat target has a glowing purple border

### 🔗 Share & Invite
- **Share** button copies the room URL to clipboard
- **Invite** button copies a pre-written invite message with the link
- Toast notification confirms copy success

### ⏺ Session Recording
- Toggle **Record** button to mark a session as being recorded
- Blinking 🔴 **REC** badge appears in the top bar while active

### ✋ Hand Raise
- Raise your hand using the **Hand** button
- ✋ **Hand Raised** badge appears in the top bar
- Socket event emitted so the server is notified

### ⚡ Emoji Reactions
- Click **React** to open a panel with 10 emoji reactions
- Send reactions that broadcast to the server and appear floating above avatars

### 🧩 Mini Apps (in-toolbar panel)
| App | What it does |
|---|---|
| ⏱️ **Timer** | Pomodoro-style stopwatch with start/pause/reset |
| 📋 **Notes** | Scratch pad — type notes and copy to clipboard |
| 🎵 **Music** | Ambient sound selector (Ocean, Rain, Coffee Shop, Forest) |
| 📊 **Poll** | Coming soon |
| 🎲 **Games** | Coming soon |
| 🖼️ **Board** | Coming soon |

### ⚙️ Settings Panel
- Change your **avatar emoji** in-session without rejoining
- Change your **avatar highlight color**
- Live preview updates as you pick options
- Saves to Zustand store and emits `update_avatar` socket event

### 🔔 Toast Notifications
- Non-intrusive slide-up toasts for all actions (Share, Invite, Record, Hand, React, Settings)
- Color-coded: green = success, purple = info, red = error
- Auto-dismiss after 2.5 seconds

### 📊 Top Bar Status
- Your username chip + avatar emoji
- Total user count in the room
- Current room name (updates as you walk into different zones)
- Live connection dot (green = connected, red = disconnected)
- **REC** badge (blinking red when recording)
- **✋ Hand Raised** badge when hand is up
- Call state indicator — **In Call** (green glow) when proximity chat is active

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 (Vite), HTML5 Canvas 2D, Zustand, Socket.IO Client |
| **Backend** | Node.js, Express, Socket.IO, MongoDB (Mongoose) |
| **Real-time** | WebSocket via Socket.IO |
| **Styling** | Vanilla CSS + Inline styles (Glassmorphism dark theme) |
| **State** | Zustand (global store for users, chat, UI panels, reactions) |

---

## 🚀 Local Setup

### 1. Clone

```bash
git clone https://github.com/balajiraonadipalli/TuteDude_Assignment.git
cd TuteDude_Assignment
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your MONGO_URI
npm run dev        # starts on http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev        # starts on http://localhost:5173
```

### 4. Environment Variables

**backend/.env**
```
MONGO_URI=mongodb://localhost:27017/cosmos
PORT=4000
```

**frontend/.env** *(optional — defaults to localhost)*
```
VITE_SOCKET_URL=http://localhost:4000
```

---

## 📁 Project Structure

```
TuteDude_Assignment/
│
├── backend/
│   ├── src/
│   │   ├── config/db.js              # MongoDB connection
│   │   ├── models/User.js            # User schema (position, avatar, nearbyUsers)
│   │   ├── socket/socketManager.js   # All Socket.IO event handlers
│   │   ├── utils/proximity.js        # Distance calculation + connect/disconnect logic
│   │   └── index.js                  # Express + Socket.IO server entry
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── CosmosCanvas.jsx      # HTML5 Canvas 2D renderer (avatars, map, camera)
    │   │   ├── ChatPanel.jsx         # Proximity chat UI with bubbles
    │   │   ├── JoinScreen.jsx        # Entry screen (username, avatar, color)
    │   │   ├── TopBar.jsx            # Header with status badges
    │   │   ├── BottomToolbar.jsx     # All tool buttons + mini apps + settings
    │   │   ├── PortraitCards.jsx     # Sidebar cards for nearby users
    │   │   └── Toast.jsx             # Slide-up notification system
    │   ├── hooks/
    │   │   ├── useKeyboardMovement.js   # WASD movement + position heartbeat
    │   │   └── useSocketEvents.js       # Persistent socket handlers + proximity guard
    │   ├── map/officeMap.js          # Tile map definition (rooms, walls, decorations)
    │   ├── store/cosmosStore.js      # Zustand global state
    │   ├── socket/socket.js          # Socket.IO singleton
    │   └── pages/CosmosScreen.jsx    # Main game screen
    └── package.json
```

---

## 🎮 How to Play

1. Open the app → enter your **name**, pick an **emoji avatar** and **color**
2. Click **Enter Cosmos** → you appear on the 2D office map
3. Use **WASD** or **arrow keys** to walk around
4. **Approach** another user (within ~200px) → chat panel slides open automatically
5. Type messages → they appear as speech bubbles on **both** screens in real time
6. **Walk away** → chat disconnects automatically
7. Use the **bottom toolbar** to share, react, raise hand, access apps and settings

---

## ⚙️ Key Technical Details

| Feature | Implementation |
|---|---|
| Rendering | `requestAnimationFrame` loop on HTML5 Canvas — no PixiJS dependency |
| Proximity | Server-side Euclidean distance checked on every `move` event |
| Heartbeat | Client emits position every 1.5s even when stationary |
| Client guard | Frontend re-checks distances every 2s as fallback disconnect |
| DB writes | `User.updateOne()` used for position updates (avoids Mongoose `ParallelSaveError`) |
| Socket handlers | Split: join-flow in `JoinScreen`, game-world in `useSocketEvents` (survives navigation) |
| State | Zustand store — reactive, no prop drilling, accessed from hooks and socket handlers |
