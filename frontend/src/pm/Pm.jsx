import { useState, useEffect } from "react";
import "./Pm.css";
import Layout from "../Layout";
import { useAuth } from "../AuthContext";
import toast, { Toaster } from 'react-hot-toast';

const Pm = () => {
    const { user } = useAuth();
    const [pmTasks, setPmTasks] = useState([]);
    const [assets, setAssets] = useState([]);
    const [showRaisePMModal, setShowRaisePMModal] = useState(false);
   
    const [newPmAssetId, setNewPmAssetId] = useState("");
    const [newPmQuarter, setNewPmQuarter] = useState("");
    const [newPmLastPmDate, setNewPmLastPmDate] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error("Authentication token not found. Please log in.", "error");
                    return;
                }
                const pmResponse = await fetch('http://localhost:8080/ContractManagementSystem/pm-tasks', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!pmResponse.ok) {
                    const errorText = await pmResponse.text();
                    console.error("PM fetch error response:", errorText);
                    throw new Error(`Failed to fetch PM tasks: ${errorText}`);
                }
                const pmData = await pmResponse.json();
                setPmTasks(pmData);
                const assetsResponse = await fetch('http://localhost:8080/ContractManagementSystem/assets/all', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!assetsResponse.ok) {
                    const errorText = await assetsResponse.text();
                    console.error("Assets fetch error response:", errorText);
                    toast.error("Assets fetch error response:", errorText);
                    throw new Error(`Failed to fetch assets: ${errorText}`);
                }
                const assetsData = await assetsResponse.json();
                setAssets(assetsData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast.error(`Failed to load data: ${error.message}.`, "error");
            }
        };
        fetchData();
    }, []);

    const handleRaisePM = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("Authentication token not found. Please log in.", "error");
                return;
            }
            if (!newPmAssetId) {
                toast.error("Please select an Asset.", "error");
                return;
            }
            if (!newPmQuarter || !newPmQuarter.match(/Q[1-4]-\d{4}/)) {
                toast.error("Please select a valid Quarter (e.g., Q1-2025).", "error");
                return;
            }
            if (!newPmLastPmDate || !newPmLastPmDate.match(/\d{4}-\d{2}-\d{2}/)) {
                toast.error("Please provide a valid Last PM Date (YYYY-MM-DD).", "error");
                return;
            }
            const newPM = {
                asset_id: parseInt(newPmAssetId),
                quarter: newPmQuarter,
                last_pm_date: newPmLastPmDate
            };
            const response = await fetch('http://localhost:8080/ContractManagementSystem/pm-tasks', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newPM)
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Backend error response:", errorData);
                throw new Error(errorData.message || 'Failed to create PM task.');
            }
            const createdTask = await response.json();
            setPmTasks([...pmTasks, createdTask]);
            setShowRaisePMModal(false);
            console.log("PM Task Raised Successfully!", "success");
            setNewPmAssetId("");
            setNewPmQuarter("");
            setNewPmLastPmDate("");
            toast.success("PM Task Raised Successfully!");
        } catch (error) {
            console.error("Failed to raise PM task:", error);
            toast.error(error.message || "Failed to raise PM task. Please check your inputs and try again.", "error");
        }
    };

    const handleVerifyPM = async (pmId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("Authentication token not found. Please log in.", "error");
                return;
            }
            const response = await fetch(`http://localhost:8080/ContractManagementSystem/pm-tasks/${pmId}/verify`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to verify PM task');
            }
            const updatedTask = await response.json();
            setPmTasks(pmTasks.map(task => task.id === pmId ? updatedTask : task));
            toast.success("PM Task Verified!", "success");
        } catch (error) {
            console.error("Failed to verify PM task:", error);
            toast.error(error.message || "Failed to verify PM task", "error");
        }
    };

    const handleApprovePM = async (pmId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("Authentication token not found. Please log in.", "error");
                return;
            }
            const response = await fetch(`http://localhost:8080/ContractManagementSystem/pm-tasks/${pmId}/approve`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to approve PM task');
            }
            const updatedTask = await response.json();
            setPmTasks(pmTasks.map(task => task.id === pmId ? updatedTask : task));
            toast.success("PM Task Approved!", "success");
        } catch (error) {
            console.error("Failed to approve PM task:", error);
            toast.error(error.message || "Failed to approve PM task", "error");
        }
    };

    const handleBillApprovePM = async (pmId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("Authentication token not found. Please log in.", "error");
                return;
            }
            const response = await fetch(`http://localhost:8080/ContractManagementSystem/pm-tasks/${pmId}/bill-approve`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to bill approve PM task');
            }
            const updatedTask = await response.json();
            setPmTasks(pmTasks.map(task => task.id === pmId ? updatedTask : task));
            toast.success("PM Task Bill Approved!", "success");
        } catch (error) {
            console.error("Failed to bill approve PM task:", error);
            toast.error(error.message || "Failed to bill approve PM task", "error");
        }
    };

    const handleRejectPM = async (pmId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("Authentication token not found. Please log in.", "error");
                return;
            }
            const response = await fetch(`http://localhost:8080/ContractManagementSystem/pm-tasks/${pmId}/reject`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to reject PM task');
            }
            const updatedTask = await response.json();
            setPmTasks(pmTasks.map(task => task.id === pmId ? updatedTask : task));
            toast.success("PM Task Rejected!", "success");
        } catch (error) {
            console.error("Failed to reject PM task:", error);
            toast.error(error.message || "Failed to reject PM task", "error");
        }
    };

    const calculateBillingSummary = () => {
        const summary = {};
        pmTasks.forEach((task) => {
            if (task.status === "APPROVED" || task.status === "BILL_APPROVED") {
                const quarter = task.quarter;
                if (!summary[quarter]) summary[quarter] = 0;
                summary[quarter] += 1;
            }
        });
        return summary;
    };

    const billingSummary = calculateBillingSummary();

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
                <div className="pm-page-container">
                    <h1>Preventive Maintenance Management</h1>
                    <div className="action-buttons">
                        <div>
                            {user?.role === "Service_Engineer" && (
                                <button onClick={() => setShowRaisePMModal(true)} className="btn primary">
                                    Raise New PM
                                </button>
                            )}
                            {(user?.role === "Section_Coordinator" || user?.role === "EIC_Contract") && (
                                <p>Select a PM task in the table to perform actions.</p>
                            )}
                        </div>
                    </div>
                    {showRaisePMModal && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <h2>Raise New Preventive Maintenance</h2>
                                <form onSubmit={handleRaisePM}>
                                    <div className="form-group">
                                        <label htmlFor="assetId">Asset:</label>
                                        <select
                                            id="assetId"
                                            name="assetId"
                                            value={newPmAssetId}
                                            onChange={(e) => setNewPmAssetId(e.target.value)}
                                            required
                                        >
                                            <option value="">Select an Asset</option>
                                            {assets.map((asset) => (
                                                <option key={asset.id} value={asset.id}>
                                                    {asset.asset_type} - {asset.id} - {asset.department}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="quarter">Billing Quarter (e.g., Q1-2025):</label>
                                        <select
                                            id="quarter"
                                            name="quarter"
                                            value={newPmQuarter}
                                            onChange={(e) => setNewPmQuarter(e.target.value)}
                                            required
                                        >
                                            <option value="">Select Quarter</option>
                                            <option value="Q1-2025">Q1-2025</option>
                                            <option value="Q2-2025">Q2-2025</option>
                                            <option value="Q3-2025">Q3-2025</option>
                                            <option value="Q4-2025">Q4-2025</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="lastPmDate">Last PM Date:</label>
                                        <input
                                            type="date"
                                            id="lastPmDate"
                                            name="lastPmDate"
                                            value={newPmLastPmDate}
                                            onChange={(e) => setNewPmLastPmDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-actions">
                                        <button type="submit" className="btn primary">Submit PM</button>
                                        <button type="button" onClick={() => setShowRaisePMModal(false)} className="btn secondary">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                    <div className="pm-table-section">
                        <h2>Preventive Maintenance Tasks</h2>
                        <div>
                            <table>
                                <thead>
                                    <tr>
                                        <th scope="col">PM ID</th>
                                        <th scope="col">Asset ID</th>
                                        <th scope="col">Asset Name</th>
                                        <th scope="col">Department</th>
                                        <th scope="col">Last PM Date</th>
                                        <th scope="col">Quarter</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pmTasks.length === 0 ? (
                                        <tr><td colSpan="8">No PM tasks found.</td></tr>
                                    ) : (
                                        pmTasks.map((task) => {
                                            const asset = assets.find(a => a.id === task.asset_id);
                                            let statusClass = "status-indicator ";
                                            switch (task.status) {
                                                case "PENDING": statusClass += "status-pending-one"; break;
                                                case "VERIFIED": statusClass += "status-verified-one"; break;
                                                case "APPROVED": statusClass += "status-approved-one"; break;
                                                case "BILL_APPROVED": statusClass += "status-bill-approved"; break;
                                                case "REJECTED": statusClass += "status-rejected-one"; break;
                                                default: statusClass += "";
                                            }
                                            return (
                                                <tr key={task.id}>
                                                    <td>{task.id}</td>
                                                    <td>{task.asset_id}</td>
                                                    <td>{asset ? asset.asset_type : "N/A"}</td>
                                                    <td>{asset ? asset.department : "N/A"}</td>
                                                    <td>{task.last_pm_date}</td>
                                                    <td>{task.quarter}</td>
                                                    <td><span className={statusClass}>{task.status}</span></td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            {/* Allow Section_Coordinator to verify PENDING tasks */}
                                                            {(user?.role === "Section_Coordinator") && task.status === "PENDING" && (
                                                                <>
                                                                    <button onClick={() => handleVerifyPM(task.id)} className="btn success">Verify</button>
                                                                    <button onClick={() => handleRejectPM(task.id)} className="btn danger">Reject</button>
                                                                </>
                                                            )}
                                                            {/* Allow EIC_Contract or Section_InCharge to approve VERIFIED tasks */}
                                                            {( user?.role === "Section_InCharge") && task.status === "VERIFIED" && (
                                                                <>
                                                                    <button onClick={() => handleApprovePM(task.id)} className="btn success">Approve</button>
                                                                    <button onClick={() => handleRejectPM(task.id)} className="btn danger">Reject</button>
                                                                </>
                                                            )}
                                                            {/* Allow EIC_Contract to bill approve APPROVED tasks */}
                                                            {user?.role === "EIC_Contract" && task.status === "APPROVED" && (
                                                                <>
                                                                    <button onClick={() => handleBillApprovePM(task.id)} className="btn bill">Bill Approve</button>
                                                                    <button onClick={() => handleRejectPM(task.id)} className="btn danger">Reject</button>
                                                                </>
                                                            )}
                                                            {/* No actions for Service Engineer once task is not PENDING by them or for other roles if not their turn */}
                                                            {(user?.role === "Service_Engineer" && task.status !== "PENDING") && <span>No action</span>}
                                                            {/* Display "No action" for Section_Coordinator or EIC_Contract if the task is not in their actionable status */}
                                                            {((user?.role === "Section_Coordinator" && task.status !== "PENDING") ||
                                                              (user?.role === "EIC_Contract" && task.status !== "VERIFIED" && task.status !== "APPROVED") ||
                                                              (user?.role === "Section_InCharge" && task.status !== "VERIFIED")) && <span>No action</span>}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {user?.role === "ETL_Dept_EIC" && (
                        <div className="billing-summary-section">
                            <h2>Quarterly Billing Summary (Approved PMs)</h2>
                            {Object.keys(billingSummary).length === 0 ? (
                                <p>No approved PMs for billing yet.</p>
                            ) : (
                                <ul>
                                    {Object.entries(billingSummary).map(([quarter, count]) => (
                                        <li key={quarter}><strong>{quarter}:</strong> {count} Approved PMs</li>
                                    ))}
                                </ul>
                            )}
                            <p>Approved PMs are made available for billing by ETL Dept EIC.</p>
                        </div>
                    )}
                </div>
            </Layout>
        </div>
    );
};

export default Pm;