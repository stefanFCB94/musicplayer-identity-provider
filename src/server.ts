import * as express from 'express';
import * as helmet from 'helmet';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs-extra';
import { Logger } from '@musicplayer/logger-module';
import { get_users } from './routes/get_users';
import { DatabaseService } from './db/database.service';
import { get_user } from './routes/get_user';

export class Server {

  private app: express.Application;
  private httpServer: http.Server;
  private httpsServer: https.Server;

  private httpPort: number;
  private httpsPort: number;
  private useHttps: boolean;
  private certificate: string;
  private privateKey: string;

  private databaseService: DatabaseService;


  constructor(private logger: Logger) {
    this.httpPort = +process.env.AUTH_HTTP_PORT || 80;
    this.httpsPort = +process.env.AUTH_HTTPS_PORT || 443;

    // If enviroment variable is defined, use HTTPS
    this.useHttps = false;
    if (process.env.AUTH_USE_HTTPS) {
      this.useHttps = true;
    }

    this.certificate = process.env.CERTIFICATE_FILE;
    this.privateKey = process.env.PRIVATE_KEY_FILE;
  }


  public async init() {
    this.databaseService = new DatabaseService();
    await this.databaseService.connect();
  }



  public async start() {
    this.app = express();
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(compression());
    this.app.use(helmet());

    this.initializeApi();

    if (this.useHttps) {
      await this.startHTTPS();
    } else {
      await this.startHTTP();
    }
  }

  public async stop() {
    await this.stopHttp();
    await this.stopHttps();
  }


  private initializeApi() {
    const router = express.Router();
    router.get('/users', get_users(this.databaseService));
    router.get('/users/:id', get_user(this.databaseService));

    this.app.use('/v1', router);
  }


  private async startHTTP() {
    await this.stopHttp();

    return new Promise<void>((resolve) => {
      this.httpServer = http.createServer(this.app);
      this.httpServer.listen(this.httpPort, () => {
        resolve();
      });
    });
  }

  private async startHTTPS() {
    await this.stopHttp();
    await this.stopHttps();

    return new Promise<void>(async (resolve) => {
      const key = await fs.readFile(this.privateKey);
      const cert = await fs.readFile(this.certificate);

      const options: https.ServerOptions = { key, cert };

      await this.startHTTPRedirect();

      this.httpsServer = https.createServer(options, this.app);
      this.httpsServer.listen(this.httpsPort, () => {
        console.log(`Server started on port ${this.httpsPort}`);
        resolve();
      });

    });
  }

  private async startHTTPRedirect() {
    await this.stopHttp();

    const redirectApp = express();
    redirectApp.all('*', (req, res) => {
      const host = req.headers.host.split(':')[0];
      const url = `https://${host}:${this.httpsPort}${req.url}`;
      res.redirect(url);
    });

    this.httpServer = http.createServer(redirectApp);

    return new Promise<void>((resolve) => {
      this.httpServer.listen(this.httpPort, () => {
        console.log(`Server started on port ${this.httpPort}`);
        resolve();
      });
    });
  }


  private stopHttp() {
    return new Promise<void>((resolve) => {
      if (this.httpsServer) {
        this.httpServer.close(() => {

          this.httpServer = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  private stopHttps() {
    return new Promise<void>((resolve) => {
      if (this.httpsServer) {
        this.httpsServer.close(() => {

          this.httpsServer = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

}

