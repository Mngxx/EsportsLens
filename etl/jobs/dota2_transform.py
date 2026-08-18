import sys

from awsglue.context import GlueContext
from awsglue.job import Job
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from pyspark.sql import DataFrame, Window
from pyspark.sql.functions import col, explode, month, sum, when, year
from utils.helpers import read_s3_json


def main():
    args = getResolvedOptions(sys.argv, ["JOB_NAME", "RAW_BUCKET", "CURATED_BUCKET"])

    sc = SparkContext()
    glue_context = GlueContext(sc)
    spark = glue_context.spark_session
    spark.conf.set("spark.sql.sources.partitionOverwriteMode", "dynamic")

    job = Job(glue_context)
    job.init(args["JOB_NAME"], args)

    raw_bucket = args["RAW_BUCKET"]
    curated_bucket = args["CURATED_BUCKET"]

    matches_raw = read_s3_json(f"s3://{raw_bucket}/dota2/matches/")
    matches_df = transform_matches(matches_raw)
    matches_df = matches_df.withColumn("year", year("match_date")).withColumn(
        "month", month("match_date")
    )
    matches_df.write.mode("overwrite").partitionBy("year", "month").parquet(
        f"s3://{curated_bucket}/dota2/matches/"
    )

    heroes_raw = read_s3_json(f"s3://{raw_bucket}/dota2/heroes/")
    transform_heroes(heroes_raw).write.mode("overwrite").parquet(
        f"s3://{curated_bucket}/dota2/heroes/"
    )

    hero_stats_raw = read_s3_json(f"s3://{raw_bucket}/dota2/hero_stats/")
    transform_hero_stats(hero_stats_raw).write.mode("overwrite").parquet(
        f"s3://{curated_bucket}/dota2/hero_stats/"
    )

    job.commit()


def transform_heroes(df: DataFrame) -> DataFrame:
    heroes_df = df.select(
        col("id").alias("hero_id"),
        col("name"),
        col("localized_name"),
        col("primary_attr"),
        col("attack_type"),
    )
    return heroes_df


def transform_hero_stats(df: DataFrame) -> DataFrame:
    hero_stats_df = df.select(
        col("id").alias("hero_id"),
        col("name").alias("hero_name"),
        col("primary_attr"),
        col("attack_type"),
        col("pub_pick"),
        col("pub_win"),
        col("pro_pick"),
        col("pro_win"),
        col("pro_ban"),
        (col("pub_win") / col("pub_pick")).alias("win_rate"),
        (col("pro_ban") / (col("pro_pick") + col("pro_ban"))).alias("ban_rate"),
    )
    total_matches = sum("pub_pick").over(Window.partitionBy()) / 10
    hero_stats_df = hero_stats_df.withColumn(
        "pick_rate", col("pub_pick") / total_matches
    )
    return hero_stats_df


def transform_matches(df: DataFrame) -> DataFrame:
    matches_df = df.select(
        col("match_id"),
        col("start_time"),
        col("leagueid"),
        col("duration"),
        explode(col("players")).alias("player"),
    )
    matches_df = matches_df.select(
        col("match_id"),
        col("player.account_id").alias("account_id"),
        col("player.personaname").alias("player_name"),
        col("player.hero_id").alias("hero_id"),
        col("player.isRadiant").alias("is_radiant"),
        col("player.win").alias("win"),
        col("player.kills").alias("kills"),
        col("player.deaths").alias("deaths"),
        col("player.assists").alias("assists"),
        col("player.kda").alias("kda"),
        col("player.last_hits").alias("last_hits"),
        col("player.denies").alias("denies"),
        col("player.gold_per_min").alias("gold_per_min"),
        col("player.xp_per_min").alias("xp_per_min"),
        col("player.net_worth").alias("net_worth"),
        col("player.hero_damage").alias("hero_damage"),
        col("player.tower_damage").alias("tower_damage"),
        col("player.hero_healing").alias("hero_healing"),
        col("player.level").alias("level"),
        col("leagueid").alias("league_id"),
        col("duration").alias("duration_secs"),
        col("start_time").cast("timestamp").alias("match_date"),
    )
    matches_df = matches_df.withColumn(
        "is_radiant", when(col("is_radiant"), "radiant").otherwise("dire")
    ).withColumnRenamed("is_radiant", "team")
    matches_df = matches_df.withColumn("win", (col("win") == 1))
    return matches_df


if __name__ == "__main__":
    main()
