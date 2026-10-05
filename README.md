<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/4c69cfd7-0b10-4949-9419-ded0f57a153d

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Baseline Risk Engine

The client-side module in `src/ml/risk/` provides a transparent prototype heuristic. It is not a trained machine-learning model and its 0–100 output is a **risk index**, not a calibrated landslide probability.

The index sums six bounded factor contributions. Inputs outside these prototype ranges are clamped:

| Input | Range | Maximum contribution |
| --- | ---: | ---: |
| 24-hour rainfall | 0–250 mm | 28 points |
| Soil moisture | 0–100% | 22 points |
| Slope | 0–45 degrees | 18 points |
| Elevation | 0–3000 m | 6 points |
| Vegetation cover (NDVI) | 0–1 | 12 points |
| Historical landslide count | 0–15 events | 14 points |

For each factor, the value is linearly normalized to its range and multiplied by its maximum contribution. Vegetation uses the inverse normalized value, so lower NDVI adds more points. The current elevation term assumes a monotonic increase with elevation; this is only a low-weight placeholder and is not established for any specific region. The fixed weights and ranges are explicit design assumptions, not learned feature importance.

The category cutoffs are centralized in `src/ml/risk/thresholds.ts`:

- `LOW`: 0–24
- `MODERATE`: 25–49
- `HIGH`: 50–74
- `CRITICAL`: 75–100

The returned factor contributions describe arithmetic within this heuristic only. They are not SHAP values, causal effects, confidence estimates, or validation results. No accuracy, F1-score, ROC-AUC, lead time, or other model performance has been established.

The dashboard sectors, forecast scenarios, and telemetry displays currently use mock or locally simulated data. No external sensor, weather, or forecast source is connected, so the interface must not be treated as real-time monitoring or an operational early-warning service. Before operational use, replace this baseline with a locally trained and independently validated model, calibrate it against quality-controlled regional event and non-event data, confirm thresholds with geotechnical authorities, and connect monitored data sources with freshness and quality checks.

## Backend Prediction API

The separate FastAPI skeleton in `backend/` exposes `POST /api/predict`. It applies the same transparent baseline heuristic and reports a `baseline` model status; it is not a trained model and its score is not a probability. Environmental observations are not fetched by this API.

Start it from the repository root with Python 3.10 or newer:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

The prediction endpoint is `http://127.0.0.1:8000/api/predict`; interactive API documentation is available at `http://127.0.0.1:8000/docs`. Inputs are range-validated against the documented baseline ranges. Invalid or non-finite values receive FastAPI's standard `422 Unprocessable Entity` response. CORS is enabled for the local Vite origins on ports 3000 and 5173. The React frontend is not connected to this backend in this phase.
