# Customer Segmentation API

ML-backed REST API for customer segmentation using **Hierarchical Clustering**, built with FastAPI and PostgreSQL.

## Tech Stack

| Component | Technology |
|-----------|------------|
| API Framework | FastAPI |
| Database | PostgreSQL 15 |
| ORM | SQLAlchemy 2.0 (async) |
| Migrations | Alembic |
| ML | scikit-learn, scipy |
| Visualization | matplotlib |
| Container | Docker + docker-compose |

## Quick Start

### 1. Clone and Setup

```bash
cd customer-segmentation-api
cp env.example .env
```

### 2. Run with Docker

```bash
docker-compose up --build
```

The API will be available at: **http://localhost:8000**

### 3. Run Migrations

```bash
# In a new terminal, run migrations inside the container
docker-compose exec api alembic upgrade head
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/` | Health check |
| `POST` | `/api/v1/datasets/upload` | Upload CSV dataset |
| `GET` | `/api/v1/datasets` | List all datasets |
| `POST` | `/api/v1/clustering/train` | Train clustering model |
| `GET` | `/api/v1/clustering/runs/{dataset_id}` | Get runs for dataset |
| `GET` | `/api/v1/clustering/segments/{run_id}` | Get cluster assignments |
| `GET` | `/api/v1/clustering/dendrogram/{run_id}` | Get dendrogram image |

## Swagger UI Demo

1. Open **http://localhost:8000/docs**

2. **Upload a dataset:**
   - Use `POST /api/v1/datasets/upload`
   - Upload a CSV file

3. **Train clustering:**
   - Use `POST /api/v1/clustering/train`
   - Request body:
   ```json
   {
     "dataset_id": 1,
     "linkage": "ward",
     "n_clusters": 4,
     "use_pca": false
   }
   ```

4. **View results:**
   - Get segments: `GET /api/v1/clustering/segments/{run_id}`
   - View dendrogram: `GET /api/v1/clustering/dendrogram/{run_id}`

## Example CSV Format

```csv
customer_id,age,annual_income,spending_score,gender,region
1,25,45000,65,Male,Addis Ababa
2,32,78000,82,Female,Dire Dawa
3,45,52000,45,Male,Hawassa
4,28,61000,73,Female,Bahir Dar
5,56,89000,38,Male,Mekelle
```

### Supported Features

- **Numeric**: Automatically scaled with StandardScaler
- **Categorical**: Automatically encoded with OneHotEncoder

## Clustering Parameters

| Parameter | Type | Values | Description |
|-----------|------|--------|-------------|
| `dataset_id` | int | - | Dataset to cluster |
| `linkage` | string | ward, complete, average, single | Linkage method |
| `n_clusters` | int | 2-15 | Number of clusters |
| `use_pca` | bool | true/false | Apply PCA reduction |
| `pca_components` | int | 2+ | Number of PCA components |

## Metrics Returned

- **silhouette_score**: Cluster quality (-1 to 1, higher is better)
- **cluster_sizes**: Distribution of samples per cluster
- **n_samples**: Total number of data points
- **n_encoded_features**: Features after preprocessing

## Development

### Local Setup (without Docker)

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/segmentation"

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

### Project Structure

```
customer-segmentation-api/
├── app/
│   ├── main.py              # FastAPI application
│   ├── core/config.py       # Configuration
│   ├── db/
│   │   ├── base.py          # SQLAlchemy base
│   │   ├── session.py       # Database session
│   │   └── models.py        # ORM models
│   ├── schemas/             # Pydantic schemas
│   ├── services/            # Business logic
│   │   ├── io.py            # File operations
│   │   ├── preprocessing.py # Feature engineering
│   │   ├── clustering.py    # ML clustering
│   │   └── metrics.py       # Evaluation metrics
│   └── api/routes.py        # API endpoints
├── alembic/                 # Database migrations
├── data/                    # Uploaded CSVs
├── outputs/                 # Dendrogram images
├── docker-compose.yml
└── Dockerfile
```

## License

MIT

