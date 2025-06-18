import Layout from "../Layout";
import './ServiceEngineerDashboard.css';
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../AuthContext";

const ServiceEngineerDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [showAllDepartments, setShowAllDepartments] = useState(false);
  const [currentUserDepartment, setCurrentUserDepartment] = useState(null);
  const [showDashboard, setShowDashboard] = useState(true);
  const [totalAssets, setTotalAssets] = useState(0);
  const [openComplaintsCount, setOpenComplaintsCount] = useState(0);
  const [pendingPMTasks, setPendingPMTasks] = useState(0);

  const { user } = useAuth();

  const getStatusIndicatorClass = (status) => {
    switch (status) {
      case "OPEN":
        return "status-open";
      case "IN_PROGRESS":
        return "status-in-progress";
      case "CLOSED":
        return "status-closed";
      case "REOPENED":
        return "status-reopened";
      default:
        return "";
    }
  };

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const decodedToken = jwtDecode(token);
      const userDepartment = decodedToken.department;

      let url = showAllDepartments
        ? `http://localhost:8080/ContractManagementSystem/complaints`
        : `http://localhost:8080/ContractManagementSystem/complaints/department/${encodeURIComponent(userDepartment)}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch complaints.");
      }

      const data = await response.json();
      setComplaints(data);
    } catch (err) {
      console.error("Error fetching complaints:", err.message || err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalAssets = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found.");
        return;
      }

      const response = await fetch(`http://localhost:8080/ContractManagementSystem/assets/total`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTotalAssets(data.total_assets);
      } else {
        const errorData = await response.json();
        console.error(`Failed to fetch total assets: ${errorData.message || 'Unknown error'}`);
        setError(errorData.message || "Failed to fetch total assets.");
      }
    } catch (err) {
      console.error("Error fetching total assets:", err.message || err);
      setError("An unexpected error occurred while fetching total assets.");
    }
  };

  const fetchOpenComplaintsCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found.");
        return;
      }

      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.role;

      if (!userRole) {
        console.error("User role not found in token.");
        return;
      }

      console.log("User Role:", userRole); // Debug log

      const url = `http://localhost:8080/ContractManagementSystem/complaints/open-count`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOpenComplaintsCount(data.count);
      } else {
        const errorData = await response.json();
        console.error(`Failed to fetch open complaints count: ${errorData.message || 'Unknown error'}`);
        setError(errorData.message || "Failed to fetch open complaints count.");
      }
    } catch (err) {
      console.error("Error fetching open complaints count:", err.message || err);
      setError("An unexpected error occurred while fetching open complaints count.");
    }
  };

  const fetchPendingPMTasksCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found.");
        return;
      }

      const response = await fetch(`http://localhost:8080/ContractManagementSystem/pm-tasks/pending-count`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPendingPMTasks(data.count);
      } else {
        const errorData = await response.json();
        console.error(`Failed to fetch pending PM tasks count: ${errorData.message || 'Unknown error'}`);
        setError(errorData.message || "Failed to fetch pending PM tasks count.");
      }
    } catch (err) {
      console.error("Error fetching pending PM tasks count:", err.message || err);
      setError("An unexpected error occurred while fetching pending PM tasks count.");
    }
  };

  const handleCloseComplaint = (complaintId) => {
    setSelectedComplaintId(complaintId);
    setShowFeedbackModal(true);
  };

  const submitFeedback = async () => {
    if (!feedbackText.trim()) {
      alert("Feedback cannot be empty.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const response = await fetch(
        `http://localhost:8080/ContractManagementSystem/complaints/${selectedComplaintId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "CLOSED",
            feedback: feedbackText,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to close complaint and provide feedback.");
      }

      alert("Complaint closed and feedback provided successfully!");
      setShowFeedbackModal(false);
      setFeedbackText("");
      setSelectedComplaintId(null);
      fetchComplaints();
      fetchOpenComplaintsCount();
    } catch (err) {
      console.error("Error closing complaint:", err.message || err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const recentActivities = [
    { id: 1, type: "Complaint", description: "Complaint #123 resolved", date: "2024-06-01" },
    { id: 2, type: "PM Task", description: "PM Task #456 completed", date: "2024-06-02" },
    { id: 3, type: "Asset", description: "New asset added: Laptop", date: "2024-06-03" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      setCurrentUserDepartment(decodedToken.department);
    }
    fetchComplaints();
    fetchTotalAssets();
    fetchOpenComplaintsCount();
    fetchPendingPMTasksCount();
  }, [showAllDepartments]);

  if (loading) {
    return (
      <Layout>
        <div className="dashboard-container">
          <p>Loading complaints...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="dashboard-container">
          <p className="error-message">{error}</p>
        </div>
      </Layout>
    );
  }

  const DashboardContent = () => (
    <div className="main-content-dashboard">
      <div className="welcome-section">
        <div className="welcome-text">
          <h1>Welcome, {user?.name}!</h1>
          <p>{user?.role}</p>
        </div>
        <div className="profile-circle">
          <div className="profile-icon">SE</div>
          <p>{user?.name}</p>
        </div>
      </div>

      <div className="summary-cards">
        <div className="card green">
          <h3>Total Assets</h3>
          <p className="card-value">{totalAssets}</p>
        </div>
        <div className="card orange">
          <h3>Open Complaints</h3>
          <p className="card-value">{openComplaintsCount}</p>
        </div>
        <div className="card blue">
          <h3>Pending PM Tasks</h3>
          <p className="card-value">{pendingPMTasks}</p>
        </div>
      </div>

      <div className="bottom-sections">
        <div className="quick-links-section">
          <h3>Quick Links</h3>
          <div className="quick-links-grid">
            <button className="quick-link-btn"><a href="/complaints">Create Complaint</a></button>
            <button className="quick-link-btn"><a href="/preventive-maintenance">Create PM Task</a></button>
            <button className="quick-link-btn"><a href="/view-complaints">View Complaints</a></button>
            <button className="quick-link-btn"><a href="/Assets-page">Manage Assets</a></button>
            <button className="quick-link-btn">View Reports</button>
          </div>
        </div>

        <div className="recent-activity-section">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {recentActivities.length === 0 ? (
              <p>No recent activity.</p>
            ) : (
              recentActivities.map(activity => (
                <div key={activity.id} className="activity-item">
                  <span className="activity-icon">
                    {activity.type === "Complaint" && "📋"}
                    {activity.type === "PM Task" && "🛠️"}
                    {activity.type === "Asset" && "📦"}
                  </span>
                  <p>{activity.description}</p>
                  <span className="activity-date">{activity.date}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="dashboard-container">
        <div className="dashboard-container-slider">
          <div className="slider-p">
            <p>SE</p>
            <h2>Service_Engineer</h2>
          </div>
          <div className="t-btn">
            <button
              onClick={() => {
                setShowDashboard(true);
                setShowAllDepartments(false);
                fetchOpenComplaintsCount();
              }}
              className={`${
                showDashboard
                  ? "bg-blue-600 text-white shadow-lg active-sidebar-btn"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => { setShowDashboard(false); setShowAllDepartments(false); fetchOpenComplaintsCount(); }}
              className={`${
                !showDashboard && !showAllDepartments
                  ? "bg-blue-600 text-white shadow-lg active-sidebar-btn"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              My Department Complaints
            </button>
            <button
              onClick={() => { setShowDashboard(false); setShowAllDepartments(true); fetchOpenComplaintsCount(); }}
              className={`${
                !showDashboard && showAllDepartments
                  ? "bg-blue-600 text-white shadow-lg active-sidebar-btn"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All Department Complaints
            </button>
          </div>
        </div>

        {showDashboard ? (
          <DashboardContent />
        ) : complaints.length === 0 ? (
          <p className="text-gray-600 no-complaints-message">No complaints found for the selected view.</p>
        ) : (
          <div className="table-responsive bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full leading-normal">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Complaint ID</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Asset ID</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Asset Type</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Raised By</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date Raised</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-gray-50 border-b border-gray-200">
                    <td className="px-5 py-5 text-sm">{complaint.id}</td>
                    <td className="px-5 py-5 text-sm">{complaint.asset_id}</td>
                    <td className="px-5 py-5 text-sm">{complaint.asset_type}</td>
                    <td className="px-5 py-5 text-sm">{complaint.location}</td>
                    <td className="px-5 py-5 text-sm">{complaint.complaint_category}</td>
                    <td className="px-5 py-5 text-sm max-w-xs truncate" title={complaint.description}>{complaint.description}</td>
                    <td className="px-5 py-5 text-sm">
                      <span
                        className={`status-indicator ${getStatusIndicatorClass(
                          complaint.status
                        )} px-3 py-1 rounded-full text-xs font-semibold`}
                      >
                        {complaint.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-5 text-sm">{complaint.department}</td>
                    <td className="px-5 py-5 text-sm">{complaint.raised_by_user_name}</td>
                    <td className="px-5 py-5 text-sm">
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-5 text-sm">
                      {complaint.status !== "CLOSED" && (
                        <button
                          className="feedback-btn"
                          onClick={() => handleCloseComplaint(complaint.id)}
                        >
                          Provide Feedback
                        </button>
                      )}
                      {complaint.status === "CLOSED" && complaint.closed_feedback && (
                        <span
                          className="feedback-text text-green-600 font-medium ml-2"
                          title={complaint.closed_feedback}
                        >
                          Feedback provided
                        </span>
                      )}
                      {complaint.status !== "CLOSED" && currentUserDepartment && complaint.department !== currentUserDepartment && (
                        <span className="text-gray-500 text-sm italic ml-2"></span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showFeedbackModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Provide Feedback for Complaint ID: {selectedComplaintId}</h3>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Enter feedback here..."
              rows="5"
              className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 setextarea"
            ></textarea>
            <div className="flex justify-end space-x-3">
              <button
                onClick={submitFeedback}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
              >
                Submit Feedback
              </button>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ServiceEngineerDashboard;