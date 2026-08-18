from pyspark.sql import DataFrame
from pyspark.sql.functions import col, concat, explode, lit
from pyspark.sql.types import (
    ArrayType,
    IntegerType,
    MapType,
    StringType,
    StructField,
    StructType,
)
from utils.helpers import read_s3_json

champion_schema = StructType(
    [
        StructField("type", StringType()),
        StructField("format", StringType()),
        StructField("version", StringType()),
        StructField(
            "data",
            MapType(
                StringType(),
                StructType(
                    [
                        StructField("key", StringType()),
                        StructField("name", StringType()),
                        StructField("title", StringType()),
                        StructField("tags", ArrayType(StringType())),
                        StructField(
                            "info",
                            StructType(
                                [
                                    StructField("attack", IntegerType()),
                                    StructField("defense", IntegerType()),
                                    StructField("magic", IntegerType()),
                                    StructField("difficulty", IntegerType()),
                                ]
                            ),
                        ),
                    ]
                ),
            ),
        ),
    ]
)


def transform_matches(df: DataFrame) -> DataFrame:
    matches_df = df.select(
        col("metadata.matchId").alias("match_id"),
        col("info.gameDuration").alias("duration_secs"),
        col("info.gameStartTimestamp").alias("start_time"),
        col("info.queueId").alias("queue_id"),
        explode(col("info.participants")).alias("participant"),
    )
    matches_df = matches_df.select(
        col("match_id"),
        col("participant.puuid").alias("puuid"),
        concat(
            col("participant.riotIdGameName"),
            lit("#"),
            col("participant.riotIdTagline"),
        ).alias("player_name"),
        col("participant.championId").alias("champion_id"),
        col("participant.championName").alias("champion_name"),
        col("participant.teamId").alias("team_id"),
        col("participant.win").alias("win"),
        col("participant.kills").alias("kills"),
        col("participant.deaths").alias("deaths"),
        col("participant.assists").alias("assists"),
        col("participant.goldEarned").alias("gold_earned"),
        col("participant.totalDamageDealtToChampions").alias("damage_to_champions"),
        (
            col("participant.totalMinionsKilled")
            + col("participant.neutralMinionsKilled")
        ).alias("cs"),
        col("participant.visionScore").alias("vision_score"),
        col("participant.champLevel").alias("champ_level"),
        col("queue_id"),
        col("duration_secs"),
        (col("start_time") / 1000).cast("timestamp").alias("match_date"),
    )
    return matches_df


def transform_champions(df: DataFrame) -> DataFrame:
    champions_df = df.select(
        col("version"), explode(col("data")).alias("champ_name", "champ_data")
    )
    champions_df = champions_df.select(
        col("champ_data.key").cast("int").alias("champion_id"),
        col("champ_data.name").alias("name"),
        col("champ_data.title").alias("title"),
        col("champ_data.tags")[0].alias("primary_tag"),
        col("champ_data.info.attack").alias("attack"),
        col("champ_data.info.defense").alias("defense"),
        col("champ_data.info.magic").alias("magic"),
        col("champ_data.info.difficulty").alias("difficulty"),
    )
    return champions_df
