from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class PredictionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    rainfall: float = Field(ge=0, le=250, allow_inf_nan=False, description="Rainfall in mm per 24 hours")
    soil_moisture: float = Field(ge=0, le=100, allow_inf_nan=False, description="Soil moisture percentage")
    slope: float = Field(ge=0, le=45, allow_inf_nan=False, description="Slope angle in degrees")
    elevation: float = Field(ge=0, le=3000, allow_inf_nan=False, description="Elevation in meters")
    ndvi: float = Field(ge=0, le=1, allow_inf_nan=False, description="NDVI in the range 0 to 1")
    historical_landslides: float = Field(
        ge=0,
        le=15,
        allow_inf_nan=False,
        description="Recorded historical landslide count, represented on the baseline's 0 to 15 scale",
    )


class FactorContribution(BaseModel):
    name: str
    contribution: float
    explanation: str


class PredictionResponse(BaseModel):
    risk_score: int = Field(ge=0, le=100)
    risk_level: Literal["LOW", "MODERATE", "HIGH", "CRITICAL"]
    factors: list[FactorContribution]
    model_status: Literal["baseline"] = "baseline"