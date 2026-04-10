import { PlayerData } from '../types';

export class Player {
  public id: string;
  public username: string;
  public score: number = 0;
  public isHost: boolean = false;
  public isReady: boolean = false;
  public isDrawing: boolean = false;
  public hasGuessed: boolean = false;
  public roomId: string | null = null;

  constructor(id: string, username: string) {
    this.id = id;
    this.username = username;
  }

  public resetScore(): void {
    this.score = 0;
  }

  public addPoints(points: number): void {
    this.score += points;
  }

  public toJSON(): PlayerData {
    return {
      id: this.id,
      username: this.username,
      score: this.score,
      isHost: this.isHost,
      isReady: this.isReady,
      isDrawing: this.isDrawing,
      hasGuessed: this.hasGuessed,
    };
  }
}
