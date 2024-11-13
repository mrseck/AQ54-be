// scheduler.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SensorService } from '../sensor.service';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private lastExecutionTime: Date | null = null;
  private executionCount = 0;

  constructor(private readonly sensorService: SensorService) {}

  // Exécuter immédiatement au démarrage de l'application
  async onModuleInit() {
    console.log('Initializing scheduler service...');
    await this.fetchSensorData();
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  // ou pour 30 minutes : @Cron('0 */30 * * * *')
  async fetchSensorData() {
    const startTime = Date.now();
    this.executionCount++;

    try {
      console.log(`
=== Scheduled Execution #${this.executionCount} ===
Time: ${new Date().toISOString()}
Last execution: ${this.lastExecutionTime ? this.lastExecutionTime.toISOString() : 'Never'}
`);

      await Promise.all([
        this.sensorService.getCurrentValues('SMART188'),
        this.sensorService.getCurrentValues('SMART189')
      ]);

      const duration = Date.now() - startTime;
      this.lastExecutionTime = new Date();

      console.log(`
Execution completed successfully
Duration: ${duration}ms
=== End of Execution #${this.executionCount} ===
`);
    } catch (error) {
      console.error(`
!!! Execution #${this.executionCount} Failed !!!
Error: ${error.message}
Stack: ${error.stack}
`);
    }
  }

  // Méthode pour obtenir les statistiques
  getStats() {
    return {
      executionCount: this.executionCount,
      lastExecutionTime: this.lastExecutionTime,
      isRunning: true
    };
  }
}