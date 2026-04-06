# 🌌 Virtual Cosmos

A real-time 2D virtual environment where users can move around and chat with nearby users — proximity-based interaction, like Gather.town.

---

## ✨ Features

- 🗺️ **2D Office Map** — rendered on HTML5 Canvas with tiled rooms, desks, and walkable paths
- 🕹️ **WASD / Arrow Key Movement** — smooth avatar movement with collision detection
- 📡 **Real-time Proximity Detection** — server detects when users are within 200px of each other
- 💬 **Proximity Chat** — chat panel opens automatically when users get close
- 👥 **Multi-user** — see all other users' avatars and names on the map
- 🎨 **Custom Avatars** — choose your emoji and color on the join screen

---

## 🧱 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React (Vite), HTML5 Canvas 2D, Zustand, Socket.IO Client |
| Backend | Node.js, Express, Socket.IO, MongoDB (Mongoose) |
| Realtime | WebSocket via Socket.IO |

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
cp .env.example .env    # add your MONGO_URI
npm run dev             # starts on http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev             # starts on http://localhost:5173
```

---

## 🌐 Deployment

### Frontend → Vercel

| Setting | Value |
|---|---|
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

**Environment variable in Vercel:**
```
VITE_SOCKET_URL = https://your-backend.onrender.com
```

### Backend → Render

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |

**Environment variables in Render:**
```
MONGO_URI = mongodb+srv://...
PORT      = 4000
```

---

## 📁 Project Structure

```
TuteDude_Assignment/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # MongoDB connection
│   │   ├── models/User.js        # User schema
│   │   ├── socket/socketManager.js  # Socket.IO events
│   │   ├── utils/proximity.js    # Distance detection
│   │   └── index.js              # Express + Socket.IO server
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── CosmosCanvas.jsx  # HTML5 Canvas 2D renderer
    │   │   ├── ChatPanel.jsx     # Proximity chat UI
    │   │   ├── JoinScreen.jsx    # Entry screen
    │   │   ├── TopBar.jsx        # Header bar
    │   │   ├── BottomToolbar.jsx # Tool buttons
    │   │   └── PortraitCards.jsx # Nearby user cards
    │   ├── hooks/
    │   │   ├── useKeyboardMovement.js  # WASD movement
    │   │   └── useSocketEvents.js      # Persistent socket handlers
    │   ├── map/officeMap.js      # Tile map definition
    │   ├── store/cosmosStore.js  # Zustand global state
    │   └── socket/socket.js      # Socket.IO singleton
    └── package.json
```

---

## 🎮 How to Play

1. Enter your name, choose an avatar & color → **Enter Cosmos**
2. Use **WASD** or arrow keys to move your avatar
3. **Get close** to another user (within ~200px) → chat panel opens automatically
4. Type messages — they appear in real-time on both screens
5. Move away → chat disconnects

---

## 📸 Demo

> Open two browser tabs on `http://localhost:5173`, join as different users, and navigate towards each other!
