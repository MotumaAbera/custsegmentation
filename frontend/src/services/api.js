import axios from 'axios';
import { runClustering as runClientClustering } from './clustering';

// API client
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// LocalStorage key for datasets
const DATASETS_KEY = 'segmentiq_datasets';

// Helper to generate unique IDs
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Helper to read file as text
const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

// Get datasets from localStorage
export const getDatasets = async () => {
  const stored = localStorage.getItem(DATASETS_KEY);
  const datasets = stored ? JSON.parse(stored) : [];
  return { datasets };
};

// Save datasets to localStorage
const saveDatasets = (datasets) => {
  localStorage.setItem(DATASETS_KEY, JSON.stringify(datasets));
};

// Upload dataset (store in localStorage)
export const uploadDataset = async (file) => {
  const csvData = await readFileAsText(file);
  
  // Validate CSV has content
  const lines = csvData.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header row and one data row');
  }
  
  const dataset = {
    id: generateId(),
    name: file.name,
    csv_data: csvData,
    row_count: lines.length - 1,
    uploaded_at: new Date().toISOString(),
  };
  
  // Get existing datasets and add new one
  const { datasets } = await getDatasets();
  datasets.unshift(dataset);
  saveDatasets(datasets);
  
  return dataset;
};

// Delete dataset from localStorage
export const deleteDataset = async (id) => {
  const { datasets } = await getDatasets();
  const filtered = datasets.filter(d => d.id !== id);
  saveDatasets(filtered);
  return { success: true };
};

// Get a single dataset by ID
export const getDatasetById = async (id) => {
  const { datasets } = await getDatasets();
  return datasets.find(d => d.id === id);
};

// Run clustering analysis via Vercel Python API
export const trainClustering = async (params) => {
  // Get the dataset's CSV data
  const dataset = await getDatasetById(params.dataset_id);
  if (!dataset) {
    throw new Error('Dataset not found');
  }
  
  // Call Vercel Python API
  try {
    const response = await api.post('/api/cluster', {
      csv_data: dataset.csv_data,
      linkage_method: params.linkage_method,
      n_clusters: params.n_clusters,
      use_pca: params.use_pca,
      pca_components: params.pca_components,
    }, { timeout: 60000 });
    
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.error || 'Clustering failed');
    }
  } catch (serverError) {
    // Fallback to client-side clustering if API fails
    console.log('Server API error, using client-side clustering:', serverError.message);
    
    const result = await runClientClustering({
      csvData: dataset.csv_data,
      linkageMethod: params.linkage_method,
      nClusters: params.n_clusters,
      usePca: params.use_pca,
      pcaComponents: params.pca_components,
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Clustering failed');
    }
    
    return result;
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/api/health');
    return response.data;
  } catch {
    return { status: 'client-only', message: 'Running in client-only mode' };
  }
};

// These are no longer needed but kept for compatibility
export const getClusteringRuns = async () => ({ runs: [] });
export const getSegments = async () => ({ segments: [] });

export default api;
