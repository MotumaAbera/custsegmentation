import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Play, Loader2, Zap } from 'lucide-react';
import styles from './ClusteringConfig.module.css';

const LINKAGE_OPTIONS = [
  { value: 'ward', label: 'Ward', desc: 'Minimizes variance' },
  { value: 'complete', label: 'Complete', desc: 'Maximum linkage' },
  { value: 'average', label: 'Average', desc: 'Mean distance' },
  { value: 'single', label: 'Single', desc: 'Minimum linkage' },
];

export default function ClusteringConfig({ datasetId, onTrain, loading }) {
  const [config, setConfig] = useState({
    linkage: 'ward',
    n_clusters: 4,
    use_pca: false,
    pca_components: 5,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onTrain({
      dataset_id: datasetId,
      linkage: config.linkage,
      n_clusters: config.n_clusters,
      use_pca: config.use_pca,
      pca_components: config.use_pca ? config.pca_components : null,
    });
  };

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <Settings size={20} />
        </div>
        <h3 className={styles.title}>Clustering Configuration</h3>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.section}>
          <label className={styles.label}>Linkage Method</label>
          <div className={styles.linkageGrid}>
            {LINKAGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`${styles.linkageOption} ${config.linkage === option.value ? styles.active : ''}`}
                onClick={() => setConfig({ ...config, linkage: option.value })}
              >
                <span className={styles.linkageName}>{option.label}</span>
                <span className={styles.linkageDesc}>{option.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>
            Number of Clusters
            <span className={styles.value}>{config.n_clusters}</span>
          </label>
          <input
            type="range"
            min="2"
            max="15"
            value={config.n_clusters}
            onChange={(e) => setConfig({ ...config, n_clusters: parseInt(e.target.value) })}
            className={styles.slider}
          />
          <div className={styles.sliderLabels}>
            <span>2</span>
            <span>15</span>
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={config.use_pca}
              onChange={(e) => setConfig({ ...config, use_pca: e.target.checked })}
              className={styles.checkbox}
            />
            <span className={styles.checkboxCustom}>
              <Zap size={14} />
            </span>
            <span>Enable PCA Reduction</span>
          </label>

          {config.use_pca && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={styles.pcaConfig}
            >
              <label className={styles.label}>
                PCA Components
                <span className={styles.value}>{config.pca_components}</span>
              </label>
              <input
                type="range"
                min="2"
                max="20"
                value={config.pca_components}
                onChange={(e) => setConfig({ ...config, pca_components: parseInt(e.target.value) })}
                className={styles.slider}
              />
            </motion.div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !datasetId}
          className={styles.submitButton}
        >
          {loading ? (
            <>
              <Loader2 className={styles.spinner} size={20} />
              Training Model...
            </>
          ) : (
            <>
              <Play size={20} />
              Run Clustering
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}

