import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { Palette, Users, Shield } from 'lucide-react';

interface LobbyProps {
  socket: Socket;
  username: string;
  setUsername: (name: string) => void;
}

const Lobby: React.FC<LobbyProps> = ({ socket, username, setUsername }) => {
  const [targetRoomId, setTargetRoomId] = useState('');

  const handleCreateRoom = () => {
    if (!username) return alert('Please enter a username');
    socket.emit('create_room', { username });
  };

  const handleJoinRoom = () => {
    if (!username) return alert('Please enter a username');
    if (!targetRoomId) return alert('Please enter a room code');
    socket.emit('join_room', { roomId: targetRoomId, username });
  };

  return (
    <div className="glass lobby-card flex-col items-center">
      <div className="flex-col items-center gap-sm text-center">
        <div className="icon-box">
          <Palette size={48} color="white" />
        </div>
        <h1 className="title-xl text-gradient">Skribbl.io</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Multiplayer Drawing & Guessing</p>
      </div>

      <div className="flex-col gap-lg" style={{ width: '100%' }}>
        <div className="form-group">
          <label className="label">Nickname</label>
          <input
            type="text"
            className="input-field"
            placeholder="Choose a cool name..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <button onClick={handleCreateRoom} className="btn-primary flex-col items-center justify-center">
          <div className="items-center gap-sm">
            <Shield size={20} />
            Create Private Room
          </div>
        </button>

        <div className="divider"></div>

        <div className="flex-col gap-md">
          <div className="form-group">
            <label className="label">Room Code</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. 5a2b3c..."
              value={targetRoomId}
              onChange={(e) => setTargetRoomId(e.target.value)}
            />
          </div>
          <button onClick={handleJoinRoom} className="btn-secondary items-center justify-center gap-sm">
            <Users size={20} />
            Join Room
          </button>
        </div>
      </div>
      
      <div style={{ marginTop: '40px' }} className="text-center">
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          "The less you know, the more you have to draw."
        </p>
      </div>
    </div>
  );
};

export default Lobby;
