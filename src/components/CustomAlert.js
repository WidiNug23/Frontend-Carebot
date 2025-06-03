import React, { useEffect } from "react";
import "./CustomAlert.css";

const CustomAlert = ({ show, message, onClose, onConfirm, type }) => {
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (show && event.key === "Enter") {
        if (onConfirm) onConfirm(); // Panggil fungsi jika ada
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [show, onClose, onConfirm]);

  if (!show) return null;

  return (
    <div className="alert-overlay">
      <div className="alert-box">
        <p className="alert-message">{message}</p>
        <div className="alert-actions">
          {type === "confirm" ? (
            <>
              <button className="alert-button alert-cancel" onClick={onClose}>
                Batal
              </button>
              <button className="alert-button alert-confirm" onClick={() => { onConfirm(); onClose(); }}>
                OK
              </button>
            </>
          ) : (
            <button className="alert-button alert-confirm" onClick={() => { onConfirm && onConfirm(); onClose(); }}>
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;
