import json
from datetime import datetime
from _bootstrap import ROOT_DIR

# Ensure backend package path is available
import _bootstrap  # noqa: F401
from services.gemini_service import generate_summary
from database.mongo import summaries_collection


def make_response(body, status=200):
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(body),
    }


def read_json(request):
    if hasattr(request, "json"):
        try:
            return request.json()
        except Exception:
            pass
    try:
        raw = request.body
        if isinstance(raw, bytes):
            raw = raw.decode("utf-8")
        return json.loads(raw or "{}")
    except Exception:
        return {}


def handler(request):
    if request.method != "POST":
        return make_response({"error": "Method not allowed"}, status=405)

    payload = read_json(request)
    original_text = payload.get("original_text")
    if not original_text or not isinstance(original_text, str) or len(original_text.strip()) < 20:
        return make_response({"error": "original_text is required and must be at least 20 characters."}, status=400)

    summary_data = generate_summary(original_text)
    record = {
        "original_text": original_text,
        "short_summary": summary_data["short_summary"],
        "bullet_summary": summary_data["bullet_summary"],
        "highlights": summary_data["highlights"],
        "created_at": datetime.utcnow().isoformat() + "Z",
    }
    document = record.copy()
    insert_result = summaries_collection.insert_one(document)
    response_obj = {"id": str(insert_result.inserted_id), **record}
    return make_response(response_obj)
