import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import Lobby from './components/Lobby';
import GameRoom from './components/GameRoom';
import { BASE_URL } from './config';

const socket: Socket = io(BASE_URL, {
  transports: ['websocket']
});

function App() {
  const [inRoom, setInRoom] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [initialPlayers, setInitialPlayers] = useState<any[]>([]);

  useEffect(() => {
    socket.on('room_created', (data) => {
      setRoomId(data.roomId);
      setInitialPlayers(data.players);
      setInRoom(true);
    });

    socket.on('room_joined', (data) => {
      setRoomId(data.roomId);
      setInitialPlayers(data.players);
      setInRoom(true);
    });

    socket.on('error', (message) => {
      alert(message);
    });

    socket.on('connect_error', () => {
      console.error('Failed to connect to server');
    });

    return () => {
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('error');
      socket.off('connect_error');
    };
  }, []);

  return (
    <div className="container">
      {!inRoom ? (
        <Lobby socket={socket} setUsername={setUsername} username={username} />
      ) : (
        <GameRoom socket={socket} roomId={roomId} username={username} initialPlayers={initialPlayers} />
      )}
    </div>
  );
}

export default App;
