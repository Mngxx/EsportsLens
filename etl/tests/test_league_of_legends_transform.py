from pathlib import Path

import pytest
from jobs.league_of_legends_transform import (
    champion_schema,
    transform_champions,
    transform_matches,
)
from pyspark.sql import SparkSession
from utils.helpers import read_s3_json

FIXTURES_DIR = Path(__file__).parent / "fixtures"


@pytest.fixture(scope="session")
def spark():
    return (
        SparkSession.builder.master("local[1]")
        .appName("tests")
        .config("spark.sql.shuffle.partitions", "1")
        .getOrCreate()
    )


def test_transform_matches_flattens_to_one_row_per_player(spark):
    df = read_s3_json(str(FIXTURES_DIR / "league_of_legends_match_sample.json"))
    result = transform_matches(df).collect()

    assert len(result) == 2

    team1 = next(r for r in result if r.team_id == 100)
    assert team1.champion_id == 126
    assert team1.win is True

    team2 = next(r for r in result if r.team_id == 200)
    assert team2.champion_id == 164
    assert team2.win is False


def test_transform_champions_flattens_to_one_row_per_champion(spark):
    df = read_s3_json(
        str(FIXTURES_DIR / "league_of_legends_champions_sample.json"),
        schema=champion_schema,
    )
    result = transform_champions(df).collect()

    assert len(result) == 2

    aatrox = next(r for r in result if r.champion_id == 266)
    assert aatrox.name == "Aatrox"
    assert aatrox.title == "the Darkin Blade"
    assert aatrox.primary_tag == "Fighter"
    assert aatrox.difficulty == 4

    jayce = next(r for r in result if r.champion_id == 126)
    assert jayce.name == "Jayce"
    assert jayce.title == "the Defender of Tomorrow"
    assert jayce.primary_tag == "Fighter"
    assert jayce.difficulty == 7
