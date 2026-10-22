from fastapi import FastAPI

app = FastAPI(title="Drishti", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    # TODO: report status of db, chroma and ollama (docs/PROJECT_PLAN.md 7.5).
    return {"status": "ok"}
