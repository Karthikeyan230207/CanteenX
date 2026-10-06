function SuccessPopup({ message, onClose }) {
  return (
    <div className="success-popup">
      <div className="success-popup-icon">
        ✓
      </div>

      <div className="success-popup-content">
        <strong>Success</strong>
        <p>{message}</p>
      </div>

      <button
        className="success-popup-close"
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
}

export default SuccessPopup;