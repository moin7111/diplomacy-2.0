import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { PrismaService } from '../prisma/prisma.service';

import { 
    resolveOrders, 
    getAllStartingUnits, 
    territories,
    resolveRetreats,
    resolveBuilds,
    calculateBuilds,
    checkVictory,
    getHomeSupplyCenters,
    getSupplyCenters
} from '@diplomacy/game-logic';

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

  async resolveTurn(gameId: string) {
    this.logger.log(`Resolving turn for game ${gameId}...`);
    try {
        const game = await this.prisma.game.findUnique({ where: { id: gameId }});
        if (!game) return;

        const activeState = await this.prisma.gameState.findFirst({
           where: { game_id: gameId },
           orderBy: { created_at: 'desc' }
        });
        
        let boardState = activeState ? (activeState.board_state as any) : this.getInitialBoardState();
        let currentUnits = boardState.units || boardState; 
        if (!Array.isArray(currentUnits)) currentUnits = [];
        
        const playerOrders = await this.prisma.playerOrder.findMany({
            where: { game_id: gameId, phase: game.current_phase, year: game.current_year }
        });
        const allOrders = playerOrders.flatMap((po: any) => po.order_data as any[]);

        let nextPhase = '';
        let nextYear = game.current_year;
        let nextUnits = [...currentUnits];
        let dislodgedUnits: any[] = [];
        let resolutionResults = null;

        if (game.current_phase === 'FRÜHLING' || game.current_phase === 'HERBST') {
            const results = resolveOrders(allOrders, currentUnits, territories);
            resolutionResults = results;
            
            nextUnits = this.applyResolution(currentUnits, results);
            dislodgedUnits = results.dislodged.map(d => {
                 const u = currentUnits.find((cu: any) => cu.id === d.unit || cu.territory === d.unit);
                 return { id: d.unit, territory: u?.territory, nation: u?.nation, type: u?.type };
            }).filter(u => u.territory);

            if (dislodgedUnits.length > 0) {
                nextPhase = game.current_phase === 'FRÜHLING' ? 'RÜCKZUG_FRÜHLING' : 'RÜCKZUG_HERBST';
            } else {
                if (game.current_phase === 'FRÜHLING') {
                    nextPhase = 'HERBST';
                } else {
                    boardState.controlledSCs = this.updateSupplyCenters(boardState.controlledSCs || {}, nextUnits);
                    nextPhase = this.checkWinterOrSpring(boardState.controlledSCs, nextUnits);
                }
            }
        } 
        else if (game.current_phase === 'RÜCKZUG_FRÜHLING' || game.current_phase === 'RÜCKZUG_HERBST') {
            const prevResults = boardState.resolutionResults || { moves: [], bounces: [], dislodged: [] };
            const retreatRes = resolveRetreats(allOrders, boardState.dislodged || [], prevResults, currentUnits);
            resolutionResults = retreatRes;

            nextUnits = this.applyRetreats(currentUnits, retreatRes, boardState.dislodged || []);
            dislodgedUnits = [];

            if (game.current_phase === 'RÜCKZUG_FRÜHLING') {
                nextPhase = 'HERBST';
            } else {
                boardState.controlledSCs = this.updateSupplyCenters(boardState.controlledSCs || {}, nextUnits);
                nextPhase = this.checkWinterOrSpring(boardState.controlledSCs, nextUnits);
            }
        }
        else if (game.current_phase === 'WINTER') {
            const nations = Object.keys(boardState.controlledSCs || {});
            const buildCalcs = nations.map(n => calculateBuilds(n, boardState.controlledSCs[n] || [], currentUnits, currentUnits));
            
            const buildRes = resolveBuilds(allOrders, buildCalcs, currentUnits);
            resolutionResults = buildRes;
            
            nextUnits = this.applyBuilds(currentUnits, buildRes);
            nextPhase = 'FRÜHLING';
            nextYear++;
        }

        let gameOverInfo = null;
        if (boardState.controlledSCs) {
            const vic = checkVictory(boardState.controlledSCs);
            if (vic.gameOver) {
                gameOverInfo = vic;
                nextPhase = 'BEENDET';
            }
        }

        const finalBoardState = {
            units: nextUnits,
            dislodged: dislodgedUnits,
            controlledSCs: boardState.controlledSCs || {},
            resolutionResults
        };

        await this.prisma.gameState.create({
            data: { game_id: gameId, phase: nextPhase, year: nextYear, board_state: finalBoardState as any }
        });

        await this.prisma.game.update({
            where: { id: gameId },
            data: { 
                current_phase: nextPhase, 
                current_year: nextYear,
                status: gameOverInfo ? 'finished' : 'active'
            }
        });

        this.logger.log(`Turn resolved. New phase: ${nextPhase} ${nextYear}.`);

        this.gameGateway.server.to(gameId).emit('game-state-update', {
            phase: nextPhase,
            year: nextYear,
            boardState: finalBoardState,
        });

        if (gameOverInfo) {
            this.gameGateway.server.to(gameId).emit('game-over', gameOverInfo);
        }

        if (nextPhase !== 'BEENDET') {
            const nextDuration = nextPhase.includes('RÜCKZUG') ? 180 : (nextPhase === 'WINTER' ? 300 : (nextPhase === 'HERBST' ? 420 : 600));
            this.startTimer(gameId, nextPhase, nextDuration);
            this.gameGateway.server.to(gameId).emit('phase-change', { phase: nextPhase, duration: nextDuration });
        }

    } catch(e) {
        this.logger.error(`Error resolving turn: ${e.message}`, e.stack);
    }
  }

  private getInitialBoardState() {
      const units = getAllStartingUnits();
      const controlledSCs: Record<string, string[]> = {
          'England': getHomeSupplyCenters('England').map(t => t.id),
          'France': getHomeSupplyCenters('France').map(t => t.id),
          'Germany': getHomeSupplyCenters('Germany').map(t => t.id),
          'Italy': getHomeSupplyCenters('Italy').map(t => t.id),
          'Austria': getHomeSupplyCenters('Austria').map(t => t.id),
          'Russia': getHomeSupplyCenters('Russia').map(t => t.id),
          'Turkey': getHomeSupplyCenters('Turkey').map(t => t.id),
      };
      return { units, dislodged: [], controlledSCs, resolutionResults: null };
  }

  private updateSupplyCenters(currentSCs: Record<string, string[]>, units: any[]) {
      const nextSCs = JSON.parse(JSON.stringify(currentSCs));
      const allSCTerritories = getSupplyCenters().map(t => t.id);
      
      for (const unit of units) {
          if (allSCTerritories.includes(unit.territory)) {
              for (const nation in nextSCs) {
                  nextSCs[nation] = nextSCs[nation].filter((sc: string) => sc !== unit.territory);
              }
              if (!nextSCs[unit.nation]) nextSCs[unit.nation] = [];
              nextSCs[unit.nation].push(unit.territory);
          }
      }
      return nextSCs;
  }

  private checkWinterOrSpring(controlledSCs: Record<string, string[]>, units: any[]) {
      let needsWinter = false;
      const nations = Object.keys(controlledSCs);
      for (const nation of nations) {
          const nationUnits = units.filter(u => u.nation === nation);
          const calc = calculateBuilds(nation, controlledSCs[nation] || [], nationUnits, units);
          if (calc.diff !== 0) {
              needsWinter = true;
              break;
          }
      }
      return needsWinter ? 'WINTER' : 'FRÜHLING';
  }

  private applyResolution(currentUnits: any[], results: any): any[] {
     const nextUnits = JSON.parse(JSON.stringify(currentUnits));
     if (results.moves) {
         for (const move of results.moves) {
             if (move.success) {
                 const unit = nextUnits.find((u: any) => u.id === move.unit || u.territory === move.unit);
                 if (unit) {
                     unit.territory = move.to;
                 }
             }
         }
         for (const dis of results.dislodged) {
             const idx = nextUnits.findIndex((u: any) => u.id === dis.unit || u.territory === dis.unit);
             if (idx > -1) nextUnits.splice(idx, 1);
         }
     }
     return nextUnits;
  }

  private applyRetreats(currentUnits: any[], retreatRes: any, dislodged: any[]): any[] {
      const nextUnits = JSON.parse(JSON.stringify(currentUnits));
      if (retreatRes.relocated) {
          for (const rel of retreatRes.relocated) {
              const dis = dislodged.find(d => d.territory === rel.from || d.id === rel.unit);
              if (dis) {
                  nextUnits.push({
                      id: dis.id,
                      nation: dis.nation,
                      type: dis.type,
                      territory: rel.to
                  });
              }
          }
      }
      return nextUnits;
  }

  private applyBuilds(currentUnits: any[], buildRes: any): any[] {
      const nextUnits = JSON.parse(JSON.stringify(currentUnits));
      if (buildRes.builds) {
          for (const build of buildRes.builds) {
              nextUnits.push({
                  id: `${build.territory}-${Date.now()}`,
                  nation: build.nation,
                  type: build.unitType,
                  territory: build.territory,
                  coast: build.coast
              });
          }
      }
      if (buildRes.disbands) {
          for (const disband of buildRes.disbands) {
              const idx = nextUnits.findIndex((u: any) => u.territory === disband.territory && u.nation === disband.nation);
              if (idx > -1) nextUnits.splice(idx, 1);
          }
      }
      return nextUnits;
  }
}
