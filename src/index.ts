import { SetupServer } from './server';
import config from 'config';

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async (): Promise<void> => {
  const server = new SetupServer(config.get('App.port'));

  await server.init();
  server.start();
})();
