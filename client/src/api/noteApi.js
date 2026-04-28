import axiosInstance from './axiosInstance';

export const getNotes = async (params = {}) => {
  const response = await axiosInstance.get('/notes', { params });
  return response.data;
};

export const createNote = async (noteData) => {
  const response = await axiosInstance.post('/notes', noteData);
  return response.data;
};

export const updateNote = async (id, noteData) => {
  const response = await axiosInstance.put(`/notes/${id}`, noteData);
  return response.data;
};

export const deleteNote = async (id) => {
  const response = await axiosInstance.delete(`/notes/${id}`);
  return response.data;
};
