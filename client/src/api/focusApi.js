import axiosInstance from './axiosInstance';

export const getFocusSessions = async () => {
  const response = await axiosInstance.get('/focus-sessions');
  return response.data;
};

export const createFocusSession = async (sessionData) => {
  const response = await axiosInstance.post('/focus-sessions', sessionData);
  return response.data;
};

export const getFocusStats = async () => {
  const response = await axiosInstance.get('/focus-sessions/stats');
  return response.data;
};

export const deleteFocusSession = async (id) => {
  const response = await axiosInstance.delete(`/focus-sessions/${id}`);
  return response.data;
};
