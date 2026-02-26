import { requestClient } from '#/api/request';

const BASE_URL = 'http://localhost:3000/api';

// Hàm gọi API lấy danh sách User
export const getUserList = (params: any) => {
  return requestClient.get(`${BASE_URL}/users/list`, { params });
};

// Hàm cập nhật thông tin User
export const updateUser = (id: string, data: any) => {
  return requestClient.put(`${BASE_URL}/users/update/${id}`, data);
};

// Hàm Ban/Unban User
export const banUser = (id: string, status: string) => {
  return requestClient.put(`${BASE_URL}/users/ban/${id}`, { status });
};
