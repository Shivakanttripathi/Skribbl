import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { Room } from './models/Room';
import { Player } from './models/Player';
import { DrawData } from './types';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const rooms = new Map<string, Room>();
const playerSocketMap = new Map<string, string>(); // socket.id -> roomId

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('create_room', ({ username }) => {
    const roomId = uuidv4().substring(0, 8);
    const room = new Room(roomId, io);
    const player = new Player(socket.id, username);
    
    room.addPlayer(player);
    rooms.set(roomId, room);
    playerSocketMap.set(socket.id, roomId);
    
    socket.join(roomId);
    socket.emit('room_created', { roomId, players: room.players.map(p => p.toJSON()) });
  });

  socket.on('join_room', ({ roomId, username }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }
    if (room.players.length >= room.settings.maxPlayers) {
      socket.emit('error', 'Room is full');
      return;
    }

    const player = new Player(socket.id, username);
    room.addPlayer(player);
    playerSocketMap.set(socket.id, roomId);
    
    socket.join(roomId);
    socket.emit('room_joined', { roomId, players: room.players.map(p => p.toJSON()) });
    socket.to(roomId).emit('player_joined', player.toJSON());
  });

  socket.on('start_game', () => {
    const roomId = playerSocketMap.get(socket.id);
    const room = roomId ? rooms.get(roomId) : null;
    const player = room?.getPlayer(socket.id);

    if (room && player?.isHost) {
      room.start();
    }
  });

  socket.on('select_word', (word: string) => {
    const roomId = playerSocketMap.get(socket.id);
    const room = roomId ? rooms.get(roomId) : null;
    const player = room?.getPlayer(socket.id);

    if (room && player?.isDrawing) {
      room.game.selectWord(word);
    }
  });

  socket.on('draw_data', (data: DrawData) => {
    const roomId = playerSocketMap.get(socket.id);
    if (roomId) {
      socket.to(roomId).emit('draw_data', data);
    }
  });

  socket.on('clear_canvas', () => {
    const roomId = playerSocketMap.get(socket.id);
    if (roomId) {
      socket.to(roomId).emit('clear_canvas');
    }
  });

  socket.on('guess', (text: string) => {
    const roomId = playerSocketMap.get(socket.id);
    const room = roomId ? rooms.get(roomId) : null;
    const player = room?.getPlayer(socket.id);

    if (room && player) {
      const isCorrect = room.game.checkGuess(player, text);
      
      if (isCorrect) {
        io.to(roomId!).emit('chat_message', {
          id: uuidv4(),
          senderId: 'system',
          senderName: 'System',
          text: `${player.username} guessed the word!`,
          type: 'correct'
        });
        io.to(roomId!).emit('player_list', room.players.map(p => p.toJSON()));
      } else {
        io.to(roomId!).emit('chat_message', {
          id: uuidv4(),
          senderId: player.id,
          senderName: player.username,
          text,
          type: 'chat'
        });
      }
    }
  });

  socket.on('disconnect', () => {
    const roomId = playerSocketMap.get(socket.id);
    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        room.removePlayer(socket.id);
        if (room.players.length === 0) {
          rooms.delete(roomId);
        }
      }
      playerSocketMap.delete(socket.id);
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
