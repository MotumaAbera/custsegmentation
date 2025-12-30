from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import ClusterAssignment, ClusteringRun, Dataset
from app.db.session import get_db
from app.schemas.clustering import (
    ClusterAssignmentResponse,
    ClusteringRequest,
    ClusteringRunListResponse,
    ClusteringRunResponse,
    SegmentListResponse,
)
from app.schemas.dataset import DatasetListResponse, DatasetResponse
from app.services.clustering import (
    generate_dendrogram,
    get_flat_clusters,
    perform_hierarchical_clustering,
)
from app.services.io import load_csv, save_dendrogram, save_uploaded_file
from app.services.metrics import compile_metrics
from app.services.preprocessing import (
    apply_pca,
    apply_preprocessing,
    build_preprocessor,
    detect_feature_types,
    get_feature_config,
)

router = APIRouter()


@router.get("/", tags=["Health"])
async def health_check():
    return {"status": "ok"}


@router.post(
    "/datasets/upload",
    response_model=DatasetResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Datasets"],
)
async def upload_dataset(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are allowed",
        )

    file_path = save_uploaded_file(file.file, file.filename)

    dataset = Dataset(name=file.filename, file_path=file_path)
    db.add(dataset)
    await db.flush()
    await db.refresh(dataset)

    return dataset


@router.get("/datasets", response_model=DatasetListResponse, tags=["Datasets"])
async def list_datasets(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Dataset).order_by(Dataset.created_at.desc()))
    datasets = result.scalars().all()

    return DatasetListResponse(
        datasets=[DatasetResponse.model_validate(d) for d in datasets],
        total=len(datasets),
    )


@router.post(
    "/clustering/train",
    response_model=ClusteringRunResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Clustering"],
)
async def train_clustering(
    request: ClusteringRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Dataset).where(Dataset.id == request.dataset_id))
    dataset = result.scalar_one_or_none()

    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with id {request.dataset_id} not found",
        )

    try:
        df = load_csv(dataset.file_path)
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    if df.empty:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dataset is empty",
        )

    numeric_cols, categorical_cols = detect_feature_types(df)

    if not numeric_cols and not categorical_cols:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid features found in dataset",
        )

    preprocessor = build_preprocessor(numeric_cols, categorical_cols)
    data = apply_preprocessing(df, preprocessor)

    n_encoded_features = data.shape[1]
    pca_variance = None

    if request.use_pca and request.pca_components:
        if request.pca_components < n_encoded_features:
            data, pca_variance = apply_pca(data, request.pca_components)
            n_encoded_features = data.shape[1]

    if len(data) < request.n_clusters:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Number of samples ({len(data)}) must be >= n_clusters ({request.n_clusters})",
        )

    linkage_matrix = perform_hierarchical_clustering(data, request.linkage.value)
    labels = get_flat_clusters(linkage_matrix, request.n_clusters)

    metrics = compile_metrics(data, labels, n_encoded_features)
    feature_config = get_feature_config(
        numeric_cols=numeric_cols,
        categorical_cols=categorical_cols,
        n_encoded_features=n_encoded_features,
        use_pca=request.use_pca,
        pca_components=request.pca_components if request.use_pca else None,
        pca_variance=pca_variance,
    )

    clustering_run = ClusteringRun(
        dataset_id=request.dataset_id,
        linkage=request.linkage.value,
        n_clusters=request.n_clusters,
        feature_config=feature_config,
        metrics=metrics,
        dendrogram_path=None,
    )
    db.add(clustering_run)
    await db.flush()
    await db.refresh(clustering_run)

    fig = generate_dendrogram(
        linkage_matrix,
        dataset_id=request.dataset_id,
        linkage_method=request.linkage.value,
    )
    dendrogram_path = save_dendrogram(fig, clustering_run.id)
    clustering_run.dendrogram_path = dendrogram_path

    assignments: List[ClusterAssignment] = []
    for idx, label in enumerate(labels):
        row_data = df.iloc[idx].to_dict()
        for key, value in row_data.items():
            if hasattr(value, "item"):
                row_data[key] = value.item()

        assignment = ClusterAssignment(
            run_id=clustering_run.id,
            row_index=idx,
            cluster_label=int(label),
            payload=row_data,
        )
        assignments.append(assignment)

    db.add_all(assignments)
    await db.flush()

    return clustering_run


@router.get(
    "/clustering/runs/{dataset_id}",
    response_model=ClusteringRunListResponse,
    tags=["Clustering"],
)
async def get_clustering_runs(
    dataset_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    dataset = result.scalar_one_or_none()

    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with id {dataset_id} not found",
        )

    result = await db.execute(
        select(ClusteringRun)
        .where(ClusteringRun.dataset_id == dataset_id)
        .order_by(ClusteringRun.created_at.desc())
    )
    runs = result.scalars().all()

    return ClusteringRunListResponse(
        runs=[ClusteringRunResponse.model_validate(r) for r in runs],
        total=len(runs),
    )


@router.get(
    "/clustering/segments/{run_id}",
    response_model=SegmentListResponse,
    tags=["Clustering"],
)
async def get_cluster_segments(
    run_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ClusteringRun).where(ClusteringRun.id == run_id))
    run = result.scalar_one_or_none()

    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Clustering run with id {run_id} not found",
        )

    result = await db.execute(
        select(ClusterAssignment)
        .where(ClusterAssignment.run_id == run_id)
        .order_by(ClusterAssignment.row_index)
    )
    assignments = result.scalars().all()

    return SegmentListResponse(
        run_id=run_id,
        assignments=[ClusterAssignmentResponse.model_validate(a) for a in assignments],
        total=len(assignments),
    )


@router.get(
    "/clustering/dendrogram/{run_id}",
    tags=["Clustering"],
    responses={
        200: {
            "content": {"image/png": {}},
            "description": "Dendrogram image",
        }
    },
)
async def get_dendrogram(
    run_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ClusteringRun).where(ClusteringRun.id == run_id))
    run = result.scalar_one_or_none()

    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Clustering run with id {run_id} not found",
        )

    if not run.dendrogram_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dendrogram not available for this run",
        )

    path = Path(run.dendrogram_path)
    if not path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dendrogram file not found",
        )

    return FileResponse(
        path=str(path),
        media_type="image/png",
        filename=f"dendrogram_run_{run_id}.png",
    )

