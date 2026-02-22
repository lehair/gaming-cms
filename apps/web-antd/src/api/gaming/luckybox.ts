import { requestClient } from '#/api/request';

/**
 * Lấy danh sách quà tặng trong Luckybox
 */
export const getLuckyBoxList = (params?: any) => {
  return requestClient.get('/gaming/luckybox/list', { params });
};

// Thêm quà mới
export const addLuckyBox = (data: any) => requestClient.post('/gaming/luckybox/add', data);
// Cập nhật tỉ lệ và số lượng
export const updateLuckyBox = (id: number, data: any) => requestClient.put(`/gaming/luckybox/update/${id}`, data);
// Xoá quà
export const deleteLuckyBox = (id: number) => requestClient.delete(`/gaming/luckybox/delete/${id}`);
