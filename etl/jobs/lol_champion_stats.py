from pyspark.sql import DataFrame
from pyspark.sql.functions import col, count, when
from pyspark.sql.functions import sum as spark_sum


def transform_champion_stats(matches_df: DataFrame) -> DataFrame:
    total_matches = matches_df.select("match_id").distinct().count()

    champion_stats_df = matches_df.groupBy("champion_id", "champion_name").agg(
        count("*").alias("matches_played"),
        spark_sum(when(col("win"), 1).otherwise(0)).alias("wins"),
    )

    champion_stats_df = champion_stats_df.withColumn(
        "pick_rate", col("matches_played") / total_matches
    ).withColumn("win_rate", col("wins") / col("matches_played"))

    return champion_stats_df
