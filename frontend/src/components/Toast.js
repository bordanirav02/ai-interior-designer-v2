import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Toast.css";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const toast = useCallback((message, type = "info", duration = 4000) => {
    const id = ++idRef.current;
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toaster">
        <AnimatePresence>
          {toasts.map(t => (
            <ToastItem key={t.id} {...t} onDismiss={() => dismiss(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

function ToastItem({ message, type, duration, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const icons = { success: "✓", error: "✕", info: "◈", warning: "⚠" };

  return (
    <motion.div
      className={`toast toast-${type}`}
      initial={{ x: 340, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 340, opacity: 0 }}
      transition={{ type: "spring", damping: 22, stiffness: 220 }}
      layout
    >
      <span className={`toast-icon toast-icon-${type}`}>{icons[type]}</span>
      <span className="toast-msg">{message}</span>
      <button className="toast-close" onClick={onDismiss}>✕</button>
      <motion.div
        className="toast-progress"
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: duration / 1000, ease: "linear" }}
      />
    </motion.div>
  );
}
