from typing import Any, Dict, Optional

import numpy as np
from sklearn.metrics import silhouette_score


def calculate_silhouette(data: np.ndarray, labels: np.ndarray) -> Optional[float]:
    unique_labels = np.unique(labels)
    if len(unique_labels) < 2 or len(unique_labels) >= len(data):
        return None

    try:
        score = silhouette_score(data, labels)
        return float(score)
    except Exception:
        return None


def calculate_cluster_sizes(labels: np.ndarray) -> Dict[int, int]:
    unique, counts = np.unique(labels, return_counts=True)
    return {int(label): int(count) for label, count in zip(unique, counts)}


def compile_metrics(
    data: np.ndarray,
    labels: np.ndarray,
    n_encoded_features: int,
) -> Dict[str, Any]:
    silhouette = calculate_silhouette(data, labels)
    cluster_sizes = calculate_cluster_sizes(labels)

    metrics = {
        "n_samples": int(len(labels)),
        "n_clusters": int(len(np.unique(labels))),
        "n_encoded_features": n_encoded_features,
        "silhouette_score": silhouette,
        "cluster_sizes": cluster_sizes,
    }

    return metrics

