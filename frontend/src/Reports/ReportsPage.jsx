import React, { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  Wrench,
  X, // Import X icon for close button
} from "lucide-react";
import "./ReportsPage.css";
import Layout from "../Layout";

// --- Data Definitions (kept for dropdowns) ---
const departments = [
  "BF",
  "COCCP",
  "CRMP",
  "EMD",
  "ES&F",
  "LMMM",
  "MMSM",
  "RMHP",
  "RS&RS",
  "SBM",
  "SMS",
  "SMS2",
  "SP",
  "IT",
  "STM",
  "HR",
  "WMD",
  "WRM",
  "WRM2",
];

const PM_STATUSES = ["PENDING", "VERIFIED", "APPROVED", "REJECTED", "BILL_APPROVED"]; // Ensure these match your backend PM statuses

function ReportsPage() {
  const [activeTab, setActiveTab] = useState("complaints");

  // State for Complaints
  const [allComplaints, setAllComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [errorComplaints, setErrorComplaints] = useState(null);

  // State for PM Tasks
  const [allPMs, setAllPMs] = useState([]);
  const [filteredPMs, setFilteredPMs] = useState([]);
  const [loadingPMs, setLoadingPMs] = useState(true);
  const [errorPMs, setErrorPMs] = useState(null);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  // New state for handling drill-down details
  const [showDetailCard, setShowDetailCard] = useState(false);
  const [selectedItemDetails, setSelectedItemDetails] = useState(null);

  // --- Fetch Complaints Data from Backend ---
  useEffect(() => {
    const fetchComplaints = async () => {
      setLoadingComplaints(true);
      setErrorComplaints(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setErrorComplaints("Authentication token not found. Please log in.");
          setLoadingComplaints(false);
          return;
        }

        const response = await fetch(
          "http://localhost:8080/ContractManagementSystem/complaints",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch complaints");
        }

        const data = await response.json();
        setAllComplaints(data);
      } catch (error) {
        console.error("Error fetching complaints:", error);
        setErrorComplaints(error.message);
      } finally {
        setLoadingComplaints(false);
      }
    };

    fetchComplaints();
  }, []);

  // --- Fetch PM Tasks Data from Backend ---
  useEffect(() => {
    const fetchPMs = async () => {
      setLoadingPMs(true);
      setErrorPMs(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setErrorPMs("Authentication token not found. Please log in.");
          setLoadingPMs(false);
          return;
        }

        const response = await fetch(
          "http://localhost:8080/ContractManagementSystem/pm-tasks",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch PM tasks");
        }

        const data = await response.json();
        setAllPMs(data);
      } catch (error) {
        console.error("Error fetching PM tasks:", error);
        setErrorPMs(error.message);
      } finally {
        setLoadingPMs(false);
      }
    };

    fetchPMs();
  }, []);

  // --- Filtering and Sorting Logic ---
  useEffect(() => {
    // Filter Complaints
    let currentComplaints = [...allComplaints];
    if (selectedDepartment) {
      currentComplaints = currentComplaints.filter(
        (c) => c.department === selectedDepartment
      );
    }
    if (startDate) {
      currentComplaints = currentComplaints.filter(
        (c) => new Date(c.created_at) >= new Date(startDate)
      );
    }
    if (endDate) {
      currentComplaints = currentComplaints.filter(
        (c) => new Date(c.created_at) <= new Date(endDate)
      );
    }

    // Sort Complaints
    if (activeTab === "complaints" && sortColumn) {
      currentComplaints.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      });
    }
    setFilteredComplaints(currentComplaints);

    // Filter PMs
    let currentPMs = [...allPMs];
    if (selectedDepartment) {
      currentPMs = currentPMs.filter((p) => p.department === selectedDepartment);
    }
    // Assuming PM tasks use 'last_pm_date' for date filtering based on PmTask.java
    if (startDate) {
      currentPMs = currentPMs.filter(
        (p) => new Date(p.last_pm_date) >= new Date(startDate)
      );
    }
    if (endDate) {
      currentPMs = currentPMs.filter(
        (p) => new Date(p.last_pm_date) <= new Date(endDate)
      );
    }

    // Sort PMs
    if (activeTab === "pm" && sortColumn) {
      currentPMs.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      });
    }
    setFilteredPMs(currentPMs);
  }, [
    activeTab,
    allComplaints,
    allPMs,
    selectedDepartment,
    startDate,
    endDate,
    sortColumn,
    sortDirection,
  ]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleExport = (format) => {
    alert(
      `Exporting ${
        activeTab === "complaints" ? "Complaints" : "PM"
      } Report as ${format}... (Simulated)`
    );
    console.log(
      `Exporting ${
        activeTab === "complaints" ? "Complaints" : "PM"
      } Report as ${format}`
    );
  };

  const handleDrillDown = (item) => {
    setSelectedItemDetails(item);
    setShowDetailCard(true);
  };

  const handleCloseDetailCard = () => {
    setShowDetailCard(false);
    setSelectedItemDetails(null);
  };

  return (
    <div className="">
      <Layout>
        <div className="reports-page-container">
          <h1 className="reports-page-title">Reports Dashboard</h1>

          {/* Tabs */}
          <div className="tabs-container">
            <button
              className={`tab-button ${
                activeTab === "complaints" ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab("complaints");
                handleCloseDetailCard(); // Close detail card when switching tabs
              }}
            >
              <FileText size={18} /> Complaints Reports
            </button>
            <button
              className={`tab-button ${activeTab === "pm" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("pm");
                handleCloseDetailCard(); // Close detail card when switching tabs
              }}
            >
              <Wrench size={18} /> PM Reports
            </button>
          </div>

          {/* Filters Section */}
          <div className="filters-section">
            <div className="filter-group">
              <label htmlFor="department-filter" className="filter-label">
                <Filter size={16} /> Department:
              </label>
              <select
                id="department-filter"
                className="filter-select-department"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="start-date-filter" className="filter-label">
                <Calendar size={16} /> From:
              </label>
              <input
                type="date"
                id="start-date-filter"
                className="filter-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label htmlFor="end-date-filter" className="filter-label">
                <Calendar size={16} /> To:
              </label>
              <input
                type="date"
                id="end-date-filter"
                className="filter-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            {/*<button
              className="export-button"
              onClick={() => handleExport("PDF")}
            >
              <Download size={16} /> Export as PDF
            </button>
            <button
              className="export-button-csv"
              onClick={() => handleExport("CSV")}
            >
              <Download size={16} /> Export as CSV
            </button>8*/}
          </div>

          {/* Reports Display Section */}
          <div className="reports-display-section">
            {activeTab === "complaints" && (
              <div className="complaints-report">
                <h2>Complaints Report</h2>
                {loadingComplaints ? (
                  <p>Loading complaints...</p>
                ) : errorComplaints ? (
                  <p className="error-message">Error: {errorComplaints}</p>
                ) : (
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th
                            onClick={() => handleSort("id")}
                            className="sortable"
                          >
                            Complaint ID{" "}
                            {sortColumn === "id" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              ))}
                          </th>
                          <th
                            onClick={() => handleSort("department")}
                            className="sortable"
                          >
                            Department{" "}
                            {sortColumn === "department" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              ))}
                          </th>
                          <th
                            onClick={() => handleSort("location")}
                            className="sortable"
                          >
                            Location{" "}
                            {sortColumn === "location" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              ))}
                          </th>
                          <th
                            onClick={() => handleSort("status")}
                            className="sortable"
                          >
                            Status{" "}
                            {sortColumn === "status" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              ))}
                          </th>
                          <th
                            onClick={() => handleSort("created_at")}
                            className="sortable"
                          >
                            Raised Date{" "}
                            {sortColumn === "created_at" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              ))}
                          </th>
                          <th>Description</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredComplaints.length === 0 ? (
                          <tr>
                            <td colSpan="7">No complaints found.</td>
                          </tr>
                        ) : (
                          filteredComplaints.map((complaint) => (
                            <tr key={complaint.id}>
                              <td>{complaint.id}</td>
                              <td>{complaint.department}</td>
                              <td>{complaint.location}</td>
                              <td>
                                <span
                                  className={`status-badge status-${complaint.status.toLowerCase()}`}
                                >
                                  {complaint.status}
                                </span>
                              </td>
                              <td>{complaint.created_at}</td>
                              <td>{complaint.description}</td>
                              <td>
                                <button
                                  className="drill-down-button"
                                  onClick={() => handleDrillDown(complaint)}
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "pm" && (
              <div className="pm-report">
                <h2>PM Report</h2>
                {loadingPMs ? (
                  <p>Loading PM tasks...</p>
                ) : errorPMs ? (
                  <p className="error-message">Error: {errorPMs}</p>
                ) : (
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          {/* Corrected column names based on PmTask.java and joined asset fields */}
                          <th
                            onClick={() => handleSort("id")}
                            className="sortable"
                          >
                            PM ID{" "}
                            {sortColumn === "id" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              ))}
                          </th>
                          <th
                            onClick={() => handleSort("department")}
                            className="sortable"
                          >
                            Department{" "}
                            {sortColumn === "department" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              ))}
                          </th>
                          <th
                            onClick={() => handleSort("asset_type")}
                            className="sortable"
                          >
                            Asset Type{" "}
                            {sortColumn === "asset_type" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              ))}
                          </th>
                          <th
                            onClick={() => handleSort("status")}
                            className="sortable"
                          >
                            Status{" "}
                            {sortColumn === "status" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              ))}
                          </th>
                          <th
                            onClick={() => handleSort("last_pm_date")} /* Changed to last_pm_date */
                            className="sortable"
                          >
                            Last PM Date{" "}
                            {sortColumn === "last_pm_date" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              ))}
                          </th>
                          <th>Description</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPMs.length === 0 ? (
                          <tr>
                            <td colSpan="7">No PM tasks found.</td>
                          </tr>
                        ) : (
                          filteredPMs.map((pm) => (
                            <tr key={pm.id}> {/* Changed key to pm.id */}
                              <td>{pm.id}</td>
                              <td>{pm.department}</td>
                              <td>{pm.asset_type}</td>
                              <td>
                                <span
                                  className={`status-badge status-${pm.status.toLowerCase()}`}
                                >
                                  {pm.status}
                                </span>
                              </td>
                              <td>{pm.last_pm_date}</td> {/* Changed to last_pm_date */}
                              <td>{pm.description}</td>
                              <td>
                                <button
                                  className="drill-down-button"
                                  onClick={() => handleDrillDown(pm)}
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Detail Card/Modal */}
            {showDetailCard && selectedItemDetails && (
              <div className="detail-card-overlay">
                <div className="detail-card">
                  <button className="detail-card-close" onClick={handleCloseDetailCard}>
                    <X size={20} />
                  </button>
                  <h3>
                    Details for{" "}
                    {activeTab === "complaints" ? "Complaint" : "PM Task"} ID:{" "}
                    {selectedItemDetails.id}
                  </h3>
                  <div className="detail-card-content">
                    {Object.entries(selectedItemDetails).map(([key, value]) => (
                      <p key={key}>
                        <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}:</strong> {value}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </div>
  );
}

export default ReportsPage;