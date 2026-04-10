# Skribbl.io Clone

Real-time multiplayer drawing and guessing game built with a React + Vite frontend and a Node.js + Socket.IO backend. Players can create private rooms, join friends, draw prompts in real time, and compete on a live leaderboard.

![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time-010101?logo=socket.io&logoColor=white)

## ?? Live Demo

- Frontend: [Play the game](https://skribbl-ecru.vercel.app/)
- Backend: [Deployed backend](https://skribbl-backend-4cg0.onrender.com)

Note: The backend is primarily a Socket.IO service. It is deployed and reachable at the URL above, but it does not currently expose a dedicated HTTP health-check route such as `/health`.

## ? Features

- **Real-time Drawing**: Smooth, synchronized canvas powered by Socket.IO.
- **Room System**: Create private rooms, join via code, and manage players.
- **Game Mechanics**: Turn-based word selection, timer, and automated round rotation.
- **Scoring Engine**: Points awarded based on speed of guessing.
- **Premium UI**: Modern glassmorphism design with responsive layouts and animations.
- **Leaderboard**: Live score updates and end-game winner declaration.

## ??? Architecture

- **OOP Backend**: Managed through `Room`, `Game`, and `Player` classes for clear state separation.
- **WebSocket Engine**: Event-driven communication for drawing events, game state changes, and chat messages.
- **React Frontend**: Functional components with hooks and optimized canvas rendering.

## ??? Tech Stack

- **Frontend**: Vite, React, TypeScript, Lucide React, Canvas Confetti
- **Backend**: Node.js, Express, Socket.IO, TypeScript, UUID
- **Deployment**: Vercel (frontend) and Render (backend)

## ?? Deployment

- **Frontend**: Deployed on **Vercel**
  - Live URL: [https://skribbl-ecru.vercel.app/](https://skribbl-ecru.vercel.app/)
- **Backend**: Deployed on **Render**
  - Live URL: [https://skribbl-backend-4cg0.onrender.com](https://skribbl-backend-4cg0.onrender.com)

## ?? Environment Variables

### Frontend (`client`)

- `VITE_API_URL`: Base URL of the deployed or local backend

Example:

```env
VITE_API_URL=https://skribbl-backend-4cg0.onrender.com
```

### Backend (`server`)

- `PORT`: Port used by the backend server
- `NODE_ENV`: Runtime environment, typically `development` or `production`

Example:

```env
PORT=4000
NODE_ENV=development
```

## ?? Getting Started

### Prerequisites

- Node.js `18+`
- npm or yarn

### Installation

1. Clone the repository and move into the project folder.
2. Install backend dependencies:

```bash
cd server
npm install
```

3. Install frontend dependencies:

```bash
cd ../client
npm install
```

### Running Locally

The project is split into two apps:

- `server/` runs the backend and Socket.IO server
- `client/` runs the Vite frontend

1. Start the backend server:

```bash
cd server
npm start
```

Backend runs on `http://localhost:4000`

2. Start the frontend client in a new terminal:

```bash
cd client
npm run dev
```

Frontend runs on `http://localhost:5173`

## ?? Project Structure

```text
skribblIo/
+-- client/
¦   +-- src/
¦   +-- package.json
+-- server/
¦   +-- src/
¦   +-- package.json
+-- README.md
```

## ?? API / Backend Test

You can verify the backend deployment in a few ways:

- Open [https://skribbl-backend-4cg0.onrender.com](https://skribbl-backend-4cg0.onrender.com) in a browser to confirm the service is reachable.
- Use Postman to send a `GET` request to `https://skribbl-backend-4cg0.onrender.com`.
- Test the full application by opening the frontend and creating or joining a room.

Note: Since the backend is currently focused on Socket.IO events, there is no dedicated REST health endpoint yet.

## ?? WebSocket Events Reference

- `create_room`, `join_room`: Room management
- `start_game`: Host controls game start
- `draw_data`: Real-time coordinate sync
- `guess`: Submit word guesses
- `game_state`: Synchronize round and turn state

## ?? Known Issues / Notes

- **Render Cold Start**: The backend may take a few seconds to respond on the first request after inactivity.
- **Socket Connection Timing**: If the first socket connection fails, wait a moment and refresh once the backend has fully woken up.
- **Backend Reachability**: The deployed backend currently does not expose a dedicated `/health` endpoint.

## ?? Notes

- The frontend is optimized for Vercel deployment with Vite output generated in `dist/`.
- The backend allows cross-origin access for gameplay and real-time communication.
- This project is structured to keep frontend and backend concerns clearly separated for easier deployment and maintenance.
