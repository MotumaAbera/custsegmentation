import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Database, Cpu, BarChart3, Image } from 'lucide-react';
import styles from './TrainingProgress.module.css';

const STEPS = [
  { id: 'load', label: 'Loading data...', icon: Database, duration: 800 },
  { id: 'preprocess', label: 'Preprocessing features...', icon: Cpu, duration: 1200 },
  { id: 'cluster', label: 'Running clustering...', icon: BarChart3, duration: 1500 },
  { id: 'visualize', label: 'Generating dendrogram...', icon: Image, duration: 800 },
];

export default function TrainingProgress({ isActive }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    let stepIndex = 0;
    let elapsed = 0;
    const totalDuration = STEPS.reduce((sum, s) => sum + s.duration, 0);

    const interval = setInterval(() => {
      elapsed += 50;
      setProgress((elapsed / totalDuration) * 100);

      let accumulated = 0;
      for (let i = 0; i < STEPS.length; i++) {
        accumulated += STEPS[i].duration;
        if (elapsed < accumulated) {
          setCurrentStep(i);
          break;
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  const CurrentIcon = STEPS[currentStep]?.icon || Loader2;

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div className={styles.iconWrapper}>
        <motion.div
          key={currentStep}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <CurrentIcon size={32} className={styles.icon} />
        </motion.div>
        <div className={styles.pulse} />
      </div>

      <div className={styles.content}>
        <motion.p
          key={currentStep}
          className={styles.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {STEPS[currentStep]?.label}
        </motion.p>

        <div className={styles.progressBar}>
          <motion.div
            className={styles.progressFill}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>

        <div className={styles.steps}>
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`${styles.stepDot} ${index <= currentStep ? styles.active : ''}`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

