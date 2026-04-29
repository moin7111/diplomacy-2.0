import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto, JoinGameDto, ChooseNationDto } from './dto/game.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('games')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new game' })
  @ApiResponse({ status: 201, description: 'Game created and room code generated.' })
  create(@Req() req: any, @Body() createGameDto: CreateGameDto) {
    return this.gameService.createGame(req.user.id, createGameDto);
  }

  @Post('join')
  @ApiOperation({ summary: 'Join an existing game via room code' })
  join(@Req() req: any, @Body() joinGameDto: JoinGameDto) {
    return this.gameService.joinGame(req.user.id, joinGameDto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get all active games for the current user' })
  getMyGames(@Req() req: any) {
    return this.gameService.getMyGames(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get game details (players, status, config)' })
  findOne(@Param('id') id: string) {
    return this.gameService.getGameDetails(id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get replay history data for the game' })
  getGameHistory(@Param('id') id: string) {
    return this.gameService.getGameHistory(id);
  }

  @Patch(':id/nation')
  @ApiOperation({ summary: 'Choose a nation in the lobby' })
  chooseNation(@Req() req: any, @Param('id') id: string, @Body() chooseNationDto: ChooseNationDto) {
    return this.gameService.chooseNation(id, req.user.id, chooseNationDto);
  }

  @Patch(':id/ready')
  @ApiOperation({ summary: 'Toggle ready state for the current user' })
  toggleReady(@Req() req: any, @Param('id') id: string) {
    return this.gameService.toggleReady(id, req.user.id);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start the game (host only, all players must be ready)' })
  startGame(@Req() req: any, @Param('id') id: string) {
    return this.gameService.startGame(id, req.user.id);
  }
}
