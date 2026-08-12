from unittest.mock import Mock, patch

import botocore
from src.s3_writer import upload_json


def test_upload_json_success():
    with patch("src.s3_writer.s3_client") as mock_s3_client:
        result = upload_json("my-bucket", "some/key.json", {"a": 1})

    mock_s3_client.put_object.assert_called_once_with(
        Bucket="my-bucket",
        Key="some/key.json",
        Body=b'{"a": 1}',
        ContentType="application/json",
    )
    assert result is True


def test_upload_json_client_error_returns_false():
    with patch("src.s3_writer.s3_client") as mock_s3_client:
        mock_s3_client.put_object.side_effect = botocore.exceptions.ClientError(
            {"Error": {"Code": "AccessDenied", "Message": "denied"}}, "PutObject"
        )
        result = upload_json("my-bucket", "some/key.json", {"a": 1})

    assert result is False
