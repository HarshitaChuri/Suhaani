"""
PCOS Screening ML Microservice
------------------------------
Wraps the trained Random Forest screening model (from the research project)
behind a FastAPI endpoint. The Node.js backend calls this service; it never
talks to the ML model directly.

TODO (you): drop your trained model file in ml-service/models/pcos_screening_model.joblib
and it will be picked up automatically. Until then, this runs in MOCK MODE
so you can build/test the rest of the app end-to-end.
"""

import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="PCOS Screening ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # backend calls this service server-to-server; tighten in production
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = Path(__file__).parent / "models" / "pcos_screening_model.joblib"
model = None
MOCK_MODE = True

if MODEL_PATH.exists():
    model = joblib.load(MODEL_PATH)
    MOCK_MODE = False
    print(f"Loaded trained model from {MODEL_PATH}")
else:
    print(f"No model found at {MODEL_PATH} -- running in MOCK MODE. "
          f"Predictions are randomized placeholders until you add the real model.")


class ScreeningInput(BaseModel):
    """
    Fields for the NON-invasive screening model -- matches the exact 18
    columns the trained model was fit on (X_train.columns), in the same
    order. No blood test or ultrasound values here by design.

    IMPORTANT: 'cycle_regular' encoding must match training data exactly.
    Kaggle PCOS dataset convention: Regular=2, Irregular=4 (verify against
    your own df['Cycle(R/I)'].unique() before trusting predictions).
    """
    age: int = Field(..., ge=10, le=60)                        # Age(yrs)
    weight_kg: float = Field(..., gt=0)                          # Weight(Kg)
    height_cm: float = Field(..., gt=0)                          # Height(Cm)
    # BMI is derived, not asked directly -- see featurize()
    cycle_regular: bool                                          # Cycle(R/I) -- True=regular, False=irregular
    cycle_length_days: int = Field(..., ge=1, le=90)             # Cyclelength(days)
    pregnant: bool                                                # Pregnant(Y/N)
    num_abortions: int = Field(0, ge=0)                          # No.ofaborptions
    hip_inch: float = Field(..., gt=0)                           # Hip(inch)
    waist_inch: float = Field(..., gt=0)                         # Waist(inch)
    # Waist:HipRatio is derived, not asked directly -- see featurize()
    weight_gain: bool                                             # Weightgain(Y/N)
    hair_growth_excess: bool                                     # hairgrowth(Y/N)
    skin_darkening: bool                                         # Skindarkening(Y/N)
    hair_loss: bool                                               # Hairloss(Y/N)
    pimples: bool                                                 # Pimples(Y/N)
    fast_food_frequent: bool                                     # Fastfood(Y/N)
    exercise_regular: bool                                       # Reg.Exercise(Y/N)


class ScreeningOutput(BaseModel):
    model_config = {"protected_namespaces": ()}

    risk_level: str  # "low" | "moderate" | "high"
    probability: float  # 0-1
    model_used: str
    recommendation: str


def bmi(weight_kg: float, height_cm: float) -> float:
    height_m = height_cm / 100
    return weight_kg / (height_m ** 2)


# Kaggle PCOS dataset convention. VERIFY against your own training data with
# df['Cycle(R/I)'].unique() -- if it differs, update these two values.
CYCLE_REGULAR_CODE = 2
CYCLE_IRREGULAR_CODE = 4


FEATURE_COLUMNS = [
    "Age(yrs)", "Weight(Kg)", "Height(Cm)", "BMI", "Cycle(R/I)",
    "Cyclelength(days)", "Pregnant(Y/N)", "No.ofaborptions", "Hip(inch)",
    "Waist(inch)", "Waist:HipRatio", "Weightgain(Y/N)", "hairgrowth(Y/N)",
    "Skindarkening(Y/N)", "Hairloss(Y/N)", "Pimples(Y/N)", "Fastfood(Y/N)",
    "Reg.Exercise(Y/N)",
]


def featurize(payload: ScreeningInput) -> pd.DataFrame:
    """
    Builds a single-row DataFrame with column names matching the trained
    model's X_train.columns exactly (both order and names). Using a
    DataFrame instead of a bare NumPy array avoids sklearn's "X does not
    have valid feature names" warning, since the model was trained on a
    DataFrame with these column names attached.
    Do not reorder without also reordering the training columns.
    """
    waist_hip_ratio = payload.waist_inch / payload.hip_inch

    row = [
        payload.age,                                                            # Age(yrs)
        payload.weight_kg,                                                      # Weight(Kg)
        payload.height_cm,                                                      # Height(Cm)
        bmi(payload.weight_kg, payload.height_cm),                              # BMI
        CYCLE_REGULAR_CODE if payload.cycle_regular else CYCLE_IRREGULAR_CODE,  # Cycle(R/I)
        payload.cycle_length_days,                                              # Cyclelength(days)
        int(payload.pregnant),                                                  # Pregnant(Y/N)
        payload.num_abortions,                                                  # No.ofaborptions
        payload.hip_inch,                                                       # Hip(inch)
        payload.waist_inch,                                                     # Waist(inch)
        waist_hip_ratio,                                                        # Waist:HipRatio
        int(payload.weight_gain),                                               # Weightgain(Y/N)
        int(payload.hair_growth_excess),                                        # hairgrowth(Y/N)
        int(payload.skin_darkening),                                            # Skindarkening(Y/N)
        int(payload.hair_loss),                                                 # Hairloss(Y/N)
        int(payload.pimples),                                                   # Pimples(Y/N)
        int(payload.fast_food_frequent),                                        # Fastfood(Y/N)
        int(payload.exercise_regular),                                          # Reg.Exercise(Y/N)
    ]

    return pd.DataFrame([row], columns=FEATURE_COLUMNS)

def risk_bucket(probability: float) -> str:
    if probability >= 0.66:
        return "high"
    if probability >= 0.33:
        return "moderate"
    return "low"


def recommendation_for(risk_level: str) -> str:
    return {
        "high": "Your symptoms strongly align with common PCOS patterns. Please consult a "
                "gynecologist for hormonal blood tests and an ultrasound to confirm diagnosis.",
        "moderate": "Some PCOS-related patterns are present. Consider consulting a doctor and "
                    "tracking your cycle closely over the next few months.",
        "low": "Few PCOS-related patterns detected. Continue healthy lifestyle habits and monitor "
               "any new symptoms.",
    }[risk_level]


@app.get("/health")
def health():
    return {"status": "ok", "mock_mode": MOCK_MODE}


@app.post("/predict/screening", response_model=ScreeningOutput)
def predict_screening(payload: ScreeningInput):
    try:
        features = featurize(payload)

        if MOCK_MODE:
            # Deterministic-ish placeholder so the same input always gives the same mock result
            # during development/demos (based on a simple symptom count, not a real model).
            symptom_count = sum([
                not payload.cycle_regular, payload.weight_gain, payload.pimples,
                payload.hair_growth_excess, payload.hair_loss, payload.skin_darkening,
            ])
            probability = min(0.15 + symptom_count * 0.13, 0.95)
        else:
            probability = float(model.predict_proba(features)[0][1])

        level = risk_bucket(probability)

        return ScreeningOutput(
            risk_level=level,
            probability=round(probability, 3),
            model_used="random_forest_screening_v1" if not MOCK_MODE else "mock_placeholder",
            recommendation=recommendation_for(level),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
