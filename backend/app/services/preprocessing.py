from typing import Dict, List, Tuple

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.decomposition import PCA
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


def detect_feature_types(df: pd.DataFrame) -> Tuple[List[str], List[str]]:
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()

    return numeric_cols, categorical_cols


def build_preprocessor(
    numeric_cols: List[str], categorical_cols: List[str]
) -> ColumnTransformer:
    transformers = []

    if numeric_cols:
        numeric_transformer = Pipeline(
            steps=[("scaler", StandardScaler())]
        )
        transformers.append(("num", numeric_transformer, numeric_cols))

    if categorical_cols:
        categorical_transformer = Pipeline(
            steps=[("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))]
        )
        transformers.append(("cat", categorical_transformer, categorical_cols))

    preprocessor = ColumnTransformer(
        transformers=transformers,
        remainder="drop",
    )

    return preprocessor


def apply_preprocessing(
    df: pd.DataFrame, preprocessor: ColumnTransformer
) -> np.ndarray:
    transformed = preprocessor.fit_transform(df)
    return transformed


def apply_pca(data: np.ndarray, n_components: int) -> Tuple[np.ndarray, float]:
    n_components = min(n_components, data.shape[1], data.shape[0])
    pca = PCA(n_components=n_components)
    transformed = pca.fit_transform(data)
    explained_variance = float(np.sum(pca.explained_variance_ratio_))

    return transformed, explained_variance


def get_feature_config(
    numeric_cols: List[str],
    categorical_cols: List[str],
    n_encoded_features: int,
    use_pca: bool,
    pca_components: int = None,
    pca_variance: float = None,
) -> Dict:
    config = {
        "numeric_features": numeric_cols,
        "categorical_features": categorical_cols,
        "total_original_features": len(numeric_cols) + len(categorical_cols),
        "encoded_features": n_encoded_features,
        "pca_applied": use_pca,
    }

    if use_pca:
        config["pca_components"] = pca_components
        config["pca_explained_variance"] = pca_variance

    return config

