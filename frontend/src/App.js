import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import Upload from "./components/Upload";
import StyleSelector from "./components/StyleSelector";
import ResultView from "./components/ResultView";
import ObjectEditor from "./components/ObjectEditor";
import Auth from "./components/Auth";
import "./App.css";

const STEPS = ["upload", "style", "result", "edit"];

export default function App() {
  const [step, setStep] = useState("upload");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [editedImage, setEditedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthChecked(true);
    });
    return unsub;
  }, []);

  if (!authChecked) return null;
  if (!user) return <Auth onLogin={setUser} />;

  const handleUpload = (imageData) => {
    setUploadedImage(imageData);
    setStep("style");
  };

  const handleGenerate = async (style) => {
    setSelectedStyle(style);
    setLoading(true);
    setLoadingMsg("Analyzing room structure...");
    try {
      setLoadingMsg("Generating " + style + " style...");
      const res = await fetch("http://localhost:5000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ style }),
      });
      const data = await res.json();
      if (data.image) {
        setGeneratedImage("data:image/jpeg;base64," + data.image);
        setLoadingMsg("Detecting objects...");
        const detectRes = await fetch("http://localhost:5000/detect-objects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const detectData = await detectRes.json();
        setDetectedObjects(detectData.objects || []);
        setStep("result");
      }
    } catch (err) {
      alert("Generation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

 const handleEdit = async (object, prompt) => {
  setLoading(true);
  setLoadingMsg(`Replacing ${object}...`);
  try {
    const res = await fetch("http://localhost:5000/edit-object", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ object, prompt }),
    });
    const data = await res.json();
    if (data.image) {
      setEditedImage("data:image/jpeg;base64," + data.image);
      setStep("edit");
      // Do NOT reset step or clear objects
      // User can keep editing
    }
  } catch (err) {
    alert("Edit failed: " + err.message);
  } finally {
    setLoading(false);
  }
};

  const handleReset = () => {
    setStep("upload");
    setUploadedImage(null);
    setSelectedStyle(null);
    setGeneratedImage(null);
    setDetectedObjects([]);
    setEditedImage(null);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo" onClick={handleReset}>
            <span className="logo-icon">◈</span>
            <span className="logo-text">Interior<em>AI</em></span>
          </div>
          <div className="step-indicators">
            {["Upload", "Style", "Result", "Edit"].map((s, i) => (
              <div
                key={s}
                className={`step-dot ${STEPS[i] === step ? "active" : ""} ${
                  STEPS.indexOf(step) > i ? "done" : ""
                }`}
              >
                <span className="step-num">{i + 1}</span>
                <span className="step-label">{s}</span>
              </div>
            ))}
          </div>
          <div className="user-info">
            {user.photoURL && (
              <img src={user.photoURL} alt="Profile" className="user-avatar" />
            )}
            <span className="user-name">{user.displayName || user.email}</span>
            <button className="logout-btn" onClick={() => signOut(auth)}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {loading && (
          <motion.div
            className="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="loading-content">
              <div className="loading-spinner" />
              <p className="loading-msg">{loadingMsg}</p>
              <p className="loading-sub">Powered by Stable Diffusion + ControlNet</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="main">
        <AnimatePresence mode="wait">
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              <div className="page-header">
                <h1>Transform Your Space</h1>
                <p>Upload a room photo and watch AI reimagine it in any design style</p>
              </div>
              <Upload onUpload={handleUpload} />
            </motion.div>
          )}

          {step === "style" && (
            <motion.div
              key="style"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              <div className="page-header">
                <h1>Choose Your Style</h1>
                <p>Select a design aesthetic to transform your room</p>
              </div>
              <StyleSelector
                uploadedImage={uploadedImage}
                onGenerate={handleGenerate}
              />
            </motion.div>
          )}

          {(step === "result" || step === "edit") && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              <div className="page-header">
                <h1>Your Transformed Room</h1>
                <p>
                  {step === "edit"
                    ? "Object replaced with precision using AI inpainting"
                    : `${selectedStyle} style applied — drag slider to compare`}
                </p>
              </div>
              <ResultView
                original={uploadedImage}
                generated={step === "edit" ? editedImage : generatedImage}
                style={selectedStyle}
                objects={detectedObjects}
                onEdit={handleEdit}
                onReset={handleReset}
                onNewStyle={() => setStep("style")}
              />
              {(step === "result" || step === "edit") && detectedObjects.length > 0 && (
  <ObjectEditor
    objects={detectedObjects}
    onEdit={handleEdit}
    editedImage={editedImage}
  />
)}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}