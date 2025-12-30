# Customer Segmentation Frontend

Modern React frontend for the Customer Segmentation API.

## Features

- **Drag & Drop Upload**: Upload CSV datasets with a beautiful drag-and-drop interface
- **Interactive Configuration**: Configure clustering parameters with visual controls
- **Real-time Results**: View clustering metrics, distribution charts, and dendrograms
- **Responsive Design**: Works seamlessly on desktop and mobile

## Tech Stack

- **React 18** with Hooks
- **Vite** for development and building
- **Framer Motion** for animations
- **Recharts** for data visualization
- **Lucide React** for icons
- **CSS Modules** for styling

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at **http://localhost:3000**

### Production Build

```bash
npm run build
npm run preview
```

## Docker

Build and run with Docker:

```bash
docker build -t segmentation-frontend .
docker run -p 80:80 segmentation-frontend
```

## Project Structure

```
src/
├── components/
│   ├── Header.jsx          # Navigation header
│   ├── FileUpload.jsx      # Drag & drop upload
│   ├── DatasetList.jsx     # Dataset selector
│   ├── ClusteringConfig.jsx # Configuration form
│   └── Results.jsx         # Results visualization
├── services/
│   └── api.js              # API client
├── hooks/
│   └── useApi.js           # API hook
├── styles/
│   └── globals.css         # Global styles
├── App.jsx                 # Main app component
└── main.jsx                # Entry point
```

## Design

- **Color Palette**: Dark theme with gold accent (#c4a052)
- **Typography**: 
  - Instrument Serif for headings
  - Sora for body text
  - JetBrains Mono for code/data
- **Animations**: Smooth transitions and micro-interactions

## Environment

The app proxies API requests to `http://localhost:8000` in development.

For production, configure the nginx proxy to point to your API server.

