"""
predict.py
----------
Serving-time prediction logic. Given
    State, District, Market, Commodity, Variety (optional), Grade (optional),
    prediction_date
returns the predicted Modal Price (Rs/quintal).

KEY DESIGN POINT -- reconstructing lag/rolling features at inference time:
The model was trained on features like "average price in this market over
the last 30 days". At prediction time we don't have a live feed, so we
look up the most recent rows on file for the requested combination and
compute those same statistics from history up to (but not including) the
prediction date. If the prediction date is in the future beyond the data,
we use the latest available history as a stand-in (this is exactly how
you would wire it to a live database in production: pull the latest N
days for that market/commodity, compute the same rolling stats, and feed
them to the frozen model).

FALLBACK LADDER (for a Smart India Hackathon demo, users will frequently
ask for combinations with little or no exact history -- e.g. a variety
that isn't reported in that specific market). We degrade gracefully:
  1. Exact match: State + District + Market + Commodity + Variety
  2. Drop Variety: State + District + Market + Commodity (use the most
     common variety's history, or an average across varieties)
  3. Drop Market: State + District + Commodity
  4. Drop District: State + Commodity
  5. National: Commodity only (across all states)
Each fallback is flagged in the response so the frontend / demo can show
a "confidence" or "based on nearby market data" note.
"""

from dataclasses import dataclass, field
from typing import Optional
import numpy as np
import pandas as pd
import joblib

from pathlib import Path

from features import build_feature_table, FEATURE_COLUMNS, CAT_COLS, GROUP_COLS

_ROOT = Path(__file__).parent.parent
MODEL_PATH = str(_ROOT / "models" / "price_model.joblib")
RAW_CSV = str(_ROOT / "data" / "raw_mandi_prices.csv")

_bundle = None
_history_df = None


def _load():
    global _bundle, _history_df
    if _bundle is None:
        _bundle = joblib.load(MODEL_PATH)
    if _history_df is None:
        _history_df = build_feature_table(RAW_CSV)
        _history_df["Arrival_Date"] = pd.to_datetime(
            pd.read_csv(RAW_CSV, usecols=["Arrival_Date"])["Arrival_Date"],
            format="%d/%m/%Y",
        )
        for c in CAT_COLS:
            _history_df[c] = _history_df[c].astype(str).str.strip()
    return _bundle, _history_df


@dataclass
class PredictionResult:
    predicted_price: float
    unit: str = "Rs/quintal"
    match_level: str = "exact"          # which fallback tier was used
    match_note: str = ""
    used_variety: Optional[str] = None
    used_grade: Optional[str] = None
    history_points_used: int = 0
    price_range_hint: Optional[dict] = None  # rough min/max from recent history


def _subset(df, state=None, district=None, market=None, commodity=None,
            variety=None, grade=None, as_of=None):
    m = pd.Series(True, index=df.index)
    if state:
        m &= df["State"].str.lower() == state.lower()
    if district:
        m &= df["District"].str.lower() == district.lower()
    if market:
        m &= df["Market"].str.lower() == market.lower()
    if commodity:
        m &= df["Commodity"].str.lower() == commodity.lower()
    if variety:
        m &= df["Variety"].str.lower() == variety.lower()
    if grade:
        m &= df["Grade"].str.lower() == grade.lower()
    sub = df[m]
    if as_of is not None:
        sub = sub[sub["Arrival_Date"] < as_of]
    return sub


def _find_history(df, state, district, market, commodity, variety, grade, as_of):
    """Fallback ladder. Returns (subset_df, match_level, note, used_variety, used_grade)."""
    tiers = [
        ("exact", dict(state=state, district=district, market=market,
                        commodity=commodity, variety=variety, grade=grade)),
        ("no_variety", dict(state=state, district=district, market=market,
                             commodity=commodity)),
        ("no_market", dict(state=state, district=district, commodity=commodity)),
        ("no_district", dict(state=state, commodity=commodity)),
        ("national", dict(commodity=commodity)),
    ]
    notes = {
        "exact": "Exact match for state/district/market/commodity/variety.",
        "no_variety": "No history for that exact variety in this market; "
                       "using this market's overall history for the commodity.",
        "no_market": "No history for that market; using district-level "
                      "history for this commodity.",
        "no_district": "No history for that district; using state-level "
                        "history for this commodity.",
        "national": "No state-level history found; using national average "
                     "trends for this commodity.",
    }
    for level, kwargs in tiers:
        sub = _subset(df, as_of=as_of, **kwargs)
        if len(sub) >= 5:
            used_variety = variety if level in ("exact",) and variety else (
                sub["Variety"].mode().iloc[0] if len(sub) else None
            )
            used_grade = grade if level == "exact" and grade else (
                sub["Grade"].mode().iloc[0] if len(sub) else None
            )
            return sub, level, notes[level], used_variety, used_grade
    # absolute last resort: any history at all for the commodity, ignore date cutoff
    sub = _subset(df, commodity=commodity)
    return sub, "national_all_time", (
        "Very limited data for this commodity; using all available history."
    ), variety, grade


