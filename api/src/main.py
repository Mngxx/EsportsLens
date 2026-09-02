from fastapi import FastAPI, status
from fastapi.responses import JSONResponse
from src.db.athena import AthenaQueryError
from src.routes import players, matches, meta
from mangum import Mangum

app = FastAPI()
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
