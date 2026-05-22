# AI-Powered Content Summarizer

A beginner-friendly full-stack web app for summarizing long text and files with Google Gemini, built with React, FastAPI, MongoDB Atlas, and Tailwind CSS.

## Features

- Paste text or upload a `.txt` / `.pdf` file
- Generate:
  - Short summary
  - Bullet point summary
  - Key highlights
- Save summaries in MongoDB Atlas
- View summary history
- Delete old summaries
- Copy summary text to clipboard
- Dark / light mode toggle
- Word count and summary length statistics
- Responsive dashboard UI

## Folder structure

- `frontend/` — React app with Tailwind CSS
- `backend/` — FastAPI server with MongoDB integration

## Setup

### 1. Backend

1. Create a MongoDB Atlas cluster and get a connection string.
2. Copy `backend/.env.example` to `backend/.env` and set values.
   - If you have a Groq key, set `GROQ_API_KEY` and optionally `GROQ_MODEL`.
   - Otherwise leave `GROQ_API_KEY` blank.
   - If you have a Google API key, set `GEMINI_API_KEY` and optionally `MODEL_NAME`.
   - Leave both keys blank to use the built-in local summarizer without any external API.
3. Install dependencies:

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

5. Run the backend:

```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend

1. Copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL`.
2. Install dependencies:

```powershell
cd frontend
npm install
```

3. Run the frontend:

```powershell
npm run dev -- --host 0.0.0.0 --port 5173
```

## Deployment

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

### Frontend deployment

1. Push the repository to GitHub.
2. Create a Vercel project and connect this repo.
3. In Vercel project settings, set environment variable `VITE_API_URL` to your backend URL.
4. Deploy.

The repo already includes a root `vercel.json` that builds the `frontend/` app as a static site.

> If the backend is not available, the frontend falls back to a local browser summarizer so the website still returns a summary.

### Backend deployment

1. Push the `backend/` folder to GitHub.
2. Create a Render Web Service.
3. Set environment variables:
   - `GEMINI_API_KEY`
   - `MONGODB_URI`
4. Use `uvicorn main:app --host 0.0.0.0 --port 10000` as the start command.

### Database

- Use MongoDB Atlas with the `summaries` collection in your database.

## Notes

- Do not commit API keys or database URIs to source control.
- Use the `.env` files locally only.
"# AI-powered-content-summarizer" 
