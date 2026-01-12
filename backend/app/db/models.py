from datetime import datetime
from typing import List

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Dataset(Base):
    __tablename__ = "datasets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    clustering_runs: Mapped[List["ClusteringRun"]] = relationship(
        "ClusteringRun", back_populates="dataset", cascade="all, delete-orphan"
    )


class ClusteringRun(Base):
    __tablename__ = "clustering_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    dataset_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False
    )
    linkage: Mapped[str] = mapped_column(String(50), nullable=False)
    n_clusters: Mapped[int] = mapped_column(Integer, nullable=False)
    feature_config: Mapped[dict] = mapped_column(JSON, nullable=True)
    metrics: Mapped[dict] = mapped_column(JSON, nullable=True)
    dendrogram_path: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    dataset: Mapped["Dataset"] = relationship("Dataset", back_populates="clustering_runs")
    cluster_assignments: Mapped[List["ClusterAssignment"]] = relationship(
        "ClusterAssignment", back_populates="clustering_run", cascade="all, delete-orphan"
    )


class ClusterAssignment(Base):
    __tablename__ = "cluster_assignments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("clustering_runs.id", ondelete="CASCADE"), nullable=False
    )
    row_index: Mapped[int] = mapped_column(Integer, nullable=False)
    cluster_label: Mapped[int] = mapped_column(Integer, nullable=False)
    payload: Mapped[dict] = mapped_column(JSON, nullable=True)

    clustering_run: Mapped["ClusteringRun"] = relationship(
        "ClusteringRun", back_populates="cluster_assignments"
    )

