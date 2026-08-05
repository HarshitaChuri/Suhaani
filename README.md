# Suhaani — PCOS Screening & Care Platform

A real-time platform built on top of a research project for early PCOS
detection: a non-invasive symptom screening tool (powered by a trained
Random Forest model), with cycle tracking, a symptom chatbot, a community, and
doctor consultations planned in upcoming phases.

## Architecture

Three independent services:

```
pcos-platform/
├── frontend/     React + Vite — the web app
├── backend/      Node.js + Express + Mongoose — API, auth, business logic
└── ml-service/   Python + FastAPI — wraps the trained Random Forest model
```

The frontend never talks to the ML service directly — it calls the backend,
which calls the ML service internally. This keeps your model code isolated
and easy to explain/demo separately (good for interviews — you can show the
research notebook, the FastAPI wrapper, and the product UI as three distinct,
understandable layers).

```
Browser (React) → Node/Express API → FastAPI ML service → Random Forest model
                        ↓
                    MongoDB Atlas
```

## Prerequisites

- Node.js 18+
- Python 3.10+
- A free MongoDB Atlas account (see below)

## 1. Set up MongoDB Atlas (free, forever)

1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account
2. Create a new project → build a database → choose the **M0 Free** tier
3. Create a database user (username/password) — save these
4. Under Network Access, add `0.0.0.0/0` (allow from anywhere) for development
5. Click "Connect" → "Drivers" → copy the connection string, it looks like:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/`

## 2. Run the ML service

```bash
cd ml-service
pip install -r requirements.txt
python3 -m uvicorn main:app --reload --port 8000
```

Runs at `http://localhost:8000`. Visit `http://localhost:8000/docs` for the
interactive API docs (FastAPI gives you this for free).

**Note:** it starts in MOCK MODE until you add your real trained model.
See `ml-service/models/README.md` for how to export your model with `joblib`.

## 3. Run the backend

```bash
cd backend
cp .env.example .env
# edit .env — paste your MongoDB URI and set a random JWT_SECRET
npm install
npm run dev
```

Runs at `http://localhost:5000`. Health check: `http://localhost:5000/api/health`

## 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:5173`.

## 5. Set up the chatbot (Gemini API — free, no credit card)

1. Go to https://aistudio.google.com/apikey and sign in with any Google account
2. Click "Create API key" → copy it
3. Paste it into `backend/.env` as `GEMINI_API_KEY`
4. Restart the backend — the chatbot and recipe filter both work immediately, no other setup needed

**Note:** as of mid-2026, new keys are "auth keys" (format starts with `AQ.`)
and use Gemini's Interactions API, not the older `generateContent` endpoint.
The integration in `backend/src/utils/gemini.js` already accounts for this.

## Current features (Phase 0-6 + polish)

- ✅ User registration / login (JWT auth)
- ✅ Non-invasive PCOS symptom screening (calls ML service, stores result)
- ✅ Cycle tracking with calendar view and next-period prediction
- ✅ RAG chatbot ("Ask Suhaani") grounded in a curated PCOS knowledge base (Gemini API, free tier)
- ✅ Voice input + per-message "read aloud" in the chatbot (Web Speech API, free, female-voice preference, no backend cost)
- ✅ Chatbot replies in English, Hindi, or Marathi — a per-conversation language selector, not a full-site translation
- ✅ Recipe filter tool (PCOS-friendly recipes tagged by dietary goal)
- ✅ Community feed: posts, comments, likes, anonymous posting
- ✅ Doctor consultation booking: live availability, real slot-conflict prevention, connected to screening results
- ✅ Dashboard showing latest risk assessment
- ✅ Indigo/teal design system with motion (gradient accents, entrance animations, hover-lift cards)

## Notes on the chatbot's language and voice features

Rather than translating every page site-wide (which added bundle weight for
uneven payoff), multilingual support is scoped to where it matters most: the
chatbot. A language selector on the Ask Suhaani page tells Gemini to respond
in English, Hindi, or Marathi (`backend/src/utils/gemini.js`) — the same
English-language curated knowledge base is used for all three; Gemini
translates and phrases the answer naturally itself, so no separate translated
content was needed.

Voice input uses the browser's built-in `SpeechRecognition` API; each
assistant message has its own speaker icon (🔊) to read that specific reply
aloud, matching the pattern used in Claude/ChatGPT, rather than a global
auto-read toggle. Text-to-speech prefers a female voice where the browser's
available voice list allows it (`frontend/src/hooks/useSpeech.js`) — this is
a best-effort name-based match, since the Web Speech API has no reliable
standardized gender field. Both features are 100% free, browser-native, and
need zero API keys.

## Roadmap

- [ ] Phase 7 — Deploy to Vercel (frontend) + Render (backend + ML service)

## Plugging in your real trained model

The screening endpoint (`ml-service/main.py`) is already wired to the exact
18-feature screening model from your research (ROC-AUC 0.93):

```
Age(yrs), Weight(Kg), Height(Cm), BMI*, Cycle(R/I), Cyclelength(days),
Pregnant(Y/N), No.ofaborptions, Hip(inch), Waist(inch), Waist:HipRatio*,
Weightgain(Y/N), hairgrowth(Y/N), Skindarkening(Y/N), Hairloss(Y/N),
Pimples(Y/N), Fastfood(Y/N), Reg.Exercise(Y/N)
```
*BMI and Waist:HipRatio are computed automatically from the other inputs — the user never enters them directly.

To go live with your real model:

```python
# In your research notebook, after training:
import joblib
joblib.dump(your_random_forest_model, 'pcos_screening_model.joblib')
```

Copy that file into `ml-service/models/pcos_screening_model.joblib`. Restart the
ML service — it detects the file and switches out of mock mode automatically
(check the startup log, or `GET /health` — `mock_mode` flips to `false`).

**`Cycle(R/I)` encoding — confirmed:** `2` = regular, `4` = irregular, verified
directly against the training data. This matches `CYCLE_REGULAR_CODE` and
`CYCLE_IRREGULAR_CODE` in `ml-service/main.py`'s `featurize()` section, no
further changes needed there.

**Note on your full 38-feature model** (the 96.15% XGBoost one, using
ultrasound + blood test data): that's a separate model, not currently wired
into this app. It would need its own endpoint and its own form asking for
values like AMH, FSH/LH, and follicle counts — data a user can't supply
without already having had those tests done. The 18-feature screening model
above is the one meant for a home/self-screening flow.
