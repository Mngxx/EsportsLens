from pathlib import Path

import pytest
from jobs.league_of_legends_transform import transform_matches
from jobs.lol_champion_stats import transform_champion_stats
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


def test_transform_champion_stats_aggregates_across_matches(spark):
    df = read_s3_json(
        [
            str(FIXTURES_DIR / "league_of_legends_match_sample.json"),
            str(FIXTURES_DIR / "league_of_legends_match_sample_2.json"),
            str(FIXTURES_DIR / "league_of_legends_match_sample_3.json"),
        ]
    )
    matches_df = transform_matches(df)
    result = transform_champion_stats(matches_df).collect()

    assert len(result) == 3

    jayce = next(r for r in result if r.champion_id == 126)
    assert jayce.matches_played == 3
    assert jayce.wins == 2
    assert jayce.win_rate == pytest.approx(2 / 3)
    assert jayce.pick_rate == pytest.approx(1.0)

    camille = next(r for r in result if r.champion_id == 164)
    assert camille.matches_played == 2
    assert camille.wins == 1
    assert camille.win_rate == pytest.approx(0.5)
    assert camille.pick_rate == pytest.approx(2 / 3)

    ahri = next(r for r in result if r.champion_id == 103)
    assert ahri.matches_played == 1
    assert ahri.wins == 0
    assert ahri.win_rate == pytest.approx(0.0)
    assert ahri.pick_rate == pytest.approx(1 / 3)
