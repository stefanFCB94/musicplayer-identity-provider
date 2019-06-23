import { Request } from 'express';

export function get_request_id(req: Request): string {
  return req.header('request-id');
}
