import { requestClient } from '#/api/request';
const BASE_URL = 'http://localhost:3000/api';
export const getLeaderboardPrizeList = (params?: any) => {
  return requestClient.get(`${BASE_URL}/gaming/leaderboard-prize/list`, { params });
};

export const addLeaderboardPrize = (data: any) => {
  return requestClient.post(`${BASE_URL}/gaming/leaderboard-prize/add`, data);
};

export const updateLeaderboardPrize = (id: number | string, data: any) => {
  return requestClient.put(`${BASE_URL}/gaming/leaderboard-prize/update/${id}`, data);
};

export const deleteLeaderboardPrize = (id: number | string) => {
  return requestClient.delete(`${BASE_URL}/gaming/leaderboard-prize/delete/${id}`);
};
