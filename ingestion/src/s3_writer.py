import json
import logging

import boto3
import botocore

s3_client = boto3.client("s3")
logging.basicConfig(
    level=logging.WARNING, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)
logging.getLogger("boto3").setLevel(logging.WARNING)


def upload_json(bucket: str, key: str, data: dict | list) -> bool:
    try:
        json_data = json.dumps(data).encode("utf-8")
    except TypeError as te:
        logger.warning(f"JSON TypeError: {te}")
        raise
    try:
        s3_client.put_object(
            Bucket=bucket,
            Key=key,
            Body=json_data,
            ContentType="application/json",
        )
        return True
    except botocore.exceptions.ClientError as ce:
        logger.warning(f"S3 ClientError: {ce}")

    except botocore.exceptions.BotoCoreError as bce:
        logger.warning(f"S3 BotoCoreError: {bce}")
    return False
