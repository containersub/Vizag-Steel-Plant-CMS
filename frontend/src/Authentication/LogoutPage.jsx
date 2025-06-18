import React, { useState } from "react";
import "./LogoutPage.css";
const MessageBox = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500";
  const textColor = "text-white";
  const borderColor =
    type === "success"
      ? "border-green-700"
      : type === "error"
      ? "border-red-700"
      : "border-blue-700";

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`p-6 rounded-lg shadow-xl ${bgColor} ${textColor} border-t-4 ${borderColor} max-w-sm mx-auto`}
      >
        <p className="text-lg font-semibold mb-4">{message}</p>
        <button
          onClick={onClose}
          className="w-full py-2 px-4 bg-white text-gray-800 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          OK
        </button>
      </div>
    </div>
  );
};

// Logout Confirmation Modal Component
const LogoutModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="logout-modal-overlay">
      <div className="logout-modal-content">
        <h2 className="logout-modal-title">Confirm Logout</h2>
        <p className="logout-modal-message">
          Are you sure you want to log out?
        </p>
        <div className="logout-modal-actions">
          <button onClick={onConfirm} className="logout-btn confirm-btn">
            Yes, Logout
          </button>
          <button onClick={onCancel} className="logout-btn cancel-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

function LogoutPage() {
  const [showLogoutModal, setShowLogoutModal] = useState(true); // Show modal immediately on page load
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
  };

  const closeMessage = () => {
    setMessage("");
    setMessageType("");
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    showMessage("Logging out...", "info");
    // Simulate logout process
    setTimeout(() => {
      // In a real application, you would clear user session/token here
      // and then redirect to the login page.
      window.location.href = "/sign-in"; // Redirect to login page
    }, 1000);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
    // Redirect back to the previous page or home page if logout is cancelled
    window.history.back(); // Go back to the previous page
    // Alternatively, you could redirect to a specific page:
    // window.location.href = "/"; // Redirect to home page
  };

  return (
    <div className="logout-page-container">
      {showLogoutModal && (
        <LogoutModal onConfirm={confirmLogout} onCancel={cancelLogout} />
      )}
      <MessageBox message={message} type={messageType} onClose={closeMessage} />
    </div>
  );
}

export default LogoutPage;
