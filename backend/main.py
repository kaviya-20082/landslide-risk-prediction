from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .risk_engine import predict_baseline
from .schemas import PredictionRequest, PredictionResponse


app = FastAPI(
    title="LandslideGuard Baseline Prediction API",
    description=(
        "Prototype transparent heuristic risk index. This is not a trained model "
        "or a validated landslide probability."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.post("/api/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest) -> PredictionResponse:
    return predict_baseline(request)