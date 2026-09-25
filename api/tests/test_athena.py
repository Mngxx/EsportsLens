from unittest.mock import patch

import pytest
from db.athena import (
    AthenaQueryError,
    _parse_athena_results,
    _poll_athena_query,
    run_query,
)


def _query_results(columns, data_rows):
    return {
        "ResultSet": {
            "ResultSetMetadata": {"ColumnInfo": [{"Label": c} for c in columns]},
            "Rows": [
                {"Data": [{} for _ in columns]},  # header row, skipped by _parse
                *[{"Data": [{"VarCharValue": v} for v in row]} for row in data_rows],
            ],
        }
    }


def test_run_query_success_returns_parsed_rows():
    with patch("db.athena.athena_client") as mock_client:
        mock_client.start_query_execution.return_value = {"QueryExecutionId": "q1"}
        mock_client.get_query_execution.return_value = {
            "QueryExecution": {"Status": {"State": "SUCCEEDED"}}
        }
        mock_client.get_query_results.return_value = _query_results(
            ["account_id", "player_name"], [["3456", "test_player_1"]]
        )

        result = run_query("SELECT * FROM dota2_matches")

    mock_client.get_query_results.assert_called_once_with(QueryExecutionId="q1")
    assert result == [{"account_id": "3456", "player_name": "test_player_1"}]


def test_run_query_raises_on_failed_state_and_never_fetches_results():
    with patch("db.athena.athena_client") as mock_client:
        mock_client.start_query_execution.return_value = {"QueryExecutionId": "q1"}
        mock_client.get_query_execution.return_value = {
            "QueryExecution": {"Status": {"State": "FAILED"}}
        }

        with pytest.raises(AthenaQueryError):
            run_query("SELECT * FROM dota2_matches")

    mock_client.get_query_results.assert_not_called()


def test_parse_athena_results_handles_missing_value_as_empty_string():
    query_results = {
        "ResultSet": {
            "ResultSetMetadata": {
                "ColumnInfo": [{"Label": "hero_id"}, {"Label": "win_rate"}]
            },
            "Rows": [
                {"Data": [{}, {}]},  # header row, skipped
                {"Data": [{"VarCharValue": "6"}, {}]},  # win_rate missing -> ""
            ],
        }
    }

    result = _parse_athena_results(query_results)

    assert result == [{"hero_id": "6", "win_rate": ""}]


def test_poll_athena_query_polls_through_running_state_until_succeeded():
    with patch("db.athena.time.sleep") as mock_sleep:
        with patch(
            "db.athena.athena_client.get_query_execution",
            side_effect=[
                {"QueryExecution": {"Status": {"State": "RUNNING"}}},
                {"QueryExecution": {"Status": {"State": "SUCCEEDED"}}},
            ],
        ) as mock_get_query_execution:
            result = _poll_athena_query("q1")

        mock_get_query_execution.assert_called_with(QueryExecutionId="q1")
        mock_sleep.assert_called_once()
        assert result == "SUCCEEDED"
        assert mock_sleep.call_count == 1
        assert mock_get_query_execution.call_count == 2


def test_poll_athena_query_raises_on_unexpected_state():
    with patch(
        "db.athena.athena_client.get_query_execution",
        return_value={"QueryExecution": {"Status": {"State": "INTERRUPTED"}}},
    ):
        with pytest.raises(Exception):
            _poll_athena_query("q1")
