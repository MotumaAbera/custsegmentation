"""
Serverless clustering API endpoint for Vercel
Processes data in-memory without database
"""
import base64
import io
import json
from http.server import BaseHTTPRequestHandler

import matplotlib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from scipy.cluster.hierarchy import dendrogram, fcluster, linkage
from sklearn.compose import ColumnTransformer
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

matplotlib.use("Agg")


def detect_feature_types(df):
    """Detect numeric and categorical columns."""
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()
    return numeric_cols, categorical_cols


def preprocess_data(df, use_pca=False, pca_components=None):
    """Preprocess data with scaling and optional PCA."""
    numeric_cols, categorical_cols = detect_feature_types(df)
    
    transformers = []
    if numeric_cols:
        numeric_transformer = Pipeline(steps=[("scaler", StandardScaler())])
        transformers.append(("num", numeric_transformer, numeric_cols))
    
    if categorical_cols:
        categorical_transformer = Pipeline(
            steps=[("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))]
        )
        transformers.append(("cat", categorical_transformer, categorical_cols))
    
    if not transformers:
        raise ValueError("No valid features found in dataset")
    
    preprocessor = ColumnTransformer(transformers=transformers, remainder="drop")
    transformed = preprocessor.fit_transform(df)
    
    pca_variance = None
    if use_pca and pca_components:
        n_components = min(pca_components, transformed.shape[1], transformed.shape[0])
        pca = PCA(n_components=n_components)
        transformed = pca.fit_transform(transformed)
        pca_variance = float(np.sum(pca.explained_variance_ratio_))
    
    return transformed, numeric_cols, categorical_cols, pca_variance


def perform_clustering(data, linkage_method, n_clusters):
    """Perform hierarchical clustering."""
    linkage_matrix = linkage(data, method=linkage_method)
    labels = fcluster(linkage_matrix, n_clusters, criterion="maxclust") - 1
    return linkage_matrix, labels


def generate_dendrogram_base64(linkage_matrix, linkage_method, n_samples):
    """Generate dendrogram and return as base64 image."""
    fig, ax = plt.subplots(figsize=(14, 8))
    max_display = min(50, n_samples)
    
    dendrogram(
        linkage_matrix,
        ax=ax,
        truncate_mode="lastp" if n_samples > max_display else None,
        p=max_display,
        leaf_rotation=90,
        leaf_font_size=8,
        show_contracted=True,
        color_threshold=0.7 * max(linkage_matrix[:, 2]),
    )
    
    ax.set_title(
        f"Hierarchical Clustering Dendrogram | Linkage: {linkage_method.upper()}",
        fontsize=14,
        fontweight="bold",
    )
    ax.set_xlabel("Sample Index (or Cluster Size)", fontsize=11)
    ax.set_ylabel("Distance", fontsize=11)
    ax.tick_params(axis="both", which="major", labelsize=9)
    plt.tight_layout()
    
    # Save to base64
    buffer = io.BytesIO()
    fig.savefig(buffer, format="png", dpi=100, bbox_inches="tight", facecolor="white")
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.read()).decode("utf-8")
    plt.close(fig)
    
    return f"data:image/png;base64,{img_base64}"


def calculate_metrics(data, labels, n_clusters):
    """Calculate clustering quality metrics."""
    cluster_counts = {}
    for label in labels:
        cluster_counts[int(label)] = cluster_counts.get(int(label), 0) + 1
    
    silhouette = -1
    if n_clusters > 1 and len(set(labels)) > 1:
        try:
            silhouette = float(silhouette_score(data, labels))
        except:
            silhouette = -1
    
    return {
        "n_clusters": n_clusters,
        "n_samples": len(labels),
        "silhouette_score": round(silhouette, 4),
        "cluster_sizes": cluster_counts,
    }


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
    
    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode("utf-8"))
            
            # Extract parameters
            csv_data = data.get("csv_data")
            linkage_method = data.get("linkage_method", "ward")
            n_clusters = data.get("n_clusters", 4)
            use_pca = data.get("use_pca", False)
            pca_components = data.get("pca_components", 5)
            
            if not csv_data:
                raise ValueError("No CSV data provided")
            
            # Parse CSV
            df = pd.read_csv(io.StringIO(csv_data))
            
            # Remove ID-like columns
            id_cols = [col for col in df.columns if col.lower() in ["id", "customer_id", "customerid", "index"]]
            df = df.drop(columns=id_cols, errors="ignore")
            
            # Preprocess
            transformed, numeric_cols, categorical_cols, pca_variance = preprocess_data(
                df, use_pca, pca_components
            )
            
            # Cluster
            linkage_matrix, labels = perform_clustering(transformed, linkage_method, n_clusters)
            
            # Generate dendrogram
            dendrogram_img = generate_dendrogram_base64(linkage_matrix, linkage_method, len(df))
            
            # Calculate metrics
            metrics = calculate_metrics(transformed, labels, n_clusters)
            
            # Build response
            result = {
                "success": True,
                "metrics": metrics,
                "dendrogram": dendrogram_img,
                "labels": labels.tolist(),
                "feature_config": {
                    "numeric_features": numeric_cols,
                    "categorical_features": categorical_cols,
                    "pca_applied": use_pca,
                    "pca_explained_variance": pca_variance,
                },
                "linkage_method": linkage_method,
            }
            
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(result).encode("utf-8"))
            
        except Exception as e:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({
                "success": False,
                "error": str(e)
            }).encode("utf-8"))

