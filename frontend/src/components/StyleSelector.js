import { useState } from "react";
import { motion } from "framer-motion";
import "./StyleSelector.css";

const STYLES = [
  { id: "minimalist", name: "Minimalist", desc: "Clean lines, white space, serene", emoji: "◻", color: "#e8e6df" },
  { id: "industrial", name: "Industrial", desc: "Raw concrete, metal, exposed brick", emoji: "⬡", color: "#8a7a6a" },
  { id: "cyberpunk", name: "Cyberpunk", desc: "Neon lights, RGB, sci-fi future", emoji: "◈", color: "#4fc3f7" },
  { id: "modern_luxury", name: "Modern Luxury", desc: "Marble, gold accents, velvet", emoji: "◇", color: "#c9a84c" },
  { id: "scandinavian", name: "Scandinavian", desc: "Hygge warmth, natural wood, cozy", emoji: "❋", color: "#a8b89a" },
  { id: "midcentury_modern", name: "Mid-Century", desc: "Retro 1960s, teak, geometric", emoji: "◑", color: "#c4774a" },
  { id: "japanese_zen", name: "Japanese Zen", desc: "Wabi-sabi, tatami, bamboo peace", emoji: "⬤", color: "#8aa88e" },
  { id: "bohemian", name: "Bohemian", desc: "Colorful textiles, eclectic, vibrant", emoji: "✦", color: "#c47aad" },
];

export default function StyleSelector({ uploadedImage, onGenerate }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="style-container">
      {uploadedImage && (
        <div className="style-preview-strip">
          <img src={uploadedImage} alt="Your room" />
          <div className="strip-label">Your room</div>
        </div>
      )}

      <div className="styles-grid">
        {STYLES.map((style, i) => (
          <motion.div
            key={style.id}
            className={`style-card ${selected === style.id ? "selected" : ""}`}
            onClick={() => setSelected(style.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            whileHover={{ y: -4 }}
          >
            <div className="style-icon" style={{ color: style.color }}>{style.emoji}</div>
            <div className="style-info">
              <h3>{style.name}</h3>
              <p>{style.desc}</p>
            </div>
            {selected === style.id && (
              <motion.div
                className="style-check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >✓</motion.div>
            )}
            <div className="style-glow" style={{ background: style.color }} />
          </motion.div>
        ))}
      </div>

      <motion.div
        className="generate-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: selected ? 1 : 0.4 }}
      >
        <button
          className="generate-btn"
          disabled={!selected}
          onClick={() => selected && onGenerate(selected)}
        >
          <span>Generate Design</span>
          <span className="btn-arrow">→</span>
        </button>
        {selected && (
          <p className="generate-hint">
            Applying <strong>{STYLES.find(s => s.id === selected)?.name}</strong> style to your room
          </p>
        )}
      </motion.div>
    </div>
  );
}
