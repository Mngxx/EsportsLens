import logging

import requests

logging.basicConfig(
    level=logging.WARNING, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)
logging.getLogger("urllib3").setLevel(logging.WARNING)
logging.getLogger("requests").setLevel(logging.WARNING)


def safe_get(
    url: str, *, headers: dict | None = None, params: dict | None = None
) -> dict | list | None:
    try:
        response = requests.get(url, headers=headers, params=params)
        if not response.ok:
            logger.warning(f"Request failed with status code: {response.status_code}")
            return None
        return response.json()
    except requests.exceptions.RequestException as err:
        logger.warning(f"Request Exception: {err}")
        return None
