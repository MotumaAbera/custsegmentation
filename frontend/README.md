# SegmentIQ Frontend

React frontend for customer segmentation visualization.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **Framer Motion** - Animations
- **Recharts** - Charts
- **Lucide React** - Icons
- **React Dropzone** - File upload

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx           # Navigation header
│   │   ├── FileUpload.jsx       # CSV upload
│   │   ├── DatasetList.jsx      # Dataset list
│   │   ├── ClusteringConfig.jsx # Config form
│   │   ├── Results.jsx          # Results display
│   │   ├── StepIndicator.jsx    # Progress steps
│   │   ├── Toast.jsx            # Notifications
│   │   ├── Tooltip.jsx          # Tooltips
│   │   └── TrainingProgress.jsx # Training animation
│   ├── hooks/
│   │   ├── useApi.js            # API wrapper
│   │   └── useToast.js          # Toast hook
│   ├── services/
│   │   └── api.js               # API client
│   ├── styles/
│   │   └── globals.css          # Global styles
│   ├── App.jsx                  # Main app
│   └── main.jsx                 # Entry point
├── public/
├── index.html
├── package.json
└── vite.config.js
```

## Features

- 📁 Drag-and-drop CSV upload
- ⚙️ Interactive clustering configuration
- 📊 Tabbed results view (Overview, Distribution, Dendrogram)
- 🔔 Toast notifications
- 💡 Helpful tooltips
- ⏳ Training progress animation
- 📱 Responsive design

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview build |
| `npm run lint` | Run ESLint |

## Configuration

### API Proxy

In `vite.config.js`:

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

### Environment Variables

Create `.env`:

```env
VITE_API_URL=http://localhost:8000
```

## Styling

Uses CSS Modules with CSS variables:

```css
/* globals.css */
:root {
  --accent-primary: #c4a052;
  --bg-primary: #0a0a0b;
  --text-primary: #fafafa;
}
```

## Components

### FileUpload

```jsx
<FileUpload
  onUpload={handleUpload}
  loading={isUploading}
  error={uploadError}
  success={uploadSuccess}
/>
```

### ClusteringConfig

```jsx
<ClusteringConfig
  datasetId={selectedDataset.id}
  onTrain={handleTrain}
  loading={isTraining}
/>
```

### Results

```jsx
<Results run={clusteringResult} />
```

## Hooks

### useApi

```jsx
const uploadApi = useApi(uploadDataset);

await uploadApi.execute(file);
console.log(uploadApi.loading, uploadApi.error, uploadApi.data);
```

### useToast

```jsx
const { success, error, warning } = useToast();

success('Operation completed!');
error('Something went wrong');
```

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+
