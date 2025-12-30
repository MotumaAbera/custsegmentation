from typing import Tuple

import matplotlib
import matplotlib.pyplot as plt
import numpy as np
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

