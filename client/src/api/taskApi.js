import axiosInstance from './axiosInstance';

export const getTasks = async (params = {}) => {
  const response = await axiosInstance.get('/tasks', { params });
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await axiosInstance.post('/tasks', taskData);
  return response.data;
};

export const updateTask = async (id, taskData) => {
  const response = await axiosInstance.put(`/tasks/${id}`, taskData);
  return response.data;
};

export const updateTaskStatus = async (id, status) => {
  const response = await axiosInstance.patch(`/tasks/${id}/status`, { status });
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await axiosInstance.delete(`/tasks/${id}`);
  return response.data;
};