def predict_price(state: str, district: str, market: str, commodity: str,
                   prediction_date: str, variety: Optional[str] = None,
                   grade: Optional[str] = None) -> PredictionResult:
    """
    prediction_date: 'YYYY-MM-DD' string or pandas-parseable date.
    """
    bundle, df = _load()
    model = bundle["model"]

    pred_date = pd.to_datetime(prediction_date)

    hist, level, note, used_variety, used_grade = _find_history(
        df, state, district, market, commodity, variety, grade, as_of=pred_date
    )
    if len(hist) == 0:
        raise ValueError(
            f"No historical data available anywhere for commodity '{commodity}'. "
            "Check spelling or try a different commodity."
        )

    hist = hist.sort_values("Arrival_Date")
    recent = hist[hist["Arrival_Date"] <= hist["Arrival_Date"].max()]

    # Rebuild the exact feature vector the model expects, using the most
    # recent known statistics as of (or before) the prediction date.
    last_price = recent["Modal_Price"].iloc[-1]
    lag_7 = recent["Modal_Price"].tail(7).mean()
    lag_14 = recent["Modal_Price"].tail(14).mean()
    lag_30 = recent["Modal_Price"].tail(30).mean()
    roll_mean_7 = recent["Modal_Price"].tail(7).mean()
    roll_mean_30 = recent["Modal_Price"].tail(30).mean()
    roll_std_30 = recent["Modal_Price"].tail(30).std()
    if np.isnan(roll_std_30):
        roll_std_30 = 0.0

    doy = pred_date.dayofyear
    row = {
        "State": state,
        "District": district,
        "Market": market,
        "Commodity": commodity,
        "Variety": used_variety if used_variety else (variety or "Unknown"),
        "Grade": used_grade if used_grade else (grade or "FAQ"),
        "month": pred_date.month,
        "week_of_year": int(pred_date.isocalendar()[1]),
        "doy_sin": np.sin(2 * np.pi * doy / 365.0),
        "doy_cos": np.cos(2 * np.pi * doy / 365.0),
        "year": pred_date.year,
        "lag_7": lag_7,
        "lag_14": lag_14,
        "lag_30": lag_30,
        "roll_mean_7": roll_mean_7,
        "roll_mean_30": roll_mean_30,
        "roll_std_30": roll_std_30,
    }
    X = pd.DataFrame([row])[FEATURE_COLUMNS]
    for c in CAT_COLS:
        X[c] = X[c].astype(str).astype("category")

    pred = float(model.predict(X)[0])
    pred = max(pred, 0.0)

    recent_30 = recent.tail(30)["Modal_Price"]
    price_range_hint = {
        "recent_min": round(float(recent_30.min()), 2),
        "recent_max": round(float(recent_30.max()), 2),
    } if len(recent_30) else None

    return PredictionResult(
        predicted_price=round(pred, 2),
        match_level=level,
        match_note=note,
        used_variety=row["Variety"],
        used_grade=row["Grade"],
        history_points_used=len(hist),
        price_range_hint=price_range_hint,
    )


if __name__ == "__main__":
    examples = [
        dict(state="Maharashtra", district="Nashik", market="Lasalgaon Mandi",
             commodity="Onion", variety="Nashik Red", prediction_date="2025-03-15"),
        dict(state="Haryana", district="Karnal", market="Karnal Mandi",
             commodity="Wheat", prediction_date="2025-04-10"),
        dict(state="Punjab", district="Ludhiana", market="Khanna Mandi",
             commodity="Cotton", variety="Extra Long Staple",
             prediction_date="2025-11-20"),  # forces a fallback (unseen variety)
    ]
    for ex in examples:
        res = predict_price(**ex)
        print(f"\nQuery: {ex}")
        print(f"  Predicted Modal Price: Rs {res.predicted_price}/quintal")
        print(f"  Match level: {res.match_level} -- {res.match_note}")
        print(f"  Used variety/grade: {res.used_variety} / {res.used_grade}")
        print(f"  History points used: {res.history_points_used}")
        print(f"  Recent 30-day range: {res.price_range_hint}")
