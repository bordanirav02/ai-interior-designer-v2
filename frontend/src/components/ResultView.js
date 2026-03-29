import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import "./ResultView.css";
import StyleComparison from "./StyleComparison";


export default function ResultView({ original, generated, style, onReset, onNewStyle, onUndo, canUndo }) {
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const zoomCanvasRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") handleZoomClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const canvas = zoomCanvasRef.current;
    if (!canvas || !zoomOpen) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoomScale(prev => Math.min(Math.max(prev * delta, 1), 5));
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [zoomOpen]);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoomScale(prev => Math.min(Math.max(prev * delta, 1), 5));
  };

  const handleMouseDown = (e) => {
    if (zoomScale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - zoomPos.x, y: e.clientY - zoomPos.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setZoomPos({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleZoomClose = () => {
    setZoomOpen(false);
    setZoomScale(1);
    setZoomPos({ x: 0, y: 0 });
  };

  const handleDownload = () => {
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Add watermark bar at bottom
      const barHeight = 36;
      ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
      ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);

      // Style name text
      ctx.fillStyle = "rgba(201, 168, 76, 0.9)";
      ctx.font = "bold 13px sans-serif";
      ctx.letterSpacing = "2px";
      const styleName = style.replace(/_/g, " ").toUpperCase();
      ctx.fillText(`InteriorAI — ${styleName}`, 14, canvas.height - 12);

      // Date text on right
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = "11px sans-serif";
      const date = new Date().toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric"
      });
      const dateWidth = ctx.measureText(date).width;
      ctx.fillText(date, canvas.width - dateWidth - 14, canvas.height - 12);

      // Download
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/jpeg", 0.95);
      link.download = `InteriorAI-${style}-${Date.now()}.jpg`;
      link.click();
    };
    img.src = generated;
  };

  const handleCopyImage = async () => {
    try {
      const res = await fetch(generated);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback — copy text description
      const text = `Check out my AI-transformed room using InteriorAI!\nStyle: ${style.replace(/_/g, " ")}\nPowered by Stable Diffusion + ControlNet`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareText = async () => {
    const text = `I just transformed my room with AI! Style: ${style.replace(/_/g, " ").toUpperCase()} — Generated using InteriorAI powered by Stable Diffusion + ControlNet`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="result-container">

      {/* Compare Slider */}
      <motion.div
        className="result-slider-wrap"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <ReactCompareSlider
          itemOne={
            <ReactCompareSliderImage
              src={original}
              alt="Original"
              style={{ objectFit: "cover" }}
            />
          }
          itemTwo={
            <ReactCompareSliderImage
              src={generated}
              alt="Generated"
              style={{ objectFit: "cover" }}
            />
          }
          style={{
            width: "100%",
            height: "480px",
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid var(--border)"
          }}
        />
        <div className="result-labels">
          <span className="result-label">Original</span>
          <span className="result-label">AI Generated</span>
        </div>

        {/* Separate zoom button */}
        <button
          className="zoom-trigger-btn"
          onClick={() => setZoomOpen(true)}
          title="Click to zoom"
        >
          ⤢ Zoom
        </button>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className="result-actions"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button className="result-btn primary" onClick={handleDownload}>
          ↓ Download Result
        </button>
        <button className="result-btn secondary" onClick={onNewStyle}>
          ↺ Try Another Style
        </button>
        <button className="result-btn secondary" onClick={onReset}>
          + New Photo
        </button>
        <button
          className="result-btn secondary"
          onClick={() => setShowShare(!showShare)}
        >
          ↗ Share
        </button>
      </motion.div>

      <p className="result-scroll-hint">
        ✦ Scroll down to edit individual objects in this room
      </p>

      <StyleComparison
        original={original}
        currentImage={generated}
        currentStyle={style}
      />

      <motion.div
        className="result-actions"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button className="result-btn primary" onClick={handleDownload}>
          ↓ Download Result
        </button>
        <button className="result-btn secondary" onClick={onNewStyle}>
          ↺ Try Another Style
        </button>
        {canUndo && (
          <motion.button
            className="result-btn undo"
            onClick={onUndo}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            ⟵ Undo Last Edit
          </motion.button>
        )}
        <button className="result-btn secondary" onClick={onReset}>
          + New Photo
        </button>
      </motion.div>

      <AnimatePresence>
  {showShare && (
    <motion.div
      className="share-panel"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <p className="share-title">Share your design</p>
      <div className="share-options">
        <button className="share-option-btn" onClick={handleCopyImage}>
          <span className="share-option-icon">⎘</span>
          <div>
            <span className="share-option-name">
              {copied ? "Copied!" : "Copy Image"}
            </span>
            <span className="share-option-desc">Copy to clipboard</span>
          </div>
        </button>
        <button className="share-option-btn" onClick={handleShareText}>
          <span className="share-option-icon">✍</span>
          <div>
            <span className="share-option-name">Copy Caption</span>
            <span className="share-option-desc">Ready to paste anywhere</span>
          </div>
        </button>
        <button className="share-option-btn" onClick={handleDownload}>
          <span className="share-option-icon">↓</span>
          <div>
            <span className="share-option-name">Save Image</span>
            <span className="share-option-desc">Download to device</span>
          </div>
        </button>
      </div>
    </motion.div>
  )}
</AnimatePresence>

      {/* Zoom Modal */}
      <AnimatePresence>
        {zoomOpen && (
          <motion.div
            className="zoom-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleZoomClose}
          >
            <motion.div
              className="zoom-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="zoom-toolbar">
                <span className="zoom-title">
                  {style} — Full Resolution
                </span>
                <div className="zoom-controls">
                  <button
                    className="zoom-ctrl-btn"
                    onClick={() => setZoomScale(s => Math.min(s * 1.2, 5))}
                  >+</button>
                  <span className="zoom-level">
                    {Math.round(zoomScale * 100)}%
                  </span>
                  <button
                    className="zoom-ctrl-btn"
                    onClick={() => setZoomScale(s => Math.max(s * 0.8, 1))}
                  >−</button>
                  <button
                    className="zoom-ctrl-btn"
                    onClick={() => { setZoomScale(1); setZoomPos({ x: 0, y: 0 }); }}
                  >↺</button>
                  <button
                    className="zoom-close-btn"
                    onClick={handleZoomClose}
                  >✕</button>
                </div>
              </div>
              <div
                ref={zoomCanvasRef}
                className="zoom-canvas"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ cursor: zoomScale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in" }}
              >
                <motion.img
                  ref={imgRef}
                  src={generated}
                  alt="Zoomed"
                  className="zoom-img"
                  animate={{
                    scale: zoomScale,
                    x: zoomPos.x,
                    y: zoomPos.y
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  draggable={false}
                />
              </div>

              <div className="zoom-footer">
                <span>Scroll to zoom • Drag to pan • ESC to close</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}