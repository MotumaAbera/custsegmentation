# API Documentation

## Overview

The SegmentIQ API is a RESTful API built with FastAPI. It provides endpoints for managing datasets, running clustering analyses, and retrieving results.

**Base URL:** `http://localhost:8000/api/v1`

**Interactive Documentation:** `http://localhost:8000/docs` (Swagger UI)

---

## Authentication

Currently, the API does not require authentication. For production deployments, consider adding JWT authentication.

---

## Endpoints

### Health Check

#### `GET /health`

Check if the API is running.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-31T10:00:00Z"
}
```

---

## Datasets

### Upload Dataset

#### `POST /api/v1/datasets/upload`

Upload a CSV file to create a new dataset.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` - CSV file

**Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/datasets/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@customers.csv"
```

**Response:**
```json
{
  "id": 1,
  "name": "customers.csv",
  "file_path": "data/customers.csv",
  "created_at": "2024-12-31T10:30:00Z"
}
```

**Errors:**
| Status | Description |
|--------|-------------|
| 400 | Invalid file format (not CSV) |
| 413 | File too large |
| 500 | Server error |

---

### List Datasets

#### `GET /api/v1/datasets`

Retrieve all uploaded datasets.

**Response:**
```json
{
  "datasets": [
    {
      "id": 1,
      "name": "customers.csv",
      "file_path": "data/customers.csv",
      "created_at": "2024-12-31T10:30:00Z"
    }
  ]
}
```

---

### Get Dataset

#### `GET /api/v1/datasets/{id}`

Retrieve a specific dataset by ID.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| id | integer | Dataset ID |

**Response:**
```json
{
  "id": 1,
  "name": "customers.csv",
  "file_path": "data/customers.csv",
  "created_at": "2024-12-31T10:30:00Z"
}
```

**Errors:**
| Status | Description |
|--------|-------------|
| 404 | Dataset not found |

---

### Delete Dataset

#### `DELETE /api/v1/datasets/{id}`

Delete a dataset and its associated clustering runs.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| id | integer | Dataset ID |

**Response:**
```json
{
  "message": "Dataset deleted successfully"
}
```

---

## Clustering

### Train Clustering Model

#### `POST /api/v1/clustering/train`

Run hierarchical clustering on a dataset.

**Request Body:**
```json
{
  "dataset_id": 1,
  "linkage": "ward",
  "n_clusters": 4,
  "use_pca": false,
  "pca_components": null
}
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| dataset_id | integer | Yes | ID of the dataset to cluster |
| linkage | string | Yes | Linkage method: ward, complete, average, single |
| n_clusters | integer | Yes | Number of clusters (2-20) |
| use_pca | boolean | No | Apply PCA reduction (default: false) |
| pca_components | integer | No | Number of PCA components (required if use_pca is true) |

**Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/clustering/train" \
  -H "Content-Type: application/json" \
  -d '{
    "dataset_id": 1,
    "linkage": "ward",
    "n_clusters": 4,
    "use_pca": true,
    "pca_components": 5
  }'
```

**Response:**
```json
{
  "id": 1,
  "dataset_id": 1,
  "linkage": "ward",
  "n_clusters": 4,
  "feature_config": {
    "numeric_features": ["age", "total_spend", "visit_frequency", "avg_basket_size"],
    "categorical_features": ["gender", "region", "preferred_category"],
    "pca_applied": true,
    "pca_components": 5,
    "pca_explained_variance": 0.92,
    "n_encoded_features": 12
  },
  "metrics": {
    "n_samples": 500,
    "n_clusters": 4,
    "n_encoded_features": 5,
    "silhouette_score": 0.532,
    "cluster_sizes": {
      "0": 125,
      "1": 143,
      "2": 112,
      "3": 120
    }
  },
  "dendrogram_path": "outputs/dendrogram_1.png",
  "created_at": "2024-12-31T10:35:00Z"
}
```

**Errors:**
| Status | Description |
|--------|-------------|
| 400 | Invalid parameters |
| 404 | Dataset not found |
| 500 | Clustering failed |

---

### List Clustering Runs

#### `GET /api/v1/clustering/runs`

Retrieve all clustering runs.

**Query Parameters:**
| Name | Type | Description |
|------|------|-------------|
| dataset_id | integer | Filter by dataset ID (optional) |

**Response:**
```json
{
  "runs": [
    {
      "id": 1,
      "dataset_id": 1,
      "linkage": "ward",
      "n_clusters": 4,
      "metrics": {...},
      "created_at": "2024-12-31T10:35:00Z"
    }
  ]
}
```

---

### Get Clustering Run

#### `GET /api/v1/clustering/runs/{id}`

Retrieve details of a specific clustering run.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| id | integer | Clustering run ID |

**Response:**
```json
{
  "id": 1,
  "dataset_id": 1,
  "linkage": "ward",
  "n_clusters": 4,
  "feature_config": {...},
  "metrics": {...},
  "dendrogram_path": "outputs/dendrogram_1.png",
  "created_at": "2024-12-31T10:35:00Z"
}
```

---

### Get Dendrogram

#### `GET /api/v1/clustering/runs/{id}/dendrogram`

Retrieve the dendrogram image for a clustering run.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| id | integer | Clustering run ID |

**Response:**
- Content-Type: `image/png`
- Body: PNG image data

---

### Get Cluster Assignments

#### `GET /api/v1/clustering/runs/{id}/assignments`

Retrieve all cluster assignments for a run.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| id | integer | Clustering run ID |

**Query Parameters:**
| Name | Type | Description |
|------|------|-------------|
| cluster | integer | Filter by cluster label (optional) |

**Response:**
```json
{
  "run_id": 1,
  "assignments": [
    {
      "id": 1,
      "row_index": 0,
      "cluster_label": 2,
      "payload": {
        "customer_id": "C001",
        "age": 35,
        "gender": "Male",
        "total_spend": 45000
      }
    }
  ]
}
```

---

## Data Models

### Dataset

```typescript
interface Dataset {
  id: number;
  name: string;
  file_path: string;
  created_at: string; // ISO 8601
}
```

### ClusteringRun

```typescript
interface ClusteringRun {
  id: number;
  dataset_id: number;
  linkage: 'ward' | 'complete' | 'average' | 'single';
  n_clusters: number;
  feature_config: FeatureConfig;
  metrics: ClusteringMetrics;
  dendrogram_path: string;
  created_at: string; // ISO 8601
}
```

### FeatureConfig

```typescript
interface FeatureConfig {
  numeric_features: string[];
  categorical_features: string[];
  pca_applied: boolean;
  pca_components?: number;
  pca_explained_variance?: number;
  n_encoded_features: number;
}
```

### ClusteringMetrics

```typescript
interface ClusteringMetrics {
  n_samples: number;
  n_clusters: number;
  n_encoded_features: number;
  silhouette_score: number;
  cluster_sizes: Record<string, number>;
}
```

### ClusterAssignment

```typescript
interface ClusterAssignment {
  id: number;
  run_id: number;
  row_index: number;
  cluster_label: number;
  payload: Record<string, any>;
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Resource doesn't exist |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error |

---

## Rate Limiting

Currently, no rate limiting is implemented. For production, consider adding rate limiting middleware.

---

## CORS

CORS is enabled for all origins in development. Configure allowed origins for production:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

