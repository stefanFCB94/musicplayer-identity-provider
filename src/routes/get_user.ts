import { Request, Response } from 'express';
import { DatabaseService } from '../db/database.service';
import { get_request_id } from '../helpers/get_request_id';
import { log_debug, log_error } from '@musicplayer/logger-module';
import { UserIncludeQueryParams } from '../enums/UserIncludeQueryParams';
import { User } from '../db/models/User';
import { UserNotFoundError } from '../errors/UserNotFound.error';
import { send_error } from '../helpers/send_error';
import { send_data } from '../helpers/send_data';
import { UnsupportedError } from '../errors/Unsupported.error';


export function get_user(database: DatabaseService) {
  return async function (req: Request, res: Response) {
    const reqId = get_request_id(req);

    log_debug(reqId, 'Get information about a single user');

    // Get id of the requested user
    const id = req.params.id;
    log_debug(reqId, `User with following id is requested: ${id}`);

    // Get how much details are requested to the user
    const include: string[] = req.query.include || [];
    log_debug(reqId, `Following additional sights are requested: ${JSON.stringify(include)}`);

    // Get the query options for the included sights / relations
    const relations: string[] = [];
    if (include.includes(UserIncludeQueryParams.STATISTICS)) relations.push('statistics');
    if (include.includes(UserIncludeQueryParams.USER_DATA)) relations.push('userData');

    try {
      const userRepository = database.getConnection().getRepository(User);
      const user = await userRepository.findOne({ relations, where: { id } });

      if (!user) {
        const error = new UserNotFoundError(`User with id "${id}" cannot be found in database`);
        log_debug(reqId, error);

        return res.status(404).json(send_error(error));
      }

      log_debug(reqId, 'User found in the database, now return found data without password and salt');


      // Remove password and salt from the return data
      // Data security concern
      delete user.password;
      delete user.salt;

      res.status(200).json(send_data(user));
    } catch (err) {
      log_error(reqId, err);

      const error = new UnsupportedError('Unknown error by querying user data');
      res.status(500).json(send_error(error));
    }
  };
}
