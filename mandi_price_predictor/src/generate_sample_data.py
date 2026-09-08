"""
generate_sample_data.py
------------------------
Generates a synthetic-but-realistic historical mandi price dataset that
mimics the schema of the government's Agmarknet / data.gov.in "Variety-wise
Daily Market Prices" dataset:

    State, District, Market, Commodity, Variety, Grade,
    Arrival_Date, Min_Price, Max_Price, Modal_Price

WHY SYNTHETIC DATA:
This sandbox has no internet access, so it cannot call the live
data.gov.in / Agmarknet API. For the real system, replace this script's
output with the actual historical CSV pulled from:

    https://data.gov.in/resource/variety-wise-daily-market-prices-data-commodity
    (API: https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070)

The rest of the pipeline (feature engineering, training, prediction API)
does not care whether the data is real or synthetic -- it only depends on
the column schema above, so swapping in real data later requires no code
changes, only a new CSV in data/raw_mandi_prices.csv.

The generator builds prices using:
  - a commodity-specific base price
  - a yearly inflation trend
  - a seasonal (harvest/lean season) sinusoidal component
  - state/market-specific offsets (transport cost, local demand)
  - random daily noise
so that the resulting series has realistic, learnable structure.
"""

from pathlib import Path

import numpy as np
import pandas as pd
from datetime import datetime, timedelta

RNG = np.random.default_rng(42)

# ---- Reference master data: State -> District -> Market ----
LOCATIONS = {
    "Haryana": {
        "Karnal": ["Karnal Mandi", "Nilokheri Mandi"],
        "Kurukshetra": ["Kurukshetra Mandi", "Pehowa Mandi"],
    },
    "Punjab": {
        "Ludhiana": ["Ludhiana Mandi", "Khanna Mandi"],
        "Amritsar": ["Amritsar Mandi"],
    },
    "Maharashtra": {
        "Pune": ["Pune Market Yard", "Manchar Mandi"],
        "Nashik": ["Lasalgaon Mandi", "Nashik Mandi"],
    },
    "Uttar Pradesh": {
        "Agra": ["Agra Mandi"],
        "Lucknow": ["Lucknow Mandi"],
    },
    "Madhya Pradesh": {
        "Indore": ["Indore Mandi", "Mhow Mandi"],
        "Bhopal": ["Bhopal Mandi"],
    },
    "Karnataka": {
        "Bengaluru": ["Bengaluru KR Market"],
        "Belagavi": ["Belagavi Mandi"],
    },
}

# Commodity -> (variety list, base_price_per_quintal, yearly_growth,
#               seasonal_amplitude, peak_harvest_month(1-12), volatility)
COMMODITIES = {
    "Wheat": (["Dara", "Lokwan", "Sharbati"], 2100, 0.04, 0.06, 4, 0.03),
    "Rice": (["Basmati", "Non-Basmati", "Sona Masuri"], 2800, 0.05, 0.05, 11, 0.03),
    "Onion": (["Red", "Nashik Red", "Local"], 1500, 0.02, 0.35, 3, 0.15),
    "Potato": (["Jyoti", "Kufri", "Local"], 1200, 0.03, 0.30, 2, 0.14),
    "Tomato": (["Hybrid", "Local", "Desi"], 1600, 0.02, 0.45, 1, 0.20),
    "Soybean": (["Yellow", "Black"], 3800, 0.04, 0.10, 10, 0.06),
    "Cotton": (["Medium Staple", "Long Staple"], 6200, 0.045, 0.08, 11, 0.05),
    "Maize": (["Yellow", "White"], 1900, 0.035, 0.12, 10, 0.06),
    "Mustard": (["Black", "Yellow"], 5200, 0.03, 0.09, 3, 0.05),
    "Chana (Gram)": (["Desi", "Kabuli"], 4800, 0.035, 0.08, 3, 0.05),
}

GRADES = ["FAQ", "Grade I", "Grade II", "Local"]

# State-level cost-of-transport / local demand multiplier
STATE_OFFSET = {
    "Haryana": 1.00, "Punjab": 0.98, "Maharashtra": 1.05,
    "Uttar Pradesh": 0.95, "Madhya Pradesh": 0.93, "Karnataka": 1.03,
}


def seasonal_factor(day_of_year, peak_month, amplitude):
    peak_doy = peak_month * 30.4
    # cosine centered on peak harvest month -> price is LOWEST at harvest
    # (more supply -> lower price), highest in the lean season opposite it
    phase = 2 * np.pi * (day_of_year - peak_doy) / 365.0
    return -amplitude * np.cos(phase)  # trough at harvest, peak at lean season


def generate(start_date="2021-01-01", end_date="2024-12-31", rows_per_day_fraction=0.35):
    start = pd.to_datetime(start_date)
    end = pd.to_datetime(end_date)
    all_dates = pd.date_range(start, end, freq="D")

    records = []
    for state, districts in LOCATIONS.items():
        for district, markets in districts.items():
            for market in markets:
                for commodity, (varieties, base, growth, amp, peak_m, vol) in COMMODITIES.items():
                    for variety in varieties:
                        # not every market reports every commodity every day -> sample dates
                        n_days = int(len(all_dates) * rows_per_day_fraction)
                        sampled_dates = np.sort(
                            RNG.choice(all_dates, size=n_days, replace=False)
                        )
                        grade = RNG.choice(GRADES)
                        for d in sampled_dates:
                            d = pd.Timestamp(d)
                            years_elapsed = (d - start).days / 365.0
                            trend = (1 + growth) ** years_elapsed
                            season = seasonal_factor(d.dayofyear, peak_m, amp)
                            noise = RNG.normal(0, vol)
                            state_mult = STATE_OFFSET[state]

                            modal = base * trend * (1 + season + noise) * state_mult
                            modal = max(modal, base * 0.3)  # floor
                            spread = modal * RNG.uniform(0.03, 0.08)
                            min_p = modal - spread
                            max_p = modal + spread

                            records.append({
                                "State": state,
                                "District": district,
                                "Market": market,
                                "Commodity": commodity,
                                "Variety": variety,
                                "Grade": grade,
                                "Arrival_Date": d.strftime("%d/%m/%Y"),
                                "Min_Price": round(min_p, 2),
                                "Max_Price": round(max_p, 2),
                                "Modal_Price": round(modal, 2),
                            })

    df = pd.DataFrame(records)
    df["Arrival_Date"] = pd.to_datetime(df["Arrival_Date"], format="%d/%m/%Y")
    df = df.sort_values(["State", "District", "Market", "Commodity", "Variety", "Arrival_Date"])
    df["Arrival_Date"] = df["Arrival_Date"].dt.strftime("%d/%m/%Y")
    return df.reset_index(drop=True)


if __name__ == "__main__":
    df = generate()
    out_path = Path(__file__).parent.parent / "data" / "raw_mandi_prices.csv"
    df.to_csv(out_path, index=False)
    print(f"Generated {len(df):,} rows -> {out_path}")
    print(df.head())
