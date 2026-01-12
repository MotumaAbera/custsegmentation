/**
 * Client-side hierarchical clustering implementation
 * All computation happens in the browser - no backend required
 */

// Euclidean distance between two points
function euclideanDistance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
}

// Standard scale (z-score normalization)
function standardScale(data) {
  const n = data.length;
  const m = data[0].length;
  const means = new Array(m).fill(0);
  const stds = new Array(m).fill(0);
  
  // Calculate means
  for (let j = 0; j < m; j++) {
    for (let i = 0; i < n; i++) {
      means[j] += data[i][j];
    }
    means[j] /= n;
  }
  
  // Calculate stds
  for (let j = 0; j < m; j++) {
    for (let i = 0; i < n; i++) {
      stds[j] += (data[i][j] - means[j]) ** 2;
    }
    stds[j] = Math.sqrt(stds[j] / n) || 1; // Avoid division by zero
  }
  
  // Scale data
  return data.map(row => 
    row.map((val, j) => (val - means[j]) / stds[j])
  );
}

// One-hot encode categorical columns
function oneHotEncode(data, colIndex) {
  const uniqueValues = [...new Set(data.map(row => row[colIndex]))];
  return {
    encoded: data.map(row => 
      uniqueValues.map(val => row[colIndex] === val ? 1 : 0)
    ),
    categories: uniqueValues,
  };
}

// Distance between two clusters based on linkage method
function clusterDistance(c1, c2, data, method) {
  const distances = [];
  for (const i of c1) {
    for (const j of c2) {
      distances.push(euclideanDistance(data[i], data[j]));
    }
  }
  
  switch (method) {
    case 'single':
      return Math.min(...distances);
    case 'complete':
      return Math.max(...distances);
    case 'average':
      return distances.reduce((a, b) => a + b, 0) / distances.length;
    case 'ward':
    default:
      // Ward's method: minimize within-cluster variance
      const n1 = c1.length;
      const n2 = c2.length;
      const centroid1 = getCentroid(c1, data);
      const centroid2 = getCentroid(c2, data);
      const dist = euclideanDistance(centroid1, centroid2);
      return Math.sqrt((2 * n1 * n2) / (n1 + n2)) * dist;
  }
}

// Get centroid of a cluster
function getCentroid(cluster, data) {
  const m = data[0].length;
  const centroid = new Array(m).fill(0);
  for (const i of cluster) {
    for (let j = 0; j < m; j++) {
      centroid[j] += data[i][j];
    }
  }
  return centroid.map(v => v / cluster.length);
}

// Hierarchical Agglomerative Clustering
function hierarchicalClustering(data, method = 'ward') {
  const n = data.length;
  const linkageMatrix = [];
  
  // Initialize clusters (each point is its own cluster)
  let clusters = data.map((_, i) => [i]);
  let clusterIds = data.map((_, i) => i);
  let nextClusterId = n;
  
  // Distance cache
  const distanceCache = new Map();
  
  function getClusterKey(i, j) {
    return i < j ? `${i},${j}` : `${j},${i}`;
  }
  
  // Compute initial distances
  for (let i = 0; i < clusters.length; i++) {
    for (let j = i + 1; j < clusters.length; j++) {
      const dist = clusterDistance(clusters[i], clusters[j], data, method);
      distanceCache.set(getClusterKey(clusterIds[i], clusterIds[j]), dist);
    }
  }
  
  // Merge until one cluster remains
  while (clusters.length > 1) {
    let minDist = Infinity;
    let mergeI = 0;
    let mergeJ = 1;
    
    // Find closest pair
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const key = getClusterKey(clusterIds[i], clusterIds[j]);
        const dist = distanceCache.get(key) ?? clusterDistance(clusters[i], clusters[j], data, method);
        if (dist < minDist) {
          minDist = dist;
          mergeI = i;
          mergeJ = j;
        }
      }
    }
    
    // Record merge in linkage matrix
    const newClusterSize = clusters[mergeI].length + clusters[mergeJ].length;
    linkageMatrix.push([
      clusterIds[mergeI],
      clusterIds[mergeJ],
      minDist,
      newClusterSize,
    ]);
    
    // Merge clusters
    const newCluster = [...clusters[mergeI], ...clusters[mergeJ]];
    const newId = nextClusterId++;
    
    // Remove old clusters
    const oldId1 = clusterIds[mergeI];
    const oldId2 = clusterIds[mergeJ];
    clusters.splice(Math.max(mergeI, mergeJ), 1);
    clusters.splice(Math.min(mergeI, mergeJ), 1);
    clusterIds.splice(Math.max(mergeI, mergeJ), 1);
    clusterIds.splice(Math.min(mergeI, mergeJ), 1);
    
    // Add new cluster
    clusters.push(newCluster);
    clusterIds.push(newId);
    
    // Update distance cache for new cluster
    for (let i = 0; i < clusters.length - 1; i++) {
      const dist = clusterDistance(clusters[i], newCluster, data, method);
      distanceCache.set(getClusterKey(clusterIds[i], newId), dist);
    }
  }
  
  return linkageMatrix;
}

