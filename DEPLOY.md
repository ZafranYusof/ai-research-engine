# Deployment Configuration

## Backend (Render)

### render.yaml
```yaml
services:
  - type: web
    name: ai-research-engine-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: GROQ_API_KEY
        sync: false
      - key: JWT_SECRET
        sync: false
```

### Environment Variables (Render Dashboard)
- GROQ_API_KEY
- GROQ_MODEL=llama-3.3-70b-versatile
- GROQ_BASE_URL=https://api.groq.com/openai/v1
- JWT_SECRET=(generate random)
- CORS_ORIGINS=["https://your-app.vercel.app"]

## Frontend (Vercel)

### vercel.json
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://your-render-url.onrender.com/api/$1" }
  ]
}
```

### Environment Variables (Vercel Dashboard)
- VITE_API_URL=https://your-render-url.onrender.com

## Local Development
```bash
# Backend
cd backend
python -m venv venv
.\venv\Scripts\activate  (Windows)
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

## Docker (Full Stack)
```bash
docker-compose up -d
```
