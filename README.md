# 🌌 Virtual Cosmos

A **real-time 2D virtual environment** (Gather.town-style) where users can move around an office map and proximity-based chat connects/disconnects automatically.

> **Assignment**: TuteDude Frontend + Backend Assignment

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗺️ Tiled Office Map | Top-down 2D office with floors, walls, rooms, desks, plants |
| 🧑 Character Avatars | Emoji-style avatars with custom color + glow on connection |
| ⌨️ WASD Movement | Smooth keyboard-controlled movement with collision detection |
| 🔄 Real-time Sync | All user positions synced via Socket.IO |
| 📡 Proximity Detection | Server-side Euclidean distance check (150px radius) |
| 💬 Auto Chat | Chat panel appears when close, disappears when far |
| 🎴 Portrait Cards | Floating avatar cards at top (Gather.town style) |
| 🔢 User Count | Live count of users in the space |
| 🚪 Room Labels | Named rooms: Room 1, Room 2, Open Space |

---

## 🛠️ Tech Stack

### Frontend
- **React** + **Vite** – Fast dev server and build
- **PixiJS** – GPU-accelerated 2D canvas rendering
- **Tailwind CSS** – Utility-first styling
- **Zustand** – Lightweight state management
- **Socket.IO Client** – Real-time communication
- **React Router** – Client-side routing

### Backend
- **Node.js** + **Express** – HTTP + REST API server
- **Socket.IO** – WebSocket real-time events
- **MongoDB** + **Mongoose** – User/session persistence
- **Nodemon** – Dev auto-restart

---

## 📁 Project Structure

```
TuteDude_Assignment/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CosmosCanvas.jsx   # PixiJS tile map + avatars
│   │   │   ├── TopBar.jsx         # Top navigation bar
│   │   │   ├── PortraitCards.jsx  # Floating avatar cards
│   │   │   ├── ChatPanel.jsx      # Right-side chat panel
│   │   │   ├── BottomToolbar.jsx  # Bottom action bar
│   │   │   └── JoinScreen.jsx     # Join / login screen
│   │   ├── hooks/
│   │   │   └── useKeyboardMovement.js
│   │   ├── map/
│   │   │   └── officeMap.js       # 40×25 tile grid data
│   │   ├── pages/
│   │   │   └── CosmosScreen.jsx
│   │   ├── socket/
│   │   │   └── socket.js          # Socket.IO client singleton
│   │   └── store/
│   │       └── cosmosStore.js     # Zustand global state
│   └── vite.config.js
│
└── backend/
    └── src/
        ├── config/db.js           # MongoDB connection
        ├── models/User.js         # Mongoose user model
        ├── routes/userRoutes.js   # REST API routes
        ├── socket/socketManager.js # Socket.IO events
        ├── utils/proximity.js     # Distance check engine
        └── index.js               # Server entry point
```

---

## 🚀 Setup & Run

### Prerequisites
- Node.js v18+
- MongoDB running locally (`mongod`) **OR** use a free MongoDB Atlas URI

### 1. Clone & install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure backend

```bash
cd backend
cp .env.example .env
# Edit .env and set your MONGODB_URI if not using local MongoDB
```

Default `.env`:
```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/virtualcosmos
CLIENT_URL=http://localhost:5173
```

### 3. Run both servers

**Terminal 1 – Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 – Frontend:**
```bash
cd frontend
npm run dev
```

### 4. Open the app

Navigate to **http://localhost:5173**

Open multiple tabs to simulate multiple users!

---

## 🎮 How to Play

1. Enter your name, pick an avatar emoji and color
2. Click **Enter Cosmos**
3. Use **WASD** or **Arrow Keys** to move around the office
4. **Move close** to another user → Chat panel appears automatically
5. **Send messages** while in proximity
6. **Move away** → Chat disconnects

---

## 🔌 Socket Events

| Event | Direction | Payload |
|---|---|---|
| `join` | Client→Server | `{ username, avatarColor, avatarEmoji, position }` |
| `world_state` | Server→Client | `{ me, users[] }` |
| `user_joined` | Server→All | `user` |
| `move` | Client→Server | `{ x, y }` |
| `user_moved` | Server→Others | `{ id, x, y }` |
| `chat:connect` | Server→Client | `{ userId, username, avatarColor, avatarEmoji }` |
| `chat:disconnect` | Server→Client | `{ userId }` |
| `chat:message` | Client→Server | `{ toUserId, text }` |
| `chat:message` | Server→Client | `{ fromUserId, fromUsername, text, timestamp }` |
| `user_left` | Server→All | `{ id }` |

---

## 📡 REST API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | API health check |
| GET | `/api/users/active` | List all online users |

---

## 📹 Demo

[Watch demo video](#) ← Add link here

---

## 👤 Author

Built for TuteDude Assignment – Virtual Cosmos
