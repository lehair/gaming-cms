import { requestClient } from '#/api/request';
const BASE_URL = 'http://localhost:3000/api';
// Hàm gọi API lấy danh sách Leaderboard
export const getLeaderboardList = (params: any) => {
  return requestClient.get(`${BASE_URL}/gaming/leaderboard/list`, { params });
};

// (Tùy chọn) Hàm xóa bảng xếp hạng thủ công nếu cần
export const resetLeaderboard = (gameId: string, seasonId: number) => {
  return requestClient.post(`${BASE_URL}/gaming/leaderboard/reset`, { gameId, seasonId });
};
