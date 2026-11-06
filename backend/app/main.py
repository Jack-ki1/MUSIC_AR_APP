from fastapi import FastAPI
from app.core.config import API_V1_STR, PROJECT_NAME
from app.api.router import api_router

app = FastAPI(title=PROJECT_NAME)

app.include_router(api_router, prefix=API_V1_STR)

@app.get("/health")
async def health_check():
    return {"status": "ok"}
