import io
import json
from unittest.mock import patch

import botocore
from db.s3 import get_last_run


class FakeNoSuchKey(Exception):
    pass


def test_get_last_run_returns_timestamp():
    body = json.dumps(
        {"timestamp": "2026-09-24T12:00:00+00:00", "results": {"dota2": {}}}
    ).encode("utf-8")

    with patch("db.s3.s3_client") as mock_client:
        mock_client.get_object.return_value = {"Body": io.BytesIO(body)}
        result = get_last_run()

    assert result == "2026-09-24T12:00:00+00:00"


def test_get_last_run_no_marker_yet_returns_none():
    with patch("db.s3.s3_client") as mock_client:
        mock_client.exceptions.NoSuchKey = FakeNoSuchKey
        mock_client.get_object.side_effect = FakeNoSuchKey()
        result = get_last_run()

    assert result is None


def test_get_last_run_client_error_returns_none():
    with patch("db.s3.s3_client") as mock_client:
        mock_client.exceptions.NoSuchKey = FakeNoSuchKey
        mock_client.get_object.side_effect = botocore.exceptions.ClientError(
            {"Error": {"Code": "AccessDenied", "Message": "denied"}}, "GetObject"
        )
        result = get_last_run()

    assert result is None
