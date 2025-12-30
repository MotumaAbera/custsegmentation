from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class LinkageMethod(str, Enum):
    WARD = "ward"
    COMPLETE = "complete"
    AVERAGE = "average"
    SINGLE = "single"


class ClusteringRequest(BaseModel):
    dataset_id: int
    linkage: LinkageMethod = LinkageMethod.WARD
    n_clusters: int = Field(ge=2, le=15, default=3)
    use_pca: bool = False
    pca_components: Optional[int] = Field(default=None, ge=2)


class ClusteringRunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    dataset_id: int
    linkage: str
    n_clusters: int
    feature_config: Optional[Dict[str, Any]]
    metrics: Optional[Dict[str, Any]]
    dendrogram_path: Optional[str]
    created_at: datetime


class ClusteringRunListResponse(BaseModel):
    runs: List[ClusteringRunResponse]
    total: int


class ClusterAssignmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    run_id: int
    row_index: int
    cluster_label: int
    payload: Optional[Dict[str, Any]]


class SegmentListResponse(BaseModel):
    run_id: int
    assignments: List[ClusterAssignmentResponse]
    total: int

