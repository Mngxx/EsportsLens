import logging
import time

import boto3
from src.config import ATHENA_DATABASE, ATHENA_WORKGROUP

athena_client = boto3.client("athena")
logging.basicConfig(
    level=logging.WARNING, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)
logging.getLogger("boto3").setLevel(logging.WARNING)


def run_query(sql: str) -> list[dict]:
    response = athena_client.start_query_execution(
        QueryString=sql,
        QueryExecutionContext={"Database": ATHENA_DATABASE},
        WorkGroup=ATHENA_WORKGROUP,
    )
    query_id = response["QueryExecutionId"]
    poll_athena_query(query_id)
    query_results = athena_client.get_query_results(QueryExecutionId=query_id)
    athena_results = parse_athena_results(query_results)
    return athena_results


def poll_athena_query(query_execution_id: str) -> str:
    while True:
        response = athena_client.get_query_execution(
            QueryExecutionId=query_execution_id
        )
        state = response["QueryExecution"]["Status"]["State"]

        if state in ["SUCCEEDED", "FAILED", "CANCELLED"]:
            return state
        elif state == "RUNNING":
            time.sleep(1)  # Wait before next poll
        else:
            raise Exception(f"Unexpected state: {state}")


def parse_athena_results(query_results: dict) -> list[dict]:
    # 1. Extract Column Names from Metadata
    columns = [
        col["Label"]
        for col in query_results["ResultSet"]["ResultSetMetadata"]["ColumnInfo"]
    ]

    rows = query_results["ResultSet"]["Rows"]
    results = []

    # 2. Iterate over data rows (skip index 0 which is the header row in data)
    for row in rows[1:]:
        # Extract values, handling cases where a value might be null/missing
        values = [field.get("VarCharValue", "") for field in row["Data"]]

        # 3. Zip columns and values into a dict
        results.append(dict(zip(columns, values)))

    return results
