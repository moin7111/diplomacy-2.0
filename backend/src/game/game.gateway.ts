import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  OnGatewayConnection, 
  OnGatewayDisconnect, 
  ConnectedSocket, 
  MessageBody
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger, forwardRef, Inject } from '@nestjs/common';
import { TimerService } from './timer.service';
import { PrismaService } from '../prisma/prisma.service';

import { validateOrder, getAllStartingUnits, territories } from '@diplomacy/game-logic';

@WebSocketGateway({ namespace: '/game', cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  
  private readonly logger = new Logger(GameGateway.name);
  
  // Mapping: gameId -> { userId -> Set<socketId> }
  private activeConnections = new Map<string, Map<string, Set<string>>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => TimerService))
    private readonly timerService: TimerService
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.query.token as string || client.handshake.headers.authorization?.split(' ')[1];
      if (!token) throw new Error('No token provided');

      if (!process.env.JWT_SECRET) {
          throw new Error('FATAL: JWT_SECRET environment variable is missing!');
      }

      const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET
      });
      client.data.user = payload;
      this.logger.log(`WS Client connected: ${client.id} (User: ${payload.sub})`);
    } catch (err) {
      this.logger.warn(`WS Connection rejected: ${err.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`WS Client disconnected: ${client.id}`);
    const userId = client.data.user?.sub;
    if (userId) {
       for (const [gameId, users] of this.activeConnections.entries()) {
           if (users.has(userId)) {
               users.get(userId)?.delete(client.id);
           }
       }
    }
  }

  @SubscribeMessage('join-game')
  handleJoinGame(@ConnectedSocket() client: Socket, @MessageBody() data: { gameId: string }) {
    client.join(data.gameId);
    
    // Track connection mapping for B7 private chat
    const userId = client.data.user.sub;
    if (!this.activeConnections.has(data.gameId)) {
        this.activeConnections.set(data.gameId, new Map());
    }
    const gameConns = this.activeConnections.get(data.gameId)!;
    if (!gameConns.has(userId)) {
        gameConns.set(userId, new Set());
    }
    gameConns.get(userId)!.add(client.id);

    this.logger.log(`User ${client.data.user?.username} joined room ${data.gameId}`);
    this.server.to(data.gameId).emit('player-joined', { username: client.data.user?.username });
  }

  @SubscribeMessage('leave-game')
  handleLeaveGame(@ConnectedSocket() client: Socket, @MessageBody() data: { gameId: string }) {
    client.leave(data.gameId);
    this.server.to(data.gameId).emit('player-left', { username: client.data.user?.username });
  }

  // B6: Befehls-API
  @SubscribeMessage('submit-orders')
  async handleSubmitOrders(@ConnectedSocket() client: Socket, @MessageBody() data: { gameId: string, orders: any[] }) {
    const userId = client.data.user.sub;
    this.logger.log(`Orders submitted for game ${data.gameId} by ${client.data.user?.username}`);
    
    try {
       const activeState = await this.prisma.gameState.findFirst({
           where: { game_id: data.gameId },
           orderBy: { created_at: 'desc' }
       });
       
       const currentUnits = activeState ? (activeState.board_state as any) : getAllStartingUnits();

       // Validate each order against Game Logic
       for (const order of data.orders) {
           const val = validateOrder(order, currentUnits, territories);
           if (!val.valid) {
               throw new Error(`Invalid order for ${order.unit}: ${val.error}`);
           }
       }

       const game = await this.prisma.game.findUnique({ where: { id: data.gameId }});
       if (!game) throw new Error('Game not found');

       await this.prisma.playerOrder.create({
           data: {
               game_id: data.gameId,
               user_id: userId,
               phase: game.current_phase,
               year: game.current_year,
               order_data: data.orders
           }
       });

       this.server.to(data.gameId).emit('orders-received', { user: client.data.user?.username });

       // Auto-Resolve check
       const playersInGame = await this.prisma.gamePlayer.count({ where: { game_id: data.gameId }});
       const submittedCount = await this.prisma.playerOrder.count({
           where: {
               game_id: data.gameId,
               phase: game.current_phase,
               year: game.current_year
           }
       });

       if (submittedCount >= playersInGame && playersInGame > 0) {
           this.logger.log(`All players submitted. Triggering auto-resolve for ${data.gameId}`);
           this.timerService.stopTimer(data.gameId);
           await this.timerService.resolveTurn(data.gameId);
       }
    } catch(e) {
       this.logger.error(`Error saving orders: ${e.message}`);
       client.emit('error', { message: e.message || 'Invalid orders' });
    }
  }

  @SubscribeMessage('submit-retreats')
  async handleSubmitRetreats(@ConnectedSocket() client: Socket, @MessageBody() data: { gameId: string, orders: any[] }) {
      await this.saveOrdersWithoutDeepValidation(client, data, ['RÜCKZUG_FRÜHLING', 'RÜCKZUG_HERBST']);
  }

  @SubscribeMessage('submit-builds')
  async handleSubmitBuilds(@ConnectedSocket() client: Socket, @MessageBody() data: { gameId: string, orders: any[] }) {
      await this.saveOrdersWithoutDeepValidation(client, data, ['WINTER']);
  }

  private async saveOrdersWithoutDeepValidation(client: Socket, data: { gameId: string, orders: any[] }, allowedPhases: string[]) {
    const userId = client.data.user.sub;
    try {
       const game = await this.prisma.game.findUnique({ where: { id: data.gameId }});
       if (!game) throw new Error('Game not found');

       if (!allowedPhases.includes(game.current_phase)) {
           throw new Error(`Invalid phase for these orders. Current phase: ${game.current_phase}`);
       }

       await this.prisma.playerOrder.create({
           data: {
               game_id: data.gameId,
               user_id: userId,
               phase: game.current_phase,
               year: game.current_year,
               order_data: data.orders
           }
       });

       this.server.to(data.gameId).emit('orders-received', { user: client.data.user?.username });

       const playersInGame = await this.prisma.gamePlayer.count({ where: { game_id: data.gameId }});
       const submittedCount = await this.prisma.playerOrder.count({
           where: { game_id: data.gameId, phase: game.current_phase, year: game.current_year }
       });

       if (submittedCount >= playersInGame && playersInGame > 0) {
           this.logger.log(`All players submitted. Triggering auto-resolve for ${data.gameId}`);
           this.timerService.stopTimer(data.gameId);
           await this.timerService.resolveTurn(data.gameId);
       }
    } catch(e) {
       this.logger.error(`Error saving orders: ${e.message}`);
       client.emit('error', { message: e.message || 'Invalid orders' });
    }
  }

  // B7: Chat-Service
  @SubscribeMessage('send-message')
  async handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() data: { gameId: string, recipientId?: string, content: string }) {
      const userId = client.data.user.sub;
      
      const chatMsg = await this.prisma.chatMessage.create({
          data: {
              game_id: data.gameId,
              sender_id: userId,
              recipient_id: data.recipientId || null,
              content: data.content
          },
          include: { sender: { select: { username: true } }, recipient: { select: { username: true } } }
      });

      if (!data.recipientId) {
          // Broadcast to everyone in the lobby
          this.server.to(data.gameId).emit('receive-message', chatMsg);
      } else {
          // 1:1 Targeted chat: Sender and particular Receiver
          const gameMap = this.activeConnections.get(data.gameId);
          if (gameMap && gameMap.has(userId)) {
              gameMap.get(userId)?.forEach(sockId => this.server.to(sockId).emit('receive-message', chatMsg));
          }
          if (gameMap && data.recipientId && gameMap.has(data.recipientId)) {
              gameMap.get(data.recipientId)?.forEach(sockId => this.server.to(sockId).emit('receive-message', chatMsg));
          }
      }
  }

  @SubscribeMessage('get-history')
  async handleGetHistory(@ConnectedSocket() client: Socket, @MessageBody() data: { gameId: string }) {
      const userId = client.data.user.sub;
      
      const messages = await this.prisma.chatMessage.findMany({
          where: {
              game_id: data.gameId,
              OR: [
                  { recipient_id: null },
                  { recipient_id: userId },
                  { sender_id: userId }
              ]
          },
          orderBy: { sent_at: 'desc' },
          take: 50,
          include: { sender: { select: { username: true } }, recipient: { select: { username: true } } }
      });

      client.emit('chat-history', messages.reverse());
  }

  @SubscribeMessage('start-phase')
  handleStartPhase(@ConnectedSocket() client: Socket, @MessageBody() data: { gameId: string, phase: string }) {
    let duration = 600;
    if (data.phase === 'Fall') duration = 420;
    if (data.phase === 'Retreat') duration = 180;
    if (data.phase === 'Winter') duration = 300;

    this.timerService.startTimer(data.gameId, data.phase, duration);
    this.server.to(data.gameId).emit('phase-change', { phase: data.phase, duration });
  }

  @SubscribeMessage('pause-timer')
  handlePauseTimer(@ConnectedSocket() client: Socket, @MessageBody() data: { gameId: string }) {
    this.timerService.pauseTimer(data.gameId);
  }

  @SubscribeMessage('resume-timer')
  handleResumeTimer(@ConnectedSocket() client: Socket, @MessageBody() data: { gameId: string }) {
    this.timerService.resumeTimer(data.gameId);
  }
}
