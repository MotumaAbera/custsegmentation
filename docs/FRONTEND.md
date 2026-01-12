# Frontend Documentation

## Overview

The SegmentIQ frontend is a React application built with Vite. It provides an intuitive interface for uploading customer data, configuring clustering parameters, and visualizing results.

---

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **React Dropzone** - File upload
- **CSS Modules** - Scoped styling

---

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Header.jsx       # Navigation header
│   │   ├── FileUpload.jsx   # CSV upload dropzone
│   │   ├── DatasetList.jsx  # List of uploaded datasets
│   │   ├── ClusteringConfig.jsx  # Clustering parameters
│   │   ├── Results.jsx      # Clustering results
│   │   ├── StepIndicator.jsx    # Progress steps
│   │   ├── Toast.jsx        # Notification toasts
│   │   ├── Tooltip.jsx      # Help tooltips
│   │   └── TrainingProgress.jsx  # Training animation
│   ├── hooks/               # Custom React hooks
│   │   ├── useApi.js        # API call wrapper
│   │   └── useToast.js      # Toast notifications
│   ├── services/
│   │   └── api.js           # API client
│   ├── styles/
│   │   └── globals.css      # Global styles & variables
│   ├── App.jsx              # Main application
│   ├── App.module.css       # App styles
│   └── main.jsx             # Entry point
├── public/                  # Static assets
├── index.html
├── package.json
└── vite.config.js
```

---

## Components

### Header

The navigation header with branding and context.

```jsx
import Header from './components/Header';

<Header />
```

### FileUpload

Drag-and-drop CSV file upload with visual feedback.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| onUpload | function | Callback when file is selected |
| loading | boolean | Show loading state |
| error | string | Error message to display |
| success | boolean | Show success state |

```jsx
<FileUpload
  onUpload={handleUpload}
  loading={isUploading}
  error={uploadError}
  success={uploadSuccess}
/>
```

### DatasetList

Displays uploaded datasets with selection.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| datasets | array | List of dataset objects |
| selectedId | number | Currently selected dataset ID |
| onSelect | function | Callback when dataset is selected |

```jsx
<DatasetList
  datasets={datasets}
  selectedId={selectedDataset?.id}
  onSelect={handleDatasetSelect}
/>
```

### ClusteringConfig

Form for configuring clustering parameters.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| datasetId | number | Selected dataset ID |
| onTrain | function | Callback to start training |
| loading | boolean | Show loading state |

```jsx
<ClusteringConfig
  datasetId={selectedDataset.id}
  onTrain={handleTrain}
  loading={isTraining}
/>
```

### Results

Tabbed display of clustering results with charts.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| run | object | Clustering run result |

```jsx
<Results run={clusteringResult} />
```

**Tabs:**
- **Overview** - Key metrics and feature configuration
- **Distribution** - Pie and bar charts of cluster sizes
- **Dendrogram** - Hierarchical tree visualization

### StepIndicator

Visual progress indicator for the workflow.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| currentStep | number | Current step (1-3) |

```jsx
<StepIndicator currentStep={2} />
```

### Toast

Notification toasts for feedback.

```jsx
import { ToastContainer } from './components/Toast';
import { useToast } from './hooks/useToast';

const { toasts, removeToast, success, error } = useToast();

// Show notifications
success('Dataset uploaded successfully!');
error('Upload failed. Please try again.');

// Render container
<ToastContainer toasts={toasts} removeToast={removeToast} />
```

### Tooltip

Helpful hover hints for UI elements.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| content | string | Tooltip text |
| position | string | 'top' or 'bottom' |
| children | node | Element to attach tooltip to |

```jsx
<Tooltip content="This is helpful information">
  <HelpCircle size={16} />
</Tooltip>
```

---

## Hooks

### useApi

Wrapper for API calls with loading and error states.

```jsx
import { useApi } from './hooks/useApi';
import { uploadDataset } from './services/api';

const uploadApi = useApi(uploadDataset);

// Use in component
const handleUpload = async (file) => {
  try {
    const result = await uploadApi.execute(file);
    console.log('Uploaded:', result);
  } catch (err) {
    console.error('Error:', uploadApi.error);
  }
};

// Access state
uploadApi.loading; // boolean
uploadApi.error;   // string or null
uploadApi.data;    // response data
```

### useToast

Manage toast notifications.

```jsx
import { useToast } from './hooks/useToast';

const { toasts, success, error, warning, removeToast } = useToast();

// Show toasts
success('Operation completed!');
error('Something went wrong');
warning('Please check your input');

// Toasts auto-dismiss after 4 seconds
```

---

## API Service

### Configuration

The API base URL is configured in `vite.config.js`:

```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
```

### Available Functions

```javascript
import {
  uploadDataset,
  getDatasets,
  trainClustering,
  getClusteringRuns,
  getClusteringRun,
  getDendrogramUrl,
} from './services/api';

// Upload a CSV file
const dataset = await uploadDataset(file);

// Get all datasets
const { datasets } = await getDatasets();

// Run clustering
const result = await trainClustering({
  dataset_id: 1,
  linkage: 'ward',
  n_clusters: 4,
  use_pca: false,
});

// Get dendrogram URL
const url = getDendrogramUrl(runId);
```

---

## Styling

### CSS Variables

Global CSS variables are defined in `styles/globals.css`:

```css
:root {
  /* Backgrounds */
  --bg-primary: #0a0a0b;
  --bg-secondary: #111113;
  --bg-tertiary: #1a1a1d;
  --bg-card: #151517;
  --bg-elevated: #1e1e21;
  
  /* Accent Colors */
  --accent-primary: #c4a052;
  --accent-secondary: #e6c96e;
  --accent-muted: rgba(196, 160, 82, 0.15);
  --accent-glow: rgba(196, 160, 82, 0.4);
  
  /* Text */
  --text-primary: #fafafa;
  --text-secondary: #a1a1a6;
  --text-muted: #6b6b70;
  
  /* Borders */
  --border-color: #2a2a2e;
  --border-accent: rgba(196, 160, 82, 0.3);
  
  /* Status */
  --success: #4ade80;
  --error: #f87171;
  --warning: #fbbf24;
  
  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-xl: 28px;
  
  /* Fonts */
  --font-display: 'Instrument Serif', serif;
  --font-body: 'Sora', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 60px var(--accent-glow);
}
```

### CSS Modules

Each component has a corresponding `.module.css` file:

```jsx
import styles from './Component.module.css';

<div className={styles.container}>
  <h1 className={styles.title}>Title</h1>
</div>
```

### Animations

Animations use Framer Motion:

```jsx
import { motion, AnimatePresence } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

---

## Development

### Start Development Server

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:3000` (or next available port).

### Build for Production

```bash
npm run build
```

Output is in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

---

## Environment Variables

Create `.env` for environment-specific configuration:

```env
VITE_API_URL=http://localhost:8000
```

Access in code:

```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

---

## Performance Tips

1. **Lazy load routes** for larger apps
2. **Memoize expensive computations** with `useMemo`
3. **Virtualize long lists** with react-window
4. **Optimize images** before upload
5. **Use production build** for deployment

