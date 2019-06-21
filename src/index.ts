import { DatabaseService } from './db/database.service';

const service = new DatabaseService();
service.connect().then(() => {
  console.log('connected');
});
