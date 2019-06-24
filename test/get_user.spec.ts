import * as request from 'supertest';
import { Client } from 'pg';


describe('/v1/users/:id', () => {

  let client: Client;

  const host = process.env.AUTH_HOST;
  const port = process.env.AUTH_PORT;
  const protocol = process.env.AUTH_USE_HTTPS ? 'https' : 'http';

  async function delete_data() {
    await client.query('delete from user_statistics');
    await client.query('delete from user_data');
    await client.query('delete from "user"');
  }


  beforeEach(async () => {
    client = new Client({
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      user: process.env.AUTH_DB_USERNAME,
      password: process.env.AUTH_DB_PASSWORD,
      database: process.env.AUTH_DB_DATABASE,
    });

    await client.connect();

    await delete_data();
  });

  afterEach(async () => {
    await client.end();
  });

  describe('Success response', () => {

    beforeEach(async () => {
      await client.query(
        `insert into "user"(id, username, password, salt, locked, "createdAt", "updatedAt")
        values('id', 'username', 'password', 'salt', false, current_timestamp, current_timestamp)`,
      );

      await client.query(
        `insert into user_data(id, "userId", firstname, lastname, mail)
         values('dataId', 'id', 'firstname', 'lastname', 'mail')`,
      );

      await client.query(
        `insert into user_statistics(id, "userId", "countSignin", "countSignout", "lastLogin", "lastLogout")
        values('statId', 'id', 3, 4, current_timestamp, current_timestamp)`,
      );

    });

    afterEach(async () => {
      await delete_data();
    });

    it('should return the status code 200, if a user has been found', (done) => {
      request(`${protocol}://${host}:${port}`)
        .get('/v1/users/id')
        .set('request-id', 'req-id')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, data) => {
          if (err) return done(err);
          done();
        });
    });

    it('should return the user data without password and salt', (done) => {
      request(`${protocol}://${host}:${port}`)
        .get('/v1/users/id')
        .set('request-id', 'req-id')
        .set('Accept', 'application/json')
        .end((err, data) => {
          if (err) return done(err);

          expect(data.body.errors.length).toEqual(0);
          expect(data.body.data.id).toEqual('id');
          expect(data.body.data.username).toEqual('username');
          expect(data.body.data.locked).toEqual(false);
          expect(data.body.data.createdAt).toBeDefined();
          expect(data.body.data.updatedAt).toBeDefined();
          expect(data.body.data.password).toBeUndefined();
          expect(data.body.data.salt).toBeUndefined();

          done();
        });
    });

    it('should not return the user statistics and user data if not requested espacially', (done) => {
      request(`${protocol}://${host}:${port}`)
        .get('/v1/users/id')
        .set('request-id', 'req-id')
        .set('Accept', 'application/json')
        .end((err, data) => {
          if (err) return done(err);

          expect(data.body.data.statistics).toBeUndefined();
          expect(data.body.data.userData).toBeUndefined();

          done();
        });
    });

    it('should return the user data if requested through query parameter', (done) => {
      request(`${protocol}://${host}:${port}`)
        .get('/v1/users/id?include=userdata')
        .set('request-id', 'req-id')
        .set('Accept', 'application/json')
        .end((err, data) => {
          if (err) return done(err);

          expect(data.body.data.userData).not.toBeUndefined();
          expect(data.body.data.userData.id).toEqual('dataId');
          expect(data.body.data.userData.profilePicture).toBeNull();
          expect(data.body.data.userData.firstname).toEqual('firstname');
          expect(data.body.data.userData.lastname).toEqual('lastname');
          expect(data.body.data.userData.mail).toEqual('mail');

          done();
        });
    });

    it('should return the user statistics, if requested through query parameter', (done) => {
      request(`${protocol}://${host}:${port}`)
        .get('/v1/users/id?include=statistics')
        .set('request-id', 'reg-id')
        .set('Accept', 'application/json')
        .end((err, data) => {
          if (err) return done(err);

          expect(data.body.data.statistics).not.toBeUndefined();
          expect(data.body.data.statistics.id).toEqual('statId');
          expect(data.body.data.statistics.countSignin).toEqual(3);
          expect(data.body.data.statistics.countSignout).toEqual(4);
          expect(data.body.data.statistics.lastLogin).toBeDefined();
          expect(data.body.data.statistics.lastLogout).toBeDefined();

          done();
        });
    });

  });

  describe('Not found error response', () => {

    it('should return the status code 404, if user was not found in the database', (done) => {
      request(`${protocol}://${host}:${port}`)
        .get('/v1/users/id')
        .set('request-id', 'id')
        .set('Accept', 'application/json')
        .expect(404)
        .end((err, data) => {
          if (err) return done(err);
          done();
        });
    });

    it('should return an UserNotFoundError in the errors array', (done) => {
      request(`${protocol}://${host}:${port}`)
        .get('/v1/users/id')
        .set('request-id', 'req-id')
        .set('Accept', 'application/json')
        .end((err, data) => {
          if (err) return done(err);

          expect(data.body.data).toBeNull();
          expect(data.body.errors.length).toEqual(1);
          expect(data.body.errors[0].type).toEqual('UserNotFoundError');
          expect(data.body.errors[0].message).toBeDefined();

          done();
        });
    });

  });


});
