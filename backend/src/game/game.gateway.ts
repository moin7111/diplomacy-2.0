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

@WebSocketGateway({ namespace: '/game', cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  
  private readonly logger = new Logger(GameGateway.name);

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

      const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET || 'diplomacy2-dev-secret-super-secure'
      });
      client.data.user = payload;
      this.logger.log(`WS Client connected: ${client.id} (User: ${payload.username})`);
    } catch (err) {
      this.logger.warn(`WS Connection rejected: ${err.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`WS Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-game')
  handleJoinGame(@ConnectedSocket() client: Socket, @MessageBody() data: { gameId: string }) {
    client.join(data.gameId);
    this.logger.log(`User ${client.data.user?.username} joined room ${data.gameId}`);
    this.server.to(data.gameId).emit('player-joined', { username: client.data.user?.username });
  }

  @SubscribeMessage('leave-game')
  handleLeaveGame(@ConnectedSocket() client: Socket, @MessageBody() data: { gameId: string }) {
    client.leave(data.gameId);
    this.server.to(data.gameId).emit('player-left', { username: client.data.user?.username });
  }

  @SubscribeMessage('submit-orders')
  async handleSubmitOrders(@ConnectedSocket() client: Socket, @MessageBody() data: { gameId: string, orders: any[] }) {
    this.logger.log(`Orders submitted for game ${data.gameId} by ${client.data.user?.username}`);
    
    try {
       // TODO: Deep integration with @diplomacy/game-logic to validate orders
       this.server.to(data.gameId).emit('orders-received', { user: client.data.user?.username });
    } catch(e) {
       client.emit('error', { message: 'Invalid orders' });
    }
  }

  @SubscribeMessage('start-phase')
  handleStartPhase(@ConnectedSocket() client: Socket, @MessageBody() data: { gameId: string, phase: string }) {
    let duration = 600; // default 10min for Spring
    if (data.phase === 'Fall') duration = 420; // 7 min
    if (data.phase === 'Retreat') duration = 180; // 3 min
    if (data.phase === 'Winter') duration = 300; // 5 min

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
