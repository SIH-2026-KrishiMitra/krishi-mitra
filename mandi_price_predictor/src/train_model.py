"""
train_model.py
---------------
Trains the mandi modal-price prediction model and saves it (with all
metadata needed for serving) to models/price_model.joblib.

Model choice: sklearn's HistGradientBoostingRegressor.
  - Handles categorical columns natively (no manual one-hot encoding),
    which matters here because State/District/Market/Commodity/Variety
    have many high-cardinality combinations.
  - Fast, accurate gradient boosting -- functionally equivalent to
    LightGBM/XGBoost for this tabular problem. If you have internet
    access outside this sandbox, you can drop in LightGBM by changing
    only the `build_model()` function below; the feature pipeline and
    API do not need to change.

Validation strategy: time-based split (train on earlier dates, test on
the most recent slice) rather than a random split, because a random
split would leak future prices into training via the lag/rolling
features and give an unrealistically good score.
"""

import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error, r2_score

from features import build_feature_table, FEATURE_COLUMNS, TARGET_COLUMN, CAT_COLS

_ROOT = Path(__file__).parent.parent
RAW_CSV = str(_ROOT / "data" / "raw_mandi_prices.csv")
MODEL_PATH = str(_ROOT / "models" / "price_model.joblib")


def build_model(categorical_idx):
    return HistGradientBoostingRegressor(
        max_iter=400,
        max_depth=8,
        learning_rate=0.06,
        l2_regularization=0.1,
        categorical_features=categorical_idx,
        early_stopping=True,
        validation_fraction=0.1,
        n_iter_no_change=20,
        random_state=42,
    )


def main():
    print("Loading data and building features...")
    df = build_feature_table(RAW_CSV)

    # cast categoricals to pandas 'category' dtype for native handling
    for c in CAT_COLS:
        df[c] = df[c].astype("category")

    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    # Time-based split: last 15% of dates (by original row order per group
    # doesn't matter here -- split globally by date) held out as test set.
    df_sorted = df.sort_values("Arrival_Date" if "Arrival_Date" in df.columns else "year")
    cutoff_idx = int(len(df_sorted) * 0.85)
    # need Arrival_Date preserved -- reload for the split boundary
    raw_dates = pd.read_csv(RAW_CSV, usecols=["Arrival_Date"])
    df["Arrival_Date"] = pd.to_datetime(raw_dates["Arrival_Date"], format="%d/%m/%Y")
    df = df.sort_values("Arrival_Date").reset_index(drop=True)
    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]
    cutoff = df["Arrival_Date"].quantile(0.85)

    train_mask = df["Arrival_Date"] <= cutoff
    X_train, X_test = X[train_mask], X[~train_mask]
    y_train, y_test = y[train_mask], y[~train_mask]

    categorical_idx = [X.columns.get_loc(c) for c in CAT_COLS]

    print(f"Train rows: {len(X_train):,} | Test rows: {len(X_test):,}")
    print("Training HistGradientBoostingRegressor...")
    model = build_model(categorical_idx)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    mape = mean_absolute_percentage_error(y_test, preds) * 100
    r2 = r2_score(y_test, preds)
    print(f"\n--- Held-out (future-date) evaluation ---")
    print(f"MAE:  Rs {mae:,.2f} per quintal")
    print(f"MAPE: {mape:.2f}%")
    print(f"R2:   {r2:.4f}")

    joblib.dump({
        "model": model,
        "feature_columns": FEATURE_COLUMNS,
        "categorical_columns": CAT_COLS,
        "metrics": {"mae": mae, "mape": mape, "r2": r2},
    }, MODEL_PATH)
    print(f"\nSaved model -> {MODEL_PATH}")


if __name__ == "__main__":
    main()
