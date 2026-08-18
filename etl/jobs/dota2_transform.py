from pyspark.sql import DataFrame, Window
from pyspark.sql.functions import col, explode, sum, when
from utils.helpers import read_s3_json


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
