import os
import base64
import io
import threading
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Allow requests from Vercel frontend and localhost dev
ALLOWED_ORIGINS = [o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "").split(",") if o.strip()]
ALLOWED_ORIGINS += ["http://localhost:3000", "http://127.0.0.1:3000"]
CORS(app, origins=ALLOWED_ORIGINS)

UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "outputs"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Runtime state — Colab URL registered via /set-colab-url
COLAB_URL = {"url": None}

COLAB_HEADERS = {
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json",
}

# Style prompts used when generating via Replicate (no Colab)
STYLE_PROMPTS = {
    "minimalist": "minimalist interior design, clean lines, white walls, sparse furniture, natural light, serene atmosphere",
    "industrial": "industrial interior design, exposed brick walls, concrete floors, metal fixtures, Edison bulbs, raw textures",
    "cyberpunk": "cyberpunk interior design, neon RGB lighting, holographic screens, futuristic tech, dark moody room, sci-fi aesthetic",
    "modern_luxury": "modern luxury interior design, marble surfaces, gold accents, velvet furniture, chandelier, upscale finishes",
    "scandinavian": "Scandinavian interior design, hygge aesthetic, natural wood, warm whites, cozy textiles, indoor plants, minimal clutter",
    "midcentury_modern": "mid-century modern interior design, 1960s retro aesthetic, teak wood furniture, geometric patterns, warm earth tones",
    "japanese_zen": "Japanese zen interior design, wabi-sabi aesthetic, tatami mats, bamboo elements, paper screens, minimalist peaceful space",
    "bohemian": "bohemian interior design, colorful layered textiles, eclectic furniture mix, macrame wall art, plants, warm artistic vibe",
}

REPLICATE_API_TOKEN = os.environ.get("REPLICATE_API_TOKEN", "")

# Replicate model — Stable Diffusion img2img (always available, reliable)
# User can override via env var to use a different model version
REPLICATE_IMG2IMG_MODEL = os.environ.get(
    "REPLICATE_IMG2IMG_MODEL",
    "stability-ai/stable-diffusion-img2img:15a3689ee13b0d2616e98820eca31d4af4a36b65a5a4aaf3ded1c69a29fb5e8",
)
REPLICATE_INPAINT_MODEL = os.environ.get(
    "REPLICATE_INPAINT_MODEL",
    "stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3",
)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def image_to_base64(image_path):
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def base64_to_image(b64_string, save_path):
    img_data = base64.b64decode(b64_string)
    img = Image.open(io.BytesIO(img_data))
    img.save(save_path)
    return save_path


def pil_to_base64(img: Image.Image) -> str:
    buf = io.BytesIO()
    img.convert("RGB").save(buf, format="JPEG", quality=90)
    return base64.b64encode(buf.getvalue()).decode()


def url_to_base64(url: str) -> str:
    """Download an image from a URL and return base64 string."""
    resp = requests.get(url, timeout=60)
    resp.raise_for_status()
    img = Image.open(io.BytesIO(resp.content)).convert("RGB")
    return pil_to_base64(img)


def build_prompt(style=None, palette=None, custom_prompt=None) -> str:
    if custom_prompt:
        return f"{custom_prompt}, photorealistic interior design, high quality, 8k, detailed"

    base = STYLE_PROMPTS.get(style, "modern interior design, stylish, high quality")
    prompt = f"{base}, photorealistic, 8k, highly detailed, interior photography"

    if palette and isinstance(palette, dict):
        colors = palette.get("colors", [])
        if colors:
            prompt += f", color palette featuring {', '.join(colors[:3])}"

    return prompt


# ─── Replicate Generation ─────────────────────────────────────────────────────

def replicate_generate(image_path, style=None, palette=None, custom_prompt=None) -> str:
    """Call Replicate img2img and return base64 JPEG."""
    import replicate as rep  # lazy import so app starts even without package

    prompt = build_prompt(style, palette, custom_prompt)
    negative = "blurry, bad quality, distorted, ugly, low resolution, watermark, text"

    with open(image_path, "rb") as f:
        output = rep.run(
            REPLICATE_IMG2IMG_MODEL,
            input={
                "image": f,
                "prompt": prompt,
                "negative_prompt": negative,
                "prompt_strength": 0.75,
                "num_inference_steps": 25,
                "guidance_scale": 7.5,
                "scheduler": "DPMSolverMultistep",
            },
        )

    # output is a list of image URLs
    if isinstance(output, list) and output:
        return url_to_base64(str(output[0]))

    raise RuntimeError("Replicate returned no output")


