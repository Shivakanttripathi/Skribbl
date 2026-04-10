export type GameState = 'LOBBY' | 'STARTING' | 'WORD_SELECTION' | 'DRAWING' | 'ROUND_END' | 'GAME_OVER';

export interface PlayerData {
  id: string;
  username: string;
  avatar?: string;
  score: number;
  isHost: boolean;
  isReady: boolean;
  isDrawing: boolean;
  hasGuessed: boolean;
  lastGuessCorrect?: boolean;
}

export interface RoomSettings {
  maxPlayers: number;
  rounds: number;
  drawTime: number;
  isPublic: boolean;
}

export interface DrawData {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  color: string;
  size: number;
  tool: 'brush' | 'eraser';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  type: 'chat' | 'guess' | 'system' | 'correct';
}
