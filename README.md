# ThermoSense AI — Urban Heat Island Intelligence Platform

An advanced, production-grade Urban Heat Island (UHI) analysis platform designed for Indian municipal planning. ThermoSense AI helps identify microclimatic anomalies, simulate thermal interventions (cool roofs, forestry, reflective pavements), visualize socioeconomic vulnerabilities, and auto-generate PDF municipal policy briefs.

## Features

1. **UHI Mapping & Diurnal Forecasting**: Interactive Mapbox GL JS rendering of five major Indian cities (Delhi, Mumbai, Bengaluru, Hyderabad, Chennai) showing heat anomaly zones. Includes Recharts line charts with a 48-hour diurnal ambient temperature and Heat Index forecast.
2. **Intervention Simulator**: Microclimate cooling projection simulator. Dial in cool roofs, urban forest canopy, and reflective pavements, and inspect simulated temperature drop, and request **Gemini 1.5 Pro** to critique the microclimatic scenario in real-time.
3. **Satellite Image Analyzer**: Drag & drop thermal satellite captures. Features client-side EXIF metadata stripping via `piexifjs` for privacy, then queries Gemini 1.5 Pro to segment concrete ratio, estimate albedo, detect anomalies, and suggest target cooling methods.
4. **Equity Overlay**: Compares exposure (heat risk) with vulnerability (population density, income, lacking greenery). Uses a multi-dimensional Recharts scatter plot to identify **Environmental Justice Hotspots** that require priority municipal cooling budgets.
5. **AI Policy Brief & PDF Export**: Synthesizes spatial and social profile parameters to draft a formal policy directive using Gemini 1.5 Pro, and exports it to a highly styled, print-ready multi-page PDF using `jsPDF` with automatic margin wrapping and page-overflow handling.

## Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS v3, Mapbox GL JS (`mapbox-gl` `^2.15.0`), Recharts
- **PDF Export**: jsPDF (`jspdf`)
- **Metadata Privacy**: piexifjs
- **Icons**: lucide-react
- **Backend API**: Vercel Serverless Functions (Node.js) proxying Gemini REST API calls.
- **AI Model**: Google Gemini 1.5 Pro via REST API.

---

## Environment Variables

To run the application locally or deploy it to Vercel, configure the following variables:

- `GEMINI_API_KEY`: Google Gemini API Key (obtained from Google AI Studio).
- `VITE_MAPBOX_ACCESS_TOKEN`: Mapbox Access Token (obtained from Mapbox.com).

*Note: For testing convenience, if system-level environment variables are not loaded, users can input these keys directly in the browser settings panel, which persists client-side in `localStorage`.*

---

## Local Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment variables template and configure your secrets:
   ```bash
   cp .env.example .env
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```

---

## Vercel Deployment

Deploy with one-click via the Vercel CLI:

```bash
vercel --prod
```

Vercel will automatically detect `/api/gemini.js` as a Serverless Node.js Function, and the `vercel.json` routing configuration will handle proxy API rewrites.
