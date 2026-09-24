import os

from dotenv import load_dotenv


load_dotenv()

ATHENA_DATABASE = os.getenv("ATHENA_DATABASE")
ATHENA_WORKGROUP = os.getenv("ATHENA_WORKGROUP")
ATHENA_OUTPUT_LOCATION = os.getenv("ATHENA_OUTPUT_LOCATION")
AWS_REGION = os.getenv("AWS_REGION")

# Comma-separated list — a new local port only needs an api/.env edit now,
# no source change + redeploy. Prod's *.vercel.app origins stay in main.py's
# allow_origin_regex, since that's a pattern, not a fixed list.
CORS_ALLOW_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ALLOW_ORIGINS", "http://localhost:3000,http://localhost:5173"
    ).split(",")
    if origin.strip()
]
