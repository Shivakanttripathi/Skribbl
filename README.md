# 🎨 Skribbl.io Clone (Full Stack)

A real-time multiplayer drawing and guessing game built with React, Node.js, and Socket.IO.

## ✨ Features
- **Real-time Drawing**: Smooth, synchronized canvas using Socket.IO.
- **Room System**: Create private rooms, join via code, and manage players.
- **Game Mechanics**: Turn-based word selection, timer, and automated round rotation.
- **Scoring Engine**: Points awarded based on speed of guessing.
- **Premium UI**: Modern glassmorphism design with responsive layouts and animations.
- **Leaderboard**: Live score updates and end-game winner declaration.

## 🏗️ Architecture
- **OOP Backend**: Managed via `Room`, `Game`, and `Player` classes for clean state separation.
- **WebSocket Engine**: Event-driven communication for drawing data, game states, and chat messages.
- **React Frontend**: Functional components with hooks and optimized canvas rendering.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository** (or navigate to the folder).
2. **Install Server dependencies**:
   ```bash
   cd server
   npm install
   ```
3. **Install Client dependencies**:
   ```bash
   cd client
   npm install
   ```

### Running Locally

1. **Start the Server**:
   ```bash
   cd server
   npm start
   ```
   (Server runs on `http://localhost:4000`)

2. **Start the Client**:
   ```bash
   cd client
   npm run dev
   ```
   (Client runs on `http://localhost:5173`)

## 🛠️ Tech Stack
- **Frontend**: Vite, React, TypeScript, Lucide React, Canvas Confetti.
- **Backend**: Node.js, Express, Socket.IO, TypeScript, UUID.
- **Deployment Ready**: Configured for easy deployment on Render or Railway.

## 📋 WebSocket Events Reference
- `create_room`, `join_room`: Room management.
- `start_game`: Host controls game start.
- `draw_data`: Real-time coordinate sync.
- `guess`: Submit word guesses.
- `game_state`: Sync round/turn status.