def replicate_inpaint(image_path, edit_prompt: str) -> str:
    """Run Replicate inpainting (whole-image prompt edit, no mask required)."""
    import replicate as rep

    # Fall back to img2img when no mask is available
    prompt = f"{edit_prompt}, photorealistic interior design, high quality, 8k"
    negative = "blurry, bad quality, distorted, ugly"

    with open(image_path, "rb") as f:
        output = rep.run(
            REPLICATE_IMG2IMG_MODEL,
            input={
                "image": f,
                "prompt": prompt,
                "negative_prompt": negative,
                "prompt_strength": 0.6,
                "num_inference_steps": 25,
                "guidance_scale": 8,
            },
        )

    if isinstance(output, list) and output:
        return url_to_base64(str(output[0]))

    raise RuntimeError("Replicate returned no output")


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    has_replicate = bool(REPLICATE_API_TOKEN)
    return jsonify({
        "status": "ok",
        "colab_connected": COLAB_URL["url"] is not None,
        "colab_url": COLAB_URL["url"],
        "replicate_enabled": has_replicate,
        "mode": "colab" if COLAB_URL["url"] else ("replicate" if has_replicate else "none"),
    })


@app.route("/set-colab-url", methods=["POST"])
def set_colab_url():
    data = request.json or {}
    url = data.get("url", "").strip()
    if not url:
        return jsonify({"error": "No URL provided"}), 400
    COLAB_URL["url"] = url.rstrip("/")
    print(f"✅ Colab URL set: {COLAB_URL['url']}")
    return jsonify({"message": "Colab URL registered", "url": COLAB_URL["url"]})


@app.route("/upload", methods=["POST"])
def upload():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400
    file = request.files["image"]
    if not file.filename:
        return jsonify({"error": "Empty filename"}), 400

    save_path = os.path.join(UPLOAD_FOLDER, "room_original.jpg")
    img = Image.open(file).convert("RGB")
    img = img.resize((512, 512))
    img.save(save_path)
    return jsonify({"message": "Image uploaded successfully", "path": save_path})


@app.route("/generate", methods=["POST"])
def generate():
    data = request.json or {}
    style = data.get("style")
    palette = data.get("palette")
    custom_prompt = data.get("customPrompt")

    if not style and not custom_prompt:
        return jsonify({"error": "style or customPrompt required"}), 400

    upload_path = os.path.join(UPLOAD_FOLDER, "room_original.jpg")
    if not os.path.exists(upload_path):
        return jsonify({"error": "No uploaded image found — upload first"}), 400

    # ── Mode 1: Colab ──────────────────────────────────────────────────────────
    if COLAB_URL["url"]:
        image_b64 = image_to_base64(upload_path)
        try:
            resp = requests.post(
                f"{COLAB_URL['url']}/colab-generate",
                json={"image": image_b64, "style": style, "palette": palette, "customPrompt": custom_prompt},
                headers=COLAB_HEADERS,
                timeout=120,
            )
            result = resp.json()
        except Exception as e:
            return jsonify({"error": f"Colab request failed: {e}"}), 500

        if "image" not in result:
            return jsonify({"error": "Colab did not return an image", "details": result}), 500

        base64_to_image(result["image"], os.path.join(OUTPUT_FOLDER, "room_styled.jpg"))
        return jsonify({"message": "Style transfer complete", "style": style, "image": result["image"]})

    # ── Mode 2: Replicate ──────────────────────────────────────────────────────
    if REPLICATE_API_TOKEN:
        os.environ["REPLICATE_API_TOKEN"] = REPLICATE_API_TOKEN
        try:
            image_b64 = replicate_generate(upload_path, style, palette, custom_prompt)
        except Exception as e:
            return jsonify({"error": f"Replicate generation failed: {e}"}), 500

        output_path = os.path.join(OUTPUT_FOLDER, "room_styled.jpg")
        base64_to_image(image_b64, output_path)
        return jsonify({"message": "Style transfer complete", "style": style, "image": image_b64})

    return jsonify({"error": "No AI backend connected. Start Colab or set REPLICATE_API_TOKEN."}), 503


@app.route("/detect-objects", methods=["POST"])
def detect_objects():
    # ── Mode 1: Colab ──────────────────────────────────────────────────────────
    if COLAB_URL["url"]:
        styled_path = os.path.join(OUTPUT_FOLDER, "room_styled.jpg")
        if not os.path.exists(styled_path):
            return jsonify({"error": "No styled image found"}), 400

        image_b64 = image_to_base64(styled_path)
        try:
            resp = requests.post(
                f"{COLAB_URL['url']}/colab-detect",
                json={"image": image_b64},
                headers=COLAB_HEADERS,
                timeout=60,
            )
            result = resp.json()
        except Exception as e:
            return jsonify({"error": f"Colab request failed: {e}"}), 500

        return jsonify({"message": "Detection complete", "objects": result.get("objects", [])})

    # ── Mode 2: Replicate / fallback ───────────────────────────────────────────
    # Return common room objects so the UI still works for object editing
    fallback_objects = ["sofa", "chair", "table", "lamp", "bed", "rug", "curtain", "plant"]
    return jsonify({
        "message": "Fallback objects (Colab not connected)",
        "objects": fallback_objects,
    })


