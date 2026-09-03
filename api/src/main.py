from fastapi import FastAPI, status
from fastapi.responses import JSONResponse
from db.athena import AthenaQueryError
from routes import players, matches, meta
from mangum import Mangum
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_methods=["GET"],
    allow_headers=["*"],
)
app.include_router(players.router)
app.include_router(matches.router)
app.include_router(meta.router)


@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """Simple Health check endpoint."""
    return {"status": "healthy"}


@app.exception_handler(AthenaQueryError)
async def athena_query_error_handler(request, exc):
    return JSONResponse(
        status_code=502,
        content={"details": str(exc)},
    )


handler = Mangum(app)
