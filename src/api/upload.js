import api from '../app/services/api';

export const uploadCSV = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/inventory/batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
