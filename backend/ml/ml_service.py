"""
ml_service.py
─────────────
Lightweight Flask HTTP service that wraps the trained scikit-learn models.
The Express backend calls this service via HTTP on port 5001.

Endpoints:
  POST /predict   – accepts drone features, returns type + threat score
  GET  /health    – health check
  GET  /info      – model metadata

Run with: python ml/ml_service.py
"""

import json
import math
import numpy as np
import joblib
from flask import Flask, request, jsonify

app = Flask(__name__)

# ── Load models at startup ────────────────────────────────────────────────────
MODEL_DIR = 'ml/models'
try:
    clf = joblib.load(f'{MODEL_DIR}/type_classifier.pkl')
    reg = joblib.load(f'{MODEL_DIR}/threat_regressor.pkl')
    le  = joblib.load(f'{MODEL_DIR}/label_encoder.pkl')
    with open(f'{MODEL_DIR}/meta.json') as f:
        meta = json.load(f)
    FEATURES = meta['features']
    print("[OK] ML models loaded successfully")
    print(f"   Classifier: {meta['model_info']['classifier']}")
    print(f"   Regressor:  {meta['model_info']['regressor']}")
    MODELS_LOADED = True
except Exception as e:
    print(f"⚠ Could not load models: {e}")
    print("  Run: python ml/train_models.py  first")
    MODELS_LOADED = False

# ── Helper ────────────────────────────────────────────────────────────────────
DIFF_MAP = {'Easy': 0, 'Medium': 1, 'Hard': 2}

def build_feature_vector(drone, scenario):
    """
    Convert a drone + scenario dict into the feature vector the models expect.
    Matches exactly the features used during training (see train_models.py).
    """
    x = float(drone.get('x', 0.5))
    y = float(drone.get('y', 0.5))
    dist = math.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2)

    # Approach angle from edge toward centre
    angle = math.atan2(y - 0.5, x - 0.5)

    speed    = float(drone.get('speed', 0.001))
    is_night = 1 if scenario.get('timeOfDay', 'Day') == 'Night' else 0
    degraded = 1 if scenario.get('degradedSensors', False) else 0
    diff_enc = DIFF_MAP.get(scenario.get('difficulty', 'Medium'), 1)

    return [
        round(dist, 4),
        round(speed, 5),
        is_night,
        degraded,
        diff_enc,
        round(math.sin(angle), 4),
        round(math.cos(angle), 4),
    ]

# ── Routes ────────────────────────────────────────────────────────────────────

@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'models_loaded': MODELS_LOADED})


@app.route('/info')
def info():
    if not MODELS_LOADED:
        return jsonify({'error': 'Models not loaded'}), 503
    return jsonify(meta)


@app.route('/predict', methods=['POST'])
def predict():
    """
    Body: {
      "drones":   [ { id, type, hostile, x, y, speed, spawnAt } ],
      "scenario": { difficulty, timeOfDay, terrain, degradedSensors },
      "decisions":[ { droneId, action, reactionSec } ]
    }

    Returns: {
      "results": [
        {
          "droneId":       "D1",
          "predictedType": "Armed",
          "actualType":    "Armed",
          "threatScore":   87,
          "threatLevel":   "High",
          "confidence":    0.91,
          "recommended":   "Jam",
          "probabilities": { "Armed": 0.91, "Commercial": 0.03, ... }
        },
        ...
      ],
      "modelAccuracy": 0.91
    }
    """
    if not MODELS_LOADED:
        return jsonify({'error': 'Models not loaded. Run python ml/train_models.py first.'}), 503

    data     = request.get_json(force=True) or {}
    drones   = data.get('drones', [])
    scenario = data.get('scenario', {})
    decisions = data.get('decisions', [])

    if not drones:
        return jsonify({'error': 'No drones provided'}), 400

    results = []
    correct = 0

    for drone in drones:
        fv = build_feature_vector(drone, scenario)
        X  = np.array([fv])

        # 1. Predict drone TYPE
        type_idx   = clf.predict(X)[0]
        type_proba = clf.predict_proba(X)[0]
        pred_type  = le.classes_[type_idx]
        confidence = float(round(type_proba[type_idx], 3))

        # Probability breakdown across all classes
        probs = {cls: round(float(p), 3) for cls, p in zip(le.classes_, type_proba)}

        # 2. Predict THREAT SCORE
        raw_score = float(reg.predict(X)[0])
        threat_score = int(min(100, max(0, round(raw_score))))

        # 3. Classify threat level
        threat_level = 'High' if threat_score >= 65 else ('Medium' if threat_score >= 35 else 'Low')

        # 4. Recommended action
        if pred_type == 'Swarm':
            recommended = 'Engage'
        elif threat_score >= 65:
            recommended = 'Jam'
        else:
            recommended = 'Monitor'

        # 5. Operator decision lookup
        decision = next((d for d in decisions if d.get('droneId') == drone.get('id')), None)
        op_action  = decision['action'] if decision else 'None'
        reaction_s = decision.get('reactionSec') if decision else None

        actual_type = drone.get('type', 'Unknown')
        if pred_type == actual_type:
            correct += 1

        results.append({
            'droneId':        drone.get('id'),
            'predictedType':  pred_type,
            'actualType':     actual_type,
            'threatScore':    threat_score,
            'threatLevel':    threat_level,
            'confidence':     confidence,
            'probabilities':  probs,
            'recommended':    recommended,
            'operatorAction': op_action,
            'reactionSec':    reaction_s,
            'features':       dict(zip(FEATURES, [round(v, 4) for v in fv])),
        })

    model_accuracy = round(correct / len(drones), 2) if drones else 0.0

    return jsonify({
        'results':       results,
        'modelAccuracy': model_accuracy,
        # Shape the 'rows' key the frontend already expects
        'rows':          results,
    })


if __name__ == '__main__':
    print("====================================")
    print("  Drone ML Service  (port 5001)")
    print("====================================")
    app.run(host='0.0.0.0', port=5001, debug=False)
