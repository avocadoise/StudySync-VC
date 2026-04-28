import axiosInstance from './axiosInstance';

export const getSubjects = async () => {
  const response = await axiosInstance.get('/subjects');
  return response.data;
};

export const createSubject = async (subjectData) => {
  const response = await axiosInstance.post('/subjects', subjectData);
  return response.data;
};

export const updateSubject = async (id, subjectData) => {
  const response = await axiosInstance.put(`/subjects/${id}`, subjectData);
  return response.data;
};

export const deleteSubject = async (id) => {
  const response = await axiosInstance.delete(`/subjects/${id}`);
  return response.data;
};
