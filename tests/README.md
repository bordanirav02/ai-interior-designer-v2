# Tests

## Backend API Tests (pytest)

Tests cover all 7 Flask REST endpoints.

### Run

```bash
# From project root
pip install pytest
cd tests
pytest test_api.py -v
```

### Test Coverage

| Test File | Endpoints Covered |
|-----------|------------------|
| `test_api.py` | `/health`, `/upload`, `/generate`, `/detect-objects`, `/set-colab-url` |

### What is tested

- `GET /health` — returns `ok` status, has `mode` and `colab_connected` fields
- `POST /upload` — returns 400 when no file or wrong field name provided
- `POST /generate` — returns 503 when no AI backend connected
- `POST /detect-objects` — returns fallback object list when Colab is offline
- `POST /set-colab-url` — returns 400 when URL missing, 200 when valid URL provided

### Frontend Tests (Sprint 4)

End-to-end Playwright tests for the full user workflow are planned for Sprint 4 (TECH-09).
