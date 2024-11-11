import { 
  Controller, 
  Post, 
  Body, 
  UseGuards,
  ValidationPipe,
  HttpStatus, 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { SensorService } from './sensor.service';
import { SensorQueryDto } from './dtos/sensor-query.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from 'src/auth/roles/roles.enum';
import { SensorData } from './entities/sensor.entity';

@ApiTags('Sensors')
@Controller('sensors')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class SensorController {
  constructor(private readonly sensorService: SensorService) {}

  @Post('data')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Récupérer les données agrégées des capteurs' })
  @ApiBody({ type: SensorQueryDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Données agrégées récupérées avec succès',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Horodatage de l\'agrégation',
          },
          temperature: {
            type: 'number',
            description: 'Température moyenne sur la période',
          },
          humidity: {
            type: 'number',
            description: 'Humidité moyenne sur la période',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé - Token JWT manquant ou invalide',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Accès interdit - Rôle utilisateur insuffisant',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Requête invalide - Paramètres manquants ou incorrects',
  })
  async getSensorData(
    @Body(new ValidationPipe({ transform: true })) 
    query: SensorQueryDto
  ) {
    return this.sensorService.aggregateData(query);
  }

  @Post('sync')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Synchroniser les données avec l\'API Airgino',
    description: 'Réservé aux administrateurs. Récupère et stocke les nouvelles données des capteurs.'
  })
  @ApiBody({ type: SensorQueryDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Synchronisation réussie',
    type: [SensorData],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non autorisé - Token JWT manquant ou invalide',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Accès interdit - Nécessite les droits administrateur',
  })
  @ApiResponse({
    status: HttpStatus.BAD_GATEWAY,
    description: 'Erreur lors de la communication avec l\'API Airgino',
  })
  async syncSensorData(
    @Body(new ValidationPipe({ transform: true })) 
    query: SensorQueryDto
  ) {
    return this.sensorService.syncData(
      query.sensorId,
      query.startDate,
      query.endDate,
    );
  }
}