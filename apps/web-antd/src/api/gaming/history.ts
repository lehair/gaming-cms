import { requestClient } from '#/api/request';
const BASE_URL = 'http://localhost:3000/api';

export const getScoreHistoryList = (params: any) => {
  return requestClient.get(`${BASE_URL}/gaming/history/scores`, { params }); // Sửa URL khớp với Router Backend của bạn
};

export const getRewardHistoryList = (params: any) => {
  return requestClient.get(`${BASE_URL}/gaming/history/rewards`, { params }); // Sửa URL khớp với Router Backend của bạn
};
