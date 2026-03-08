import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import "./Upload.css";

export default function Upload({ onUpload }) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const processFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      await axios.post("http://localhost:5000/upload", formData);
      const dataURL = await new Promise((res) => {
        const r = new FileReader();
        r.onload = (e) => res(e.target.result);
        r.readAsDataURL(file);
      });
      onUpload(dataURL);
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  }, [processFile]);

  return (
    <div className="upload-container">
      <motion.div
        className={`upload-zone ${dragging ? "dragging" : ""} ${preview ? "has-preview" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !preview && fileRef.current.click()}
        whileHover={!preview ? { scale: 1.01 } : {}}
        transition={{ duration: 0.2 }}
      >
        {!preview ? (
          <div className="upload-idle">
            <div className="upload-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <h2>Drop your room photo here</h2>
            <p>or click to browse — JPG, PNG, WEBP supported</p>
            <div className="upload-hint">
              <span>◈</span> Works best with clear, well-lit interior photos
            </div>
          </div>
        ) : (
          <div className="upload-preview">
            <img src={preview} alt="Room preview" />
            <div className="preview-overlay">
              <button className="change-btn" onClick={(e) => { e.stopPropagation(); fileRef.current.click(); }}>
                Change Photo
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => processFile(e.target.files[0])}
      />

      {preview && (
        <motion.div
          className="upload-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="ready-text">✓ Photo ready — click continue to choose a style</p>
        </motion.div>
      )}

      {/* Tips */}
      <div className="upload-tips">
        {["Living Rooms", "Bedrooms", "Kitchens", "Home Offices", "Dining Rooms"].map((tip) => (
          <span key={tip} className="tip-tag">{tip}</span>
        ))}
      </div>
    </div>
  );
}
