import json
import logging

import boto3
import botocore
from config import RAW_BUCKET_NAME


s3_client = boto3.client("s3")
logger = logging.getLogger(__name__)

LAST_RUN_KEY = "meta/last_run.json"


def get_last_run() -> str | None:
    """Returns the ingestion Lambda's last-run ISO timestamp, or None if it
    hasn't run yet (no marker object) or the read fails."""
    try:
        response = s3_client.get_object(Bucket=RAW_BUCKET_NAME, Key=LAST_RUN_KEY)
        body = json.loads(response["Body"].read())
        return body.get("timestamp")
    except s3_client.exceptions.NoSuchKey:
        return None
    except (botocore.exceptions.ClientError, botocore.exceptions.BotoCoreError) as exc:
        logger.warning(f"Failed to read last-run marker: {exc}")
        return None
