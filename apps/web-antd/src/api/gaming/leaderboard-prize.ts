import { requestClient } from '#/api/request';

export const getLeaderboardPrizeList = (params?: any) => {
  return requestClient.get('/gaming/leaderboard-prize/list', { params });
};

export const addLeaderboardPrize = (data: any) => {
  return requestClient.post('/gaming/leaderboard-prize/add', data);
};

export const updateLeaderboardPrize = (id: number | string, data: any) => {
  return requestClient.put(`/gaming/leaderboard-prize/update/${id}`, data);
};

export const deleteLeaderboardPrize = (id: number | string) => {
  return requestClient.delete(`/gaming/leaderboard-prize/delete/${id}`);
};
