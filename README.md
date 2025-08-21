# 🧑‍⚖️ Legal Assistant Chatbot (Pakistan Laws)

This is an AI-powered legal assistant chatbot built with **FastAPI**, **LangChain**, **FAISS**, and **OpenAI**.  
It uses Retrieval-Augmented Generation (RAG) to answer user questions based on region-specific Pakistani laws.

---

## 📁 Project Structure

```
.
├── main.py               # FastAPI application entry point
├── sysprompt.py          # Custom system prompt template
├── frontend/             # Frontend (UI code)
├── requirements.txt      # Python dependencies
├── q1.png                # Demo screenshot
├── q2.png                # Demo screenshot
├── homepage.png          # Frontend homepage preview
└── .gitignore            # Ignored files (vectorstores, videos, etc.)
```

> ⚠️ Large assets (vectorstores + demo video) are excluded from this repo. See [Large Assets](#-large-assets).

---

## ⚙️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/adeelshah41/Legal-chatbot.git
cd Legal-chatbot
```

### 2. Create and Activate Virtual Environment
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Add Your Environment Variables
Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key
MONGODB_URI=your_mongodb_atlas_connection_uri
```

---

## 🔻 Large Assets

Due to GitHub size limits, the following are stored externally on **Google Drive**:

- 📂 [Vectorstore (Punjab, Sindh, KPK, Balochistan)](https://drive.google.com/drive/folders/14wgtgXdwCGuCVfHzhrorVrrL6m-tfEYL)  
- 🎥 Demo Video: *legalassitantpakistan.mp4* (same Drive folder)

Extract vectorstores into this structure:

```
project-root/
└── vectorstore/
    ├── vectorstore_punjab/
    ├── vectorstore_sindh/
    ├── vectorstore_kpk/
    └── vectorstore_balochistan/
```

---

## 🚀 Running the App

Start the FastAPI server:
```bash
uvicorn main:app --reload
```

Swagger UI:
```
http://localhost:8000/docs
```

---

## 🧠 Features
* ✅ Region-specific legal knowledge (Punjab, Sindh, KPK, Balochistan)  
* ✅ Chat history memory (file-based)  
* ✅ RAG pipeline with FAISS + OpenAI  
* ✅ Secure JWT-based authentication (optional)  
* ✅ Structured JSON responses  

---

## 📌 Coming Soon
* Admin dashboard for uploading new documents  
* Multi-language support (Urdu & English)  

---

## 👨‍💻 Author
**Adeel Shah**  
[LinkedIn](https://www.linkedin.com/in/muhammad-adeel-shah/)

---

## 📄 License
This project is licensed under the **MIT License**.
