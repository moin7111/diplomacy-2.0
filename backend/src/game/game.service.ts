import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGameDto, JoinGameDto, ChooseNationDto, ALLOWED_NATIONS } from './dto/game.dto';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

  constructor(private readonly prisma: PrismaService) {}

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async createGame(userId: string, dto: CreateGameDto) {
    let room_code = this.generateRoomCode();
    
    // Quick retry just in case it exists computationally
    while (await this.prisma.game.findUnique({ where: { room_code } })) {
      room_code = this.generateRoomCode();
    }

    const game = await this.prisma.game.create({
      data: {
        name: dto.name,
        host_id: userId,
        config: dto.config,
        room_code,
        players: {
          create: {
            user_id: userId,
            nation: '', // No nation yet
            is_ready: false,
          }
        }
      },
      include: {
        players: true
      }
    });

    this.logger.log(`Game created: ${game.id} (Room: ${room_code}) by user ${userId}`);

    return game;
  }

  async joinGame(userId: string, dto: JoinGameDto) {
    const game = await this.prisma.game.findUnique({
      where: { room_code: dto.room_code },
      include: { players: true }
    });

    if (!game) {
      throw new NotFoundException('Game not found with this room code');
    }

    if (game.status !== 'lobby') {
      throw new BadRequestException('Game is already active or finished');
    }

    if (game.players.length >= 7) {
      throw new BadRequestException('Game is already full (maximum 7 players)');
    }

    const alreadyJoined = game.players.find(p => p.user_id === userId);
    if (alreadyJoined) {
      throw new BadRequestException('You are already in this game');
    }

    await this.prisma.gamePlayer.create({
      data: {
        game_id: game.id,
        user_id: userId,
        nation: '', // Must pick nation later
        is_ready: false,
      }
    });

    return this.getGameDetails(game.id);
  }

  async getMyGames(userId: string) {
    return this.prisma.game.findMany({
      where: {
        players: { some: { user_id: userId } }
      },
      orderBy: { created_at: 'desc' },
      include: {
        host: { select: { username: true } },
        players: { include: { user: { select: { username: true } } } }
      }
    });
  }

  async getGameDetails(gameId: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: {
        host: { select: { username: true } },
        players: {
          include: { user: { select: { username: true, avatar_id: true } } }
        }
      }
    });

    if (!game) throw new NotFoundException('Game not found');
    return game;
  }

  async getGameHistory(gameId: string) {
    return this.prisma.gameState.findMany({
      where: { game_id: gameId },
      orderBy: { created_at: 'asc' }
    });
  }

  async chooseNation(gameId: string, userId: string, dto: ChooseNationDto) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: { players: true }
    });

    if (!game) throw new NotFoundException('Game not found');

    const playerRecord = game.players.find(p => p.user_id === userId);
    if (!playerRecord) throw new ForbiddenException('You are not a player in this game');

    if (game.status !== 'lobby') throw new BadRequestException('Cannot change nation after game started');

    const nationTaken = game.players.find(p => p.nation === dto.nation && p.user_id !== userId);
    if (nationTaken) throw new BadRequestException(`Nation ${dto.nation} is already taken`);

    await this.prisma.gamePlayer.update({
      where: {
        game_id_user_id: { game_id: gameId, user_id: userId }
      },
      data: { nation: dto.nation }
    });

    return this.getGameDetails(gameId);
  }

  async toggleReady(gameId: string, userId: string) {
    const player = await this.prisma.gamePlayer.findUnique({
      where: { game_id_user_id: { game_id: gameId, user_id: userId } }
    });

    if (!player) throw new ForbiddenException('You are not in this game');

    await this.prisma.gamePlayer.update({
      where: { game_id_user_id: { game_id: gameId, user_id: userId } },
      data: { is_ready: !player.is_ready }
    });

    return this.getGameDetails(gameId);
  }

  async startGame(gameId: string, userId: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: { players: true }
    });

    if (!game) throw new NotFoundException('Game not found');
    
    if (game.host_id !== userId) {
      throw new ForbiddenException('Only the host can start the game');
    }

    if (game.status !== 'lobby') {
      throw new BadRequestException('Game is already active');
    }

    const allReady = game.players.every(p => p.is_ready);
    if (!allReady) {
      throw new BadRequestException('Not all players are ready');
    }

    const unassignedNations = game.players.filter(p => !ALLOWED_NATIONS.includes(p.nation));
    if (unassignedNations.length > 0) {
      throw new BadRequestException('All players must choose a valid nation before starting');
    }

    const updatedGame = await this.prisma.game.update({
      where: { id: gameId },
      data: { status: 'active' },
      include: { players: true }
    });

    this.logger.log(`Game started: ${game.id} by host ${userId}`);

    return updatedGame;
  }
}
