import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Play, Zap, HelpCircle, Info } from 'lucide-react';
import Tooltip from './Tooltip';
import TrainingProgress from './TrainingProgress';
import styles from './ClusteringConfig.module.css';

const LINKAGE_OPTIONS = [
  { value: 'ward', label: 'Ward', desc: 'Minimizes variance', tooltip: 'Best for compact, equal-sized clusters. Most commonly used method.' },
  { value: 'complete', label: 'Complete', desc: 'Maximum linkage', tooltip: 'Creates tight clusters. Good when clusters are well-separated.' },
  { value: 'average', label: 'Average', desc: 'Mean distance', tooltip: 'Balanced approach. Works well for most datasets.' },
  { value: 'single', label: 'Single', desc: 'Minimum linkage', tooltip: 'Can find irregular shapes. Sensitive to noise.' },
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
      linkage_method: config.linkage,
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
        <Tooltip content="Configure how customers will be grouped into segments">
          <HelpCircle size={16} className={styles.helpIcon} />
        </Tooltip>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <TrainingProgress key="progress" isActive={loading} />
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className={styles.form}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.section}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Linkage Method</label>
                <Tooltip content="Determines how cluster distances are calculated">
                  <Info size={14} className={styles.infoIcon} />
                </Tooltip>
              </div>
              <div className={styles.linkageGrid}>
                {LINKAGE_OPTIONS.map((option) => (
                  <Tooltip key={option.value} content={option.tooltip} position="bottom">
                    <motion.button
                      type="button"
                      className={`${styles.linkageOption} ${config.linkage === option.value ? styles.active : ''}`}
                      onClick={() => setConfig({ ...config, linkage: option.value })}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className={styles.linkageName}>{option.label}</span>
                      <span className={styles.linkageDesc}>{option.desc}</span>
                    </motion.button>
                  </Tooltip>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.labelRow}>
                <label className={styles.label}>
                  Number of Clusters
                </label>
                <span className={styles.value}>{config.n_clusters}</span>
              </div>
              <div className={styles.sliderContainer}>
                <input
                  type="range"
                  min="2"
                  max="15"
                  value={config.n_clusters}
                  onChange={(e) => setConfig({ ...config, n_clusters: parseInt(e.target.value) })}
                  className={styles.slider}
                />
                <div className={styles.sliderMarks}>
                  {[2, 5, 8, 11, 15].map((mark) => (
                    <span
                      key={mark}
                      className={`${styles.mark} ${config.n_clusters >= mark ? styles.activeMark : ''}`}
                    >
                      {mark}
                    </span>
                  ))}
                </div>
              </div>
              <p className={styles.hint}>
                💡 Tip: Start with 3-5 clusters and adjust based on results
              </p>
            </div>

            <div className={styles.section}>
              <motion.label 
                className={styles.checkboxLabel}
                whileHover={{ x: 2 }}
              >
                <input
                  type="checkbox"
                  checked={config.use_pca}
                  onChange={(e) => setConfig({ ...config, use_pca: e.target.checked })}
                  className={styles.checkbox}
                />
                <span className={`${styles.checkboxCustom} ${config.use_pca ? styles.checked : ''}`}>
                  <Zap size={14} />
                </span>
                <div className={styles.checkboxText}>
                  <span>Enable PCA Reduction</span>
                  <span className={styles.checkboxHint}>Reduces dimensionality for high-feature datasets</span>
                </div>
              </motion.label>

              <AnimatePresence>
                {config.use_pca && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={styles.pcaConfig}
                  >
                    <div className={styles.labelRow}>
                      <label className={styles.label}>
                        PCA Components
                      </label>
                      <span className={styles.value}>{config.pca_components}</span>
                    </div>
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
              </AnimatePresence>
            </div>

            <motion.button
              type="submit"
              disabled={!datasetId}
              className={styles.submitButton}
              whileHover={{ scale: 1.02, boxShadow: '0 0 80px var(--accent-glow)' }}
              whileTap={{ scale: 0.98 }}
            >
              <Play size={20} />
              Run Clustering Analysis
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
