# 🧑‍⚖️ Legal Assistant Chatbot (Pakistan Laws)

AI-powered legal assistant using **FastAPI**, **LangChain**, **FAISS**, and **OpenAI** with RAG over region-specific Pakistani laws.

---

## 📦 Project Structure (relevant files)

```
.
├── main.py               # FastAPI application entry point
├── sysprompt.py          # Custom system prompt template
├── frontend/             # Frontend UI (index.html, style.css, script.js)
├── requirements.txt      # Python dependencies
├── q1.png, q2.png, homepage.png
└── .gitignore            # Ignores heavy assets (vectorstores, videos, etc.)
```

> Large vectorstores are hosted on Google Drive. See **Large Assets** at the end.

---

# 🚀 Quick Start (Choose ONE)
You can run the project in **two** ways. Pick the option that suits your workflow.

## ✅ Option 1 — API-Only (FastAPI Endpoints)
Use the backend as a pure API (no UI). Test via Swagger, curl, or Postman.

### 1) Setup
```bash
git clone https://github.com/adeelshah41/Legal-chatbot.git
cd Legal-chatbot

python -m venv venv
# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
```

Create `.env`:
```env
OPENAI_API_KEY=your_openai_api_key
MONGODB_URI=your_mongodb_atlas_connection_uri
```

### 2) Run FastAPI
```bash
uvicorn main:app --reload
# Server: http://localhost:8000
# Swagger: http://localhost:8000/docs
```

### 3) Call an Endpoint
Assuming you have an endpoint like `POST /api/ask`:

**curl**
```bash
curl -X POST "http://localhost:8000/api/ask" ^
  -H "Content-Type: application/json" ^
  -d "{\"query\":\"What is the law on...\", \"region\":\"punjab\"}"
```

**HTTP response (example)**
```json
{
  "answer": "Demo response",
  "sources": []
}
```

> You can integrate the API into any client (web, mobile, server-to-server) without using the provided frontend.

---

## 🖥️ Option 2 — With Frontend UI (Integrated)
Use the provided `frontend/` (index.html, style.css, script.js). Two ways to serve it:

### A) Serve Frontend Separately (simple dev setup)
1. **Start the backend**:
   ```bash
   uvicorn main:app --reload
   # Backend on http://localhost:8000
   ```

2. **Serve the frontend** from the `frontend/` folder:
   - Windows (PowerShell):
     ```powershell
     cd frontend
     python -m http.server 5500
     ```
   - Linux/macOS:
     ```bash
     cd frontend
     python3 -m http.server 5500
     ```

3. Open **http://localhost:5500** in your browser.

4. **Enable CORS** in `main.py`:
   ```python
   from fastapi.middleware.cors import CORSMiddleware

   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:5500", "http://127.0.0.1:5500"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

5. **script.js** example call:
   ```js
   async function askQuestion(question) {
     const res = await fetch("http://localhost:8000/api/ask", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ query: question, region: "punjab" }),
     });
     if (!res.ok) throw new Error("Request failed");
     return res.json();
   }
   ```

### B) Serve Frontend Directly from FastAPI (single-port)
Mount static files and serve `index.html` at `/` so everything runs on **:8000**.

**In `main.py`:**
```python
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path

app = FastAPI()

frontend_dir = Path(__file__).parent / "frontend"
app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

@app.get("/", include_in_schema=False)
def root():
    return FileResponse(frontend_dir / "index.html")
```

**In `index.html`** reference assets via `/static`:
```html
<link rel="stylesheet" href="/static/style.css" />
<script src="/static/script.js" defer></script>
```

Run and open:
```bash
uvicorn main:app --reload
# Open http://localhost:8000
```

---

## 🔗 Example FastAPI Route (for both options)
If you don’t have one yet, here’s a minimal router to receive questions:

```python
from pydantic import BaseModel
from fastapi import APIRouter

router = APIRouter(prefix="/api")

class AskBody(BaseModel):
    query: str
    region: str | None = None  # "punjab" | "sindh" | "kpk" | "balochistan"

@router.post("/ask")
async def ask_question(body: AskBody):
    # TODO:
    # 1) choose vectorstore by region
    # 2) run retrieval + LLM
    # 3) return {"answer": "...", "sources": [...]}
    return {"answer": "Demo response", "sources": []}

# in main.py
# app.include_router(router)
```

---

## 📦 Large Assets (Hosted Externally)
Vectorstores & demo video are stored on Google Drive due to GitHub size limits:
- Vectorstores (Punjab, Sindh, KPK, Balochistan): https://drive.google.com/drive/folders/14wgtgXdwCGuCVfHzhrorVrrL6m-tfEYL

Extract vectorstores into:
```
project-root/
└── vectorstore/
    ├── vectorstore_punjab/
    ├── vectorstore_sindh/
    ├── vectorstore_kpk/
    └── vectorstore_balochistan/
```

---

## ✅ Summary
- **Option 1** — API-only: run FastAPI and call endpoints from any client (Swagger/curl/Postman).  
- **Option 2** — With Frontend: use provided UI; serve it separately (CORS) or mount via FastAPI for a single port.

