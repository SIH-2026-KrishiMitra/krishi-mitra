"""
app.py
------
FastAPI service for the mandi price predictor. This is what a web or
mobile front-end (or another team's app in the hackathon) calls.

Run locally:
    cd mandi_price_predictor/api
    uvicorn app:app --host 0.0.0.0 --port 8000 --reload

Then:
    GET  /health
    GET  /metadata                 -> lists valid states/commodities/etc.
                                       for building dropdowns in the UI
    POST /predict                  -> main prediction endpoint

Example request body for POST /predict:
{
  "state": "Maharashtra",
  "district": "Nashik",
  "market": "Lasalgaon Mandi",
  "commodity": "Onion",
  "variety": "Nashik Red",
  "grade": null,
  "prediction_date": "2025-03-15"
}
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "src"))

from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from predict import predict_price, _load  # noqa: E402

app = FastAPI(
    title="Mandi Price Predictor API",
    description="Predicts future mandi modal price (Rs/quintal) for a "
                 "given state, district, market, commodity, variety and date.",
    version="1.0.0",
)

# Allow calls from any web/mobile frontend during the hackathon demo.
# Tighten allow_origins to your actual frontend domain before production use.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    state: str = Field(..., example="Maharashtra")
    district: str = Field(..., example="Nashik")
    market: str = Field(..., example="Lasalgaon Mandi")
    commodity: str = Field(..., example="Onion")
    variety: Optional[str] = Field(None, example="Nashik Red")
    grade: Optional[str] = Field(None, example="Grade I")
    prediction_date: str = Field(..., example="2025-03-15",
                                  description="YYYY-MM-DD")


class PredictResponse(BaseModel):
    predicted_price: float
    unit: str
    match_level: str
    match_note: str
    used_variety: Optional[str]
    used_grade: Optional[str]
    history_points_used: int
    price_range_hint: Optional[dict]


@app.on_event("startup")
def warm_up():
    # Pre-load the model + history into memory so the first real
    # request isn't slow.
    _load()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/metadata")
def metadata():
    """Returns valid dropdown values for the frontend form."""
    _, df = _load()
    return {
        "states": sorted(df["State"].unique().tolist()),
        "state_to_districts": (
            df.groupby("State")["District"].unique()
              .apply(lambda x: sorted(x.tolist())).to_dict()
        ),
        "district_to_markets": (
            df.groupby("District")["Market"].unique()
              .apply(lambda x: sorted(x.tolist())).to_dict()
        ),
        "commodities": sorted(df["Commodity"].unique().tolist()),
        "commodity_to_varieties": (
            df.groupby("Commodity")["Variety"].unique()
              .apply(lambda x: sorted(x.tolist())).to_dict()
        ),
    }


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    try:
        result = predict_price(
            state=req.state,
            district=req.district,
            market=req.market,
            commodity=req.commodity,
            variety=req.variety,
            grade=req.grade,
            prediction_date=req.prediction_date,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

    return PredictResponse(
        predicted_price=result.predicted_price,
        unit=result.unit,
        match_level=result.match_level,
        match_note=result.match_note,
        used_variety=result.used_variety,
        used_grade=result.used_grade,
        history_points_used=result.history_points_used,
        price_range_hint=result.price_range_hint,
    )
