import axiosInstance from './axiosInstance';

export const getDashboardSummary = async () => {
  const response = await axiosInstance.get('/dashboard/summary');
  return response.data;
};
