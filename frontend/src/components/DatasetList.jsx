import { motion } from 'framer-motion';
import { Database, Calendar, ChevronRight, FileSpreadsheet } from 'lucide-react';
import styles from './DatasetList.module.css';

export default function DatasetList({ datasets, selectedId, onSelect }) {
  if (!datasets || datasets.length === 0) {
    return (
      <motion.div
        className={styles.empty}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <FileSpreadsheet size={32} className={styles.emptyIcon} />
        <p>No datasets uploaded yet</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <Database size={20} />
        </div>
        <h3 className={styles.title}>Your Datasets</h3>
        <span className={styles.count}>{datasets.length}</span>
      </div>

      <div className={styles.list}>
        {datasets.map((dataset, index) => (
          <motion.button
            key={dataset.id}
            className={`${styles.item} ${selectedId === dataset.id ? styles.selected : ''}`}
            onClick={() => onSelect(dataset)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div className={styles.itemIcon}>
              <FileSpreadsheet size={18} />
            </div>
            <div className={styles.itemContent}>
              <span className={styles.itemName}>{dataset.name}</span>
              <span className={styles.itemDate}>
                <Calendar size={12} />
                {new Date(dataset.created_at).toLocaleDateString()}
              </span>
            </div>
            <ChevronRight size={18} className={styles.arrow} />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