@app.route("/edit-object", methods=["POST"])
def edit_object():
    data = request.json or {}
    object_label = data.get("object")
    edit_prompt = data.get("prompt")

    if not object_label or not edit_prompt:
        return jsonify({"error": "object and prompt required"}), 400

    # Choose base image (chain edits)
    edited_path = os.path.join(OUTPUT_FOLDER, "room_edited.jpg")
    styled_path = os.path.join(OUTPUT_FOLDER, "room_styled.jpg")
    base_path = edited_path if os.path.exists(edited_path) else styled_path

    if not os.path.exists(base_path):
        return jsonify({"error": "No styled image found — generate a style first"}), 400

    # ── Mode 1: Colab ──────────────────────────────────────────────────────────
    if COLAB_URL["url"]:
        image_b64 = image_to_base64(base_path)
        try:
            resp = requests.post(
                f"{COLAB_URL['url']}/colab-edit",
                json={"image": image_b64, "object": object_label, "prompt": edit_prompt},
                headers=COLAB_HEADERS,
                timeout=120,
            )
            result = resp.json()
        except Exception as e:
            return jsonify({"error": f"Colab request failed: {e}"}), 500

        if "image" not in result:
            return jsonify({"error": "Colab did not return an image", "details": result}), 500

        base64_to_image(result["image"], edited_path)
        return jsonify({"message": "Edit complete", "object": object_label, "image": result["image"]})

    # ── Mode 2: Replicate ──────────────────────────────────────────────────────
    if REPLICATE_API_TOKEN:
        os.environ["REPLICATE_API_TOKEN"] = REPLICATE_API_TOKEN
        full_prompt = f"Replace the {object_label} with {edit_prompt}"
        try:
            image_b64 = replicate_inpaint(base_path, full_prompt)
        except Exception as e:
            return jsonify({"error": f"Replicate edit failed: {e}"}), 500

        base64_to_image(image_b64, edited_path)
        return jsonify({"message": "Edit complete", "object": object_label, "image": image_b64})

    return jsonify({"error": "No AI backend connected. Start Colab or set REPLICATE_API_TOKEN."}), 503


@app.route("/preview-styles", methods=["POST"])
def preview_styles():
    upload_path = os.path.join(UPLOAD_FOLDER, "room_original.jpg")
    if not os.path.exists(upload_path):
        return jsonify({"error": "No uploaded image found — upload first"}), 400

    data = request.json or {}
    palette = data.get("palette")

    # ── Mode 1: Colab ──────────────────────────────────────────────────────────
    if COLAB_URL["url"]:
        image_b64 = image_to_base64(upload_path)
        try:
            resp = requests.post(
                f"{COLAB_URL['url']}/colab-preview",
                json={"image": image_b64, "palette": palette},
                headers=COLAB_HEADERS,
                timeout=300,
            )
            result = resp.json()
        except Exception as e:
            return jsonify({"error": f"Colab request failed: {e}"}), 500

        return jsonify({"message": "Previews generated", "previews": result.get("previews", {})})

    # ── Mode 2: Replicate — generate all 8 styles concurrently ────────────────
    if REPLICATE_API_TOKEN:
        os.environ["REPLICATE_API_TOKEN"] = REPLICATE_API_TOKEN
        previews = {}
        errors = {}

        def gen_style(style_id):
            try:
                previews[style_id] = replicate_generate(upload_path, style_id, palette)
            except Exception as e:
                errors[style_id] = str(e)
                print(f"Preview failed for {style_id}: {e}")

        threads = [threading.Thread(target=gen_style, args=(s,)) for s in STYLE_PROMPTS]
        for t in threads:
            t.start()
        for t in threads:
            t.join(timeout=120)

        if not previews:
            return jsonify({"error": "All Replicate preview generations failed", "details": errors}), 500

        return jsonify({"message": "Previews generated via Replicate", "previews": previews})

    return jsonify({"error": "No AI backend connected. Start Colab or set REPLICATE_API_TOKEN."}), 503


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    print("🚀 AI Interior Designer v2 — Flask API")
    print(f"📍 Running on port {port}")
    print(f"🤖 Replicate: {'enabled' if REPLICATE_API_TOKEN else 'disabled (set REPLICATE_API_TOKEN)'}")
    app.run(host="0.0.0.0", port=port, debug=debug)
