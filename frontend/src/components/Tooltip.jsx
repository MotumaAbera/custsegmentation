import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Tooltip.module.css';

export default function Tooltip({ children, content, position = 'top' }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={styles.wrapper}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`${styles.tooltip} ${styles[position]}`}
            initial={{ opacity: 0, scale: 0.9, y: position === 'top' ? 5 : -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
          >
            {content}
            <div className={styles.arrow} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

