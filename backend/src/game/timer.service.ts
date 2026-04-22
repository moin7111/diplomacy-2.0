import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { PrismaService } from '../prisma/prisma.service';

import { resolveOrders, getAllStartingUnits, territories } from '@diplomacy/game-logic';

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
    private readonly gameGateway: GameGateway,
    private readonly prisma: PrismaService
  ) {}

  startTimer(gameId: string, phase: string, durationSeconds: number) {
    this.logger.log(`Starting timer for game ${gameId}, phase ${phase}, duration ${durationSeconds}s`);
    
    this.stopTimer(gameId);

    const intervalId = setInterval(async () => {
      const state = this.activeTimers.get(gameId);
      if (!state) return;
      if (state.isPaused) return;

      if (state.timeLeft <= 0) {
        this.stopTimer(gameId);
        this.logger.log(`Timer expired for game ${gameId}`);
        this.gameGateway.server.to(gameId).emit('timer-expired', { gameId, phase });
        await this.resolveTurn(gameId);
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

  /**
   * Called when timer expires OR everyone submitted their orders.
   * Collects orders, calls resolveOrders(), updates GameState.
   */
  async resolveTurn(gameId: string) {
    this.logger.log(`Resolving turn for game ${gameId}...`);
    try {
        const game = await this.prisma.game.findUnique({ where: { id: gameId }});
        if (!game) return;

        const activeState = await this.prisma.gameState.findFirst({
           where: { game_id: gameId },
           orderBy: { created_at: 'desc' }
        });
        
        let currentUnits = activeState ? (activeState.board_state as any) : getAllStartingUnits();

        const playerOrders = await this.prisma.playerOrder.findMany({
            where: {
                game_id: gameId,
                phase: game.current_phase,
                year: game.current_year
            }
        });

        const allOrders = playerOrders.flatMap(po => po.order_data as any[]);

        // Adjudicate via Logic Engine
        const results = resolveOrders(allOrders, currentUnits, territories);

        const nextStateUnits = this.applyResolution(currentUnits, results);
        const nextPhase = game.current_phase === 'FRÜHLING' ? 'HERBST' : 'FRÜHLING';
        const nextYear = game.current_phase === 'FRÜHLING' ? game.current_year : game.current_year + 1;

        await this.prisma.gameState.create({
            data: {
                game_id: gameId,
                phase: nextPhase,
                year: nextYear,
                board_state: nextStateUnits
            }
        });

        await this.prisma.game.update({
            where: { id: gameId },
            data: { current_phase: nextPhase, current_year: nextYear }
        });

        this.logger.log(`Turn resolved. New phase: ${nextPhase} ${nextYear}.`);

        this.gameGateway.server.to(gameId).emit('game-state-update', {
            phase: nextPhase,
            year: nextYear,
            boardState: nextStateUnits,
            resolutionResults: results
        });
    } catch(e) {
        this.logger.error(`Error resolving turn: ${e.message}`, e.stack);
    }
  }

  private applyResolution(currentUnits: any, results: any): any[] {
     const nextUnits = JSON.parse(JSON.stringify(currentUnits));
     
     // Quick bypass if results is not an array (e.g. object map instead)
     const resArray = Array.isArray(results) ? results : [results];
     
     for (const res of resArray) {
         if (res.type === 'move' && res.success) {
            const unit = nextUnits.find((u: any) => u.territory === res.order.unit.split('-')[0] || u.id === res.order.unit);
            if (unit) {
                unit.territory = res.order.target.split('-')[0];
                if (res.order.target.includes('-')) {
                    unit.coast = res.order.target.split('-')[1];
                }
            }
         }
     }
     
     return nextUnits;
  }
}
