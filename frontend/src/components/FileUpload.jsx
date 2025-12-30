import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileSpreadsheet, Check, AlertCircle, Loader2 } from 'lucide-react';
import styles from './FileUpload.module.css';

export default function FileUpload({ onUpload, loading, error, success }) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div
        {...getRootProps()}
        className={`${styles.dropzone} ${isDragActive ? styles.active : ''} ${success ? styles.success : ''} ${error ? styles.error : ''}`}
      >
        <input {...getInputProps()} />
        
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={styles.content}
            >
              <Loader2 className={styles.spinner} size={48} />
              <p className={styles.text}>Uploading dataset...</p>
            </motion.div>
          ) : success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={styles.content}
            >
              <div className={styles.successIcon}>
                <Check size={32} />
              </div>
              <p className={styles.text}>Dataset uploaded successfully!</p>
              <p className={styles.subtext}>Drop another file to replace</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={styles.content}
            >
              <div className={styles.errorIcon}>
                <AlertCircle size={32} />
              </div>
              <p className={styles.text}>Upload failed</p>
              <p className={styles.subtext}>{error}</p>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.content}
            >
              <div className={styles.iconWrapper}>
                {isDragActive ? (
                  <FileSpreadsheet size={48} className={styles.iconActive} />
                ) : (
                  <Upload size={48} className={styles.icon} />
                )}
              </div>
              <p className={styles.text}>
                {isDragActive ? 'Drop your CSV here' : 'Drag & drop your customer data'}
              </p>
              <p className={styles.subtext}>or click to browse files</p>
              <div className={styles.badge}>CSV files only</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

