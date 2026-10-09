"""
train_models.py
───────────────
Trains two scikit-learn models on synthetic drone observation data:
  1. RandomForestClassifier  → predicts drone TYPE (classification)
  2. GradientBoostingRegressor → predicts THREAT SCORE (0-100) (regression)

Features used (all derived from what the simulation already tracks):
  - dist_from_centre   : Euclidean distance from (0.5, 0.5)
  - speed              : normalised approach speed
  - is_night           : 0/1
  - degraded_sensors   : 0/1
  - difficulty_enc     : 0=Easy, 1=Medium, 2=Hard
  - approach_angle_sin : sin of approach angle (direction info)
  - approach_angle_cos : cos of approach angle

Saves trained models to ml/models/ using joblib.
Run once before starting the server: python ml/train_models.py
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, mean_absolute_error
from sklearn.preprocessing import LabelEncoder
import joblib
import os
import json

# ── Reproducibility ───────────────────────────────────────────────────────────
SEED = 42
np.random.seed(SEED)

# ── Synthetic data generation ─────────────────────────────────────────────────
# We generate data that mirrors the actual simulation logic so the model learns
# the same relationships as the rule-based engine — but generalises beyond it.

N = 5000   # training samples

TYPES = ['Commercial', 'Surveillance', 'Armed', 'Swarm']
DIFFICULTY = ['Easy', 'Medium', 'Hard']
DIFF_MAP   = {'Easy': 0, 'Medium': 1, 'Hard': 2}
DIFF_MULT  = {'Easy': 0.8, 'Medium': 1.0, 'Hard': 1.25}

TYPE_BASE  = {'Commercial': 15, 'Surveillance': 45, 'Armed': 75, 'Swarm': 80}
HOSTILE    = {'Commercial': False, 'Surveillance': False, 'Armed': True, 'Swarm': True}
HOST_CHANCE = {'Easy': 0.4, 'Medium': 0.6, 'Hard': 0.8}

rows = []
for _ in range(N):
    diff = np.random.choice(DIFFICULTY)
    hostile_prob = HOST_CHANCE[diff]
    is_hostile = np.random.random() < hostile_prob

    if is_hostile:
        dtype = np.random.choice(['Armed', 'Swarm'])
    else:
        dtype = np.random.choice(['Commercial', 'Surveillance'])

    # Position (normalised 0-1 grid)
    angle = np.random.uniform(0, 2 * np.pi)
    # Hostile drones spawn closer; harmless ones stay near edge
    if is_hostile:
        radius = np.random.uniform(0.1, 0.48)
    else:
        radius = np.random.uniform(0.25, 0.48)

    x = 0.5 + np.cos(angle) * radius
    y = 0.5 + np.sin(angle) * radius

    dist = np.sqrt((x - 0.5)**2 + (y - 0.5)**2)
    speed = np.random.uniform(0.0008, 0.0020) * (2 if diff == 'Hard' and is_hostile else 1)
    is_night = int(np.random.random() < 0.45)
    degraded  = int(np.random.random() < 0.35)

    # Compute threat score using the same formula as the rule-based engine
    base  = TYPE_BASE[dtype]
    prox  = round((1 - dist / 0.5) * 20)
    spd   = 10 if speed > 0.001 else 0
    env   = (8 if is_night else 0) + (-10 if degraded else 0)
    score = round((base + prox + spd + env) * DIFF_MULT[diff])
    score = min(100, max(0, score))

    # Add ±10 noise so the model has to generalise (not just memorise)
    score_noisy = int(min(100, max(0, score + np.random.randint(-10, 11))))

    rows.append({
        'type':              dtype,
        'hostile':           int(is_hostile),
        'dist_from_centre':  round(dist, 4),
        'speed':             round(speed, 5),
        'is_night':          is_night,
        'degraded_sensors':  degraded,
        'difficulty_enc':    DIFF_MAP[diff],
        'approach_angle_sin': round(np.sin(angle), 4),
        'approach_angle_cos': round(np.cos(angle), 4),
        'threat_score':      score_noisy,
    })

df = pd.DataFrame(rows)

FEATURES = ['dist_from_centre', 'speed', 'is_night', 'degraded_sensors',
            'difficulty_enc', 'approach_angle_sin', 'approach_angle_cos']

X = df[FEATURES].values

# ── Model 1: Type Classifier (RandomForest) ───────────────────────────────────
le = LabelEncoder()
y_type = le.fit_transform(df['type'])

X_tr, X_te, y_tr, y_te = train_test_split(X, y_type, test_size=0.2, random_state=SEED)

clf = RandomForestClassifier(n_estimators=120, max_depth=10, random_state=SEED, n_jobs=-1)
clf.fit(X_tr, y_tr)

y_pred = clf.predict(X_te)
print("=== Type Classifier (RandomForest) ===")
print(classification_report(y_te, y_pred, target_names=le.classes_))

# ── Model 2: Threat Score Regressor (GradientBoosting) ───────────────────────
y_score = df['threat_score'].values

X_tr2, X_te2, ys_tr, ys_te = train_test_split(X, y_score, test_size=0.2, random_state=SEED)

reg = GradientBoostingRegressor(n_estimators=150, max_depth=4, learning_rate=0.1, random_state=SEED)
reg.fit(X_tr2, ys_tr)

ys_pred = reg.predict(X_te2)
mae = mean_absolute_error(ys_te, ys_pred)
print(f"\n=== Threat Score Regressor (GradientBoosting) ===")
print(f"MAE: {mae:.2f} points  (out of 100)")

# ── Feature importances ───────────────────────────────────────────────────────
print("\n=== Feature importances (classifier) ===")
for fname, imp in sorted(zip(FEATURES, clf.feature_importances_), key=lambda x: -x[1]):
    print(f"  {fname:<25} {imp:.3f}")

# ── Save models ───────────────────────────────────────────────────────────────
os.makedirs('ml/models', exist_ok=True)
joblib.dump(clf,      'ml/models/type_classifier.pkl')
joblib.dump(reg,      'ml/models/threat_regressor.pkl')
joblib.dump(le,       'ml/models/label_encoder.pkl')

# Save feature list and class names for the inference service to use
meta = {
    'features':   FEATURES,
    'classes':    le.classes_.tolist(),
    'model_info': {
        'classifier': 'RandomForestClassifier(n_estimators=120, max_depth=10)',
        'regressor':  'GradientBoostingRegressor(n_estimators=150, max_depth=4)',
        'training_samples': N,
        'seed': SEED,
    }
}
with open('ml/models/meta.json', 'w') as f:
    json.dump(meta, f, indent=2)

print("\n[OK] Models saved to ml/models/")
print("   type_classifier.pkl")
print("   threat_regressor.pkl")
print("   label_encoder.pkl")
print("   meta.json")
