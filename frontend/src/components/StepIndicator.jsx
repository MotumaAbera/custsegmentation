import { motion } from 'framer-motion';
import { Upload, Settings, BarChart3, Check } from 'lucide-react';
import styles from './StepIndicator.module.css';

const STEPS = [
  { id: 1, label: 'Upload Data', icon: Upload },
  { id: 2, label: 'Configure', icon: Settings },
  { id: 3, label: 'Results', icon: BarChart3 },
];

export default function StepIndicator({ currentStep }) {
  return (
    <div className={styles.container}>
      {STEPS.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isActive = currentStep === step.id;
        const Icon = step.icon;

        return (
          <div key={step.id} className={styles.stepWrapper}>
            <motion.div
              className={`${styles.step} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
              initial={false}
              animate={{
                scale: isActive ? 1.1 : 1,
                backgroundColor: isCompleted 
                  ? 'var(--success)' 
                  : isActive 
                    ? 'var(--accent-primary)' 
                    : 'var(--bg-tertiary)',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {isCompleted ? (
                <Check size={18} />
              ) : (
                <Icon size={18} />
              )}
            </motion.div>
            <span className={`${styles.label} ${isActive ? styles.activeLabel : ''}`}>
              {step.label}
            </span>
            {index < STEPS.length - 1 && (
              <div className={styles.connector}>
                <motion.div
                  className={styles.connectorFill}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isCompleted ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

