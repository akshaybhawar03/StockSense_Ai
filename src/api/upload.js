import api from './axios';

export const uploadCSV = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/inventory/batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
