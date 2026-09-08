"""
features.py
------------
Turns raw mandi price rows into a model-ready feature table.

Feature groups:
  1. Categorical identity features: State, District, Market, Commodity,
     Variety, Grade (used natively as pandas 'category' dtype so the
     tree model can split on them directly -- no manual one-hot needed).
  2. Calendar / seasonality features: month, day-of-year (sin/cos
     encoded so Dec 31 and Jan 1 are "close"), week-of-year.
  3. Series-history features computed PER (State, District, Market,
     Commodity, Variety) group, sorted by date:
       - lag_7, lag_14, lag_30: modal price N days before the current row
       - roll_mean_7, roll_mean_30: rolling average of recent prices
       - roll_std_30: recent volatility
     These are the single most important features for this kind of
     problem -- "what was this exact crop selling for recently in this
     exact market" -- and are what let the model react to genuine price
     trends (e.g. a supply glut this month) rather than only average
     seasonality.

At PREDICTION time (predict.py) these lag/rolling features are rebuilt
from the most recent known history for the requested
state/district/market/commodity/variety combination, falling back to
a broader group average when history for that exact combination is
too sparse (see predict.py for the fallback ladder).
"""

import numpy as np
import pandas as pd

GROUP_COLS = ["State", "District", "Market", "Commodity", "Variety"]
CAT_COLS = GROUP_COLS + ["Grade"]


def load_raw(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    df["Arrival_Date"] = pd.to_datetime(df["Arrival_Date"], format="%d/%m/%Y")
    for c in CAT_COLS:
        df[c] = df[c].astype(str).str.strip()
    return df


def add_calendar_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    doy = df["Arrival_Date"].dt.dayofyear
    df["month"] = df["Arrival_Date"].dt.month
    df["week_of_year"] = df["Arrival_Date"].dt.isocalendar().week.astype(int)
    df["doy_sin"] = np.sin(2 * np.pi * doy / 365.0)
    df["doy_cos"] = np.cos(2 * np.pi * doy / 365.0)
    df["year"] = df["Arrival_Date"].dt.year
    return df


def add_history_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.sort_values(GROUP_COLS + ["Arrival_Date"]).copy()
    g = df.groupby(GROUP_COLS, sort=False)
    df["lag_7"] = g["Modal_Price"].shift(7)
    df["lag_14"] = g["Modal_Price"].shift(14)
    df["lag_30"] = g["Modal_Price"].shift(30)
    df["roll_mean_7"] = g["Modal_Price"].transform(
        lambda s: s.shift(1).rolling(7, min_periods=1).mean()
    )
    df["roll_mean_30"] = g["Modal_Price"].transform(
        lambda s: s.shift(1).rolling(30, min_periods=1).mean()
    )
    df["roll_std_30"] = g["Modal_Price"].transform(
        lambda s: s.shift(1).rolling(30, min_periods=2).std()
    )

    # Fill early-series NaNs with the group's overall mean, then any
    # remaining NaNs (brand-new group) with the global mean.
    hist_cols = ["lag_7", "lag_14", "lag_30", "roll_mean_7", "roll_mean_30", "roll_std_30"]
    for c in hist_cols:
        df[c] = df.groupby(GROUP_COLS)[c].transform(lambda s: s.fillna(s.mean()))
        df[c] = df[c].fillna(df["Modal_Price"].mean())
    return df


def build_feature_table(raw_csv_path: str) -> pd.DataFrame:
    df = load_raw(raw_csv_path)
    df = add_calendar_features(df)
    df = add_history_features(df)
    return df


FEATURE_COLUMNS = [
    "State", "District", "Market", "Commodity", "Variety", "Grade",
    "month", "week_of_year", "doy_sin", "doy_cos", "year",
    "lag_7", "lag_14", "lag_30", "roll_mean_7", "roll_mean_30", "roll_std_30",
]
TARGET_COLUMN = "Modal_Price"
