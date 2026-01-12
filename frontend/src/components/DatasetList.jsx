import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Calendar, ChevronRight, FileSpreadsheet, Sparkles, Trash2, X } from 'lucide-react';
import styles from './DatasetList.module.css';

export default function DatasetList({ datasets, selectedId, onSelect, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleDeleteClick = (e, dataset) => {
    e.stopPropagation();
    setConfirmDelete(dataset);
  };

  const handleConfirmDelete = async (e) => {
    e.stopPropagation();
    if (confirmDelete && onDelete) {
      await onDelete(confirmDelete.id);
      setConfirmDelete(null);
    }
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setConfirmDelete(null);
  };

  if (!datasets || datasets.length === 0) {
    return (
      <motion.div
        className={styles.empty}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className={styles.emptyIcon}>
          <FileSpreadsheet size={28} />
        </div>
        <p className={styles.emptyTitle}>No datasets yet</p>
        <p className={styles.emptyText}>Upload a CSV file to get started</p>
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
          <Database size={18} />
        </div>
        <h3 className={styles.title}>Your Datasets</h3>
        <span className={styles.count}>{datasets.length}</span>
      </div>

      <div className={styles.list}>
        <AnimatePresence>
          {datasets.map((dataset, index) => (
            <motion.div
              key={dataset.id}
              className={`${styles.item} ${selectedId === dataset.id ? styles.selected : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20, height: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              layout
            >
              <button
                className={styles.itemButton}
                onClick={() => onSelect(dataset)}
              >
                <div className={styles.itemIcon}>
                  {selectedId === dataset.id ? (
                    <Sparkles size={16} />
                  ) : (
                    <FileSpreadsheet size={16} />
                  )}
                </div>
                <div className={styles.itemContent}>
                  <span className={styles.itemName}>{dataset.name}</span>
                  <span className={styles.itemDate}>
                    <Calendar size={10} />
                    {new Date(dataset.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <ChevronRight size={16} className={styles.arrow} />
              </button>

              {onDelete && (
                <motion.button
                  className={styles.deleteBtn}
                  onClick={(e) => handleDeleteClick(e, dataset)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Delete dataset"
                >
                  <Trash2 size={14} />
                </motion.button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancelDelete}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className={styles.modalClose} onClick={handleCancelDelete}>
                <X size={18} />
              </button>
              <div className={styles.modalIcon}>
                <Trash2 size={24} />
              </div>
              <h4 className={styles.modalTitle}>Delete Dataset?</h4>
              <p className={styles.modalText}>
                This will permanently delete <strong>{confirmDelete.name}</strong> and all associated clustering runs.
              </p>
              <div className={styles.modalActions}>
                <button className={styles.cancelBtn} onClick={handleCancelDelete}>
                  Cancel
                </button>
                <button className={styles.confirmBtn} onClick={handleConfirmDelete}>
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
