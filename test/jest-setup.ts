import { SetupServer } from '@src/server';
import supertest from 'supertest';

const server: SetupServer = new SetupServer();

beforeAll(async () => {
  await server.init();
  global.testRequest = supertest(server.getApp());
});

afterAll(async () => {
  await server.close();
  console.log('OK');
});
