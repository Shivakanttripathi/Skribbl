import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { Send, Timer, Star, LogOut, Trash2, Palette } from 'lucide-react';
import Canvas, { CanvasHandle } from './Canvas';
import confetti from 'canvas-confetti';

interface GameRoomProps {
  socket: Socket;
  roomId: string;
  username: string;
  initialPlayers: any[];
}

const GameRoom: React.FC<GameRoomProps> = ({ socket, roomId, username, initialPlayers }) => {
  const [players, setPlayers] = useState<any[]>(initialPlayers);
  const [gameState, setGameState] = useState<any>({ state: 'LOBBY', currentRound: 0, totalRounds: 3 });
  const [timeLeft, setTimeLeft] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputGuess, setInputGuess] = useState('');
  const [wordOptions, setWordOptions] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const canvasRef = useRef<CanvasHandle>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const me = players.find(p => p.id === socket.id);
  const isHost = me?.isHost;
  const isDrawing = me?.isDrawing;

  useEffect(() => {
    socket.on('player_list', setPlayers);
    socket.on('game_state', setGameState);
    socket.on('timer_tick', setTimeLeft);
    socket.on('word_options', setWordOptions);
    socket.on('current_word', setCurrentWord);
    socket.on('chat_message', (msg) => {
      setMessages(prev => [...prev, msg]);
      if (msg.type === 'correct') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    });

    return () => {
      socket.off('player_list');
      socket.off('game_state');
      socket.off('timer_tick');
      socket.off('word_options');
      socket.off('chat_message');
    };
  }, [socket]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartGame = () => {
    socket.emit('start_game');
  };

  const handleSelectWord = (word: string) => {
    socket.emit('select_word', word);
    setWordOptions([]);
    setCurrentWord(word);
  };

  const handleSendGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputGuess.trim()) return;
    socket.emit('guess', inputGuess);
    setInputGuess('');
  };

  const handleClear = () => {
    canvasRef.current?.clear();
  };

  return (
    <div className="flex-col gap-md" style={{ width: '100%', height: '90vh', padding: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 320px', gap: '20px', height: '100%' }}>
        
        {/* Sidebar: Players */}
        <div className="glass flex-col gap-md" style={{ padding: '24px' }}>
          <div className="items-center gap-sm" style={{ padding: '12px', background: 'rgba(30,41,59,0.5)', borderRadius: '12px' }}>
            <Star className="text-yellow-400" size={20} />
            <span style={{ fontWeight: 'bold' }}>Room: {roomId}</span>
          </div>
          
          <div className="flex-col gap-sm" style={{ flex: 1, overflowY: 'auto' }}>
            {players.map((p) => (
              <div 
                key={p.id} 
                className="items-center"
                style={{ 
                  padding: '12px', 
                  borderRadius: '12px', 
                  background: p.id === socket.id ? 'rgba(99,102,241,0.2)' : 'rgba(30,41,59,0.3)',
                  borderLeft: p.id === socket.id ? '4px solid var(--primary)' : '4px solid transparent'
                }}
              >
                <div className="flex-col" style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    {p.username} {p.isHost && '👑'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.score} pts</span>
                </div>
                {p.isDrawing && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--secondary)' }}></div>}
              </div>
            ))}
          </div>

          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: 'auto', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}
            className="items-center gap-sm justify-center"
          >
            <LogOut size={16} /> Leave
          </button>
        </div>

        {/* Main Area */}
        <div className="flex-col gap-md">
          <header className="glass items-center" style={{ padding: '0 24px', height: '70px', display: 'flex' }}>
            <div className="items-center" style={{ display: 'flex', gap: '20px', minWidth: '200px' }}>
              <div className="items-center gap-sm" style={{ display: 'flex', background: 'rgba(30,41,59,0.7)', padding: '8px 16px', borderRadius: '50px' }}>
                <Timer size={18} style={{ color: 'var(--secondary)' }} />
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', fontFamily: 'monospace' }}>{timeLeft}s</span>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                Round <span style={{ color: 'white', fontWeight: 'bold' }}>{gameState.currentRound}/{gameState.totalRounds}</span>
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ 
                fontSize: currentWord.length > 10 ? '1.2rem' : '1.8rem', 
                fontWeight: 800, 
                letterSpacing: '4px', 
                color: 'white',
                textTransform: 'uppercase',
                textAlign: 'center'
              }}>
                {isDrawing ? currentWord : currentWord.split('').map(char => char === ' ' ? ' ' : '_').join(' ')}
              </div>
            </div>

            <div style={{ minWidth: '100px', display: 'flex', justifyContent: 'flex-end' }}>
              {gameState.state === 'LOBBY' && isHost && (
                <button onClick={handleStartGame} className="btn-primary" style={{ padding: '8px 24px', width: 'auto' }}>Start</button>
              )}
              {isDrawing && gameState.state === 'DRAWING' && (
                <button onClick={handleClear} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </header>

          <main className="glass" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {gameState.state === 'WORD_SELECTION' && isDrawing && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(2, 6, 23, 0.95)', zIndex: 100 }} className="flex-col items-center justify-center gap-lg">
                <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Choose a Word</h2>
                <div style={{ display: 'flex', gap: '16px' }}>
                  {wordOptions.map(word => (
                    <button 
                      key={word}
                      onClick={() => handleSelectWord(word)}
                      className="btn-primary"
                      style={{ width: 'auto', padding: '16px 32px' }}
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {gameState.state === 'WORD_SELECTION' && !isDrawing && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(2, 6, 23, 0.7)', zIndex: 100 }} className="flex-col items-center justify-center">
                <div className="icon-box">
                  <Palette size={48} className="animate-pulse" />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Drawer is choosing a word...</h2>
              </div>
            )}

            {gameState.state === 'ROUND_END' && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(99, 102, 241, 0.9)', zIndex: 100 }} className="flex-col items-center justify-center gap-md">
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Round Ended!</h2>
                <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>The word was: {currentWord}</div>
                <p style={{ marginTop: '20px' }}>Prepare for the next round...</p>
              </div>
            )}

            <Canvas ref={canvasRef} socket={socket} isDrawing={!!isDrawing && gameState.state === 'DRAWING'} />
          </main>
        </div>

        {/* Chat Area */}
        <div className="glass flex-col" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)' }}>
            <h3 className="items-center gap-sm" style={{ fontSize: '1rem', fontWeight: 700 }}>
              <Send size={16} style={{ color: 'var(--primary)' }} /> Chat & Guesses
            </h3>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                style={{ 
                  padding: '10px', 
                  borderRadius: '10px', 
                  fontSize: '0.85rem',
                  background: msg.type === 'correct' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(30, 41, 59, 0.4)',
                  borderLeft: msg.type === 'correct' ? '3px solid var(--correct)' : '3px solid transparent'
                }}
              >
                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{msg.senderName}: </span>
                <span style={{ color: msg.type === 'correct' ? 'var(--correct)' : 'white' }}>{msg.text}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendGuess} style={{ padding: '20px', borderTop: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="input-field"
                style={{ flex: 1, padding: '12px' }}
                placeholder={isDrawing ? "You're drawing..." : "Type guess..."}
                disabled={isDrawing}
                value={inputGuess}
                onChange={(e) => setInputGuess(e.target.value)}
              />
              <button type="submit" disabled={isDrawing} className="btn-primary" style={{ width: '50px', padding: '0' }}>
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default GameRoom;
