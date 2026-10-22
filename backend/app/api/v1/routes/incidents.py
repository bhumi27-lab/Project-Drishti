"""/incidents routes (see docs/PROJECT_PLAN.md section 7.5)."""

from fastapi import APIRouter

router = APIRouter(prefix="/incidents", tags=["incidents"])

# TODO: implement endpoints. Keep business logic in services/, not here.
