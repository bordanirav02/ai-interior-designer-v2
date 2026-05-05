"""
Backend API tests — pytest
Run: cd tests && pytest test_api.py -v
"""
import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
import app as flask_app


@pytest.fixture
def client():
    flask_app.app.config['TESTING'] = True
    with flask_app.app.test_client() as client:
        yield client


# ---------------------------------------------------------------------------
# /health
# ---------------------------------------------------------------------------

def test_health_returns_ok(client):
    res = client.get('/health')
    assert res.status_code == 200
    data = res.get_json()
    assert data['status'] == 'ok'

def test_health_has_mode_field(client):
    res = client.get('/health')
    data = res.get_json()
    assert 'mode' in data
    assert data['mode'] in ('colab', 'replicate', 'none')

def test_health_has_colab_connected_field(client):
    res = client.get('/health')
    data = res.get_json()
    assert 'colab_connected' in data


# ---------------------------------------------------------------------------
# /upload
# ---------------------------------------------------------------------------

def test_upload_no_file_returns_400(client):
    res = client.post('/upload', data={})
    assert res.status_code == 400
    data = res.get_json()
    assert 'error' in data

def test_upload_wrong_field_name_returns_400(client):
    res = client.post('/upload', data={'photo': b'fake'})
    assert res.status_code == 400


# ---------------------------------------------------------------------------
# /generate
# ---------------------------------------------------------------------------

def test_generate_missing_style_returns_400(client):
    res = client.post('/generate',
                      json={},
                      content_type='application/json')
    assert res.status_code in (400, 503)

def test_generate_no_backend_returns_503(client):
    flask_app.COLAB_URL = None
    flask_app.REPLICATE_API_TOKEN = None
    res = client.post('/generate',
                      json={'style': 'minimalist', 'palette': None, 'customPrompt': None},
                      content_type='application/json')
    assert res.status_code == 503


# ---------------------------------------------------------------------------
# /detect-objects
# ---------------------------------------------------------------------------

def test_detect_objects_no_colab_returns_fallback(client):
    flask_app.COLAB_URL = None
    res = client.post('/detect-objects',
                      json={},
                      content_type='application/json')
    data = res.get_json()
    assert 'objects' in data
    assert isinstance(data['objects'], list)
    assert len(data['objects']) > 0


# ---------------------------------------------------------------------------
# /set-colab-url
# ---------------------------------------------------------------------------

def test_set_colab_url_missing_url_returns_400(client):
    res = client.post('/set-colab-url',
                      json={},
                      content_type='application/json')
    assert res.status_code == 400

def test_set_colab_url_valid_url_registered(client):
    res = client.post('/set-colab-url',
                      json={'url': 'https://test-1234.ngrok-free.app'},
                      content_type='application/json')
    assert res.status_code == 200
    data = res.get_json()
    assert data['url'] == 'https://test-1234.ngrok-free.app'
