import { requestClient } from '#/api/request';

export const getScoreHistoryList = (params: any) => {
  return requestClient.get('/gaming/history/scores', { params }); // Sửa URL khớp với Router Backend của bạn
};

export const getRewardHistoryList = (params: any) => {
  return requestClient.get('/gaming/history/rewards', { params }); // Sửa URL khớp với Router Backend của bạn
};
