import axiosInstance from './axiosInstance';

export const getCalendarEvents = async (params = {}) => {
  const response = await axiosInstance.get('/calendar/events', { params });
  return response.data;
};
