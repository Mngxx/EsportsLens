from pyspark.sql import DataFrame, SparkSession
from pyspark.sql.types import StructType


def read_s3_json(path: str, schema: StructType | None = None) -> DataFrame:
    spark = SparkSession.builder.appName("Create PySpark DataFrame").getOrCreate()
    reader = spark.read.option("multiLine", True)
    if schema is not None:
        reader = reader.schema(schema)

    return reader.json(path)
