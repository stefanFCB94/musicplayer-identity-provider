import { Request, Response } from 'express';
import { log_debug, log_error } from '@musicplayer/logger-module';
import { FindConditions, FindManyOptions, Like, MoreThanOrEqual, LessThanOrEqual, MoreThan } from 'typeorm';

import { DatabaseService } from '../db/database.service';
import { UserIncludeQueryParams } from '../enums/UserIncludeQueryParams';
import { User } from '../db/models/User';

import { send_data } from '../helpers/send_data';
import { send_error } from '../helpers/send_error';
import { get_request_id } from '../helpers/get_request_id';
import { UnsupportedError } from '../errors/Unsupported.error';


export function get_users(database: DatabaseService) {
  return async function (req: Request, res: Response) {
    const reqId = get_request_id(req);

    log_debug(reqId, 'Get all users from the database');

    // Get pagination information
    const skip = req.query.skipCount || 0;
    const take = req.query.maxItems || 25;
    log_debug(reqId, `Get all users from user ${skip} to user ${take}`);

    // Get how much details are wanted
    const include: string[] = req.query.include || [];
    log_debug(reqId, `Following additional sights are wanted: ${JSON.stringify(include)}`);

    // Get query options for the include sights
    const relations: string[] = [];
    if (include.includes(UserIncludeQueryParams.STATISTICS)) relations.push('statistics');
    if (include.includes(UserIncludeQueryParams.USER_DATA)) relations.push('userData');

    // Get filter
    const where: FindConditions<User> = {};
    if (req.query.locked === 'true') where.locked = true;
    if (req.query.locked === 'false') where.locked = false;
    if (req.query.username) where.username = Like(req.query.username.replace(/\*/g, '%'));
    if (req.query.createdAfter) where.createdAt = MoreThanOrEqual(new Date(req.query.createdAfter));
    if (req.query.createdBefore) where.createdAt = LessThanOrEqual(new Date(req.query.createBefore));
    if (req.query.updatedAfter) where.updatedAt = MoreThanOrEqual(new Date(req.query.updatedAfter));
    if (req.query.updatedBefore) where.updatedAt = LessThanOrEqual(new Date(req.query.updatedBefore));

    log_debug(reqId, `The following filter are set: ${JSON.stringify(where)}`);

    // Get sorting
    let order: { [key: string]: string } = { username: 'ASC' };
    if (typeof req.query.orderBy === 'string') {
      const [key, direction] = req.query.orderBy.split(' ');
      order =  {};
      order[key] = direction;
    }

    log_debug(reqId, `The following order should be used: ${JSON.stringify(order)}`);

    try {
      const userRepository = database.getConnection().getRepository(User);
      const users = await userRepository.find({ where, relations, skip, take, order } as FindManyOptions<User>);

      // Remove password and salt from the user data
      // Important to make sure, that the password hashes are not returned to the client
      const ret = users.map((user) => {
        delete user.password;
        delete user.salt;
      });

      log_debug(reqId, `Users successfully loaded, found results: ${users.length}`);
      res.status(200).json(send_data(users));
    } catch (err) {
      log_error(reqId, err);

      const error = new UnsupportedError('Unsupported error requesting users');
      res.status(500).json(send_error(error));
    }

  };
}
