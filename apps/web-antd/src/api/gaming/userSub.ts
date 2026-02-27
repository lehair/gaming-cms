import { requestClient } from '#/api/request';
const BASE_URL = 'http://localhost:3000/api';

export const getUserSubList = (params?: any) => {
  return requestClient.get(`${BASE_URL}/user-subs/list`, { params });
};
