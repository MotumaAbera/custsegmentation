import { motion } from 'framer-motion';
import { Layers, Sparkles } from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
  return (
    <motion.header 
      className={styles.header}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={styles.container}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Layers size={24} />
          </div>
          <span className={styles.logoText}>
            Segment<span className={styles.accent}>IQ</span>
          </span>
        </div>

        <nav className={styles.nav}>
          <span className={styles.tagline}>
            <Sparkles size={14} />
            ML-Powered Customer Insights
          </span>
        </nav>
      </div>
    </motion.header>
  );
}

