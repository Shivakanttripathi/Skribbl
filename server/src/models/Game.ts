import { GameState } from '../types';
import { Player } from './Player';
import { getRandomWords } from '../utils/WordList';

export class Game {
  public state: GameState = 'LOBBY';
  public currentRound: number = 0;
  public totalRounds: number = 3;
  public drawTime: number = 60; // seconds
  public timeLeft: number = 0;
  public currentWord: string = '';
  public drawerIndex: number = -1;
  public players: Player[] = [];
  
  private timerInterval: NodeJS.Timeout | null = null;
  private onStateChange: (state: GameState) => void;
  private onTimerTick: (time: number) => void;
  private onWordSelection: (words: string[]) => void;
  private onWordSelected: (word: string) => void;
  private onRoundEnd: () => void;

  constructor(
    callbacks: {
      onStateChange: (state: GameState) => void;
      onTimerTick: (time: number) => void;
      onWordSelection: (words: string[]) => void;
      onWordSelected: (word: string) => void;
      onRoundEnd: () => void;
    }
  ) {
    this.onStateChange = callbacks.onStateChange;
    this.onTimerTick = callbacks.onTimerTick;
    this.onWordSelection = callbacks.onWordSelection;
    this.onWordSelected = callbacks.onWordSelected;
    this.onRoundEnd = callbacks.onRoundEnd;
  }

  public setSettings(rounds: number, drawTime: number) {
    this.totalRounds = rounds;
    this.drawTime = drawTime;
  }

  public start(players: Player[]) {
    this.players = players;
    this.currentRound = 1;
    this.drawerIndex = 0;
    this.startRound();
  }

  private startRound() {
    this.state = 'WORD_SELECTION';
    
    // Reset player states for the turn
    this.players.forEach(p => {
      p.isDrawing = false;
      p.hasGuessed = false;
    });

    const currentDrawer = this.players[this.drawerIndex];
    if (currentDrawer) {
      currentDrawer.isDrawing = true;
      const options = getRandomWords(3);
      this.onWordSelection(options);
    }

    this.onStateChange(this.state);
  }

  public selectWord(word: string) {
    this.currentWord = word.toLowerCase();
    this.state = 'DRAWING';
    this.timeLeft = this.drawTime;
    this.onStateChange(this.state);
    this.onWordSelected(this.currentWord);
    this.startTimer();
  }

  private startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.onTimerTick(this.timeLeft);

      if (this.timeLeft <= 0 || this.allGuessed()) {
        this.endTurn();
      }
    }, 1000);
  }

  private allGuessed(): boolean {
    const guessers = this.players.filter(p => !p.isDrawing);
    return guessers.length > 0 && guessers.every(p => p.hasGuessed);
  }

  public checkGuess(player: Player, guess: string): boolean {
    if (this.state !== 'DRAWING' || player.isDrawing || player.hasGuessed) return false;

    if (guess.toLowerCase().trim() === this.currentWord) {
      player.hasGuessed = true;
      // Scoring logic: earlier guesses get more points
      const points = Math.ceil((this.timeLeft / this.drawTime) * 100) + 50;
      player.addPoints(points);
      
      // Drawer also gets some points if someone guesses
      const drawer = this.players[this.drawerIndex];
      if (drawer) drawer.addPoints(25);
      
      return true;
    }
    return false;
  }

  private endTurn() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.state = 'ROUND_END';
    this.onStateChange(this.state);
    this.onRoundEnd();

    setTimeout(() => {
      this.nextTurn();
    }, 5000);
  }

  private nextTurn() {
    this.drawerIndex++;
    if (this.drawerIndex >= this.players.length) {
      this.drawerIndex = 0;
      this.currentRound++;
    }

    if (this.currentRound > this.totalRounds) {
      this.endGame();
    } else {
      this.startRound();
    }
  }

  private endGame() {
    this.state = 'GAME_OVER';
    this.onStateChange(this.state);
  }
}
