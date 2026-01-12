# Machine Learning Guide

This guide explains the machine learning concepts and implementation in SegmentIQ.

---

## Table of Contents

- [Overview](#overview)
- [Data Preprocessing](#data-preprocessing)
- [Hierarchical Clustering](#hierarchical-clustering)
- [Linkage Methods](#linkage-methods)
- [Evaluation Metrics](#evaluation-metrics)
- [Best Practices](#best-practices)
- [Interpreting Results](#interpreting-results)

---

## Overview

SegmentIQ uses **Hierarchical Agglomerative Clustering (HAC)** to segment customers into distinct groups based on their characteristics.

### Why Hierarchical Clustering?

| Advantage | Description |
|-----------|-------------|
| No k-means initialization | Deterministic results |
| Dendrogram visualization | See cluster relationships |
| Flexible cluster count | Choose after seeing hierarchy |
| Works with any distance | Supports various metrics |

### Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA PREPROCESSING                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   CSV Data  →  Column Detection  →  Feature Extraction              │
│                                          │                          │
│                          ┌───────────────┴───────────────┐          │
│                          ↓                               ↓          │
│                   Numeric Features              Categorical Features│
│                          ↓                               ↓          │
│                   StandardScaler               OneHotEncoder        │
│                          ↓                               ↓          │
│                          └───────────────┬───────────────┘          │
│                                          ↓                          │
│                               ColumnTransformer                     │
│                                          ↓                          │
│                            (Optional) PCA Reduction                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                          ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      HIERARCHICAL CLUSTERING                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Preprocessed Data  →  Linkage Matrix  →  Dendrogram               │
│                                ↓                                    │
│                         Cut at n_clusters                           │
│                                ↓                                    │
│                        Cluster Assignments                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                          ↓
┌─────────────────────────────────────────────────────────────────────┐
│                           EVALUATION                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Cluster Assignments  →  Silhouette Score  →  Cluster Sizes        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Preprocessing

### 1. Column Detection

The system automatically detects column types:

```python
def detect_column_types(df):
    numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns
    return numeric_cols, categorical_cols
```

**Rules:**
- Columns with `int64` or `float64` are numeric
- Columns with `object` or `category` are categorical
- ID columns are excluded automatically

### 2. Numeric Feature Scaling

Numeric features are standardized to have zero mean and unit variance:

```python
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_numeric)
```

**Why scale?**
- Distance-based algorithms are sensitive to feature magnitudes
- Prevents features with large ranges from dominating
- Ensures equal contribution from all features

**Example:**

| Original | Scaled |
|----------|--------|
| age: 25-75 | age: -1.5 to 1.5 |
| spend: 1000-50000 | spend: -1.5 to 1.5 |

### 3. Categorical Encoding

Categorical features are one-hot encoded:

```python
from sklearn.preprocessing import OneHotEncoder

encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
X_encoded = encoder.fit_transform(X_categorical)
```

**Example:**

| Original | Encoded |
|----------|---------|
| gender: Male | gender_Male: 1, gender_Female: 0 |
| region: Addis Ababa | region_AA: 1, region_Oromia: 0, ... |

### 4. PCA Dimensionality Reduction

Optional PCA reduces feature space for high-dimensional data:

```python
from sklearn.decomposition import PCA

pca = PCA(n_components=5)
X_reduced = pca.fit_transform(X_combined)
```

**When to use PCA:**
- Many categorical features (after one-hot encoding)
- Feature count exceeds sample count
- To reduce noise and improve clustering

**Variance explained:**
- Aim for 80-95% variance retention
- Monitor `explained_variance_ratio_`

---

## Hierarchical Clustering

### Algorithm Steps

1. **Initialize**: Each data point is its own cluster
2. **Find closest pair**: Calculate distances between all cluster pairs
3. **Merge**: Combine the two closest clusters
4. **Update**: Recalculate distances to the new cluster
5. **Repeat**: Until desired number of clusters reached

### Implementation

```python
from scipy.cluster.hierarchy import linkage, fcluster, dendrogram
from scipy.spatial.distance import pdist

# Calculate distance matrix
distance_matrix = pdist(X, metric='euclidean')

# Build linkage matrix
Z = linkage(distance_matrix, method='ward')

# Cut dendrogram at n clusters
labels = fcluster(Z, t=n_clusters, criterion='maxclust')
```

### Dendrogram

The dendrogram visualizes the hierarchical clustering:

```
Height (Distance)
    │
    │          ┌───────────────────┐
  5 │          │                   │
    │     ┌────┤                   │
  4 │     │    │                   │
    │  ┌──┤    │                   │
  3 │  │  │    │                   │
    │  │  │ ┌──┤                   │
  2 │──┤  │ │  │                   │
    │  │  │ │  │                   │
  1 │  │  └─┤  │                   │
    │  │    │  │                   │
  0 ├──┴────┴──┴───────────────────┼───
    C1  C2  C3  C4                 C5
         Customer Samples
```

**Reading the dendrogram:**
- **Height**: Distance at which clusters merge
- **Branches**: Groups of similar customers
- **Cut line**: Horizontal line determines cluster count

---

## Linkage Methods

### Ward Linkage (Recommended)

**Criterion:** Minimizes within-cluster variance

**Formula:**
$$d(A, B) = \sqrt{\frac{2|A||B|}{|A|+|B|}} \cdot ||c_A - c_B||$$

**Characteristics:**
- Creates compact, spherical clusters
- Equal-sized clusters preferred
- Most commonly used method
- Best for customer segmentation

### Complete Linkage

**Criterion:** Maximum distance between points

**Formula:**
$$d(A, B) = \max_{a \in A, b \in B} ||a - b||$$

**Characteristics:**
- Tight, compact clusters
- Sensitive to outliers
- Good when clusters are well-separated

### Average Linkage

**Criterion:** Mean distance between all pairs

**Formula:**
$$d(A, B) = \frac{1}{|A||B|} \sum_{a \in A} \sum_{b \in B} ||a - b||$$

**Characteristics:**
- Balanced approach
- Less sensitive to outliers
- Good general-purpose method

### Single Linkage

**Criterion:** Minimum distance between points

**Formula:**
$$d(A, B) = \min_{a \in A, b \in B} ||a - b||$$

**Characteristics:**
- Can detect elongated clusters
- Sensitive to noise/outliers
- May create "chaining" effect

### Linkage Comparison

| Method | Cluster Shape | Outlier Sensitivity | Use Case |
|--------|---------------|---------------------|----------|
| Ward | Compact, spherical | Medium | General segmentation |
| Complete | Tight | High | Well-separated groups |
| Average | Moderate | Low | Noisy data |
| Single | Chain-like | Very High | Detecting outliers |

---

## Evaluation Metrics

### Silhouette Score

Measures how similar an object is to its own cluster vs. other clusters.

**Formula:**
$$s(i) = \frac{b(i) - a(i)}{\max(a(i), b(i))}$$

Where:
- $a(i)$ = Average distance to points in same cluster
- $b(i)$ = Minimum average distance to points in other clusters

**Interpretation:**

| Score | Quality | Meaning |
|-------|---------|---------|
| 0.71 - 1.00 | Excellent | Strong structure found |
| 0.51 - 0.70 | Good | Reasonable structure |
| 0.26 - 0.50 | Fair | Weak structure |
| < 0.25 | Poor | May be artificial |

### Cluster Sizes

Check cluster size distribution:

```python
cluster_sizes = pd.Series(labels).value_counts()
```

**Warning signs:**
- One cluster with 90%+ of data
- Many clusters with single members
- Extremely unbalanced sizes

---

## Best Practices

### Data Preparation

1. **Remove ID columns** - They add noise
2. **Handle missing values** - Impute or remove
3. **Check for outliers** - Consider removal or capping
4. **Balance feature types** - Many categoricals? Use PCA

### Choosing Parameters

#### Number of Clusters

**Methods:**
1. **Elbow method**: Plot silhouette scores for k=2-15
2. **Domain knowledge**: How many segments make business sense?
3. **Dendrogram**: Look for natural cut points

**Recommendation:** Start with 3-5 clusters

#### Linkage Method

- **Default**: Start with Ward
- **Outliers present**: Try Average
- **Need specific shapes**: Experiment

### Iteration

1. Run initial clustering with defaults
2. Examine results and silhouette score
3. Try different cluster counts
4. Test alternative linkage methods
5. Consider PCA if many features

---

## Interpreting Results

### Cluster Profiles

After clustering, analyze each cluster:

```python
# Get cluster assignments
df['cluster'] = labels

# Profile each cluster
for cluster_id in df['cluster'].unique():
    cluster_data = df[df['cluster'] == cluster_id]
    
    print(f"Cluster {cluster_id}:")
    print(f"  Size: {len(cluster_data)}")
    print(f"  Avg Age: {cluster_data['age'].mean():.1f}")
    print(f"  Avg Spend: {cluster_data['total_spend'].mean():.0f}")
    print(f"  Top Region: {cluster_data['region'].mode()[0]}")
```

### Example Customer Segments

| Cluster | Name | Characteristics |
|---------|------|-----------------|
| 0 | Premium Shoppers | High spend, frequent visits, urban |
| 1 | Budget Families | Large baskets, value-focused |
| 2 | Young Professionals | Medium spend, convenience-oriented |
| 3 | Occasional Shoppers | Low frequency, variety seeking |

### Business Actions

| Segment | Marketing Strategy |
|---------|-------------------|
| Premium | Loyalty rewards, exclusive events |
| Budget | Bulk discounts, family packs |
| Young Pro | Mobile app, quick checkout |
| Occasional | Re-engagement campaigns |

---

## Troubleshooting

### Low Silhouette Score

**Possible causes:**
- Too many/few clusters
- Features not discriminative
- Outliers distorting results

**Solutions:**
- Try different n_clusters
- Use PCA to reduce noise
- Remove outliers
- Try different linkage

### Unbalanced Clusters

**Possible causes:**
- Outliers forming separate clusters
- Too many clusters
- Data is not naturally clustered

**Solutions:**
- Reduce n_clusters
- Remove outliers
- Check if data has natural segments

### Slow Performance

**Possible causes:**
- Large dataset (>10k samples)
- Many features after encoding

**Solutions:**
- Sample data for exploration
- Use PCA to reduce dimensions
- Consider k-means for initial exploration

