from fastapi import APIRouter, HTTPException
from datetime import datetime
from bson.objectid import ObjectId
import traceback
from models.summary_schema import SummaryRequest
from database.mongo import summaries_collection
from services.gemini_service import generate_summary

router = APIRouter()


def format_summary_document(document):
    return {
        "id": str(document.get("_id")),
        "original_text": document.get("original_text"),
        "short_summary": document.get("short_summary"),
        "bullet_summary": document.get("bullet_summary"),
        "highlights": document.get("highlights"),
        "created_at": document.get("created_at"),
    }

@router.post("/summarize")
def create_summary(payload: SummaryRequest):
    try:
        print("[SUMMARY ROUTE] payload original_text length:", len(payload.original_text))
        summary_data = generate_summary(payload.original_text)
        print("[SUMMARY ROUTE] summary_data keys:", summary_data.keys())
        record = {
            "original_text": payload.original_text,
            "short_summary": summary_data["short_summary"],
            "bullet_summary": summary_data["bullet_summary"],
            "highlights": summary_data["highlights"],
            "created_at": datetime.utcnow().isoformat() + "Z",
        }
        document = record.copy()
        insert_result = summaries_collection.insert_one(document)
        print("[SUMMARY ROUTE] inserted id:", insert_result.inserted_id)
        return {"id": str(insert_result.inserted_id), **record}
    except Exception as exc:
        print("[SUMMARY ROUTE] exception:", exc)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc))

@router.get("/history")
def get_history():
    try:
        items = []
        for doc in summaries_collection.find().sort("created_at", -1):
            items.append(format_summary_document(doc))
        return {"history": items}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@router.delete("/history/{summary_id}")
def delete_history(summary_id: str):
    try:
        result = summaries_collection.delete_one({"_id": ObjectId(summary_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Summary not found")
        return {"message": "Summary deleted successfully", "id": summary_id}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
