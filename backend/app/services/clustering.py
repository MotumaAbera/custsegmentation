from typing import Tuple

import matplotlib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from scipy.cluster.hierarchy import dendrogram, fcluster, linkage

matplotlib.use("Agg")


def perform_hierarchical_clustering(
    data: np.ndarray, linkage_method: str
) -> np.ndarray:
    linkage_matrix = linkage(data, method=linkage_method)
    return linkage_matrix


def get_flat_clusters(linkage_matrix: np.ndarray, n_clusters: int) -> np.ndarray:
    labels = fcluster(linkage_matrix, n_clusters, criterion="maxclust")
    labels = labels - 1
    return labels


def generate_dendrogram(
    linkage_matrix: np.ndarray,
    dataset_id: int,
    linkage_method: str,
    max_display: int = 50,
) -> plt.Figure:
    fig, ax = plt.subplots(figsize=(14, 8))

    dendrogram(
        linkage_matrix,
        ax=ax,
        truncate_mode="lastp" if linkage_matrix.shape[0] > max_display else None,
        p=max_display,
        leaf_rotation=90,
        leaf_font_size=8,
        show_contracted=True,
        color_threshold=0.7 * max(linkage_matrix[:, 2]),
    )

    ax.set_title(
        f"Hierarchical Clustering Dendrogram\nDataset: {dataset_id} | Linkage: {linkage_method.upper()}",
        fontsize=14,
        fontweight="bold",
    )
    ax.set_xlabel("Sample Index (or Cluster Size)", fontsize=11)
    ax.set_ylabel("Distance", fontsize=11)
    ax.tick_params(axis="both", which="major", labelsize=9)

    plt.tight_layout()
    return fig


def generate_scatter_plot(
    assignments: list,
    x_feature: str,
    y_feature: str,
    run_id: int,
) -> plt.Figure:
    """Generate scatter plot visualization for cluster assignments."""
    if not assignments:
        raise ValueError("No assignments provided")
    
    # Extract data
    data_points = []
    cluster_labels = []
    
    for assignment in assignments:
        payload = assignment.payload if assignment.payload else {}
        cluster_label = assignment.cluster_label
        
        if payload and x_feature in payload and y_feature in payload:
            try:
                x_val = float(payload[x_feature])
                y_val = float(payload[y_feature])
                data_points.append([x_val, y_val])
                cluster_labels.append(cluster_label)
            except (ValueError, TypeError):
                continue
    
    if not data_points:
        raise ValueError(f"Features {x_feature} and/or {y_feature} not found or not numeric")
    
    data_array = np.array(data_points)
    unique_clusters = sorted(set(cluster_labels))
    
    fig, ax = plt.subplots(figsize=(12, 8))
    
    colors = plt.cm.tab10(np.linspace(0, 1, len(unique_clusters)))
    
    for i, cluster_id in enumerate(unique_clusters):
        mask = np.array(cluster_labels) == cluster_id
        ax.scatter(
            data_array[mask, 0],
            data_array[mask, 1],
            c=[colors[i]],
            label=f'Cluster {cluster_id + 1}',
            alpha=0.6,
            s=50,
            edgecolors='black',
            linewidth=0.5
        )
    
    ax.set_xlabel(x_feature, fontsize=12, fontweight='bold')
    ax.set_ylabel(y_feature, fontsize=12, fontweight='bold')
    ax.set_title(
        f'Cluster Scatter Plot\nRun #{run_id} | X: {x_feature} vs Y: {y_feature}',
        fontsize=14,
        fontweight='bold'
    )
    ax.legend(loc='best', framealpha=0.9)
    ax.grid(True, alpha=0.3, linestyle='--')
    
    plt.tight_layout()
    return fig


def generate_distribution_chart(
    cluster_sizes: dict,
    run_id: int,
) -> plt.Figure:
    """Generate distribution chart (pie and bar) for cluster sizes."""
    if not cluster_sizes:
        raise ValueError("No cluster sizes provided")
    
    # Prepare data
    clusters = sorted([int(k) for k in cluster_sizes.keys()])
    sizes = [cluster_sizes[str(k)] for k in clusters]
    labels = [f'Cluster {k + 1}' for k in clusters]
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
    
    colors = plt.cm.tab10(np.linspace(0, 1, len(clusters)))
    
    # Pie chart
    ax1.pie(
        sizes,
        labels=labels,
        autopct='%1.1f%%',
        colors=colors,
        startangle=90,
        textprops={'fontsize': 10, 'fontweight': 'bold'}
    )
    ax1.set_title('Cluster Distribution (Pie Chart)', fontsize=12, fontweight='bold')
    
    # Bar chart
    bars = ax2.barh(labels, sizes, color=colors)
    ax2.set_xlabel('Number of Samples', fontsize=11, fontweight='bold')
    ax2.set_title('Cluster Sizes (Bar Chart)', fontsize=12, fontweight='bold')
    ax2.grid(True, alpha=0.3, axis='x', linestyle='--')
    
    # Add value labels on bars
    for i, (bar, size) in enumerate(zip(bars, sizes)):
        width = bar.get_width()
        ax2.text(width, bar.get_y() + bar.get_height()/2,
                f' {int(size)}',
                ha='left', va='center', fontweight='bold', fontsize=10)
    
    fig.suptitle(f'Cluster Distribution Analysis - Run #{run_id}', 
                 fontsize=14, fontweight='bold', y=1.02)
    
    plt.tight_layout()
    return fig

