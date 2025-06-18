// frontend/src/Dashboards/AssetsManage.jsx
import React, { useState, useEffect } from "react";
import {
  Filter,
  ChevronDown,
  ChevronUp,
  HardDrive,
  PlusCircle,
  Edit,
  Trash2,
} from "lucide-react";
import Layout from "../Layout"; // Assuming Layout component is available
import "./AssetsManage.css"; // Import the CSS file for styling
import { useNavigate } from "react-router-dom";

// Data Definitions (assuming these are consistent with your backend Asset model)
const departments = [
  "BF", "COCCP", "CRMP", "EMD", "ES&F", "LMMM", "MMSM", "RMHP",
  "RS&RS", "SBM", "SMS", "SMS2", "SP", "IT", "STM", "HR", "WMD", "WRM", "WRM2",
];

const assetStatuses = [
  "Active", "In Maintenance", "Retired", "Disposed", "Lost"
];

const AssetsManage = () => {
  const [allAssets, setAllAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedAssetType, setSelectedAssetType] = useState(""); // Assuming asset_type for filtering
  const [selectedStatus, setSelectedStatus] = useState("");

  // Sort states
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

   const navigate = useNavigate();

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token"); // Assuming JWT token is stored here
        if (!token) {
          setError("Authentication token not found. Please log in.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "http://localhost:8080/ContractManagementSystem/assets/all",
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
          throw new Error(errorData.message || "Failed to fetch assets");
        }

        const data = await response.json();
        setAllAssets(data);
      } catch (err) {
        console.error("Error fetching assets:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []); // Empty dependency array to run once on mount

  // Filtering and Sorting Logic
  useEffect(() => {
    let currentAssets = [...allAssets];

    // Apply filters
    if (selectedDepartment) {
      currentAssets = currentAssets.filter(
        (asset) => asset.department === selectedDepartment
      );
    }
    if (selectedAssetType) {
      currentAssets = currentAssets.filter(
        (asset) =>
          asset.asset_type &&
          asset.asset_type.toLowerCase().includes(selectedAssetType.toLowerCase())
      );
    }
    if (selectedStatus) {
      currentAssets = currentAssets.filter(
        (asset) => asset.status === selectedStatus
      );
    }

    // Apply sorting
    if (sortColumn) {
      currentAssets.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        // Handle null/undefined values for sorting
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortDirection === "asc" ? 1 : -1;
        if (bValue == null) return sortDirection === "asc" ? -1 : 1;


        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        // Handle numbers and dates (assuming date strings are comparable directly)
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      });
    }

    setFilteredAssets(currentAssets);
  }, [allAssets, selectedDepartment, selectedAssetType, selectedStatus, sortColumn, sortDirection]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleEdit = (assetId) => {
    // Implement logic to navigate to an edit page or open a modal
    console.log("Edit asset:", assetId);
    alert(`Edit functionality for Asset ID: ${assetId} will be implemented here.`);
    // Example: navigate(`/assets/edit/${assetId}`);
  };

  const handleDelete = async (assetId) => {
    if (!window.confirm(`Are you sure you want to delete Asset ID: ${assetId}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication token not found. Please log in.");
        return;
      }

      const response = await fetch(
        `http://localhost:8080/ContractManagementSystem/assets/${assetId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete asset");
      }

      setAllAssets(allAssets.filter((asset) => asset.id !== assetId));
      alert(`Asset ID: ${assetId} deleted successfully.`);
    } catch (err) {
      console.error("Error deleting asset:", err);
      alert(`Error deleting asset: ${err.message}`);
    }
  };


  return (
    <Layout>
      <div className="assets-manage-container">
        <h1 className="assets-manage-title">
          <HardDrive size={28} /> Manage Assets
        </h1>

        <button
          onClick={() => navigate(-1)}
          className=" close-btn"
          aria-label="Close Complaints View"
        >
          Close
        </button>
        

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filter-group">
            <label htmlFor="department-filter" className="filter-label">
              <Filter size={16} /> Department:
            </label>
            <select
              id="department-filter"
              className="filter-select"
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
            <label htmlFor="asset-type-filter" className="filter-label">
              <Filter size={16} /> Asset Type:
            </label>
            <input
              type="text"
              id="asset-type-filter"
              className="filter-input"
              placeholder="e.g., Laptop, Server"
              value={selectedAssetType}
              onChange={(e) => setSelectedAssetType(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="status-filter" className="filter-label">
              <Filter size={16} /> Status:
            </label>
            <select
              id="status-filter"
              className="filter-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              {assetStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assets Display Section */}
        <div className="assets-display-section">
          <h2>All Assets</h2>
          {loading ? (
            <p>Loading assets...</p>
          ) : error ? (
            <p className="error-message">Error: {error}</p>
          ) : (
            <div className="table-responsive">
              <table className="data-table-ass">
                <thead>
                  <tr>
                    <th onClick={() => handleSort("id")} className="sortable">
                      ID{" "}
                      {sortColumn === "id" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        ))}
                    </th>
                    <th onClick={() => handleSort("asset_type")} className="sortable">
                      Asset Type{" "}
                      {sortColumn === "asset_type" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        ))}
                    </th>
                    <th onClick={() => handleSort("department")} className="sortable">
                      Department{" "}
                      {sortColumn === "department" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        ))}
                    </th>
                    <th onClick={() => handleSort("location")} className="sortable">
                      Location{" "}
                      {sortColumn === "location" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        ))}
                    </th>
                    <th onClick={() => handleSort("serial_number")} className="sortable">
                      Serial Number{" "}
                      {sortColumn === "serial_number" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        ))}
                    </th>
                    <th onClick={() => handleSort("status")} className="sortable">
                      Status{" "}
                      {sortColumn === "status" &&
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
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan="10">No assets found.</td>
                    </tr>
                  ) : (
                    filteredAssets.map((asset) => (
                      <tr key={asset.id}>
                        <td>{asset.id}</td>
                        <td>{asset.asset_type}</td>
                        <td>{asset.department}</td>
                        <td>{asset.location}</td>
                        <td>{asset.serial_number}</td>
                        <td>
                          {/* Safely access asset.status */}
                          <span
                            className={`status-badge-am status-${(asset.status ? asset.status.toLowerCase() : 'unknown').replace(/\s/g, '-')}`}
                          >
                            {asset.status || 'N/A'}
                          </span>
                        </td>
                        <td>{asset.description}</td>
                        <td className="acbu">
                          <button
                            className="action-button edit-button"
                            onClick={() => handleEdit(asset.id)}
                            title="Edit Asset"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="action-button delete-button"
                            onClick={() => handleDelete(asset.id)}
                            title="Delete Asset"
                          >
                            <Trash2 size={16} />
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
      </div>
    </Layout>
  );
};

export default AssetsManage;