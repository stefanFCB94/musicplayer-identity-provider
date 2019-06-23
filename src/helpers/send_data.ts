import { ResponseType } from '../interfaces/ResponseType';

export function send_data(data: any): ResponseType {
  return { data, errors: [] };
}
