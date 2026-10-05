from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP
from math import floor

from .schemas import FactorContribution, PredictionRequest, PredictionResponse


@dataclass(frozen=True)
class FactorDefinition:
    name: str
    weight: float
    rationale: str
    minimum: float
    maximum: float
    inverse: bool = False


FACTORS = (
    FactorDefinition(
        "Rainfall",
        28,
        "Higher rainfall adds more baseline index points.",
        0,
        250,
    ),
    FactorDefinition(
        "Soil moisture",
        22,
        "Higher soil moisture adds more baseline index points.",
        0,
        100,
    ),
    FactorDefinition(
        "Slope",
        18,
        "Steeper slopes add more baseline index points.",
        0,
        45,
    ),
    FactorDefinition(
        "Elevation",
        6,
        "Elevation is a low-weight provisional proxy; its local relationship to risk is not established.",
        0,
        3000,
    ),
    FactorDefinition(
        "Vegetation cover (NDVI)",
        12,
        "Lower NDVI adds more baseline index points as a simple vegetation-cover proxy.",
        0,
        1,
        inverse=True,
    ),
    FactorDefinition(
        "Historical landslides",
        14,
        "More recorded past events add more baseline index points.",
        0,
        15,
    ),
)


def _risk_level(score: int) -> str:
    if score >= 75:
        return "CRITICAL"
    if score >= 50:
        return "HIGH"
    if score >= 25:
        return "MODERATE"
    return "LOW"


def predict_baseline(request: PredictionRequest) -> PredictionResponse:
    values = (
        request.rainfall,
        request.soil_moisture,
        request.slope,
        request.elevation,
        request.ndvi,
        request.historical_landslides,
    )
    contributions: list[FactorContribution] = []

    for factor, value in zip(FACTORS, values):
        fraction = (value - factor.minimum) / (factor.maximum - factor.minimum)
        if factor.inverse:
            fraction = 1 - fraction
        points = float(
            Decimal(str(fraction * factor.weight)).quantize(
                Decimal("0.1"),
                rounding=ROUND_HALF_UP,
            )
        )
        contributions.append(
            FactorContribution(
                name=factor.name,
                contribution=points,
                explanation=(
                    f"{factor.rationale} Current value {value:g}; "
                    f"contributes {points:g} of {factor.weight:g} possible points."
                ),
            )
        )

    score = max(0, min(100, floor(sum(factor.contribution for factor in contributions) + 0.5)))
    return PredictionResponse(
        risk_score=score,
        risk_level=_risk_level(score),
        factors=contributions,
        model_status="baseline",
    )