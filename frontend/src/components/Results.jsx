import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Target, Layers, TrendingUp, Image, Users, Table, Download, Sparkles, ScatterChart as ScatterIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ScatterChart, Scatter, ZAxis, Legend } from 'recharts';
import { getDendrogramUrl, getSegments } from '../services/api';
import styles from './Results.module.css';

const CLUSTER_COLORS = [
  '#22c55e', '#ef4444', '#3b82f6', '#f97316', '#a78bfa',
  '#c4a052', '#22d3d8', '#f472b6', '#84cc16', '#e879f9',
];

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'scatter', label: 'Scatter Plot', icon: ScatterIcon },
  { id: 'distribution', label: 'Distribution', icon: Layers },
  { id: 'dendrogram', label: 'Dendrogram', icon: Image },
];

export default function Results({ run }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [scatterData, setScatterData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [axisFeatures, setAxisFeatures] = useState({ x: null, y: null });

  // Fetch segment data for scatter plot
  useEffect(() => {
    if (!run?.id) return;
    
    const fetchSegments = async () => {
      setLoading(true);
      try {
        const data = await getSegments(run.id);
        if (data?.assignments) {
          // Get numeric features for axis selection
          const numericFeatures = run.feature_config?.numeric_features || [];
          const xFeature = numericFeatures[0] || null;
          const yFeature = numericFeatures[1] || numericFeatures[0] || null;
          setAxisFeatures({ x: xFeature, y: yFeature });
          
          // Transform assignments to scatter data
          const transformed = data.assignments.map((a) => ({
            ...a.payload,
            cluster: a.cluster_label,
            clusterName: `Cluster ${a.cluster_label + 1}`,
          }));
          setScatterData(transformed);
        }
      } catch (err) {
        console.error('Failed to fetch segments:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSegments();
  }, [run?.id, run?.feature_config?.numeric_features]);

  if (!run) return null;

  const { metrics, feature_config } = run;
  const numericFeatures = feature_config?.numeric_features || [];
  const clusterData = metrics?.cluster_sizes
    ? Object.entries(metrics.cluster_sizes).map(([label, count]) => ({
        name: `Cluster ${parseInt(label) + 1}`,
        shortName: `C${parseInt(label) + 1}`,
        value: count,
        label: parseInt(label),
        percentage: ((count / metrics.n_samples) * 100).toFixed(1),
      }))
    : [];

  const getSilhouetteRating = (score) => {
    if (score === null || score === undefined) return { label: 'N/A', color: 'var(--text-muted)' };
    if (score > 0.7) return { label: 'Excellent', color: 'var(--success)' };
    if (score > 0.5) return { label: 'Good', color: '#4ade80' };
    if (score > 0.25) return { label: 'Fair', color: 'var(--warning)' };
    return { label: 'Poor', color: 'var(--error)' };
  };

  const rating = getSilhouetteRating(metrics?.silhouette_score);

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrapper}>
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className={styles.title}>Clustering Results</h3>
            <span className={styles.subtitle}>Run #{run.id} • {run.linkage.toUpperCase()} linkage</span>
          </div>
        </div>
        <motion.a
          href={getDendrogramUrl(run.id)}
          download={`dendrogram_run_${run.id}.png`}
          className={styles.downloadBtn}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Download size={16} />
          Export
        </motion.a>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              <Icon size={16} />
              {tab.label}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={styles.tabContent}
          >
            {/* Stats Cards */}
            <div className={styles.statsGrid}>
              <StatCard
                icon={<Users size={22} />}
                label="Total Samples"
                value={metrics?.n_samples || 0}
                color="var(--accent-primary)"
              />
              <StatCard
                icon={<Layers size={22} />}
                label="Clusters"
                value={metrics?.n_clusters || run.n_clusters}
                color="#60a5fa"
              />
              <StatCard
                icon={<Target size={22} />}
                label="Features"
                value={metrics?.n_encoded_features || 0}
                color="#a78bfa"
              />
              <div className={styles.silhouetteCard}>
                <div className={styles.silhouetteHeader}>
                  <TrendingUp size={22} />
                  <span>Silhouette Score</span>
                </div>
                <div className={styles.silhouetteValue}>
                  <span className={styles.scoreNumber}>
                    {metrics?.silhouette_score?.toFixed(3) || 'N/A'}
                  </span>
                  <span className={styles.scoreRating} style={{ color: rating.color }}>
                    {rating.label}
                  </span>
                </div>
                <div className={styles.scoreBar}>
                  <motion.div
                    className={styles.scoreBarFill}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(0, (metrics?.silhouette_score || 0) + 1) * 50}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{ background: rating.color }}
                  />
                </div>
                <div className={styles.scoreScale}>
                  <span>-1</span>
                  <span>0</span>
                  <span>+1</span>
                </div>
              </div>
            </div>

            {/* Feature Config */}
            {feature_config && (
              <div className={styles.featureCard}>
                <h4 className={styles.cardTitle}>
                  <Table size={16} />
                  Feature Configuration
                </h4>
                <div className={styles.featureGrid}>
                  {feature_config.numeric_features?.length > 0 && (
                    <div className={styles.featureGroup}>
                      <span className={styles.featureLabel}>Numeric ({feature_config.numeric_features.length})</span>
                      <div className={styles.featureTags}>
                        {feature_config.numeric_features.map((f) => (
                          <motion.span
                            key={f}
                            className={styles.featureTag}
                            whileHover={{ scale: 1.05 }}
                          >
                            {f}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}
                  {feature_config.categorical_features?.length > 0 && (
                    <div className={styles.featureGroup}>
                      <span className={styles.featureLabel}>Categorical ({feature_config.categorical_features.length})</span>
                      <div className={styles.featureTags}>
                        {feature_config.categorical_features.map((f) => (
                          <motion.span
                            key={f}
                            className={`${styles.featureTag} ${styles.cat}`}
                            whileHover={{ scale: 1.05 }}
                          >
                            {f}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {feature_config.pca_applied && (
                  <div className={styles.pcaBadge}>
                    <Sparkles size={14} />
                    PCA applied: {feature_config.pca_components} components
                    ({(feature_config.pca_explained_variance * 100).toFixed(1)}% variance explained)
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'scatter' && (
          <motion.div
            key="scatter"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={styles.tabContent}
          >
            <div className={styles.scatterCard}>
              <div className={styles.scatterHeader}>
                <h4 className={styles.cardTitle}>
                  <ScatterIcon size={16} />
                  Cluster Visualization
                </h4>
                {numericFeatures.length >= 2 && (
                  <div className={styles.axisSelectors}>
                    <div className={styles.axisSelector}>
                      <label>X-Axis:</label>
                      <select 
                        value={axisFeatures.x || ''} 
                        onChange={(e) => setAxisFeatures(prev => ({ ...prev, x: e.target.value }))}
                      >
                        {numericFeatures.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.axisSelector}>
                      <label>Y-Axis:</label>
                      <select 
                        value={axisFeatures.y || ''} 
                        onChange={(e) => setAxisFeatures(prev => ({ ...prev, y: e.target.value }))}
                      >
                        {numericFeatures.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
              
              {loading ? (
                <div className={styles.scatterLoading}>
                  <motion.div 
                    className={styles.loadingSpinner}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span>Loading cluster data...</span>
                </div>
              ) : scatterData.length > 0 && axisFeatures.x && axisFeatures.y ? (
                <div className={styles.scatterWrapper}>
                  <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                      <XAxis 
                        type="number" 
                        dataKey={axisFeatures.x} 
                        name={axisFeatures.x}
                        stroke="var(--text-muted)" 
                        fontSize={12}
                        label={{ value: axisFeatures.x, position: 'bottom', fill: 'var(--text-secondary)', fontSize: 12 }}
                      />
                      <YAxis 
                        type="number" 
                        dataKey={axisFeatures.y} 
                        name={axisFeatures.y}
                        stroke="var(--text-muted)" 
                        fontSize={12}
                        label={{ value: axisFeatures.y, angle: -90, position: 'insideLeft', fill: 'var(--text-secondary)', fontSize: 12 }}
                      />
                      <ZAxis range={[80, 80]} />
                      <Tooltip content={<ScatterTooltip xKey={axisFeatures.x} yKey={axisFeatures.y} />} />
                      {/* Render each cluster as a separate Scatter */}
                      {Array.from(new Set(scatterData.map(d => d.cluster))).sort((a, b) => a - b).map((clusterId) => (
                        <Scatter
                          key={clusterId}
                          name={`Cluster ${clusterId + 1}`}
                          data={scatterData.filter(d => d.cluster === clusterId)}
                          fill={CLUSTER_COLORS[clusterId % CLUSTER_COLORS.length]}
                        />
                      ))}
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{value}</span>}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className={styles.scatterEmpty}>
                  <p>No numeric features available for scatter plot visualization.</p>
                  <p className={styles.scatterHint}>Upload a dataset with at least 2 numeric columns.</p>
                </div>
              )}
              
              {/* Cluster Legend */}
              {scatterData.length > 0 && (
                <div className={styles.scatterLegend}>
                  {clusterData.map((entry, index) => (
                    <div key={entry.name} className={styles.scatterLegendItem}>
                      <span 
                        className={styles.scatterLegendColor} 
                        style={{ background: CLUSTER_COLORS[index % CLUSTER_COLORS.length] }}
                      />
                      <span className={styles.scatterLegendLabel}>{entry.name}</span>
                      <span className={styles.scatterLegendCount}>{entry.value} points</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'distribution' && (
          <motion.div
            key="distribution"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={styles.tabContent}
          >
            <div className={styles.chartsGrid}>
              {/* Pie Chart */}
              <div className={styles.chartCard}>
                <h4 className={styles.cardTitle}>Segment Distribution</h4>
                <div className={styles.pieWrapper}>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={clusterData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={800}
                      >
                        {clusterData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={CLUSTER_COLORS[index % CLUSTER_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={<CustomTooltip />}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className={styles.pieCenter}>
                    <span className={styles.pieCenterValue}>{metrics?.n_clusters}</span>
                    <span className={styles.pieCenterLabel}>Segments</span>
                  </div>
                </div>
              </div>

              {/* Bar Chart */}
              <div className={styles.chartCard}>
                <h4 className={styles.cardTitle}>Cluster Sizes</h4>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={clusterData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                    <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis dataKey="shortName" type="category" stroke="var(--text-muted)" fontSize={12} width={40} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} animationDuration={800}>
                      {clusterData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={CLUSTER_COLORS[index % CLUSTER_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Legend */}
            <div className={styles.legendGrid}>
              {clusterData.map((entry, index) => (
                <motion.div
                  key={entry.name}
                  className={styles.legendCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div
                    className={styles.legendColor}
                    style={{ background: CLUSTER_COLORS[index % CLUSTER_COLORS.length] }}
                  />
                  <div className={styles.legendInfo}>
                    <span className={styles.legendName}>{entry.name}</span>
                    <span className={styles.legendCount}>{entry.value} customers</span>
                  </div>
                  <span className={styles.legendPercent}>{entry.percentage}%</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'dendrogram' && (
          <motion.div
            key="dendrogram"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={styles.tabContent}
          >
            <div className={styles.dendrogramCard}>
              <div className={styles.dendrogramHeader}>
                <h4 className={styles.cardTitle}>
                  <Image size={16} />
                  Hierarchical Clustering Dendrogram
                </h4>
                <p className={styles.dendrogramHint}>
                  The dendrogram shows how clusters are merged at different distances.
                  Vertical lines indicate merges; height shows dissimilarity.
                </p>
              </div>
              <div className={styles.dendrogramWrapper}>
                <motion.img
                  src={getDendrogramUrl(run.id)}
                  alt="Dendrogram"
                  className={styles.dendrogram}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <motion.div
      className={styles.statCard}
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }}
    >
      <div className={styles.statIcon} style={{ color }}>{icon}</div>
      <div className={styles.statContent}>
        <motion.span
          className={styles.statValue}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {value}
        </motion.span>
        <span className={styles.statLabel}>{label}</span>
      </div>
    </motion.div>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  return (
    <div className={styles.customTooltip}>
      <strong>{data.name}</strong>
      <p>{data.value} customers ({data.percentage}%)</p>
    </div>
  );
}

function ScatterTooltip({ active, payload, xKey, yKey }) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  return (
    <div className={styles.customTooltip}>
      <strong style={{ color: CLUSTER_COLORS[data.cluster % CLUSTER_COLORS.length] }}>
        Cluster {data.cluster + 1}
      </strong>
      <p>{xKey}: {data[xKey]}</p>
      <p>{yKey}: {data[yKey]}</p>
      {data.customer_id && <p style={{ opacity: 0.7, fontSize: '0.75rem' }}>ID: {data.customer_id}</p>}
    </div>
  );
}
