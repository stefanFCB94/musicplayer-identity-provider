import { Logger, open_service_file, log_info, close_service_file, log_debug } from '@musicplayer/logger-module';
import { Server } from './server';


let logger: Logger;
let server: Server;

function startLogger() {
  let useLoggerHttps = false;
  if (process.env.LOGGER_USE_HTTPS) {
    useLoggerHttps = true;
  }

  let loggerPort: number;
  if (useLoggerHttps) {
    loggerPort = +process.env.LOGGER_HTTPS_PORT || 443;
  } else {
    loggerPort = +process.env.LOGGER_HTTP_PORT || 80;
  }

  const loggerHost = process.env.LOGGER_HOST || 'logger';
  const loggerServiceName = process.env.LOGGER_SERVICE_NAME || 'Identity-Provider';

  logger = new Logger(useLoggerHttps, loggerHost, loggerPort, 1, loggerServiceName);
  logger.start();

  open_service_file();
}

async function startServer() {
  server = new Server(logger);
  await server.init();
  await server.start();
}



async function start() {
  startLogger();
  log_info('STARTUP', 'Service is starting');

  await startServer();
  log_debug('STARTUP', 'HTTP-Server started');
}

async function stop() {
  log_info('SHUTDOWN', 'Service is shutting down');

  await server.stop();
  log_debug('SHTUDOWN', 'HTTP-Server shutdown');

  close_service_file();
  logger.stop();
}


start();
