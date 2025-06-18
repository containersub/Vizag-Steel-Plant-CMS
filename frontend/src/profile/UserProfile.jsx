import { useState } from "react";
import "./UserProfile.css";
import {
  User,
  Mail,
  Phone,
  Building,
  Key,
  Save,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../AuthContext";
import Layout from "../Layout";

// Custom Message Box Component (reused for consistent feedback)
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

function UserProfilePage() {
 
  // Mock User Data (replace with actual user data from your backend)
  const [userData, setUserData] = useState({
    name:"Admin" ,
    role: "ETL" ,
    department: "ETL",
    email: "@gmail.com",
    phone: "08y6678877",
  });

  // State for form fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [contactEmail, setContactEmail] = useState(userData.email);
  const [contactPhone, setContactPhone] = useState(userData.phone);

  // State for messages
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

  // Handle form submission
  const handleSave = (e) => {
    e.preventDefault();

    // --- Password Update Validation ---
    if (currentPassword || newPassword || confirmNewPassword) {
      if (!currentPassword) {
        showMessage(
          "Current password is required to change password.",
          "error"
        );
        return;
      }
      if (newPassword.length < 6) {
        showMessage(
          "New password must be at least 6 characters long.",
          "error"
        );
        return;
      }
      if (newPassword !== confirmNewPassword) {
        showMessage("New password and confirm password do not match.", "error");
        return;
      }
      // Simulate password update API call
      console.log("Updating password...");
      showMessage("Password updated successfully!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }

    // --- Contact Info Update Validation ---
    if (contactEmail !== userData.email || contactPhone !== userData.phone) {
      if (!contactEmail || !contactPhone) {
        showMessage("Email and Phone cannot be empty.", "error");
        return;
      }
      // Basic email validation
      if (!/\S+@\S+\.\S+/.test(contactEmail)) {
        showMessage("Please enter a valid email address.", "error");
        return;
      }
      // Simulate contact info update API call
      console.log("Updating contact info...");
      setUserData((prev) => ({
        ...prev,
        email: contactEmail,
        phone: contactPhone,
      }));
      showMessage("Contact information updated successfully!", "success");
    }

    if (
      !currentPassword &&
      !newPassword &&
      !confirmNewPassword &&
      contactEmail === userData.email &&
      contactPhone === userData.phone
    ) {
      showMessage("No changes to save.", "info");
    }
  };
  let{user}=useAuth();
  return (
    <Layout>
      <div className="user-profile-page-container">
      {/* Embedded CSS for UserProfilePage */}

      <h1 className="profile-section-title">User Profile</h1>

      {/* User Info Card */}
      <div className="user-info-card">
        <div className="user-avatar">
          {user?.name ? user?.name.charAt(0).toUpperCase() : "?"}
        </div>
        <h2>{user?.name}</h2>
        <p>
          <User size={20} /> {user?.role}
        </p>
        <p>
          <Building size={20} /> {user?.department}
        </p>
        <p>
          <Mail size={20} /> {user?.email}
        </p>
        <p>
          <Phone size={20} /> {user?.phone}
        </p>
      </div>

      {/* Update Form Section */}
      <div className="update-form-section">
        <h2>Update Profile Information</h2>
        <form onSubmit={handleSave}>
          {/* Password Update */}
          <h3>
            <Key size={20} /> Change Password
          </h3>
          <div className="form-group">
            <label htmlFor="current-password">Current Password:</label>
            <input
              type="password"
              id="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="new-password">New Password:</label>
            <input
              type="password"
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-new-password">Confirm New Password:</label>
            <input
              type="password"
              id="confirm-new-password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>

          {/* Contact Info Update */}
          <h3 style={{ marginTop: "30px" }}>
            <Mail size={20} /> Update Contact Info
          </h3>
          <div className="form-group">
            <label htmlFor="contact-email">Email:</label>
            <input
              type="email"
              id="contact-email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="Enter new email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="contact-phone">Phone:</label>
            <input
              type="tel"
              id="contact-phone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="Enter new phone number"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="save-btn">
              <Save size={20} /> Save Changes
            </button>
          </div>
        </form>
      </div>

      <MessageBox message={message} type={messageType} onClose={closeMessage} />
    </div>
    </Layout>
  );
}

export default UserProfilePage;
