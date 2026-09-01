from fastapi import FastAPI, status
from fastapi.responses import JSONResponse
from src.db.athena import AthenaQueryError

app = FastAPI()


@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """Simple Health check endpoint."""
    return {"status": "healthy"}


@app.exception_handler(AthenaQueryError)
async def athena_query_error_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"message": str(exc)},
    )