// Cut dendrogram to get flat clusters
function getClusters(linkageMatrix, nClusters, nSamples) {
  const labels = new Array(nSamples).fill(0).map((_, i) => i);
  const n = nSamples;
  
  // Start from bottom (all separate) and merge until we have nClusters
  const clusterMap = new Map();
  for (let i = 0; i < n; i++) {
    clusterMap.set(i, [i]);
  }
  
  let currentClusters = n;
  let nextId = n;
  
  for (const [c1, c2, , ] of linkageMatrix) {
    if (currentClusters <= nClusters) break;
    
    const members1 = clusterMap.get(c1) || [];
    const members2 = clusterMap.get(c2) || [];
    const merged = [...members1, ...members2];
    
    clusterMap.delete(c1);
    clusterMap.delete(c2);
    clusterMap.set(nextId, merged);
    nextId++;
    currentClusters--;
  }
  
  // Assign labels
  let labelId = 0;
  for (const members of clusterMap.values()) {
    for (const idx of members) {
      labels[idx] = labelId;
    }
    labelId++;
  }
  
  return labels;
}

// Silhouette score
function silhouetteScore(data, labels) {
  const n = data.length;
  if (n < 2) return 0;
  
  const uniqueLabels = [...new Set(labels)];
  if (uniqueLabels.length < 2) return 0;
  
  const scores = [];
  
  for (let i = 0; i < n; i++) {
    const myLabel = labels[i];
    const myCluster = data.filter((_, j) => labels[j] === myLabel && j !== i);
    
    if (myCluster.length === 0) {
      scores.push(0);
      continue;
    }
    
    // a(i) = mean distance to points in same cluster
    const a = myCluster.reduce((sum, point) => sum + euclideanDistance(data[i], point), 0) / myCluster.length;
    
    // b(i) = min mean distance to points in other clusters
    let b = Infinity;
    for (const otherLabel of uniqueLabels) {
      if (otherLabel === myLabel) continue;
      const otherCluster = data.filter((_, j) => labels[j] === otherLabel);
      if (otherCluster.length === 0) continue;
      const meanDist = otherCluster.reduce((sum, point) => sum + euclideanDistance(data[i], point), 0) / otherCluster.length;
      b = Math.min(b, meanDist);
    }
    
    if (b === Infinity) {
      scores.push(0);
    } else {
      scores.push((b - a) / Math.max(a, b));
    }
  }
  
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

// Parse CSV
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((h, j) => {
        row[h] = values[j];
      });
      data.push(row);
    }
  }
  
  return { headers, data };
}

// Preprocess data
function preprocessData(data, headers) {
  const idColumns = ['id', 'customer_id', 'customerid', 'index', 'row'];
  const numericCols = [];
  const categoricalCols = [];
  
  // Detect column types
  for (const col of headers) {
    if (idColumns.includes(col.toLowerCase())) continue;
    
    const values = data.map(row => row[col]);
    const numericValues = values.filter(v => !isNaN(parseFloat(v)) && v !== '');
    
    if (numericValues.length / values.length > 0.8) {
      numericCols.push(col);
    } else {
      categoricalCols.push(col);
    }
  }
  
  // Build numeric matrix
  let matrix = data.map(row => 
    numericCols.map(col => parseFloat(row[col]) || 0)
  );
  
  // Encode categorical columns
  for (const col of categoricalCols) {
    const uniqueVals = [...new Set(data.map(row => row[col]))];
    const encoded = data.map(row => 
      uniqueVals.map(val => row[col] === val ? 1 : 0)
    );
    matrix = matrix.map((row, i) => [...row, ...encoded[i]]);
  }
  
  // Standard scale
  const scaled = standardScale(matrix);
  
  return {
    matrix: scaled,
    numericCols,
    categoricalCols,
  };
}

