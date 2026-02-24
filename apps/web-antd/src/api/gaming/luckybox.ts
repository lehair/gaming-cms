import { requestClient } from '#/api/request';
const BASE_URL = 'http://localhost:3000/api';

/**
 * Lấy danh sách quà tặng trong Luckybox
 */
export const getLuckyBoxList = (params?: any) => {
  return requestClient.get(`${BASE_URL}/gaming/luckybox/list`, { params });
};

// Thêm quà mới
export const addLuckyBox = (data: any) => requestClient.post(`${BASE_URL}/gaming/luckybox/add`, data);
// Cập nhật tỉ lệ và số lượng
export const updateLuckyBox = (id: number, data: any) => requestClient.put(`${BASE_URL}/gaming/luckybox/update/${id}`, data);
// Xoá quà
export const deleteLuckyBox = (id: number) => requestClient.delete(`${BASE_URL}/gaming/luckybox/delete/${id}`);
