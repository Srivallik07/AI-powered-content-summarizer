import json
from _bootstrap import ROOT_DIR

# Ensure backend package path is available
import _bootstrap  # noqa: F401
from bson.objectid import ObjectId
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


def format_doc(doc):
    return {
        "id": str(doc.get("_id")),
        "original_text": doc.get("original_text"),
        "short_summary": doc.get("short_summary"),
        "bullet_summary": doc.get("bullet_summary"),
        "highlights": doc.get("highlights"),
        "created_at": doc.get("created_at"),
    }


def handler(request):
    if request.method == "GET":
        items = [format_doc(doc) for doc in summaries_collection.find().sort("created_at", -1)]
        return make_response({"history": items})

    if request.method == "DELETE":
        payload = read_json(request)
        summary_id = payload.get("summary_id")
        if not summary_id:
            return make_response({"error": "summary_id is required"}, status=400)
        try:
            result = summaries_collection.delete_one({"_id": ObjectId(summary_id)})
            if result.deleted_count == 0:
                return make_response({"error": "Summary not found"}, status=404)
            return make_response({"message": "Summary deleted successfully", "id": summary_id})
        except Exception as exc:
            return make_response({"error": str(exc)}, status=500)

    return make_response({"error": "Method not allowed"}, status=405)
