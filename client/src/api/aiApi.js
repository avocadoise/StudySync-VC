import axiosInstance from './axiosInstance';

export const generateReviewer = async (data) => {
  const response = await axiosInstance.post('/ai/generate-reviewer', data);
  return response.data;
};

export const getReviewers = async () => {
  const response = await axiosInstance.get('/ai/reviewers');
  return response.data;
};

export const getReviewerById = async (id) => {
  const response = await axiosInstance.get(`/ai/reviewers/${id}`);
  return response.data;
};

export const deleteReviewer = async (id) => {
  const response = await axiosInstance.delete(`/ai/reviewers/${id}`);
  return response.data;
};

export const getStudyRecommendation = async () => {
  const response = await axiosInstance.post('/ai/study-recommendation');
  return response.data;
};

export const validateInputWithAI = async (data) => {
  const response = await axiosInstance.post('/ai/validate-input', data);
  return response.data;
};
