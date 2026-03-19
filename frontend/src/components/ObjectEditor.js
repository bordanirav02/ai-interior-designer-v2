import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./ObjectEditor.css";

export default function ObjectEditor({ objects, onEdit, editedImage }) {
  const [selectedObject, setSelectedObject] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [editHistory, setEditHistory] = useState([]);

  const suggestions = {
    chair: ["modern white accent chair with gold legs", "vintage leather armchair in cognac", "minimalist wooden chair in natural oak"],
    sofa: ["luxury velvet sofa in deep emerald green", "white modern sectional with chrome legs", "mid-century teak sofa with mustard cushions"],
    bed: ["platform bed with gold brass frame and white linen", "rustic reclaimed wood bed frame", "modern upholstered bed in charcoal grey velvet"],
    table: ["Calacatta marble dining table with gold base", "smoked glass coffee table with chrome frame", "rustic solid oak farmhouse dining table"],
    "potted plant": ["tall fiddle leaf fig tree in white pot", "hanging golden pothos in woven basket", "large monstera deliciosa in terracotta pot"],
    lamp: ["modern arc floor lamp in brushed gold", "industrial cage pendant lamp in matte black", "sculptural ceramic table lamp in cream"],
    couch: ["luxury boucle sectional in cream white", "deep blue velvet chesterfield sofa", "minimalist low profile sofa in light grey"],
  };

  const getSuggestions = () => suggestions[selectedObject] || [];

  const handleSubmit = async () => {
    if (!selectedObject || !prompt.trim()) return;
    setLoading(true);
    try {
      await onEdit(selectedObject, prompt);
      setEditHistory(prev => [...prev, { object: selectedObject, prompt }]);
      setPrompt("");
      setSelectedObject(null);
    } finally {
      setLoading(false);
    }
  };

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
            <p>Select an object and describe what you want — you can edit multiple times</p>
          </div>
        </div>
      </div>

      {/* Edit History */}
      {editHistory.length > 0 && (
        <div className="edit-history">
          <p className="objects-label">Edit History:</p>
          <div className="history-list">
            {editHistory.map((item, i) => (
              <div key={i} className="history-item">
                <span className="history-num">{i + 1}</span>
                <span className="history-text">
                  Changed <strong>{item.object}</strong> — {item.prompt}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detected Objects */}
      <div className="objects-section">
        <p className="objects-label">
          {editHistory.length > 0 ? "Edit another object:" : "Detected in your room:"}
        </p>
        <div className="objects-list">
          {objects.map((obj) => (
            <motion.button
              key={obj}
              className={`object-chip ${selectedObject === obj ? "selected" : ""}`}
              onClick={() => { setSelectedObject(obj); setPrompt(""); }}
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
                placeholder={`e.g. luxury velvet ${selectedObject} in deep blue...`}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <button
                className="edit-submit-btn"
                disabled={!prompt.trim() || loading}
                onClick={handleSubmit}
              >
                {loading ? "Generating..." : "Apply →"}
              </button>
            </div>

            <p className="edit-note">
              ◈ Only the {selectedObject} will change — everything else stays identical.
              After this edit you can continue editing other objects.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}