import axios from 'axios';

const API_BASE = '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const healthCheck = async () => {
  const response = await api.get('/');
  return response.data;
};

export const uploadDataset = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/datasets/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getDatasets = async () => {
  const response = await api.get('/datasets');
  return response.data;
};

export const trainClustering = async (params) => {
  const response = await api.post('/clustering/train', params);
  return response.data;
};

export const getClusteringRuns = async (datasetId) => {
  const response = await api.get(`/clustering/runs/${datasetId}`);
  return response.data;
};

export const getSegments = async (runId) => {
  const response = await api.get(`/clustering/segments/${runId}`);
  return response.data;
};

export const getDendrogramUrl = (runId) => {
  return `${API_BASE}/clustering/dendrogram/${runId}`;
};

export default api;

