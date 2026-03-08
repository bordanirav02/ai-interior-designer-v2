import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./ObjectEditor.css";

export default function ObjectEditor({ objects, onEdit }) {
  const [selectedObject, setSelectedObject] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!selectedObject || !prompt.trim()) return;
    setSubmitted(true);
    onEdit(selectedObject, prompt);
  };

  const suggestions = {
    chair: ["modern white accent chair", "vintage leather armchair", "minimalist wooden chair"],
    sofa: ["luxury velvet sofa in deep blue", "white modern sectional", "mid-century teak sofa"],
    bed: ["platform bed with gold frame", "rustic wooden bed frame", "modern upholstered bed"],
    table: ["marble dining table", "glass coffee table", "rustic wood farmhouse table"],
    "potted plant": ["tall fiddle leaf fig", "hanging macrame plant", "bamboo in ceramic pot"],
  };

  const getSuggestions = () => suggestions[selectedObject] || [];

  return (
    <motion.div
      className="editor-container"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <div className="editor-header">
        <div className="editor-title">
          <span className="editor-icon">✦</span>
          <div>
            <h2>Edit Individual Objects</h2>
            <p>Select an object and describe what you want to replace it with</p>
          </div>
        </div>
      </div>

      {/* Detected Objects */}
      <div className="objects-section">
        <p className="objects-label">Detected in your room:</p>
        <div className="objects-list">
          {objects.map((obj) => (
            <motion.button
              key={obj}
              className={`object-chip ${selectedObject === obj ? "selected" : ""}`}
              onClick={() => { setSelectedObject(obj); setPrompt(""); setSubmitted(false); }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              {obj}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Edit Input */}
      <AnimatePresence>
        {selectedObject && (
          <motion.div
            className="edit-input-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="edit-label">
              Describe the new <strong>{selectedObject}</strong> you want:
            </p>

            {/* Suggestions */}
            {getSuggestions().length > 0 && (
              <div className="suggestions">
                {getSuggestions().map((s) => (
                  <button
                    key={s}
                    className="suggestion-chip"
                    onClick={() => setPrompt(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="edit-input-row">
              <input
                type="text"
                className="edit-input"
                placeholder={`e.g. modern gold ${selectedObject} with velvet finish...`}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <button
                className="edit-submit-btn"
                disabled={!prompt.trim() || submitted}
                onClick={handleSubmit}
              >
                {submitted ? "Generating..." : "Apply →"}
              </button>
            </div>

            <p className="edit-note">
              ◈ Everything else in the room will remain identical — only the {selectedObject} changes
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
