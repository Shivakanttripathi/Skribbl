import { Player } from './Player';
import { Game } from './Game';
import { RoomSettings, GameState } from '../types';
import { Server, Socket } from 'socket.io';

export class Room {
  public id: string;
  public players: Player[] = [];
  public settings: RoomSettings = {
    maxPlayers: 8,
    rounds: 3,
    drawTime: 60,
    isPublic: true,
  };
  public game: Game;
  private io: Server;

  constructor(id: string, io: Server) {
    this.id = id;
    this.io = io;
    this.game = new Game({
      onStateChange: (state) => this.broadcastState(state),
      onTimerTick: (time) => this.io.to(this.id).emit('timer_tick', time),
      onWordSelection: (words) => this.sendWordOptions(words),
      onWordSelected: (word) => this.broadcastWord(word),
      onRoundEnd: () => this.io.to(this.id).emit('round_end', this.getLeaderboard()),
    });
  }

  private broadcastWord(word: string) {
    const drawer = this.players.find(p => p.isDrawing);
    // Send full word only to drawer
    if (drawer) {
      this.io.to(drawer.id).emit('current_word', word);
    }
    // Send masked word (spaces preserve) to others
    const masked = word.split('').map(char => char === ' ' ? ' ' : '_').join('');
    this.io.to(this.id).except(drawer?.id || '').emit('current_word', masked);
  }

  public addPlayer(player: Player) {
    if (this.players.length === 0) {
      player.isHost = true;
    }
    this.players.push(player);
    player.roomId = this.id;
    this.broadcastPlayers();
  }

  public removePlayer(playerId: string) {
    const index = this.players.findIndex(p => p.id === playerId);
    if (index !== -1) {
      const removedPlayer = this.players.splice(index, 1)[0];
      if (removedPlayer.isHost && this.players.length > 0) {
        this.players[0].isHost = true;
      }
      this.broadcastPlayers();
    }
  }

  public start() {
    this.game.start(this.players);
  }

  private broadcastPlayers() {
    this.io.to(this.id).emit('player_list', this.players.map(p => p.toJSON()));
  }

  private broadcastState(state: GameState) {
    this.io.to(this.id).emit('game_state', {
      state,
      currentRound: this.game.currentRound,
      totalRounds: this.game.totalRounds,
    });
    this.broadcastPlayers(); // Ensure isDrawing and other flags are synced
  }

  private sendWordOptions(words: string[]) {
    const drawer = this.players.find(p => p.isDrawing);
    if (drawer) {
      this.io.to(drawer.id).emit('word_options', words);
    }
  }

  private getLeaderboard() {
    return this.players
      .map(p => ({ username: p.username, score: p.score }))
      .sort((a, b) => b.score - a.score);
  }

  public getPlayer(id: string): Player | undefined {
    return this.players.find(p => p.id === id);
  }
}
