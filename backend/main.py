import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routes.summaries import router as summary_router

load_dotenv(override=True)

app = FastAPI(
    title="AI Content Summarizer API",
    description="REST API for generating and storing AI-powered summaries.",
    version="1.0.0",
)

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(summary_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Content Summarizer backend is running."}
