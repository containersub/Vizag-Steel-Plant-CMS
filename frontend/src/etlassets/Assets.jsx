import { useState, useEffect } from "react";
import {
  Search,
  ChevronUp,
  ChevronDown,
  Building,
  Box,
  Calendar,
  MapPin,
  Wrench,
  Hash,
} from "lucide-react";
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import toast, { Toaster } from 'react-hot-toast';

import "./Assets.css";
import Layout from "../Layout";
// Assuming Layout.jsx is in the same directory as Assets.jsx.
// If your Layout component is elsewhere, adjust this import path accordingly.


// Placeholder Layout component.
// IMPORTANT: If you have your own Layout component, replace this placeholder
// with your actual Layout component's code. This is included to ensure the
// Assets.jsx file can compile independently.
// (Removed duplicate Layout definition to avoid redeclaration error)


function Assets() {
  const navigate = useNavigate(); // Initialize navigate hook for programmatic navigation

  // --- State Management ---
  const [allAssets, setAllAssets] = useState([]); // Stores all original assets fetched from backend
  const [filteredAndSortedAssets, setFilteredAndSortedAssets] = useState([]); // Assets after filtering/sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedAssetType, setSelectedAssetType] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc"); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  
  const assetsPerPage = 10; // Number of assets per page

  const [showModal, setShowModal] = useState(false); // State for showing asset details modal
  const [selectedAsset, setSelectedAsset] = useState(null); // State for the asset selected in the details modal

  // Function to close the asset details modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedAsset(null);
  };

  // State for the "Add New Asset" modal and its form data
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [newAssetData, setNewAssetData] = useState({
    asset_type: "SERVC. PENTIUM PC", // Default value for new asset form
    department: "BF", // Default value for new asset form
    description: "",
    location: "",
    last_maintenance: new Date().toISOString().split("T")[0], // Default to today's date
    serial_number: "",
  });

  // Define possible asset types and departments for dropdowns
  const assetTypes = [
    "SERVC. PENTIUM PC", "SERVC.OTHER PRGM", "SERVC.PRR",
    "SERVC. PG675 SIEMENS PRGM G.U", "SERVC.OTHER MONER",
  ];
  const departments = [
    "BF", "COCCP", "CRMP", "EMD", "ES&F", "LMMM", "MMSM", "RMHP", "RS&RS",
    "SBM", "SMS", "SMS2", "SP", "STM", "WMD", "WRM", "WRM2", "ETL",
  ];

  // --- API Call to Fetch User-Specific Assets ---
  const fetchUserAssets = async () => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    console.log("No token found, redirecting to login");
    toast.error("No token found, redirecting to login")
    navigate('/login');
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:8080/ContractManagementSystem/user-assets",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate('/login');
        return;
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    setAllAssets(data);
  } catch (error) {
    console.error("Error fetching assets:", error);
    toast.error(`Failed to fetch assets: ${error.message}`);
    if (error.message.includes("401")) {
      localStorage.removeItem("token");
      navigate('/login');
    }
  }
};

  // Effect hook to fetch assets when the component mounts
  useEffect(() => {
    fetchUserAssets();
  }, []); // Empty dependency array ensures this runs only once on mount

  // --- Filtering and Sorting Logic ---
  // This effect runs whenever `allAssets`, search term, filters, or sort preferences change
  useEffect(() => {
    let currentAssets = [...allAssets]; // Create a mutable copy of all assets

    // 1. Apply Search Filter: Filters assets based on whether any field contains the search term
    if (searchTerm) {
      currentAssets = currentAssets.filter((asset) =>
        Object.values(asset).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // 2. Apply Department Filter: Filters assets by selected department
    if (selectedDepartment) {
      currentAssets = currentAssets.filter(
        (asset) => asset.department === selectedDepartment
      );
    }

    // 3. Apply Asset Type Filter: Filters assets by selected asset type
    if (selectedAssetType) {
      currentAssets = currentAssets.filter(
        (asset) => asset.asset_type === selectedAssetType
      );
    }

    // 4. Apply Sorting: Sorts assets based on the selected column and direction
    if (sortColumn) {
      currentAssets.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        // For numeric values (like ID), direct comparison
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      });
    }

    setFilteredAndSortedAssets(currentAssets); // Update state with filtered and sorted assets
    setCurrentPage(1); // Reset to the first page whenever filters/sort change
  }, [
    allAssets, // Re-run when the original list of assets changes
    searchTerm,
    selectedDepartment,
    selectedAssetType,
    sortColumn,
    sortDirection,
  ]);

  // --- Pagination Logic ---
  const indexOfLastAsset = currentPage * assetsPerPage;
  const indexOfFirstAsset = indexOfLastAsset - assetsPerPage;
  const currentAssets = filteredAndSortedAssets.slice(
    indexOfFirstAsset,
    indexOfLastAsset
  );

  const totalPages = Math.ceil(filteredAndSortedAssets.length / assetsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  // --- Event Handlers ---
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };

  const handleAssetTypeChange = (e) => {
    setSelectedAssetType(e.target.value);
  };

  // Toggles sorting direction for a column
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc"); // Default to ascending when changing column
    }
  };

  // Opens the asset details modal
  const viewAssetDetails = (asset) => {
    setSelectedAsset(asset);
    setShowModal(true);
  };

  // Closes the asset details modal
 

  // Opens the "Add New Asset" modal
  const openAddAssetModal = () => {
    setShowAddAssetModal(true);
    // Reset new asset data and set default maintenance date when opening the modal
    setNewAssetData({
      asset_type: assetTypes[0],
      department: departments[0],
      description: "",
      location: "",
      last_maintenance: new Date().toISOString().split("T")[0],
      serial_number: "",
    });
  };

  // Closes the "Add New Asset" modal
  const closeAddAssetModal = () => {
    setShowAddAssetModal(false);
  };

  // Handles input changes in the "Add New Asset" form
  const handleNewAssetInputChange = (e) => {
    const { name, value } = e.target;
    setNewAssetData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // --- API Call to Add New Asset ---
  const addNewAsset = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Basic client-side validation
    if (
      !newAssetData.asset_type ||
      !newAssetData.department ||
      !newAssetData.description ||
      !newAssetData.location ||
      !newAssetData.serial_number ||
      !newAssetData.last_maintenance
    ) {
      toast.alert("Please fill in all fields for the new asset.");
      return;
    }

    const token = localStorage.getItem("token"); // Get token for authentication
    if (!token) {
      toast.alert("You must be logged in to add an asset.");
      navigate('/login'); // Redirect if not authenticated
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/ContractManagementSystem/assets", // Endpoint for adding assets
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include JWT token
          },
          body: JSON.stringify({
            ...newAssetData,
            created_at: new Date().toISOString().split("T")[0], // Add current date as created_at
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text(); // Get full error response text
        console.error("Add asset error response body:", errorText);
        let errorMessage = `Failed to add asset with status: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          // ignore JSON parse error
        }
        throw new Error(errorMessage);
      }

      const addedAsset = await response.json(); // Backend returns the newly added asset
      setAllAssets((prevAssets) => [...prevAssets, addedAsset]); // Add the new asset to the list

      closeAddAssetModal(); // Close the modal on success
    
      toast.success("New asset added successfully!")
    } catch (error) {
      console.error("Error adding new asset:", error);
      toast.error(`Failed to add asset: ${error.message}`);
    }
  };
  


  return (
    <>
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
                <div className="assets-page-container">
          <div className="assets-content">
            <h1 className="page-title">Asset Management</h1>
           
           

            {/* Filters and Search Bar Section */}
            <div className="filters-search-section">
              <div className="filter-group">
                <label htmlFor="department-filter" className="filter-label">
                  Department:
                </label>
                <select
                  id="department-filter"
                  className="filter-select"
                  value={selectedDepartment}
                  onChange={handleDepartmentChange}
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
                  Asset Type:
                </label>
                <select
                  id="asset-type-filter"
                  className="filter-select"
                  value={selectedAssetType}
                  onChange={handleAssetTypeChange}
                >
                  <option value="">All Types</option>
                  {assetTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="search-bar-group">
                <input
                  type="text"
                  placeholder="Search assets..."
                  className="search-input"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <Search className="search-icon" size={20} />
              </div>
            </div>

            {/* Button to open the Add New Asset modal */}
            <button onClick={openAddAssetModal} className="add-asset-button">
              Add New Asset
            </button>

            {/* Assets Table Display */}
            <div className="table-container">
              <table className="assets-table">
                <thead>
                  <tr>{/* Ensure no whitespace or newlines directly after <tr> */}
                    <th onClick={() => handleSort("id")}>
                      Asset ID
                      {sortColumn === "id" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        ))}
                    </th>
                    <th onClick={() => handleSort("asset_type")}>
                      Type
                      {sortColumn === "asset_type" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        ))}
                    </th>
                    <th onClick={() => handleSort("department")}>
                      Department
                      {sortColumn === "department" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        ))}
                    </th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAssets.length > 0 ? (
                    currentAssets.map((asset) => (
                      <tr
                        key={asset.id}
                        onClick={() => viewAssetDetails(asset)}
                        className="table-row-clickable"
                      >
                        <td>{asset.id}</td>
                        <td>{asset.asset_type}</td>
                        <td>{asset.department}</td>
                        <td>
                          <span className="status-badge status-active">
                            Active
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click from triggering
                              viewAssetDetails(asset);
                            }}
                            className="view-details-button"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-results">
                        No assets found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="pagination-controls">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Asset Details Modal */}
        {showModal && selectedAsset && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button
                className="modal-close-button"
                onClick={closeModal}
                aria-label="Close View"
              >
                &times;
              </button>
              <h2 className="modal-title">
                Asset Details - ID: {selectedAsset.id}
              </h2>
              <div className="modal-details">
                <p>
                  <Box size={18} className="modal-icon" />{" "}
                  <strong>Type:</strong> {selectedAsset.asset_type}
                </p>
                <p>
                  <Building size={18} className="modal-icon" />{" "}
                  <strong>Department:</strong> {selectedAsset.department}
                </p>
                <p>
                  <MapPin size={18} className="modal-icon" />{" "}
                  <strong>Location:</strong> {selectedAsset.location}
                </p>
                <p>
                  <Hash size={18} className="modal-icon" />{" "}
                  <strong>Serial No:</strong> {selectedAsset.serial_number}
                </p>
                <p>
                  <Calendar size={18} className="modal-icon" />{" "}
                  <strong>Created At:</strong> {selectedAsset.created_at}
                </p>
                <p>
                  <Wrench size={18} className="modal-icon" />{" "}
                  <strong>Last Maintenance:</strong>{" "}
                  {selectedAsset.last_maintenance}
                </p>
                <p>
                  <strong>Description:</strong> {selectedAsset.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Add New Asset Modal */}
        {showAddAssetModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button
                className="modal-close-button"
                onClick={closeAddAssetModal}
              >
                &times;
              </button>
              <h2 className="modal-title">Add New Asset</h2>
              <form onSubmit={addNewAsset}>
                <div className="new-form-group">
                  <label htmlFor="newAssetType">Asset Type:</label>
                  <select
                    id="newAssetType"
                    name="asset_type"
                    value={newAssetData.asset_type}
                    onChange={handleNewAssetInputChange}
                    required
                  >
                    {assetTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="new-form-group">
                  <label htmlFor="newDepartment">Department:</label>
                  <select
                    id="newDepartment"
                    name="department"
                    value={newAssetData.department}
                    onChange={handleNewAssetInputChange}
                    required
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="new-form-group">
                  <label htmlFor="newDescription">Description:</label>
                  <textarea
                    id="newDescription"
                    name="description"
                    value={newAssetData.description}
                    onChange={handleNewAssetInputChange}
                    required
                  ></textarea>
                </div>
                <div className="new-form-group">
                  <label htmlFor="newLocation">Location:</label>
                  <input
                    type="text"
                    id="newLocation"
                    name="location"
                    value={newAssetData.location}
                    onChange={handleNewAssetInputChange}
                    required
                  />
                </div>
                <div className="new-form-group">
                  <label htmlFor="newSerialNumber">Serial Number:</label>
                  <input
                    type="text"
                    id="newSerialNumber"
                    name="serial_number"
                    value={newAssetData.serial_number}
                    onChange={handleNewAssetInputChange}
                    required
                  />
                </div>
                <div className="new-form-group">
                  <label htmlFor="newLastMaintenance">
                    Last Maintenance Date:
                  </label>
                  <input
                    type="date"
                    id="newLastMaintenance"
                    name="last_maintenance"
                    value={newAssetData.last_maintenance}
                    onChange={handleNewAssetInputChange}
                    required
                  />
                </div>

                <div className="action-btn">
                  <button type="submit" className="submit-button">
                    Add Asset
                  </button>
                  <button
                    type="button" // Changed to type="button" to prevent form submission
                    className="close-button"
                    onClick={closeAddAssetModal}
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
  
      </Layout>
    </>
  );
}

export default Assets;