// Generate simple dendrogram as SVG
function generateDendrogramSVG(linkageMatrix, nSamples, linkageMethod) {
  const width = 800;
  const height = 400;
  const margin = { top: 40, right: 20, bottom: 60, left: 60 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  
  const maxHeight = Math.max(...linkageMatrix.map(row => row[2]));
  
  // Build tree structure
  const nodes = new Map();
  for (let i = 0; i < nSamples; i++) {
    nodes.set(i, { id: i, x: 0, height: 0, children: null });
  }
  
  let nextId = nSamples;
  for (const [c1, c2, height] of linkageMatrix) {
    const node1 = nodes.get(c1);
    const node2 = nodes.get(c2);
    nodes.set(nextId, {
      id: nextId,
      height,
      children: [node1, node2],
    });
    nextId++;
  }
  
  // Assign x positions (leaf ordering)
  let xPos = 0;
  function assignX(node) {
    if (!node.children) {
      node.x = xPos++;
      return;
    }
    assignX(node.children[0]);
    assignX(node.children[1]);
    node.x = (node.children[0].x + node.children[1].x) / 2;
  }
  
  const root = nodes.get(nextId - 1);
  assignX(root);
  
  // Scale functions
  const xScale = (x) => margin.left + (x / (nSamples - 1)) * plotWidth;
  const yScale = (h) => margin.top + plotHeight - (h / maxHeight) * plotHeight;
  
  // Generate paths
  let paths = '';
  function drawNode(node) {
    if (!node.children) return;
    
    const [left, right] = node.children;
    const x1 = xScale(left.x);
    const x2 = xScale(right.x);
    const y1 = yScale(left.height);
    const y2 = yScale(right.height);
    const yMerge = yScale(node.height);
    
    // Vertical lines from children to merge height
    paths += `<line x1="${x1}" y1="${y1}" x2="${x1}" y2="${yMerge}" stroke="#132787" stroke-width="2"/>`;
    paths += `<line x1="${x2}" y1="${y2}" x2="${x2}" y2="${yMerge}" stroke="#132787" stroke-width="2"/>`;
    // Horizontal line connecting children
    paths += `<line x1="${x1}" y1="${yMerge}" x2="${x2}" y2="${yMerge}" stroke="#132787" stroke-width="2"/>`;
    
    drawNode(left);
    drawNode(right);
  }
  
  drawNode(root);
  
  // Create SVG
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" style="background: white;">
      <style>
        text { font-family: Arial, sans-serif; }
      </style>
      <rect width="${width}" height="${height}" fill="white"/>
      <text x="${width/2}" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="#000">
        Hierarchical Clustering Dendrogram (${linkageMethod.toUpperCase()})
      </text>
      ${paths}
      <text x="${width/2}" y="${height - 10}" text-anchor="middle" font-size="12" fill="#666">Sample Index</text>
      <text x="15" y="${height/2}" text-anchor="middle" font-size="12" fill="#666" transform="rotate(-90, 15, ${height/2})">Distance</text>
    </svg>
  `;
  
  // Convert to data URL
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// Main clustering function
export async function runClustering({
  csvData,
  linkageMethod = 'ward',
  nClusters = 4,
  usePca = false,
  pcaComponents = 5,
}) {
  try {
    // Parse CSV
    const { headers, data } = parseCSV(csvData);
    
    if (data.length < 2) {
      throw new Error('Dataset must have at least 2 rows');
    }
    
    // Preprocess
    const { matrix, numericCols, categoricalCols } = preprocessData(data, headers);
    
    if (matrix[0].length === 0) {
      throw new Error('No valid features found in dataset');
    }
    
    // Note: For simplicity, PCA is not implemented client-side
    // The server version uses sklearn's PCA
    
    // Run clustering
    const linkageMatrix = hierarchicalClustering(matrix, linkageMethod);
    
    // Get cluster labels
    const labels = getClusters(linkageMatrix, nClusters, data.length);
    
    // Calculate metrics
    const silhouette = silhouetteScore(matrix, labels);
    
    const clusterSizes = {};
    labels.forEach(label => {
      clusterSizes[label] = (clusterSizes[label] || 0) + 1;
    });
    
    // Generate dendrogram
    const dendrogram = generateDendrogramSVG(linkageMatrix, data.length, linkageMethod);
    
    return {
      success: true,
      metrics: {
        n_clusters: nClusters,
        n_samples: data.length,
        silhouette_score: Math.round(silhouette * 1000) / 1000,
        cluster_sizes: clusterSizes,
      },
      dendrogram,
      labels,
      feature_config: {
        numeric_features: numericCols,
        categorical_features: categoricalCols,
        pca_applied: false,
        pca_explained_variance: null,
      },
      linkage_method: linkageMethod,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

