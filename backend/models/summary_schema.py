from pydantic import BaseModel, Field
from typing import Optional

class SummaryRequest(BaseModel):
    original_text: str = Field(..., min_length=20, max_length=25000)

class SummaryResponse(BaseModel):
    id: str
    original_text: str
    short_summary: str
    bullet_summary: str
    highlights: str
    created_at: str

class DeleteResponse(BaseModel):
    message: str
    id: Optional[str] = None
