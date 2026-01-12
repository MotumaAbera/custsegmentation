# SegmentIQ Backend

FastAPI backend for customer segmentation using hierarchical clustering.

## Quick Start

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp env.example .env

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000
```

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── routes.py          # API endpoints
│   ├── core/
│   │   └── config.py          # Settings management
│   ├── db/
│   │   ├── base.py            # SQLAlchemy base
│   │   ├── models.py          # ORM models
│   │   └── session.py         # Database session
│   ├── schemas/
│   │   ├── dataset.py         # Pydantic schemas
│   │   └── clustering.py
│   ├── services/
│   │   ├── io.py              # File operations
│   │   ├── preprocessing.py   # Data preprocessing
│   │   ├── clustering.py      # ML clustering
│   │   └── metrics.py         # Evaluation metrics
│   └── main.py                # FastAPI application
├── alembic/
│   ├── versions/              # Migration scripts
│   └── env.py                 # Alembic config
├── data/                      # Uploaded CSV files
├── outputs/                   # Generated dendrograms
├── tests/                     # Test files
├── requirements.txt
├── alembic.ini
└── .env
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_NAME` | Application name | Customer Segmentation API |
| `ENV` | Environment (dev/prod) | dev |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `UPLOAD_DIR` | Directory for uploads | data |
| `OUTPUT_DIR` | Directory for outputs | outputs |

### Example .env

```env
APP_NAME=Customer Segmentation API
ENV=dev
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/Customerseg
UPLOAD_DIR=data
OUTPUT_DIR=outputs
```

## Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one step
alembic downgrade -1

# Rollback all
alembic downgrade base
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/datasets/upload` | Upload CSV |
| `GET` | `/api/v1/datasets` | List datasets |
| `GET` | `/api/v1/datasets/{id}` | Get dataset |
| `DELETE` | `/api/v1/datasets/{id}` | Delete dataset |
| `POST` | `/api/v1/clustering/train` | Run clustering |
| `GET` | `/api/v1/clustering/runs` | List runs |
| `GET` | `/api/v1/clustering/runs/{id}` | Get run details |
| `GET` | `/api/v1/clustering/runs/{id}/dendrogram` | Get dendrogram |
| `GET` | `/api/v1/clustering/runs/{id}/assignments` | Get assignments |

## Development

### Running Tests

```bash
pytest tests/ -v
```

### Code Formatting

```bash
# Format code
black app/

# Sort imports
isort app/

# Type checking
mypy app/
```

### API Documentation

When running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Services

### io.py - File Operations

Handles CSV upload and validation.

### preprocessing.py - Data Preprocessing

- Column type detection
- Numeric standardization (StandardScaler)
- Categorical encoding (OneHotEncoder)
- Optional PCA reduction

### clustering.py - ML Clustering

- Hierarchical agglomerative clustering
- Dendrogram generation
- Cluster assignment

### metrics.py - Evaluation

- Silhouette score calculation
- Cluster size statistics

## Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
docker build -t segmentation-api .
docker run -p 8000:8000 segmentation-api
```
