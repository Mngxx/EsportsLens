from fastapi import FastAPI, status
from fastapi.responses import JSONResponse
from config import CORS_ALLOW_ORIGINS
from db.athena import AthenaQueryError
from db.s3 import get_last_run
from models.schemas import HealthSchema
from routes import players, matches, meta, dashboard
from mangum import Mangum
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware

app = FastAPI()
app.add_middleware(GZipMiddleware, minimum_size=500)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOW_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_methods=["GET"],
    allow_headers=["*"],
)
app.include_router(players.router)
app.include_router(matches.router)
app.include_router(meta.router)
app.include_router(dashboard.router)


@app.get("/health", status_code=status.HTTP_200_OK, response_model=HealthSchema)
async def health_check():
    """Health check + last successful ingestion run timestamp."""
    return {"status": "healthy", "last_run": get_last_run()}


@app.exception_handler(AthenaQueryError)
async def athena_query_error_handler(request, exc):
    return JSONResponse(
        status_code=502,
        content={"details": str(exc)},
    )


handler = Mangum(app)
