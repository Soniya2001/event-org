# EventEase AI — Intelligent Luxury Event Planning & Management Platform

**EventEase AI** is an enterprise-grade, full-stack GenAI-powered event planning platform that transforms raw celebration concepts into actionable, luxury-caliber event blueprints. 

By combining **FastAPI (Python)**, **React 18 + TypeScript + Tailwind CSS**, **SQLAlchemy ORM**, and the **Google Gemini API**, EventEase AI delivers deterministic budget reconciliation, lead-time prioritized milestone scheduling, vendor procurement tracking, and a context-aware conversational AI assistant.

---

## 🌟 Key Capabilities & Pages

1. **Luxury SaaS Landing Page**: Modern hero section, interactive celebration categories, 3-step planning workflow, feature breakdowns, sample client testimonials, and FAQ accordion.
2. **Authentication & Profile Management**: Secure JWT-based authentication, bcrypt password hashing, and user currency selection (USD, EUR, INR, GBP, CAD, AUD).
3. **Event Command Center (Dashboard)**: Metric cards for total events, upcoming celebrations, capital allocated, and progress bars. Filterable by `Upcoming`, `Completed`, and `Draft`.
4. **AI Event Creation Wizard**: 6-step guided wizard (Event Type $\to$ Basic Details $\to$ Budget $\to$ Atmospheric Preferences $\to$ Special Requirements $\to$ Review & AI Generation) with full state persistence across back/forward navigation.
5. **AI Master Blueprint**: Visualizes the 6-part generated plan:
   - **Overview & Concept**: Theme, aesthetic mood, and recommended run-of-show format.
   - **Budget Breakdown**: Line-item costs, dynamic percentages, and actionable cost-saving tips.
   - **Timeline Schedule**: Chronological milestones with lead-time priorities.
   - **Vendor Specifications**: Price guidelines, booking deadlines, and selection criteria.
   - **Personalized Ideas**: Themes, decor, entertainment, and culinary touches.
   - **Risk Management**: Weather, vendor, and headcount mitigation strategies.
   - *Independent section editing, regenerating, and saving.*
6. **Deterministic Budget & Expense Management**:
   - Recharts visual charts: Category Allocation Pie Chart & Allocated vs. Actual Bar Chart.
   - Itemized expense logging (CRUD).
   - Real-time variance calculation and automated over-budget threshold alerts.
   - Integrated **AI Smart Budget Optimizer** for category-level rebalancing and contingency preservation.
7. **Timeline & Task Management**:
   - Dual view: Kanban List & Chronological Calendar view.
   - Task completion dynamically recalculates overall event planning progress.
   - Overdue milestone badges and priority filters (Low, Medium, High, Urgent).
8. **Vendor Directory & Comparison Matrix**:
   - Directory with vendor contacts, categories, and notes.
   - Estimated quote vs. actual contract quote comparisons.
   - Status tracking across inquiry, quote, booked, and payment stages.
9. **Context-Aware AI Planning Assistant**:
   - Drawer interface with conversational memory of the active event's parameters.
   - Answers questions regarding cost reduction, thematic concepts, catering ratios, and timeline scheduling.
   - Proposes structured event changes (e.g. updating guest count or budget) that require user confirmation before applying.
10. **Account & Preferences Settings**:
    - Manage profile name, default currency, notification rules, and security options.

---

## 🌐 Live Production Deployment

- **Cloud Run Live App**: [https://eventease-ai-3szof4ofua-uc.a.run.app](https://eventease-ai-3szof4ofua-uc.a.run.app)
- **Interactive API Documentation (Swagger)**: [https://eventease-ai-3szof4ofua-uc.a.run.app/docs](https://eventease-ai-3szof4ofua-uc.a.run.app/docs)
- **Health Check Endpoint**: [https://eventease-ai-3szof4ofua-uc.a.run.app/health](https://eventease-ai-3szof4ofua-uc.a.run.app/health)
- **Google Cloud Console**: [Service Console](https://console.cloud.google.com/run/detail/us-central1/eventease-ai?project=buildathon-504708)

---

## 🏗️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Vite, Lucide React, Framer Motion, Recharts, Axios |
| **Backend** | Python 3.11, FastAPI, Pydantic v2, Pydantic Settings, SQLAlchemy ORM, Uvicorn |
| **AI Integration**| Google Gemini API (`google-genai` / `gemini-2.5-flash`) with structured JSON schema enforcement |
| **Database** | SQLite (local dev zero-friction default) / PostgreSQL (production Cloud SQL / Supabase) |
| **Auth & Security** | JWT (JSON Web Tokens), `passlib` + `bcrypt`, OAuth2 password bearer |
| **Testing** | `pytest`, `pytest-asyncio`, `httpx` |
| **DevOps** | Docker, Docker Compose, Nginx (frontend SPA) |

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- (Optional) Docker & Docker Compose

---

### 1. Backend Setup

```bash
# 1. Navigate to the project root and activate virtual environment
cd event-org
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. Configure environment variables (create backend/.env)
cp backend/.env.example backend/.env

# Optional: Add your Gemini API Key in backend/.env:
# GEMINI_API_KEY="your-google-gemini-api-key"

# 4. Start the FastAPI backend server
uvicorn app.main:app --app-dir backend --reload --port 8000
```

The backend API is now accessible at:
- **API Root**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Swagger Interactive Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

### 2. Frontend Setup

In a new terminal window:

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The frontend application will start at:
- **Application URL**: [http://localhost:5173/](http://localhost:5173/)

---

### 3. Running Automated Tests

Run the backend unit test suite covering authentication, data isolation, event lifecycle, deterministic budget reconciliation, and AI endpoints:

```bash
$env:PYTHONPATH="backend"; .venv\Scripts\pytest backend\tests -v
```

Verify frontend TypeScript compilation and production bundling:

```bash
cd frontend
npm run build
```

---

## 🐳 Docker & Containerization

Run the entire full-stack application (PostgreSQL + FastAPI Backend + Nginx Frontend) with a single command:

```bash
docker-compose up --build
```

- Frontend: [http://localhost](http://localhost)
- Backend: [http://localhost:8000](http://localhost:8000)

---

## ☁️ Production Deployment

### Backend: Google Cloud Run
1. Build and push container:
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/eventease-backend ./backend
   ```
2. Deploy to Cloud Run:
   ```bash
   gcloud run deploy eventease-backend \
     --image gcr.io/PROJECT_ID/eventease-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars DATABASE_URL="postgresql://...",GEMINI_API_KEY="..."
   ```

### Frontend: Vercel
1. Import repository on [Vercel](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Set Framework Preset to `Vite`.
4. Configure Environment Variable:
   - `VITE_API_URL`: URL of your deployed Cloud Run backend (e.g., `https://eventease-backend-xxx.run.app/api/v1`).
5. Deploy.

---

## 🔒 Security & Data Integrity

- **Tenant Isolation**: Every database query filters strictly on `user_id == current_user.id`.
- **Zero Financial Hallucination**: Financial calculations (percentages, variances, balance deductions) are computed in Python backend logic.
- **User Approval Guards**: The AI assistant proposes changes as structured previews; changes are only committed after the user clicks "Confirm & Apply Change".
- **Zero Frontend Secret Leaks**: The Gemini API key is managed securely on the backend.
