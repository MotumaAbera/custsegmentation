import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileSpreadsheet, Check, AlertCircle, Loader2, UploadCloud } from 'lucide-react';
import styles from './FileUpload.module.css';

export default function FileUpload({ onUpload, loading, error, success }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <motion.div
        {...getRootProps()}
        className={`${styles.dropzone} ${isDragActive ? styles.active : ''} ${success ? styles.success : ''} ${error ? styles.error : ''}`}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
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
              <div className={styles.loadingWrapper}>
                <Loader2 className={styles.spinner} size={40} />
                <div className={styles.loadingRing} />
              </div>
              <p className={styles.text}>Uploading dataset...</p>
              <p className={styles.subtext}>Processing your file</p>
            </motion.div>
          ) : success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={styles.content}
            >
              <motion.div 
                className={styles.successIcon}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <Check size={28} />
              </motion.div>
              <p className={styles.text}>Upload successful!</p>
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
              <motion.div 
                className={styles.errorIcon}
                animate={{ x: [-2, 2, -2, 2, 0] }}
                transition={{ duration: 0.4 }}
              >
                <AlertCircle size={28} />
              </motion.div>
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
              <motion.div 
                className={styles.iconWrapper}
                animate={isDragActive ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
              >
                {isDragActive ? (
                  <FileSpreadsheet size={36} className={styles.iconActive} />
                ) : (
                  <UploadCloud size={36} className={styles.icon} />
                )}
              </motion.div>
              <p className={styles.text}>
                {isDragActive ? 'Drop your CSV here' : 'Upload Customer Data'}
              </p>
              <p className={styles.subtext}>
                {isDragActive ? 'Release to upload' : 'Drag & drop or click to browse'}
              </p>
              <div className={styles.badges}>
                <span className={styles.badge}>CSV</span>
                <span className={styles.badge}>Max 10MB</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorative elements */}
        <div className={styles.corner} style={{ top: 12, left: 12 }} />
        <div className={styles.corner} style={{ top: 12, right: 12, transform: 'rotate(90deg)' }} />
        <div className={styles.corner} style={{ bottom: 12, left: 12, transform: 'rotate(-90deg)' }} />
        <div className={styles.corner} style={{ bottom: 12, right: 12, transform: 'rotate(180deg)' }} />
      </motion.div>
    </motion.div>
  );
}
