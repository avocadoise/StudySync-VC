import axiosInstance from './axiosInstance';

export const getStudyPlans = async (params = {}) => {
  const response = await axiosInstance.get('/study-plans', { params });
  return response.data;
};

export const createStudyPlan = async (planData) => {
  const response = await axiosInstance.post('/study-plans', planData);
  return response.data;
};

export const updateStudyPlan = async (id, planData) => {
  const response = await axiosInstance.put(`/study-plans/${id}`, planData);
  return response.data;
};

export const updateStudyPlanStatus = async (id, status) => {
  const response = await axiosInstance.patch(`/study-plans/${id}/status`, { status });
  return response.data;
};

export const deleteStudyPlan = async (id) => {
  const response = await axiosInstance.delete(`/study-plans/${id}`);
  return response.data;
};
