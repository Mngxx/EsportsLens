import json

import pytest
from pyspark.sql import SparkSession
from utils.helpers import read_s3_json


@pytest.fixture(scope="session")
def spark():
    return (
        SparkSession.builder.master("local[1]")
        .appName("tests")
        .config("spark.sql.shuffle.partitions", "1")
        .getOrCreate()
    )


def _write_json(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj))


def test_read_s3_json_recursive_reads_mixed_hive_and_flat_layout(spark, tmp_path):
    # Reproduces the Week 5 bug: mixed Hive-partitioned + flat raw layout silently dropped files.
    _write_json(
        tmp_path / "year=2026" / "month=08" / "day=13" / "old_match.json",
        {"match_id": "old-1"},
    )
    _write_json(tmp_path / "new_match.json", {"match_id": "new-1"})

    df = read_s3_json(str(tmp_path), recursive=True)
    match_ids = {row["match_id"] for row in df.collect()}

    assert match_ids == {"old-1", "new-1"}


def test_read_s3_json_non_recursive_drops_flat_files_under_hive_partitions(
    spark, tmp_path
):
    # Same fixture without recursive=True — documents the actual bug behavior.
    _write_json(
        tmp_path / "year=2026" / "month=08" / "day=13" / "old_match.json",
        {"match_id": "old-1"},
    )
    _write_json(tmp_path / "new_match.json", {"match_id": "new-1"})

    df = read_s3_json(str(tmp_path))
    match_ids = {row["match_id"] for row in df.collect()}

    assert match_ids == {"old-1"}
