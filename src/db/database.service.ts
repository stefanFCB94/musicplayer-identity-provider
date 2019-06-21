import { Connection, createConnection } from 'typeorm';

export class DatabaseService {

  private connection: Connection;


  getConnection(): Connection {
    return this.connection;
  }


  async connect(): Promise<void> {

    const host: string = process.env.DB_HOST || 'db';
    const port: number = +process.env.DB_PORT || 5432;

    const username: string = process.env.AUTH_DB_USERNAME || 'identity';
    const password: string = process.env.AUTH_DB_PASSWORD || 'identity';
    const database: string = process.env.AUTH_DB_DATABASE || 'identity';

    try {

      const dir = __dirname;
      this.connection = await createConnection({
        host,
        port,
        username,
        password,
        database,
        type: 'postgres',
        entities: [
          `${dir}/models/*.js`,
        ],
        synchronize: true,
      });

    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connection) return;

    await this.connection.close();
    this.connection = null;
  }

}
