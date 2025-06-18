import { useState, useEffect } from "react";
import "./ComplaintPage.css";
import Layout from "../Layout";
import { useAuth } from "../AuthContext"; // Assuming AuthContext provides user information
import toast, { Toaster } from 'react-hot-toast';

const ComplaintPage = () => {
  const { user } = useAuth(); // Get user from AuthContext

  // State for the new complaint form
  const [currentDate, setCurrentDate] = useState("");
  const [assetId, setAssetId] = useState("");
  const [assetType, setAssetType] = useState("Computer");
  const [location, setLocation] = useState("");
  const [complaintCategory, setComplaintCategory] = useState("Hardware");
  const [complaintDescription, setComplaintDescription] = useState("");
  const [department, setDepartment] = useState("IT");

  // State for existing complaints
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);

  // State for filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [idFilter, setIdFilter] = useState("");

  // List of available departments
  const departments = [
    "IT", "BF", "COCCP", "CRMP", "EMD", "ES&F", "LMMM", "MMSM", "RMHP", "RS&RS",
    "SBM", "SMS", "SMS2", "SP", "STM", "HR", "WMD", "WRM", "WRM2", "ETL",
  ];

  // List of available asset types
  const assetTypes = [
    "Select Type", "SERVC.PENTIUM PC", "SERVC.OTHER PRGM", "SERVC.PRR",
    "SERVC.PG675 SIEMENS PRGM G.U", "SERVC.OTHER MONR",
  ];

  // List of available complaint categories
  const complaintCategories = [
    "Hardware", "Software", "Network", "Facilities", "Maintenance", "Other",
  ];

  // Effect to set the current date on component mount and fetch user complaints
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    setCurrentDate(`${year}-${month}-${day}`);

    if (user) {
      fetchUserComplaints();
    }
  }, [user]); // Re-fetch when user changes

  // Function to fetch complaints for the logged-in user
  const fetchUserComplaints = async () => {
    try {
      const token = localStorage.getItem("token"); // Assuming you store token in localStorage
      if (!token) {
        console.error("No authentication token found.");
        return;
      }

      const response = await fetch("http://localhost:8080/ContractManagementSystem/user-complaints", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setComplaints(data);
      setFilteredComplaints(data);
    } catch (error) {
      console.error("Error fetching user complaints:", error);
      // Handle error (e.g., show an alert to the user)
    }
  };

  // Effect for filtering complaints
  useEffect(() => {
    let currentComplaints = complaints;

    if (statusFilter !== "ALL") {
      currentComplaints = currentComplaints.filter(
        (complaint) => complaint.status === statusFilter
      );
    }

    if (departmentFilter !== "ALL") {
      currentComplaints = currentComplaints.filter(
        (complaint) => complaint.department === departmentFilter
      );
    }

    if (idFilter) {
      currentComplaints = currentComplaints.filter((complaint) =>
        String(complaint.id).includes(idFilter)
      );
    }

    setFilteredComplaints(currentComplaints);
  }, [complaints, statusFilter, departmentFilter, idFilter]);

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();

    if (
      !assetId ||
      !assetType ||
      !location ||
      !complaintCategory ||
      !complaintDescription ||
      !department ||
      !currentDate
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const newComplaintData = {
      asset_id: parseInt(assetId),
      asset_type: assetType,
      location: location,
      complaint_category: complaintCategory,
      description: complaintDescription, // Ensure this matches backend field name
      department: department,
      // created_at, raised_by_user_id, raised_by_user_name, status will be set by backend
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token not found. Please log in.");
        return;
      }

      const response = await fetch("http://localhost:8080/ContractManagementSystem/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(newComplaintData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      toast.success("Complaint submitted successfully!");
      // Re-fetch complaints to display the newly added one
      fetchUserComplaints();

      // Reset form fields
      setAssetId("");
      setAssetType("Computer");
      setLocation("");
      setComplaintCategory("Hardware");
      setComplaintDescription("");
      setDepartment("IT");
      // Re-autofill date after submission
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      setCurrentDate(`${year}-${month}-${day}`);

    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast.error(`Failed to submit complaint: ${error.message}`);
    }
  };

  const handleCloseComplaint = async (complaintId) => {
    const feedback = prompt(
      "Please provide closing feedback for this complaint:"
    );
    if (feedback === null) {
      // User cancelled the prompt
      return;
    }
    if (feedback.trim() === "") {
      toast.alert("Closing feedback cannot be empty.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token not found. Please log in.");
        return;
      }

      const response = await fetch(`http://localhost:8080/ContractManagementSystem/complaints/${complaintId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "CLOSED", feedback: feedback }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      toast.success("Complaint closed with feedback.");
      // Re-fetch complaints to update the status in the UI
      fetchUserComplaints();

    } catch (error) {
      console.error("Error closing complaint:", error);
      toast.error(`Failed to close complaint: ${error.message}`);
    }
  };

  const getStatusIndicatorClass = (status) => {
    switch (status) {
      case "OPEN":
        return "status-open";
      case "IN_PROGRESS":
        return "status-in-progress";
      case "CLOSED":
        return "status-closed";
      default:
        return "";
    }
  };

  return (
    <div className="">
      <Layout>
        <Toaster 
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover/>
        <div className="complaint-page-container">
          <div className="cr">
            <div className="complaint-form-section">
              <h2>Raise a New Complaint</h2>
              <p>Welcome, {user?.name}! </p>
              <form onSubmit={handleSubmitComplaint}>
                <div className="main-form">
                  <div className="sub-main-form">
                    <div className="form-group">
                      <label htmlFor="date">Date:</label>
                      <input
                        type="date"
                        id="date"
                        value={currentDate}
                        onChange={(e) => setCurrentDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="assetId">Asset ID:</label>
                      <input
                        type="text"
                        id="assetId"
                        value={assetId}
                        onChange={(e) => setAssetId(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="assetType">Asset Type:</label>
                      <select
                        id="assetType"
                        value={assetType}
                        onChange={(e) => setAssetType(e.target.value)}
                        required
                      >
                        {assetTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="sub-main-form1">
                    <div className="form-group">
                      <label htmlFor="location">Location:</label>
                      <input
                        type="text"
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="complaintCategory">
                        Complaint Category:
                      </label>
                      <select
                        id="complaintCategory"
                        value={complaintCategory}
                        onChange={(e) => setComplaintCategory(e.target.value)}
                        required
                      >
                        {complaintCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="department">Department:</label>
                      <select
                        id="department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        required
                      >
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="complaintDescription">
                    Complaint Description:
                  </label>
                  <textarea
                    id="complaintDescription"
                    value={complaintDescription}
                    onChange={(e) => setComplaintDescription(e.target.value)}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="submit-button">
                  Submit Complaint
                </button>
              </form>
            </div>
          </div>

          <div className="cr1">
            <div className="existing-complaints-section">
              <h2>Existing Complaints</h2>
              <div className="filters">
                <div className="filter-group">
                  <label htmlFor="statusFilter">Status:</label>
                  <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All</option>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label htmlFor="departmentFilter">Department:</label>
                  <select
                    id="departmentFilter"
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                  >
                    <option value="ALL">All</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label htmlFor="idFilter">Complaint ID:</label>
                  <input
                    type="text"
                    id="idFilter"
                    value={idFilter}
                    onChange={(e) => setIdFilter(e.target.value)}
                    placeholder="Filter by ID"
                  />
                </div>
              </div>

              {filteredComplaints.length === 0 ? (
                <p>No complaints found matching your criteria.</p>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Complaint ID</th>
                        <th>Asset ID</th>
                        <th>Asset Type</th>
                        <th>Location</th>
                        <th>Complaint Category</th>
                        <th>Complaint Description</th>
                        <th>Status</th>
                        <th>Department</th>
                        <th>Raised By</th>
                        <th>Date Raised</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredComplaints.map((complaint) => (
                        <tr key={complaint.id}>
                          <td>{complaint.id}</td>
                          <td>{complaint.asset_id}</td>
                          <td>{complaint.asset_type}</td>
                          <td>{complaint.location}</td>
                          <td>{complaint.complaint_category}</td>
                          <td>{complaint.description}</td>
                          <td>
                            <span
                              className={`status-indicator ${getStatusIndicatorClass(
                                complaint.status
                              )}`}
                            >
                              {complaint.status.replace("_", " ")}
                            </span>
                          </td>
                          <td>{complaint.department}</td>
                          <td>{complaint.raised_by_user_name}</td> {/* Use raised_by_user_name */}
                          <td>
                            {new Date(
                              complaint.created_at
                            ).toLocaleDateString()}
                          </td>
                          <td>
                            {complaint.status !== "CLOSED" && (
                              <button
                                className="close-button"
                                onClick={() =>
                                  handleCloseComplaint(complaint.id)
                                }
                              >
                                Provide Feedback
                              </button>
                            )}
                            {complaint.status === "CLOSED" &&
                              complaint.closed_feedback && (
                                <span
                                  className="feedback-text"
                                  title={complaint.closed_feedback}
                                >
                                  Feedback provided
                                </span>
                              )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </div>
  );
};

export default ComplaintPage;