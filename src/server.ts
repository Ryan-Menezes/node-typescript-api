import './util/module-alias';
import { Server } from '@overnightjs/core';
import { Application, json } from 'express';
import { ForecastController } from '@src/controllers/forecast';
import { BeachesController } from '@src/controllers/beaches';
import { UsersController } from '@src/controllers/users';
import * as database from '@src/database';
import apiSchema from '@src/api-schema.json';
import cors from 'cors';
import logger from '@src/logger';
import swaggerUi from 'swagger-ui-express';
import * as OpenApiValidator from 'express-openapi-validator';
import { OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';
import { apiErrorValidator } from '@src/middlewares/api-error-validator';
import { BeachMongoDBRepository } from '@src/repositories/beachMongoDBRepository';
import { UserMongoDBRepository } from '@src/repositories/userMongoDBRepository';

export class SetupServer extends Server {
  constructor(private readonly port = 3000) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    this.docsSetup();
    this.setupControllers();
    await this.setupDatabase();
    this.setupErrorHandlers();
  }

  private setupExpress(): void {
    this.app.use(json());
    this.app.use(
      cors({
        origin: '*',
      })
    );
  }

  private setupErrorHandlers(): void {
    this.app.use(apiErrorValidator);
  }

  private setupControllers(): void {
    const beachMongoDBRepository = new BeachMongoDBRepository();
    const userMongoDBRepository = new UserMongoDBRepository();

    const forecastController = new ForecastController(beachMongoDBRepository);
    const beachesController = new BeachesController(beachMongoDBRepository);
    const usersController = new UsersController(userMongoDBRepository);

    this.addControllers([
      forecastController,
      beachesController,
      usersController,
    ]);
  }

  private async setupDatabase(): Promise<void> {
    await database.connect();
  }

  private docsSetup(): void {
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiSchema));
    this.app.use(
      OpenApiValidator.middleware({
        apiSpec: apiSchema as OpenAPIV3.Document,
        validateRequests: true,
        validateResponses: true,
      })
    );
  }

  public start(): void {
    this.app.listen(this.port, () => {
      logger.info(`Server listening on port: ${this.port}`);
    });
  }

  public async close(): Promise<void> {
    await database.close();
  }

  public getApp(): Application {
    return this.app;
  }
}
