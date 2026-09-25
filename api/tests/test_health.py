from unittest.mock import patch

from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)


def test_health_check_with_last_run():
    with patch("src.main.get_last_run", return_value="2026-09-24T12:00:00+00:00"):
        response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "last_run": "2026-09-24T12:00:00+00:00",
    }


def test_health_check_no_last_run_yet():
    with patch("src.main.get_last_run", return_value=None):
        response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "last_run": None}
