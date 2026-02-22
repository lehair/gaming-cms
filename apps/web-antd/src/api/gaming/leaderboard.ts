import { requestClient } from '#/api/request';

// Hàm gọi API lấy danh sách Leaderboard
export const getLeaderboardList = (params: any) => {
  return requestClient.get('/gaming/leaderboard/list', { params });
};

// (Tùy chọn) Hàm xóa bảng xếp hạng thủ công nếu cần
export const resetLeaderboard = (gameId: string, seasonId: number) => {
  return requestClient.post('/gaming/leaderboard/reset', { gameId, seasonId });
};
