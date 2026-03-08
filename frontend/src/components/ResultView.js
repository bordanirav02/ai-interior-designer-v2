import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { motion } from "framer-motion";
import "./ResultView.css";

export default function ResultView({ original, generated, style, onReset, onNewStyle }) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = generated;
    link.download = `interior-ai-${style}.jpg`;
    link.click();
  };

  return (
    <motion.div
      className="result-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Comparison Slider */}
      <div className="comparison-wrapper">
        <ReactCompareSlider
          itemOne={<ReactCompareSliderImage src={original} alt="Original room" />}
          itemTwo={<ReactCompareSliderImage src={generated} alt="Generated room" />}
          style={{ borderRadius: "12px", overflow: "hidden" }}
        />
        <div className="slider-labels">
          <span>Original</span>
          <span>AI Generated</span>
        </div>
      </div>

      {/* Actions */}
      <div className="result-actions">
        <button className="action-btn primary" onClick={handleDownload}>
          ↓ Download Result
        </button>
        <button className="action-btn secondary" onClick={onNewStyle}>
          ↺ Try Another Style
        </button>
        <button className="action-btn ghost" onClick={onReset}>
          + New Photo
        </button>
      </div>

      <p className="result-hint">
        ◈ Scroll down to edit individual objects in this room
      </p>
    </motion.div>
  );
}
