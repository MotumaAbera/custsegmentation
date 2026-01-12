# Deploy to Vercel - Full Stack (Frontend + Backend)

Deploy the complete SegmentIQ application to Vercel with both React frontend and Python backend.

---

## Quick Deploy (One Click)

1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click **"Add New Project"**
   - Import your GitHub repository
   - Vercel auto-detects settings from `vercel.json`
   - Click **"Deploy"**

That's it! Your app will be live in ~2 minutes.

---

## What Gets Deployed

| Component | Technology | Vercel Feature |
|-----------|------------|----------------|
| Frontend | React + Vite | Static Files |
| Backend API | Python (FastAPI-style) | Serverless Functions |
| Clustering | scikit-learn, scipy | Python Runtime |

---

## Project Structure for Vercel

```
CustSegML/
├── vercel.json              # ← Vercel configuration
├── api/                     # ← Python serverless functions
│   ├── cluster.py           # POST /api/cluster
│   ├── health.py            # GET /api/health  
│   └── requirements.txt     # Python dependencies
└── frontend/                # ← React application
    ├── src/
    ├── dist/                # Built on deploy
    └── package.json
```

---

## API Endpoints

After deployment, your API will be available at:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `https://your-app.vercel.app/api/health` | GET | Health check |
| `https://your-app.vercel.app/api/cluster` | POST | Run clustering |

### Example API Call

```javascript
POST /api/cluster
{
  "csv_data": "id,age,income\n1,25,50000\n2,35,75000",
  "linkage_method": "ward",
  "n_clusters": 3,
  "use_pca": false
}
```

---

## How Data Works

Since Vercel is serverless (no persistent storage):

- **Datasets** → Stored in browser `localStorage`
- **Clustering** → Runs on Vercel Python serverless functions
- **Results** → Returned directly, includes base64 dendrogram image

No database needed!

---

## Build Settings (Auto-detected)

Vercel reads these from `vercel.json`:

| Setting | Value |
|---------|-------|
| Build Command | `cd frontend && npm install && npm run build` |
| Output Directory | `frontend/dist` |
| Install Command | (auto) |
| Node.js Version | 18.x |
| Python Version | 3.9 |

---

## Environment Variables

**None required!** The app works out of the box.

---

## Troubleshooting

### Build fails with "Module not found"
```bash
cd frontend
npm install
npm run build
```
Make sure this works locally first.

### API returns 500 error
Check the Vercel function logs:
1. Go to your Vercel dashboard
2. Click on your project
3. Go to "Logs" tab
4. Filter by "Functions"

### Python dependencies not installing
Ensure `api/requirements.txt` exists with:
```
pandas==2.1.4
numpy==1.26.2
scipy==1.11.4
scikit-learn==1.3.2
matplotlib==3.8.2
```

### Clustering timeout
Vercel free tier has 10s timeout. Upgrade to Pro for 60s, or use smaller datasets.

---

## Custom Domain

1. Go to your Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

---

## Local Development

To test before deploying:

```bash
# Terminal 1: Frontend
cd frontend
npm install
npm run dev

# Terminal 2: Backend (optional, for testing API)
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

The frontend will use client-side clustering if the backend isn't running.
