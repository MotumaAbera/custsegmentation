# SegmentIQ - Customer Segmentation for Ethiopian Supermarkets

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11+-blue.svg" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-0.100+-green.svg" alt="FastAPI">
  <img src="https://img.shields.io/badge/React-18+-61DAFB.svg" alt="React">
  <img src="https://img.shields.io/badge/PostgreSQL-15+-336791.svg" alt="PostgreSQL">
</p>

A full-stack machine learning application for customer segmentation using **Hierarchical Clustering**. Built specifically for Ethiopian supermarket analytics, this system helps identify distinct customer segments to enable targeted marketing strategies.

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Local Development](#-local-development)
- [Docker Deployment](#-docker-deployment)
- [API Reference](#-api-reference)
- [Machine Learning Pipeline](#-machine-learning-pipeline)
- [Database Schema](#-database-schema)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### Machine Learning
- **Hierarchical Clustering** with multiple linkage methods (Ward, Complete, Average, Single)
- **Automatic feature detection** - numeric and categorical columns
- **PCA dimensionality reduction** for high-dimensional datasets
- **Silhouette score** for cluster quality evaluation
- **Dendrogram visualization** showing cluster hierarchy

### User Interface
- **Modern dark theme** with elegant gold accents
- **Drag-and-drop file upload** for CSV datasets
- **Interactive configuration** with tooltips and hints
- **Real-time progress** during clustering
- **Tabbed results view** with charts and statistics
- **Responsive design** for all screen sizes

### Backend
- **RESTful API** with FastAPI
- **Async database operations** with SQLAlchemy 2.0
- **PostgreSQL** for persistent storage
- **Automatic migrations** with Alembic
- **Docker-ready** deployment

---

## 🏗 Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React + Vite   │────▶│    FastAPI      │────▶│   PostgreSQL    │
│   (Frontend)    │     │   (Backend)     │     │   (Database)    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
       :3000                  :8000                   :5432
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, Framer Motion, Recharts, Lucide Icons |
| **Backend** | Python 3.11+, FastAPI, Uvicorn, Pydantic |
| **Database** | PostgreSQL 15, SQLAlchemy 2.0 (async), Alembic |
| **ML/Data** | Pandas, NumPy, Scikit-learn, SciPy, Matplotlib |
| **DevOps** | Docker, Docker Compose |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Git

### Clone the Repository

```bash
git clone https://github.com/your-username/customer-segmentation.git
cd customer-segmentation
```

---

## 💻 Local Development

### 1. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE Customerseg;
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment

Create `backend/.env`:

```env
APP_NAME=Customer Segmentation API
ENV=dev
DATABASE_URL=postgresql+asyncpg://postgres:your_password@localhost:5432/Customerseg
UPLOAD_DIR=data
OUTPUT_DIR=outputs
```

> ⚠️ **Note:** If your password contains special characters like `@`, URL-encode them (e.g., `@` becomes `%40`)

### 4. Run Migrations

```bash
cd backend
alembic upgrade head
```

### 5. Start Backend

```bash
uvicorn app.main:app --reload --port 8000
```

### 6. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 7. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# Stop services
docker-compose down
```

### Services

| Service | Port | Description |
|---------|------|-------------|
| `db` | 5432 | PostgreSQL database |
| `api` | 8000 | FastAPI backend |
| `frontend` | 3000 | React frontend |

---

## 📡 API Reference

### Base URL
```
http://localhost:8000/api/v1
```

### Endpoints

#### Datasets

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/datasets/upload` | Upload a CSV file |
| `GET` | `/datasets` | List all datasets |
| `GET` | `/datasets/{id}` | Get dataset details |
| `DELETE` | `/datasets/{id}` | Delete a dataset |

#### Clustering

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/clustering/train` | Run clustering analysis |
| `GET` | `/clustering/runs` | List all clustering runs |
| `GET` | `/clustering/runs/{id}` | Get run details |
| `GET` | `/clustering/runs/{id}/dendrogram` | Get dendrogram image |
| `GET` | `/clustering/runs/{id}/assignments` | Get cluster assignments |

### Example: Upload Dataset

```bash
curl -X POST "http://localhost:8000/api/v1/datasets/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@customers.csv"
```

### Example: Run Clustering

```bash
curl -X POST "http://localhost:8000/api/v1/clustering/train" \
  -H "Content-Type: application/json" \
  -d '{
    "dataset_id": 1,
    "linkage": "ward",
    "n_clusters": 4,
    "use_pca": false
  }'
```

### Response Schema

```json
{
  "id": 1,
  "dataset_id": 1,
  "linkage": "ward",
  "n_clusters": 4,
  "feature_config": {
    "numeric_features": ["age", "total_spend", "visit_frequency"],
    "categorical_features": ["gender", "region"],
    "pca_applied": false
  },
  "metrics": {
    "n_samples": 500,
    "n_clusters": 4,
    "n_encoded_features": 8,
    "silhouette_score": 0.532,
    "cluster_sizes": {"0": 125, "1": 143, "2": 112, "3": 120}
  },
  "dendrogram_path": "outputs/dendrogram_1.png",
  "created_at": "2024-12-31T10:30:00Z"
}
```

---

## 🤖 Machine Learning Pipeline

### 1. Data Preprocessing

```
CSV Upload → Column Detection → Feature Extraction
                                      ↓
                    ┌─────────────────┴─────────────────┐
                    ↓                                   ↓
            Numeric Features                  Categorical Features
                    ↓                                   ↓
            StandardScaler                     OneHotEncoder
                    ↓                                   ↓
                    └─────────────────┬─────────────────┘
                                      ↓
                              ColumnTransformer
                                      ↓
                         (Optional) PCA Reduction
```

### 2. Clustering Algorithm

**Hierarchical Agglomerative Clustering:**

1. Each data point starts as its own cluster
2. Iteratively merge closest clusters based on linkage criterion
3. Continue until desired number of clusters is reached

### 3. Linkage Methods

| Method | Description | Best For |
|--------|-------------|----------|
| **Ward** | Minimizes within-cluster variance | Compact, equal-sized clusters |
| **Complete** | Maximum pairwise distance | Well-separated clusters |
| **Average** | Mean pairwise distance | General purpose |
| **Single** | Minimum pairwise distance | Detecting outliers |

### 4. Evaluation Metrics

**Silhouette Score** measures how similar an object is to its own cluster compared to other clusters.

| Score Range | Interpretation |
|-------------|----------------|
| 0.71 – 1.00 | Excellent |
| 0.51 – 0.70 | Good |
| 0.26 – 0.50 | Fair |
| < 0.25 | Poor |

---

## 🗄 Database Schema

### Tables

#### `datasets`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| name | VARCHAR | Dataset filename |
| file_path | VARCHAR | Path to stored CSV |
| created_at | TIMESTAMP | Upload timestamp |

#### `clustering_runs`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| dataset_id | INTEGER | Foreign key to datasets |
| linkage | VARCHAR | Linkage method used |
| n_clusters | INTEGER | Number of clusters |
| feature_config | JSONB | Feature configuration |
| metrics | JSONB | Clustering metrics |
| dendrogram_path | VARCHAR | Path to dendrogram image |
| created_at | TIMESTAMP | Run timestamp |

#### `cluster_assignments`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| run_id | INTEGER | Foreign key to runs |
| row_index | INTEGER | Original row index |
| cluster_label | INTEGER | Assigned cluster |
| payload | JSONB | Original row data |

---

## 📁 Project Structure

```
CustSegML/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py          # API endpoints
│   │   ├── core/
│   │   │   └── config.py          # Settings
│   │   ├── db/
│   │   │   ├── base.py            # SQLAlchemy base
│   │   │   ├── models.py          # ORM models
│   │   │   └── session.py         # Database session
│   │   ├── schemas/
│   │   │   ├── dataset.py         # Pydantic schemas
│   │   │   └── clustering.py
│   │   ├── services/
│   │   │   ├── io.py              # File I/O
│   │   │   ├── preprocessing.py   # Data preprocessing
│   │   │   ├── clustering.py      # ML clustering
│   │   │   └── metrics.py         # Evaluation
│   │   └── main.py                # FastAPI app
│   ├── alembic/
│   │   └── versions/              # Migration scripts
│   ├── data/                      # Uploaded files
│   ├── outputs/                   # Generated outputs
│   ├── requirements.txt
│   ├── alembic.ini
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   ├── DatasetList.jsx
│   │   │   ├── ClusteringConfig.jsx
│   │   │   ├── Results.jsx
│   │   │   ├── StepIndicator.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── Tooltip.jsx
│   │   │   └── TrainingProgress.jsx
│   │   ├── hooks/
│   │   │   ├── useApi.js
│   │   │   └── useToast.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── sample_data/
│   └── ethiopian_supermarket_customers.csv
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_NAME` | Application name | Customer Segmentation API |
| `ENV` | Environment (dev/prod) | dev |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `UPLOAD_DIR` | Directory for uploads | data |
| `OUTPUT_DIR` | Directory for outputs | outputs |

### Sample .env

```env
APP_NAME=Customer Segmentation API
ENV=dev
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/Customerseg
UPLOAD_DIR=data
OUTPUT_DIR=outputs
```

---

## 🔧 Troubleshooting

### Database Connection Error

**Error:** `socket.gaierror: [Errno 11003] getaddrinfo failed`

**Solution:** Check that PostgreSQL is running and the DATABASE_URL is correct.

### Password with Special Characters

**Error:** Connection fails with `@` in password

**Solution:** URL-encode special characters:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`

In `alembic.ini`, use double `%%`:
```ini
sqlalchemy.url = postgresql+asyncpg://user:pass%%40word@localhost:5432/db
```

### Port Already in Use

**Error:** `Port 3000 is in use`

**Solution:** Kill the process or use a different port:
```bash
npm run dev -- --port 3001
```

### Migration Errors

**Solution:** Reset and rerun migrations:
```bash
alembic downgrade base
alembic upgrade head
```

---

## 📊 Sample Data

A sample dataset is included at `sample_data/ethiopian_supermarket_customers.csv` with the following columns:

- `customer_id` - Unique identifier
- `age` - Customer age
- `gender` - Male/Female
- `region` - Ethiopian region
- `total_spend` - Total amount spent (ETB)
- `visit_frequency` - Visits per month
- `avg_basket_size` - Average items per visit
- `preferred_category` - Most purchased category

---

## 📝 License

MIT License - feel free to use this project for your own purposes.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<p align="center">
  Made with ❤️ for Ethiopian Supermarket Analytics
</p>
