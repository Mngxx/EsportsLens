import boto3
from pyspark.sql import DataFrame, SparkSession
from pyspark.sql.types import StructType


def latest_s3_key(bucket: str, prefix: str) -> str:
    s3 = boto3.client("s3")
    paginator = s3.get_paginator("list_objects_v2")
    keys = [
        obj["Key"]
        for page in paginator.paginate(Bucket=bucket, Prefix=prefix)
        for obj in page.get("Contents", [])
    ]
    if not keys:
        raise ValueError(f"No objects found under s3://{bucket}/{prefix}")
    return max(keys)


def read_s3_json(
    path: str, schema: StructType | None = None, recursive: bool = False
) -> DataFrame:
    spark = SparkSession.builder.appName("Create PySpark DataFrame").getOrCreate()
    reader = spark.read.option("multiLine", True)
    if schema is not None:
        reader = reader.schema(schema)
    if recursive:
        # Disables Hive partition inference, which otherwise silently drops files that don't match it.
        reader = reader.option("recursiveFileLookup", "true")

    return reader.json(path)
