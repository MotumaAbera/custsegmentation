import { motion } from 'framer-motion';
import { BarChart3, Target, Layers, TrendingUp, Image, Users } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getDendrogramUrl } from '../services/api';
import styles from './Results.module.css';

const CLUSTER_COLORS = [
  '#c4a052', '#4ade80', '#60a5fa', '#f472b6', '#a78bfa',
  '#fb923c', '#22d3d8', '#f87171', '#84cc16', '#e879f9',
];

export default function Results({ run }) {
  if (!run) return null;

  const { metrics, feature_config } = run;
  const clusterData = metrics?.cluster_sizes
    ? Object.entries(metrics.cluster_sizes).map(([label, count]) => ({
        name: `Cluster ${parseInt(label) + 1}`,
        value: count,
        label: parseInt(label),
      }))
    : [];

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <BarChart3 size={20} />
        </div>
        <h3 className={styles.title}>Clustering Results</h3>
        <span className={styles.runId}>Run #{run.id}</span>
      </div>

      <div className={styles.grid}>
        <div className={styles.statsGrid}>
          <StatCard
            icon={<Users size={20} />}
            label="Samples"
            value={metrics?.n_samples || 0}
          />
          <StatCard
            icon={<Layers size={20} />}
            label="Clusters"
            value={metrics?.n_clusters || run.n_clusters}
          />
          <StatCard
            icon={<Target size={20} />}
            label="Features"
            value={metrics?.n_encoded_features || 0}
          />
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Silhouette"
            value={metrics?.silhouette_score?.toFixed(3) || 'N/A'}
            highlight={metrics?.silhouette_score > 0.5}
          />
        </div>

        {clusterData.length > 0 && (
          <div className={styles.chartCard}>
            <h4 className={styles.cardTitle}>Cluster Distribution</h4>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={clusterData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {clusterData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={CLUSTER_COLORS[index % CLUSTER_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#1a1a1d',
                      border: '1px solid #2a2a2e',
                      borderRadius: '8px',
                      color: '#fafafa',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.legend}>
                {clusterData.map((entry, index) => (
                  <div key={entry.name} className={styles.legendItem}>
                    <span
                      className={styles.legendDot}
                      style={{ background: CLUSTER_COLORS[index % CLUSTER_COLORS.length] }}
                    />
                    <span className={styles.legendLabel}>{entry.name}</span>
                    <span className={styles.legendValue}>{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {feature_config && (
          <div className={styles.featureCard}>
            <h4 className={styles.cardTitle}>Feature Configuration</h4>
            <div className={styles.featureList}>
              {feature_config.numeric_features?.length > 0 && (
                <div className={styles.featureGroup}>
                  <span className={styles.featureLabel}>Numeric</span>
                  <div className={styles.featureTags}>
                    {feature_config.numeric_features.map((f) => (
                      <span key={f} className={styles.featureTag}>{f}</span>
                    ))}
                  </div>
                </div>
              )}
              {feature_config.categorical_features?.length > 0 && (
                <div className={styles.featureGroup}>
                  <span className={styles.featureLabel}>Categorical</span>
                  <div className={styles.featureTags}>
                    {feature_config.categorical_features.map((f) => (
                      <span key={f} className={`${styles.featureTag} ${styles.cat}`}>{f}</span>
                    ))}
                  </div>
                </div>
              )}
              {feature_config.pca_applied && (
                <div className={styles.pcaInfo}>
                  <span>PCA: {feature_config.pca_components} components</span>
                  <span>({(feature_config.pca_explained_variance * 100).toFixed(1)}% variance)</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className={styles.dendrogramCard}>
          <h4 className={styles.cardTitle}>
            <Image size={16} />
            Dendrogram
          </h4>
          <div className={styles.dendrogramWrapper}>
            <img
              src={getDendrogramUrl(run.id)}
              alt="Dendrogram"
              className={styles.dendrogram}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ icon, label, value, highlight }) {
  return (
    <div className={`${styles.statCard} ${highlight ? styles.highlight : ''}`}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statContent}>
        <span className={styles.statValue}>{value}</span>
        <span className={styles.statLabel}>{label}</span>
      </div>
    </div>
  );
}

