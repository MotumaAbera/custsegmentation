import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import DatasetList from './components/DatasetList';
import ClusteringConfig from './components/ClusteringConfig';
import Results from './components/Results';
import StepIndicator from './components/StepIndicator';
import { ToastContainer } from './components/Toast';
import { uploadDataset, getDatasets, trainClustering, deleteDataset } from './services/api';
import { useApi } from './hooks/useApi';
import { useToast } from './hooks/useToast';
import styles from './App.module.css';

export default function App() {
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [clusteringResult, setClusteringResult] = useState(null);
  const { toasts, removeToast, success, error } = useToast();

  const uploadApi = useApi(uploadDataset);
  const datasetsApi = useApi(getDatasets);
  const trainApi = useApi(trainClustering);
  const deleteApi = useApi(deleteDataset);

  // Calculate current step
  const getCurrentStep = () => {
    if (clusteringResult) return 3;
    if (selectedDataset) return 2;
    return 1;
  };

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
      setClusteringResult(null);
      success(`Dataset "${file.name}" uploaded successfully!`);
    } catch (err) {
      error(uploadApi.error || 'Failed to upload dataset');
    }
  };

  const handleTrain = async (params) => {
    try {
      const result = await trainApi.execute(params);
      setClusteringResult(result);
      success(`Clustering complete! Found ${result.metrics?.n_clusters || params.n_clusters} customer segments.`);
    } catch (err) {
      error(trainApi.error || 'Clustering failed. Please try again.');
    }
  };

  const handleDatasetSelect = (dataset) => {
    setSelectedDataset(dataset);
    setClusteringResult(null);
  };

  const handleReset = () => {
    setClusteringResult(null);
  };

  const handleDeleteDataset = async (datasetId) => {
    try {
      await deleteApi.execute(datasetId);
      // If the deleted dataset was selected, clear selection
      if (selectedDataset?.id === datasetId) {
        setSelectedDataset(null);
        setClusteringResult(null);
      }
      await fetchDatasets();
      success('Dataset deleted successfully');
    } catch (err) {
      error(deleteApi.error || 'Failed to delete dataset');
    }
  };

  return (
    <div className={styles.app}>
      <Header />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
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
              Discover meaningful customer segments using hierarchical clustering. 
              Upload your data, configure the analysis, and visualize the results.
            </p>
          </motion.div>

          <StepIndicator currentStep={getCurrentStep()} />

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
                onDelete={handleDeleteDataset}
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
                      <div className={styles.selectedDetails}>
                        <span className={styles.selectedLabel}>Selected Dataset</span>
                        <span className={styles.selectedName}>{selectedDataset.name}</span>
                      </div>
                      {clusteringResult && (
                        <motion.button
                          className={styles.resetBtn}
                          onClick={handleReset}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Run New Analysis
                        </motion.button>
                      )}
                    </div>

                    {!clusteringResult && (
                      <ClusteringConfig
                        datasetId={selectedDataset.id}
                        onTrain={handleTrain}
                        loading={trainApi.loading}
                      />
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
                    <motion.div 
                      className={styles.placeholderIcon}
                      animate={{ 
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      📊
                    </motion.div>
                    <h3>Get Started</h3>
                    <p>Upload a CSV file or select an existing dataset to begin customer segmentation</p>
                    <div className={styles.placeholderSteps}>
                      <div className={styles.placeholderStep}>
                        <span className={styles.stepNumber}>1</span>
                        <span>Upload Data</span>
                      </div>
                      <div className={styles.placeholderStep}>
                        <span className={styles.stepNumber}>2</span>
                        <span>Configure</span>
                      </div>
                      <div className={styles.placeholderStep}>
                        <span className={styles.stepNumber}>3</span>
                        <span>Analyze</span>
                      </div>
                    </div>
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
        <p>
          <span className={styles.footerBrand}>SegmentIQ</span>
          {' • '}
          Powered by Hierarchical Clustering, FastAPI & PostgreSQL
        </p>
      </footer>
    </div>
  );
}
