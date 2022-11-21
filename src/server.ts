import './util/module-alias';
import { Server } from '@overnightjs/core';
import { Application, json } from 'express';
import { ForecastController } from './controllers/forecast';
import * as database from '@src/database';

export class SetupServer extends Server {
  constructor(private readonly port = 3000) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    this.setupControllers();
    await this.setupDatabase();
  }

  private setupExpress(): void {
    this.app.use(json());
  }

  private setupControllers(): void {
    const forecastController = new ForecastController();

    this.addControllers([forecastController]);
  }

  private async setupDatabase(): Promise<void> {
    await database.connect();
  }

  public async close(): Promise<void> {
    await database.close();
  }

  public getApp(): Application {
    return this.app;
  }
}
