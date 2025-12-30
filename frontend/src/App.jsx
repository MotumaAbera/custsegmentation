import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import DatasetList from './components/DatasetList';
import ClusteringConfig from './components/ClusteringConfig';
import Results from './components/Results';
import { uploadDataset, getDatasets, trainClustering } from './services/api';
import { useApi } from './hooks/useApi';
import styles from './App.module.css';

export default function App() {
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [clusteringResult, setClusteringResult] = useState(null);

  const uploadApi = useApi(uploadDataset);
  const datasetsApi = useApi(getDatasets);
  const trainApi = useApi(trainClustering);

  const fetchDatasets = useCallback(async () => {
    try {
      const result = await datasetsApi.execute();
      setDatasets(result.datasets || []);
    } catch (err) {
      console.error('Failed to fetch datasets:', err);
    }
  }, []);

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleUpload = async (file) => {
    try {
      const result = await uploadApi.execute(file);
      await fetchDatasets();
      setSelectedDataset(result);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleTrain = async (params) => {
    try {
      const result = await trainApi.execute(params);
      setClusteringResult(result);
    } catch (err) {
      console.error('Training failed:', err);
    }
  };

  const handleDatasetSelect = (dataset) => {
    setSelectedDataset(dataset);
    setClusteringResult(null);
  };

  return (
    <div className={styles.app}>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.container}>
          <motion.div 
            className={styles.hero}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className={styles.heading}>
              Customer <span className={styles.accent}>Segmentation</span>
            </h1>
            <p className={styles.subtitle}>
              Upload your customer data, configure clustering parameters, and discover 
              meaningful customer segments using hierarchical clustering algorithms.
            </p>
          </motion.div>

          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <FileUpload
                onUpload={handleUpload}
                loading={uploadApi.loading}
                error={uploadApi.error}
                success={!!uploadApi.data}
              />

              <DatasetList
                datasets={datasets}
                selectedId={selectedDataset?.id}
                onSelect={handleDatasetSelect}
              />
            </aside>

            <section className={styles.content}>
              <AnimatePresence mode="wait">
                {selectedDataset ? (
                  <motion.div
                    key="config"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={styles.configSection}
                  >
                    <div className={styles.selectedInfo}>
                      <span className={styles.selectedLabel}>Selected Dataset:</span>
                      <span className={styles.selectedName}>{selectedDataset.name}</span>
                    </div>

                    <ClusteringConfig
                      datasetId={selectedDataset.id}
                      onTrain={handleTrain}
                      loading={trainApi.loading}
                    />

                    {trainApi.error && (
                      <motion.div
                        className={styles.errorBanner}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {trainApi.error}
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={styles.placeholder}
                  >
                    <div className={styles.placeholderIcon}>📊</div>
                    <h3>Select a Dataset</h3>
                    <p>Upload a CSV file or select an existing dataset to start clustering</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>

          <AnimatePresence>
            {clusteringResult && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Results run={clusteringResult} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Powered by Hierarchical Clustering • FastAPI • PostgreSQL</p>
      </footer>
    </div>
  );
}

