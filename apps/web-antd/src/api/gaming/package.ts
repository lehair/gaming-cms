import { requestClient } from '#/api/request';

const BASE_URL = 'http://localhost:3000/api';

export const getPackageList = (params?: any) => {
  return requestClient.get(`${BASE_URL}/packages/list`, { params });
};

export const addPackage = (data: any) => {
  return requestClient.post(`${BASE_URL}/packages/add`, data);
};

export const updatePackage = (id: number, data: any) => {
  return requestClient.put(`${BASE_URL}/packages/update/${id}`, data);
};

export const deletePackage = (id: number) => {
  return requestClient.delete(`${BASE_URL}/packages/delete/${id}`);
};
