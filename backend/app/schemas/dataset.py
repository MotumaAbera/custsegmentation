from datetime import datetime
from typing import List

from pydantic import BaseModel, ConfigDict


class DatasetBase(BaseModel):
    name: str


class DatasetCreate(DatasetBase):
    file_path: str


class DatasetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    file_path: str
    created_at: datetime


class DatasetListResponse(BaseModel):
    datasets: List[DatasetResponse]
    total: int

