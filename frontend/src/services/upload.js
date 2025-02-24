// src/services/upload.js
export const uploadFile = async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadType', type);
  
    try {
      const { data } = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return data.url;
    } catch (err) {
      throw new Error('File upload failed');
    }
  };