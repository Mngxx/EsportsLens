from pathlib import Path

import pytest
from jobs.dota2_transform import (
    transform_hero_stats,
    transform_heroes,
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
    df = read_s3_json(str(FIXTURES_DIR / "dota2_match_sample.json"))
    result = transform_matches(df).collect()

    assert len(result) == 2

    radiant_row = next(r for r in result if r.account_id == 898754153)
    assert radiant_row.team == "radiant"
    assert radiant_row.win is True
    assert radiant_row.hero_id == 6

    dire_row = next(r for r in result if r.account_id == 140251702)
    assert dire_row.team == "dire"
    assert dire_row.win is False


def test_transform_heroes_flattens_to_one_row_per_hero(spark):
    df = read_s3_json(str(FIXTURES_DIR / "dota2_heroes_sample.json"))
    result = transform_heroes(df).collect()

    assert len(result) == 2

    drow_ranger = next(r for r in result if r.hero_id == 6)
    assert drow_ranger.attack_type == "Ranged"
    assert drow_ranger.primary_attr == "agi"

    lina = next(r for r in result if r.hero_id == 25)
    assert lina.attack_type == "Ranged"
    assert lina.primary_attr == "int"


def test_transform_hero_stats_flattens_to_one_row_per_hero(spark):
    df = read_s3_json(str(FIXTURES_DIR / "dota2_hero_stats_sample.json"))
    result = transform_hero_stats(df).collect()

    assert len(result) == 2

    drow_ranger = next(r for r in result if r.hero_id == 6)
    assert drow_ranger.pub_pick == 548994
    assert drow_ranger.pub_win == 255215
    assert drow_ranger.pro_pick == 10
    assert drow_ranger.win_rate == pytest.approx(255215 / 548994)
    assert drow_ranger.ban_rate == pytest.approx(17 / 27)
    assert drow_ranger.pick_rate == pytest.approx(548994 / ((548994 + 799651) / 10))

    lina = next(r for r in result if r.hero_id == 25)
    assert lina.pub_pick == 799651
    assert lina.pub_win == 395419
    assert lina.pro_pick == 29
    assert lina.win_rate == pytest.approx(395419 / 799651)
    assert lina.ban_rate == pytest.approx(62 / 91)
    assert lina.pick_rate == pytest.approx(799651 / ((548994 + 799651) / 10))
