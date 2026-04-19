import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { GameGateway } from './game.gateway';

@Injectable()
export class TimerService {
  private readonly logger = new Logger(TimerService.name);
  
  private activeTimers = new Map<string, {
    timeLeft: number;
    intervalId: NodeJS.Timeout;
    phase: string;
    isPaused: boolean;
  }>();

  constructor(
    @Inject(forwardRef(() => GameGateway))
    private readonly gameGateway: GameGateway
  ) {}

  startTimer(gameId: string, phase: string, durationSeconds: number) {
    this.logger.log(`Starting timer for game ${gameId}, phase ${phase}, duration ${durationSeconds}s`);
    
    this.stopTimer(gameId);

    const intervalId = setInterval(() => {
      const state = this.activeTimers.get(gameId);
      if (!state) return;
      
      if (state.isPaused) return;

      if (state.timeLeft <= 0) {
        this.stopTimer(gameId);
        this.logger.log(`Timer expired for game ${gameId}`);
        this.gameGateway.server.to(gameId).emit('timer-expired', { gameId, phase });
        this.resolveTurn(gameId);
        return;
      }

      state.timeLeft -= 1;
      this.gameGateway.server.to(gameId).emit('timer-tick', { 
        gameId, 
        phase, 
        timeLeft: state.timeLeft 
      });
      
    }, 1000);

    this.activeTimers.set(gameId, {
      timeLeft: durationSeconds,
      intervalId,
      phase,
      isPaused: false
    });
  }

  stopTimer(gameId: string) {
    const state = this.activeTimers.get(gameId);
    if (state && state.intervalId) {
      clearInterval(state.intervalId);
      this.activeTimers.delete(gameId);
    }
  }

  pauseTimer(gameId: string) {
    const state = this.activeTimers.get(gameId);
    if (state) {
      state.isPaused = true;
      this.gameGateway.server.to(gameId).emit('timer-paused', { gameId });
    }
  }

  resumeTimer(gameId: string) {
    const state = this.activeTimers.get(gameId);
    if (state && state.isPaused) {
      state.isPaused = false;
      this.gameGateway.server.to(gameId).emit('timer-resumed', { gameId });
    }
  }

  private resolveTurn(gameId: string) {
    // Dummy hook for logic layer integration later
    this.logger.log(`Dummy resolveTurn called for ${gameId}. Game logic will process orders here.`);
  }
}
